import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestClient, type RawResponse } from "../../providers/harvest/mod.ts"
import { isDebugMode, ValidationError } from "../../errors/mod.ts"
import { getGlobalAccount } from "../../cli/globals.ts"

/**
 * Validate the endpoint argument for `harvest api`.
 *
 * Accepted forms:
 * - Relative path starting with "/" (e.g. "/users/me")
 * - Absolute URL matching the Harvest base URL prefix
 *
 * Rejected:
 * - Absolute URLs pointing at unrelated hosts or paths
 * - Empty or whitespace-only strings
 */
export function validateEndpoint(
  endpoint: string,
  baseUrl: string,
): "relative" | "absolute" {
  const trimmed = endpoint.trim()
  if (trimmed.length === 0) {
    throw new ValidationError("Endpoint must not be empty.", {
      suggestion:
        'Provide a relative path like "/users/me" or a full Harvest URL.',
    })
  }

  // Relative path — starts with /
  if (trimmed.startsWith("/")) {
    return "relative"
  }

  // Attempt to parse as absolute URL
  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new ValidationError(
      `Invalid endpoint: "${trimmed}" is not a relative path (starting with /) or a valid URL.`,
      {
        suggestion:
          'Use a relative path like "/users/me" or a full Harvest API URL.',
      },
    )
  }

  // Validate that the absolute URL matches the Harvest base URL prefix
  const base = new URL(baseUrl)
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
        suggestion: `Only URLs under ${baseUrl} are allowed.`,
      },
    )
  }

  return "absolute"
}

// ---------------------------------------------------------------------------
// Field parsing and scalar coercion
// ---------------------------------------------------------------------------

/**
 * Parse a `key=value` field string. Throws on missing `=` or empty key.
 */
export function parseFieldPair(raw: string): { key: string; value: string } {
  const eqIdx = raw.indexOf("=")
  if (eqIdx < 0) {
    throw new ValidationError(
      `Invalid field: "${raw}" — expected key=value format.`,
      {
        suggestion:
          'Fields must be specified as key=value, e.g. "-F user_id=42".',
      },
    )
  }
  const key = raw.slice(0, eqIdx)
  if (key.length === 0) {
    throw new ValidationError(
      `Invalid field: "${raw}" — key must not be empty.`,
    )
  }
  return { key, value: raw.slice(eqIdx + 1) }
}

/**
 * Coerce a --field value to its typed representation.
 *
 * - "true" / "false" → boolean
 * - "null" → null
 * - Integer strings → number
 * - Decimal strings → number
 * - Everything else → string (unchanged)
 */
export function coerceFieldValue(
  value: string,
): string | number | boolean | null {
  if (value === "true") return true
  if (value === "false") return false
  if (value === "null") return null
  // Integer (no leading zeros except "0" itself)
  if (/^-?(?:0|[1-9]\d*)$/.test(value)) return Number(value)
  // Decimal
  if (/^-?(?:0|[1-9]\d*)\.\d+$/.test(value)) return Number(value)
  return value
}

// ---------------------------------------------------------------------------
// @me expansion
// ---------------------------------------------------------------------------

/**
 * Expand `@me` in --field values to the account's numeric user ID.
 *
 * Only expands when the entire value is exactly `@me`. Does not expand
 * inside --raw-field values, partial strings, or headers.
 */
export function expandAtMe(
  value: string | number | boolean | null,
  userId: number,
): string | number | boolean | null {
  if (value === "@me") return userId
  return value
}

// ---------------------------------------------------------------------------
// Header parsing and protected-header rejection
// ---------------------------------------------------------------------------

const PROTECTED_HEADERS = new Set([
  "authorization",
  "harvest-account-id",
])

/**
 * Parse a header string in `key:value` or `key: value` format.
 * Rejects attempts to override protected headers (Authorization,
 * Harvest-Account-Id).
 */
export function parseHeader(raw: string): { key: string; value: string } {
  const colonIdx = raw.indexOf(":")
  if (colonIdx < 0) {
    throw new ValidationError(
      `Invalid header: "${raw}" — expected key:value format.`,
      {
        suggestion:
          'Headers must be specified as key:value, e.g. "-H Accept:text/csv".',
      },
    )
  }
  const key = raw.slice(0, colonIdx).trim()
  if (key.length === 0) {
    throw new ValidationError(
      `Invalid header: "${raw}" — header name must not be empty.`,
    )
  }

  if (PROTECTED_HEADERS.has(key.toLowerCase())) {
    throw new ValidationError(
      `Cannot override protected header "${key}".`,
      {
        suggestion:
          "Authorization and Harvest-Account-Id are managed automatically.",
      },
    )
  }

  return { key, value: raw.slice(colonIdx + 1).trimStart() }
}

// ---------------------------------------------------------------------------
// --input handling
// ---------------------------------------------------------------------------

/**
 * Read request body from a file path or stdin (`-`).
 */
export async function readInputBody(filePath: string): Promise<string> {
  if (filePath === "-") {
    const chunks: Uint8Array[] = []
    for await (const chunk of Deno.stdin.readable) {
      chunks.push(chunk)
    }
    let totalLen = 0
    for (const c of chunks) totalLen += c.length
    const result = new Uint8Array(totalLen)
    let offset = 0
    for (const c of chunks) {
      result.set(c, offset)
      offset += c.length
    }
    return new TextDecoder().decode(result)
  }
  try {
    return await Deno.readTextFile(filePath)
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      throw new ValidationError(
        `Input file not found: ${filePath}`,
        { suggestion: "Check the file path and try again." },
      )
    }
    throw new ValidationError(
      `Failed to read input file: ${filePath}`,
      { suggestion: "Check file permissions and try again." },
    )
  }
}

// ---------------------------------------------------------------------------
// Request construction
// ---------------------------------------------------------------------------

/** The fully resolved request shape, ready for transport. */
export interface ApiRequest {
  method: string
  endpoint: string
  endpointForm: "relative" | "absolute"
  queryParams: Record<string, string>
  body: string | undefined
  headers: Record<string, string>
  paginate: boolean
  include: boolean
}

export interface BuildRequestOptions {
  method?: string
  field?: string[]
  rawField?: string[]
  header?: string[]
  input?: string
  paginate?: boolean
  include?: boolean
}

/**
 * Build a validated ApiRequest from CLI options.
 *
 * Validates all guardrails before returning:
 * - --input is mutually exclusive with --field / --raw-field
 * - Protected headers cannot be overridden
 * - @me expansion only applies to --field values
 * - GET requests place fields in query params; non-GET builds a JSON body
 */
export async function buildApiRequest(
  endpoint: string,
  baseUrl: string,
  userId: number,
  options: BuildRequestOptions,
): Promise<ApiRequest> {
  const method = (options.method ?? "GET").toUpperCase()
  const fields = options.field ?? []
  const rawFields = options.rawField ?? []
  const headerArgs = options.header ?? []
  const inputFile = options.input

  // 1. Reject --input with field-building flags
  if (inputFile !== undefined && (fields.length > 0 || rawFields.length > 0)) {
    throw new ValidationError(
      "Cannot combine --input with --field or --raw-field.",
      {
        suggestion:
          "Use --input for pre-built request bodies, or --field / --raw-field to construct one — not both.",
      },
    )
  }

  // 2. Validate endpoint
  const endpointForm = validateEndpoint(endpoint, baseUrl)

  // 3. Parse and validate headers
  const headers: Record<string, string> = {}
  for (const h of headerArgs) {
    const { key, value } = parseHeader(h)
    headers[key] = value
  }

  // 4. Parse fields with coercion and @me expansion
  const parsedFields: {
    key: string
    value: string | number | boolean | null
  }[] = []
  for (const f of fields) {
    const { key, value } = parseFieldPair(f)
    const coerced = coerceFieldValue(value)
    const expanded = expandAtMe(coerced, userId)
    parsedFields.push({ key, value: expanded })
  }

  // 5. Parse raw fields (no coercion, no @me expansion)
  for (const f of rawFields) {
    const { key, value } = parseFieldPair(f)
    parsedFields.push({ key, value })
  }

  // 6. Build query params or body depending on method
  let queryParams: Record<string, string> = {}
  let body: string | undefined

  if (inputFile !== undefined) {
    body = await readInputBody(inputFile)
  } else if (method === "GET" || method === "HEAD") {
    // GET/HEAD: fields become query parameters (all stringified)
    for (const { key, value } of parsedFields) {
      queryParams[key] = String(value)
    }
  } else {
    // Non-GET: fields become a flat JSON body
    if (parsedFields.length > 0) {
      const obj: Record<string, string | number | boolean | null> = {}
      for (const { key, value } of parsedFields) {
        obj[key] = value
      }
      body = JSON.stringify(obj)
    }
  }

  return {
    method,
    endpoint,
    endpointForm,
    queryParams,
    body,
    headers,
    paginate: options.paginate ?? false,
    include: options.include ?? false,
  }
}

// ---------------------------------------------------------------------------
// Response execution and formatting
// ---------------------------------------------------------------------------

/**
 * Format a response header block for `--include` output.
 * Emits "HTTP <status>" followed by each header, then an empty line separator.
 */
export function formatResponseHeaders(
  status: number,
  headers: [string, string][],
): string {
  const lines = [`HTTP ${status}`]
  for (const [key, value] of headers) {
    lines.push(`${key}: ${value}`)
  }
  lines.push("")
  return lines.join("\n")
}

/**
 * Detect pagination from a raw response body.
 *
 * Tries to parse JSON and checks `links.next` first, then `next_page`.
 * Returns null if no pagination is detected or parsing fails.
 */
export function detectPagination(
  body: string,
): { nextUrl: string | null; nextPage: number | null } | null {
  let parsed: Record<string, unknown>
  try {
    parsed = JSON.parse(body)
  } catch {
    return null
  }

  if (typeof parsed !== "object" || parsed === null) return null

  // Check links.next first (preferred)
  const links = parsed.links as Record<string, unknown> | undefined
  const nextUrl = (typeof links?.next === "string" && links.next.length > 0)
    ? links.next
    : null

  // Fallback: next_page as a number
  const nextPage = (typeof parsed.next_page === "number")
    ? parsed.next_page
    : null

  if (nextUrl === null && nextPage === null) return null

  return { nextUrl, nextPage }
}

/**
 * Emit a single response document to stdout.
 * When `include` is true, prefixes with status line and headers.
 */
function emitResponse(
  response: RawResponse,
  include: boolean,
  writer: { write(text: string): void },
): void {
  if (include) {
    writer.write(formatResponseHeaders(response.status, response.headers))
  }
  if (response.status !== 204 && response.body.length > 0) {
    writer.write(response.body)
    // Ensure trailing newline
    if (!response.body.endsWith("\n")) {
      writer.write("\n")
    }
  }
}

/** Options for executeApiRequest, injectable for testing. */
export interface ExecuteOptions {
  stdout?: { write(text: string): void }
  stderr?: { write(text: string): void }
}

/**
 * Execute a fully constructed ApiRequest through the raw Harvest transport.
 *
 * - Emits raw upstream bodies on stdout.
 * - Non-2xx responses still print body before returning non-zero exit.
 * - 204 No Content produces no body output.
 * - `--include` prefixes each document with status/headers.
 * - Detects pagination; warns on stderr when pages exist without `--paginate`.
 * - With `--paginate`, follows every page as a separate document.
 *
 * Returns the exit code (0 for success, 1 for non-2xx).
 */
export async function executeApiRequest(
  client: HarvestClient,
  request: ApiRequest,
  options?: ExecuteOptions,
): Promise<number> {
  const stdout = options?.stdout ?? {
    write(text: string) {
      Deno.stdout.writeSync(new TextEncoder().encode(text))
    },
  }
  const stderr = options?.stderr ?? {
    write(text: string) {
      Deno.stderr.writeSync(new TextEncoder().encode(text))
    },
  }

  // 1. Send the initial request
  const response = await sendRequest(client, request)

  // 2. Emit the first response document
  emitResponse(response, request.include, stdout)

  // Non-2xx: body was already emitted, return failure exit
  if (response.status < 200 || response.status >= 300) {
    return 1
  }

  // 3. Check for pagination
  const pagination = detectPagination(response.body)

  if (pagination === null) {
    return 0
  }

  if (!request.paginate) {
    // Warn about additional pages without --paginate
    stderr.write(
      "warning: response contains additional pages; use --paginate to fetch all\n",
    )
    return 0
  }

  // 4. Follow pagination
  let nextUrl = pagination.nextUrl
  let nextPage = pagination.nextPage

  while (nextUrl !== null || nextPage !== null) {
    if (isDebugMode()) {
      const target = nextUrl ?? `page=${nextPage}`
      stderr.write(`[harvest] following pagination: ${target}\n`)
    }

    let pageResponse: RawResponse

    if (nextUrl !== null) {
      pageResponse = await client.requestAbsoluteRaw(nextUrl, {
        headers: request.headers,
      })
    } else {
      // Fallback: construct request with page param
      const params = { ...request.queryParams, page: String(nextPage!) }
      pageResponse = await client.requestRaw(request.endpoint, {
        method: request.method,
        params,
        headers: request.headers,
      })
    }

    emitResponse(pageResponse, request.include, stdout)

    if (pageResponse.status < 200 || pageResponse.status >= 300) {
      return 1
    }

    const nextPagination = detectPagination(pageResponse.body)
    if (nextPagination === null) break

    nextUrl = nextPagination.nextUrl
    nextPage = nextPagination.nextPage
  }

  return 0
}

/**
 * Send the initial request using the raw transport, dispatching to the
 * correct client method based on endpoint form.
 */
async function sendRequest(
  client: HarvestClient,
  request: ApiRequest,
): Promise<RawResponse> {
  if (request.endpointForm === "absolute") {
    const url = new URL(request.endpoint)
    for (const [key, value] of Object.entries(request.queryParams)) {
      url.searchParams.set(key, value)
    }
    return client.requestAbsoluteRaw(url.toString(), {
      method: request.method,
      headers: request.headers,
      rawBody: request.body,
    })
  }

  // Relative path
  return client.requestRaw(request.endpoint, {
    method: request.method,
    params: request.queryParams,
    headers: request.headers,
    rawBody: request.body,
  })
}

// ---------------------------------------------------------------------------
// Command definition
// ---------------------------------------------------------------------------

export const harvestApiCommand = new Command()
  .description(
    `Send authenticated requests to the Harvest REST API.

WARNING: Harvest credentials are scoped to a specific account, not to the
current user. Every data-access endpoint returns account-wide results unless
you explicitly filter by user. Always pass \`-F user_id=@me\` (or the
literal numeric user ID) when you need only your own records.

EXAMPLES

  timeslip harvest api /users/me
  timeslip harvest api /time_entries -F user_id=@me -F from=2026-03-17
  timeslip harvest api /time_entries -F user_id=@me -F is_running=true
  timeslip harvest api /projects --paginate
  timeslip harvest schema | rg '/time_entries'`,
  )
  .option("-X, --method <method:string>", "HTTP method (default: GET)")
  .option(
    "-F, --field <field:string>",
    "Add a typed query/body field (key=value)",
    { collect: true },
  )
  .option(
    "-f, --raw-field <field:string>",
    "Add a string-only query/body field (key=value)",
    { collect: true },
  )
  .option(
    "-H, --header <header:string>",
    "Add an HTTP header (key:value)",
    { collect: true },
  )
  .option(
    "--input <file:string>",
    "Read request body from a file (- for stdin)",
  )
  .option("--paginate", "Fetch all pages and concatenate results")
  .option(
    "-i, --include",
    "Include HTTP response headers in output",
  )
  .arguments("<endpoint:string>")
  .action(async function (options, endpoint) {
    // 1. Resolve account — reuses the same precedence as all other commands
    const account = await resolveAccount({
      flagAccount: getGlobalAccount(),
      envAccount: Deno.env.get("TIMESLIP_ACCOUNT"),
    })

    // 2. Build client from resolved account credentials
    const client = new HarvestClient({
      accessToken: account.accessToken,
      accountId: account.accountId,
    })

    // 3. Build and validate the request (all guardrails enforced here)
    const request = await buildApiRequest(
      endpoint,
      client.baseUrl,
      account.userId,
      {
        method: options.method,
        field: options.field,
        rawField: options.rawField,
        header: options.header,
        input: options.input,
        paginate: options.paginate,
        include: options.include,
      },
    )

    // 4. Execute and emit response
    const exitCode = await executeApiRequest(client, request)
    if (exitCode !== 0) {
      Deno.exit(exitCode)
    }
  })
