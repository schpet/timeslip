/**
 * Harvest HTTP fetch wrapper.
 *
 * Sends correct auth headers, user-agent, and maps HTTP failures into
 * typed CLI errors. Fetch is injectable for testing.
 *
 * Two request paths:
 * 1. `request` / `requestAbsolute` — parse JSON, map HTTP errors.
 * 2. `requestRaw` / `requestAbsoluteRaw` — return status, headers, and
 *    body text without JSON parsing, for thin proxy / passthrough use.
 */

import { USER_AGENT } from "../../version.ts"
import { redactToken } from "../../config/mod.ts"
import {
  AuthError,
  isDebugMode,
  NotFoundError,
  ProviderError,
  ValidationError,
} from "../../errors/mod.ts"

const BASE_URL = Deno.env.get("HARVEST_BASE_URL") ??
  "https://api.harvestapp.com/api/v2"

export interface HarvestClientOptions {
  accessToken: string
  accountId: string
  /** Override base URL for testing. */
  baseUrl?: string
  /** Injectable fetch for testing. */
  fetch?: typeof globalThis.fetch
}

export interface HarvestRequestOptions {
  method?: string
  params?: Record<string, string | number | boolean | undefined>
  body?: unknown
  /** Additional headers merged after auth headers. Cannot override auth. */
  headers?: Record<string, string>
  /** Pre-serialized body string — sent as-is, skipping JSON.stringify. */
  rawBody?: string
}

/** Raw transport response — status, headers, and body text before parsing. */
export interface RawResponse {
  status: number
  headers: [string, string][]
  body: string
}

/**
 * Low-level Harvest API client. Handles auth headers, URL construction,
 * error mapping, and debug logging with token redaction.
 */
export class HarvestClient {
  readonly #accessToken: string
  readonly #accountId: string
  readonly #baseUrl: string
  readonly #fetch: typeof globalThis.fetch

  constructor(options: HarvestClientOptions) {
    this.#accessToken = options.accessToken
    this.#accountId = options.accountId
    this.#baseUrl = (options.baseUrl ?? BASE_URL).replace(/\/+$/, "")
    this.#fetch = options.fetch ?? globalThis.fetch.bind(globalThis)
  }

  /** The configured base URL (trailing slashes stripped). */
  get baseUrl(): string {
    return this.#baseUrl
  }

  /**
   * Send a request to a relative Harvest API path (e.g. "/users/me").
   * Returns the parsed JSON body.
   */
  async request<T>(path: string, options?: HarvestRequestOptions): Promise<T> {
    const url = this.#buildUrl(path, options?.params)
    const method = options?.method ?? "GET"
    const response = await this.#doFetch(method, url, options?.body)

    if (!response.ok) {
      await this.#handleErrorResponse(response)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  /**
   * Send a request to an absolute URL (e.g. a `links.next` pagination URL).
   * Validates the URL shares the configured base URL prefix.
   */
  async requestAbsolute<T>(absoluteUrl: string): Promise<T> {
    const url = this.#validateAbsoluteUrl(absoluteUrl)
    const response = await this.#doFetch("GET", url)

    if (!response.ok) {
      await this.#handleErrorResponse(response)
    }

    return (await response.json()) as T
  }

  /**
   * Raw request to a relative Harvest API path.
   * Returns status, ordered headers, and body text without JSON parsing.
   */
  async requestRaw(
    path: string,
    options?: HarvestRequestOptions,
  ): Promise<RawResponse> {
    const url = this.#buildUrl(path, options?.params)
    const method = options?.method ?? "GET"
    const response = await this.#doFetch(method, url, options?.body, {
      headers: options?.headers,
      rawBody: options?.rawBody,
    })
    return HarvestClient.#toRawResponse(response)
  }

  /**
   * Raw request to a validated absolute URL.
   * Returns status, ordered headers, and body text without JSON parsing.
   */
  async requestAbsoluteRaw(
    absoluteUrl: string,
    options?: {
      method?: string
      headers?: Record<string, string>
      rawBody?: string
    },
  ): Promise<RawResponse> {
    const url = this.#validateAbsoluteUrl(absoluteUrl)
    const response = await this.#doFetch(
      options?.method ?? "GET",
      url,
      undefined,
      {
        headers: options?.headers,
        rawBody: options?.rawBody,
      },
    )
    return HarvestClient.#toRawResponse(response)
  }

  // ---------------------------------------------------------------------------
  // Shared transport
  // ---------------------------------------------------------------------------

  /**
   * Execute a fetch with auth headers, user-agent, debug logging, and
   * network-error wrapping. Shared by both parsed and raw request paths.
   */
  async #doFetch(
    method: string,
    url: URL,
    body?: unknown,
    extra?: { headers?: Record<string, string>; rawBody?: string },
  ): Promise<Response> {
    const headers: Record<string, string> = {
      "Authorization": `Bearer ${this.#accessToken}`,
      "Harvest-Account-Id": this.#accountId,
      "User-Agent": USER_AGENT,
      "Content-Type": "application/json",
    }

    // Merge caller-supplied headers (cannot override auth headers)
    if (extra?.headers) {
      for (const [k, v] of Object.entries(extra.headers)) {
        const normalizedKey = k.toLowerCase()
        if (
          normalizedKey === "authorization" ||
          normalizedKey === "harvest-account-id"
        ) {
          continue
        }
        headers[k] = v
      }
    }

    const init: RequestInit = { method, headers }
    if (extra?.rawBody !== undefined) {
      init.body = extra.rawBody
    } else if (body !== undefined) {
      init.body = JSON.stringify(body)
    }

    this.#debugRequest(method, url)

    let response: Response
    try {
      response = await this.#fetch(url.toString(), init)
    } catch (cause) {
      throw new ProviderError("Network error contacting Harvest API.", {
        cause,
        suggestion: "Check your internet connection and try again.",
      })
    }

    this.#debugResponse(response.status, url)
    return response
  }

  // ---------------------------------------------------------------------------
  // URL construction & validation
  // ---------------------------------------------------------------------------

  #buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): URL {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`
    const url = new URL(`${this.#baseUrl}${normalizedPath}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url
  }

  /**
   * Validate that an absolute URL shares the configured base URL prefix.
   * Rejects URLs pointing at unrelated hosts or paths.
   */
  #validateAbsoluteUrl(absoluteUrl: string): URL {
    const url = new URL(absoluteUrl)
    const base = new URL(this.#baseUrl)
    const basePath = base.pathname.replace(/\/+$/, "")
    const pathMatches = url.pathname === basePath ||
      url.pathname.startsWith(`${basePath}/`)

    if (
      url.protocol !== base.protocol ||
      url.host !== base.host ||
      !pathMatches
    ) {
      throw new ValidationError(
        `URL does not match the Harvest base URL: ${url.host}${url.pathname}`,
        {
          suggestion: `Only URLs under ${this.#baseUrl} are allowed.`,
        },
      )
    }

    return url
  }

  // ---------------------------------------------------------------------------
  // Response helpers
  // ---------------------------------------------------------------------------

  static #toRawResponse(response: Response): Promise<RawResponse> {
    const headers: [string, string][] = []
    response.headers.forEach((value, key) => {
      headers.push([key, value])
    })
    return response.text().then((body) => ({
      status: response.status,
      headers,
      body,
    }))
  }

  async #handleErrorResponse(response: Response): Promise<never> {
    let errorMessage: string | undefined
    try {
      const body = await response.json()
      errorMessage = body?.message ?? body?.error_description ?? body?.error
    } catch {
      // Body may not be JSON
    }

    const status = response.status
    const fallback = errorMessage ?? `HTTP ${status}`

    switch (status) {
      case 401:
        throw new AuthError(`Harvest authentication failed: ${fallback}`, {
          suggestion:
            "Your token may be expired or invalid. Run `timeslip auth login` to re-authenticate.",
        })
      case 403:
        throw new AuthError(
          `Harvest access denied: ${fallback}`,
          {
            suggestion:
              "Your token may lack the required permissions. Check your Harvest access settings.",
          },
        )
      case 404:
        throw new NotFoundError("resource", fallback)
      case 422:
        throw new ValidationError(`Harvest validation error: ${fallback}`)
      case 429: {
        const retryAfter = response.headers.get("Retry-After")
        const suggestion = retryAfter
          ? `Rate limited. Try again in ${retryAfter} seconds.`
          : "Rate limited. Wait a moment and try again."
        throw new ProviderError(`Harvest rate limit exceeded.`, {
          statusCode: 429,
          suggestion,
        })
      }
      default:
        throw new ProviderError(`Harvest API error: ${fallback}`, {
          statusCode: status,
        })
    }
  }

  // ---------------------------------------------------------------------------
  // Debug logging (redacted)
  // ---------------------------------------------------------------------------

  #debugRequest(method: string, url: URL): void {
    if (!isDebugMode()) return
    console.error(
      `[harvest] ${method} ${this.#redactUrl(url)}`,
    )
  }

  #debugResponse(status: number, url: URL): void {
    if (!isDebugMode()) return
    console.error(
      `[harvest] ${status} ${this.#redactUrl(url)}`,
    )
  }

  #redactUrl(url: URL): string {
    const redacted = new URL(url.toString())
    // Redact any token-like query params
    for (const key of ["access_token", "token"]) {
      if (redacted.searchParams.has(key)) {
        const val = redacted.searchParams.get(key)!
        redacted.searchParams.set(key, redactToken(val))
      }
    }
    return redacted.toString()
  }
}
