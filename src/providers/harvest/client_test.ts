/**
 * Harvest transport layer tests — headers, pagination, and error mapping.
 *
 * Covers:
 * - Request headers (auth, user-agent, content-type, account-id)
 * - Base URL handling and path construction
 * - Paginator: links.next, next_page fallback, page sizes, limits, malformed data
 * - Error mapping: 401, 403, 404, 422, 429 (with Retry-After), 5xx
 * - Debug logging: informative output with token/header redaction
 */

import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert"
import { HarvestClient, type RawResponse } from "./client.ts"
import { paginate } from "./paginator.ts"
import { USER_AGENT } from "../../version.ts"
import {
  AuthError,
  NotFoundError,
  ProviderError,
  ValidationError,
} from "../../errors/mod.ts"
import { assertNoSecrets } from "../../test_helpers.ts"

// ---------------------------------------------------------------------------
// Test helpers — mock fetch
// ---------------------------------------------------------------------------

interface CapturedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body?: unknown
}

function createMockFetch(
  handler: (req: CapturedRequest) => {
    status: number
    body?: unknown
    headers?: Record<string, string>
  },
): { fetch: typeof globalThis.fetch; captured: CapturedRequest[] } {
  const captured: CapturedRequest[] = []

  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url
    const method = init?.method ?? "GET"
    const headers: Record<string, string> = {}
    if (init?.headers) {
      const h = init.headers as Record<string, string>
      for (const [k, v] of Object.entries(h)) {
        headers[k] = v
      }
    }
    let body: unknown
    if (typeof init?.body === "string") {
      try {
        body = JSON.parse(init.body)
      } catch {
        body = init.body
      }
    } else {
      body = init?.body
    }

    const req: CapturedRequest = { url, method, headers, body }
    captured.push(req)

    const result = handler(req)
    return new Response(
      result.body !== undefined ? JSON.stringify(result.body) : null,
      {
        status: result.status,
        headers: {
          "Content-Type": "application/json",
          ...(result.headers ?? {}),
        },
      },
    )
  }

  return { fetch, captured }
}

function makeClient(
  mockFetch: typeof globalThis.fetch,
  options?: { baseUrl?: string },
): HarvestClient {
  return new HarvestClient({
    accessToken: "test-token-abc123",
    accountId: "999888",
    fetch: mockFetch,
    ...options,
  })
}

// ---------------------------------------------------------------------------
// Request headers
// ---------------------------------------------------------------------------

Deno.test("client sends correct Authorization header", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { id: 1 },
  }))
  const client = makeClient(fetch)

  await client.request("/users/me")

  assertEquals(captured.length, 1)
  assertEquals(captured[0].headers["Authorization"], "Bearer test-token-abc123")
})

Deno.test("client sends Harvest-Account-Id header", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { id: 1 },
  }))
  const client = makeClient(fetch)

  await client.request("/users/me")

  assertEquals(captured[0].headers["Harvest-Account-Id"], "999888")
})

Deno.test("client sends User-Agent matching @schpet/timeslip/<version>", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { id: 1 },
  }))
  const client = makeClient(fetch)

  await client.request("/users/me")

  assertEquals(captured[0].headers["User-Agent"], USER_AGENT)
  assertStringIncludes(USER_AGENT, "timeslip/")
})

Deno.test("client sends Content-Type: application/json", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { id: 1 },
  }))
  const client = makeClient(fetch)

  await client.request("/users/me")

  assertEquals(captured[0].headers["Content-Type"], "application/json")
})

Deno.test("every request includes all required Harvest headers", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.request("/time_entries")
  await client.request("/projects", { method: "POST", body: { name: "test" } })

  for (const req of captured) {
    assertEquals("Authorization" in req.headers, true)
    assertEquals("Harvest-Account-Id" in req.headers, true)
    assertEquals("User-Agent" in req.headers, true)
    assertEquals("Content-Type" in req.headers, true)
  }
})

// ---------------------------------------------------------------------------
// requestAbsolute — headers on absolute URLs
// ---------------------------------------------------------------------------

Deno.test("requestAbsolute sends auth headers on absolute URLs", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { time_entries: [] },
  }))
  const client = makeClient(fetch)

  await client.requestAbsolute(
    "https://api.harvestapp.com/api/v2/time_entries?page=2",
  )

  assertEquals(captured[0].headers["Authorization"], "Bearer test-token-abc123")
  assertEquals(captured[0].headers["Harvest-Account-Id"], "999888")
  assertEquals(captured[0].headers["User-Agent"], USER_AGENT)
})

// ---------------------------------------------------------------------------
// Base URL handling
// ---------------------------------------------------------------------------

Deno.test("client constructs URLs from default base URL", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.request("/users/me")

  assertStringIncludes(
    captured[0].url,
    "https://api.harvestapp.com/api/v2/users/me",
  )
})

Deno.test("client uses custom baseUrl when provided", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2",
  })

  await client.request("/time_entries")

  assertStringIncludes(
    captured[0].url,
    "http://localhost:9999/api/v2/time_entries",
  )
})

Deno.test("client strips trailing slashes from baseUrl", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2///",
  })

  await client.request("/users/me")

  assertStringIncludes(
    captured[0].url,
    "http://localhost:9999/api/v2/users/me",
  )
})

Deno.test("client appends query params to URL", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.request("/time_entries", {
    params: { user_id: 42, from: "2026-01-01", is_running: true },
  })

  const url = new URL(captured[0].url)
  assertEquals(url.searchParams.get("user_id"), "42")
  assertEquals(url.searchParams.get("from"), "2026-01-01")
  assertEquals(url.searchParams.get("is_running"), "true")
})

Deno.test("client omits undefined params", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.request("/time_entries", {
    params: { user_id: 42, from: undefined },
  })

  const url = new URL(captured[0].url)
  assertEquals(url.searchParams.get("user_id"), "42")
  assertEquals(url.searchParams.has("from"), false)
})

// ---------------------------------------------------------------------------
// Request body
// ---------------------------------------------------------------------------

Deno.test("client sends JSON body for POST requests", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { id: 1 },
  }))
  const client = makeClient(fetch)

  await client.request("/time_entries", {
    method: "POST",
    body: { project_id: 10, hours: 2.5 },
  })

  assertEquals(captured[0].method, "POST")
  assertEquals(captured[0].body, { project_id: 10, hours: 2.5 })
})

Deno.test("client handles 204 No Content", async () => {
  const { fetch } = createMockFetch(() => ({ status: 204 }))
  const client = makeClient(fetch)

  const result = await client.request<void>("/time_entries/1", {
    method: "DELETE",
  })

  assertEquals(result, undefined)
})

// ---------------------------------------------------------------------------
// Error mapping — 401
// ---------------------------------------------------------------------------

Deno.test("client maps 401 to AuthError", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 401,
    body: { error_description: "Token expired" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    AuthError,
  )
  assertStringIncludes(err.message, "Token expired")
  assertStringIncludes(err.message, "authentication failed")
  assertStringIncludes(err.suggestion!, "auth login")
})

// ---------------------------------------------------------------------------
// Error mapping — 403
// ---------------------------------------------------------------------------

Deno.test("client maps 403 to AuthError with access denied", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 403,
    body: { message: "Insufficient permissions" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    AuthError,
  )
  assertStringIncludes(err.message, "access denied")
  assertStringIncludes(err.message, "Insufficient permissions")
})

// ---------------------------------------------------------------------------
// Error mapping — 404
// ---------------------------------------------------------------------------

Deno.test("client maps 404 to NotFoundError", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 404,
    body: { message: "Record not found" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries/99999"),
    NotFoundError,
  )
  assertStringIncludes(err.message, "not found")
  assertStringIncludes(err.message, "Record not found")
})

// ---------------------------------------------------------------------------
// Error mapping — 422
// ---------------------------------------------------------------------------

Deno.test("client maps 422 to ValidationError preserving server message", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 422,
    body: { message: "Hours must be greater than 0" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.request("/time_entries", {
        method: "POST",
        body: { hours: -1 },
      }),
    ValidationError,
  )
  assertStringIncludes(err.message, "Hours must be greater than 0")
  assertStringIncludes(err.message, "validation error")
})

// ---------------------------------------------------------------------------
// Error mapping — 429 with Retry-After
// ---------------------------------------------------------------------------

Deno.test("client maps 429 to ProviderError with retry-after hint", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 429,
    body: { message: "Rate limit exceeded" },
    headers: { "Retry-After": "15" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries"),
    ProviderError,
  )
  assertStringIncludes(err.message, "rate limit")
  assertEquals(err.statusCode, 429)
  assertStringIncludes(err.suggestion!, "15 seconds")
})

Deno.test("client maps 429 without Retry-After to generic wait message", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 429,
    body: { message: "Rate limit exceeded" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries"),
    ProviderError,
  )
  assertStringIncludes(err.suggestion!, "Wait a moment")
})

// ---------------------------------------------------------------------------
// Error mapping — 5xx
// ---------------------------------------------------------------------------

Deno.test("client maps 500 to ProviderError with status code", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 500,
    body: { error: "Internal Server Error" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries"),
    ProviderError,
  )
  assertStringIncludes(err.message, "Internal Server Error")
  assertEquals(err.statusCode, 500)
})

Deno.test("client handles error response with non-JSON body", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () =>
    new Response("Bad Gateway", {
      status: 502,
      headers: { "Content-Type": "text/plain" },
    })

  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries"),
    ProviderError,
  )
  assertStringIncludes(err.message, "HTTP 502")
})

Deno.test("client uses error_description field as fallback", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 401,
    body: { error_description: "The access token is invalid" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    AuthError,
  )
  assertStringIncludes(err.message, "The access token is invalid")
})

Deno.test("client uses error field when message/error_description are absent", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 401,
    body: { error: "invalid_token" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    AuthError,
  )
  assertStringIncludes(err.message, "invalid_token")
})

// ---------------------------------------------------------------------------
// Error mapping — network failure
// ---------------------------------------------------------------------------

Deno.test("client wraps network errors in ProviderError", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () => {
    throw new TypeError("fetch failed")
  }
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    ProviderError,
  )
  assertStringIncludes(err.message, "Network error")
  assertStringIncludes(err.suggestion!, "internet connection")
})

Deno.test("requestAbsolute wraps network errors in ProviderError", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () => {
    throw new TypeError("fetch failed")
  }
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.requestAbsolute(
        "https://api.harvestapp.com/api/v2/time_entries?page=2",
      ),
    ProviderError,
  )
  assertStringIncludes(err.message, "Network error")
})

// ---------------------------------------------------------------------------
// Paginator — links.next absolute URL traversal
// ---------------------------------------------------------------------------

function makePaginatedResponse(
  itemsKey: string,
  items: unknown[],
  opts: {
    page: number
    totalPages: number
    totalEntries: number
    nextPage: number | null
    linksNext: string | null
  },
): Record<string, unknown> {
  return {
    [itemsKey]: items,
    page: opts.page,
    per_page: items.length,
    total_pages: opts.totalPages,
    total_entries: opts.totalEntries,
    next_page: opts.nextPage,
    previous_page: opts.page > 1 ? opts.page - 1 : null,
    links: {
      first: "https://api.harvestapp.com/api/v2/time_entries?page=1",
      last:
        `https://api.harvestapp.com/api/v2/time_entries?page=${opts.totalPages}`,
      next: opts.linksNext,
      previous: null,
    },
  }
}

Deno.test("paginator follows links.next absolute URLs across pages", async () => {
  let callCount = 0
  const { fetch } = createMockFetch((req) => {
    callCount++
    if (callCount === 1) {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 1 }, { id: 2 }], {
          page: 1,
          totalPages: 3,
          totalEntries: 6,
          nextPage: 2,
          linksNext:
            "https://api.harvestapp.com/api/v2/time_entries?page=2&per_page=2",
        }),
      }
    } else if (callCount === 2) {
      // Verify this was called via requestAbsolute (absolute URL)
      assertStringIncludes(req.url, "page=2")
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 3 }, { id: 4 }], {
          page: 2,
          totalPages: 3,
          totalEntries: 6,
          nextPage: 3,
          linksNext:
            "https://api.harvestapp.com/api/v2/time_entries?page=3&per_page=2",
        }),
      }
    } else {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 5 }, { id: 6 }], {
          page: 3,
          totalPages: 3,
          totalEntries: 6,
          nextPage: null,
          linksNext: null,
        }),
      }
    }
  })
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 6)
  assertEquals(result.items.map((i) => i.id), [1, 2, 3, 4, 5, 6])
  assertEquals(result.meta.pagesFetched, 3)
  assertEquals(result.meta.totalEntries, 6)
  assertEquals(result.meta.truncated, false)
})

// ---------------------------------------------------------------------------
// Paginator — next_page fallback when links.next is absent
// ---------------------------------------------------------------------------

Deno.test("paginator falls back to next_page when links.next is absent", async () => {
  let callCount = 0
  const { fetch, captured } = createMockFetch(() => {
    callCount++
    if (callCount === 1) {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 1 }], {
          page: 1,
          totalPages: 2,
          totalEntries: 2,
          nextPage: 2,
          linksNext: null, // No links.next — forces next_page fallback
        }),
      }
    } else {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 2 }], {
          page: 2,
          totalPages: 2,
          totalEntries: 2,
          nextPage: null,
          linksNext: null,
        }),
      }
    }
  })
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 2)
  assertEquals(result.meta.pagesFetched, 2)
  // Second call should be a relative request with page=2
  const secondUrl = new URL(captured[1].url)
  assertEquals(secondUrl.searchParams.get("page"), "2")
})

// ---------------------------------------------------------------------------
// Paginator — caller-specified page size
// ---------------------------------------------------------------------------

Deno.test("paginator passes perPage to first request", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: makePaginatedResponse("entries", [{ id: 1 }], {
      page: 1,
      totalPages: 1,
      totalEntries: 1,
      nextPage: null,
      linksNext: null,
    }),
  }))
  const client = makeClient(fetch)

  await paginate(client, "/time_entries", "entries", undefined, { perPage: 50 })

  const url = new URL(captured[0].url)
  assertEquals(url.searchParams.get("per_page"), "50")
})

// ---------------------------------------------------------------------------
// Paginator — explicit limit truncation
// ---------------------------------------------------------------------------

Deno.test("paginator truncates results at caller-specified limit", async () => {
  let callCount = 0
  const { fetch } = createMockFetch(() => {
    callCount++
    if (callCount === 1) {
      return {
        status: 200,
        body: makePaginatedResponse(
          "entries",
          [{ id: 1 }, { id: 2 }, { id: 3 }],
          {
            page: 1,
            totalPages: 3,
            totalEntries: 9,
            nextPage: 2,
            linksNext: "https://api.harvestapp.com/api/v2/time_entries?page=2",
          },
        ),
      }
    } else {
      return {
        status: 200,
        body: makePaginatedResponse(
          "entries",
          [{ id: 4 }, { id: 5 }, { id: 6 }],
          {
            page: 2,
            totalPages: 3,
            totalEntries: 9,
            nextPage: 3,
            linksNext: "https://api.harvestapp.com/api/v2/time_entries?page=3",
          },
        ),
      }
    }
  })
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
    undefined,
    { limit: 5 },
  )

  assertEquals(result.items.length, 5)
  assertEquals(result.items.map((i) => i.id), [1, 2, 3, 4, 5])
  assertEquals(result.meta.truncated, true)
  // Should have fetched 2 pages (first had 3 items, second had 3, limit=5)
  assertEquals(result.meta.pagesFetched, 2)
})

Deno.test("paginator truncates on first page if limit <= first page size", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: makePaginatedResponse(
      "entries",
      [{ id: 1 }, { id: 2 }, { id: 3 }],
      {
        page: 1,
        totalPages: 5,
        totalEntries: 15,
        nextPage: 2,
        linksNext: "https://api.harvestapp.com/api/v2/time_entries?page=2",
      },
    ),
  }))
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
    undefined,
    { limit: 2 },
  )

  assertEquals(result.items.length, 2)
  assertEquals(result.meta.truncated, true)
  assertEquals(result.meta.pagesFetched, 1) // Only one fetch needed
})

// ---------------------------------------------------------------------------
// Paginator — single page (no pagination needed)
// ---------------------------------------------------------------------------

Deno.test("paginator handles single-page results", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: makePaginatedResponse("entries", [{ id: 1 }, { id: 2 }], {
      page: 1,
      totalPages: 1,
      totalEntries: 2,
      nextPage: null,
      linksNext: null,
    }),
  }))
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 2)
  assertEquals(result.meta.pagesFetched, 1)
  assertEquals(result.meta.truncated, false)
})

// ---------------------------------------------------------------------------
// Paginator — empty results
// ---------------------------------------------------------------------------

Deno.test("paginator handles empty results", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: makePaginatedResponse("entries", [], {
      page: 1,
      totalPages: 0,
      totalEntries: 0,
      nextPage: null,
      linksNext: null,
    }),
  }))
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 0)
  assertEquals(result.meta.pagesFetched, 1)
  assertEquals(result.meta.totalEntries, 0)
  assertEquals(result.meta.truncated, false)
})

// ---------------------------------------------------------------------------
// Paginator — malformed pagination: missing items key returns empty array
// ---------------------------------------------------------------------------

Deno.test("paginator handles missing items key gracefully", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {
      // "entries" key is missing entirely
      page: 1,
      per_page: 10,
      total_pages: 1,
      total_entries: 0,
      next_page: null,
      previous_page: null,
      links: { first: null, last: null, next: null, previous: null },
    },
  }))
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 0)
  assertEquals(result.meta.pagesFetched, 1)
})

// ---------------------------------------------------------------------------
// Paginator — would-be infinite loop: next_page pointing to same page
// (This is a tricky fixture: if links.next is null and next_page is never
// null, the paginator would loop forever. The server's contract is that
// next_page is null on the last page, so we verify the paginator terminates.)
// ---------------------------------------------------------------------------

Deno.test("paginator terminates when next_page becomes null", async () => {
  let callCount = 0
  const { fetch } = createMockFetch(() => {
    callCount++
    return {
      status: 200,
      body: makePaginatedResponse("entries", [{ id: callCount }], {
        page: callCount,
        totalPages: 2,
        totalEntries: 2,
        nextPage: callCount < 2 ? callCount + 1 : null,
        linksNext: null,
      }),
    }
  })
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 2)
  assertEquals(result.meta.pagesFetched, 2)
  assertEquals(callCount, 2) // Confirm it stopped after 2 pages
})

// ---------------------------------------------------------------------------
// Paginator — passes extra params alongside per_page
// ---------------------------------------------------------------------------

Deno.test("paginator forwards caller params to first request", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: makePaginatedResponse("entries", [], {
      page: 1,
      totalPages: 1,
      totalEntries: 0,
      nextPage: null,
      linksNext: null,
    }),
  }))
  const client = makeClient(fetch)

  await paginate(
    client,
    "/time_entries",
    "entries",
    { user_id: 42, from: "2026-01-01" },
    { perPage: 100 },
  )

  const url = new URL(captured[0].url)
  assertEquals(url.searchParams.get("user_id"), "42")
  assertEquals(url.searchParams.get("from"), "2026-01-01")
  assertEquals(url.searchParams.get("per_page"), "100")
})

// ---------------------------------------------------------------------------
// Paginator — no duplicate pages (links.next takes priority over next_page)
// ---------------------------------------------------------------------------

Deno.test("paginator prefers links.next over next_page, no duplicates", async () => {
  let callCount = 0
  const { fetch, captured } = createMockFetch(() => {
    callCount++
    if (callCount === 1) {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 1 }], {
          page: 1,
          totalPages: 2,
          totalEntries: 2,
          nextPage: 2, // Both cursors present
          linksNext:
            "https://api.harvestapp.com/api/v2/time_entries?page=2&per_page=1",
        }),
      }
    } else {
      return {
        status: 200,
        body: makePaginatedResponse("entries", [{ id: 2 }], {
          page: 2,
          totalPages: 2,
          totalEntries: 2,
          nextPage: null,
          linksNext: null,
        }),
      }
    }
  })
  const client = makeClient(fetch)

  const result = await paginate<{ id: number }>(
    client,
    "/time_entries",
    "entries",
  )

  assertEquals(result.items.length, 2)
  assertEquals(callCount, 2) // Exactly 2 fetches, no duplicate
  // The second request should use the absolute URL from links.next
  assertStringIncludes(captured[1].url, "page=2&per_page=1")
})

// ---------------------------------------------------------------------------
// Debug logging — informative but redacted
// ---------------------------------------------------------------------------

Deno.test("debug logging includes method and URL but not raw token", async () => {
  const originalDebug = Deno.env.get("TIMESLIP_DEBUG")
  Deno.env.set("TIMESLIP_DEBUG", "1")

  try {
    const { fetch } = createMockFetch(() => ({
      status: 200,
      body: { id: 1 },
    }))
    const client = makeClient(fetch)

    // Capture debug output from an actual request
    const chunks: string[] = []
    const origError = console.error
    console.error = (...args: unknown[]) => {
      chunks.push(args.map(String).join(" "))
    }
    try {
      await client.request("/users/me")
    } finally {
      console.error = origError
    }

    const debugOutput = chunks.join("\n")

    // Should include method and path context
    assertStringIncludes(debugOutput, "[harvest]")
    assertStringIncludes(debugOutput, "GET")
    assertStringIncludes(debugOutput, "users/me")

    // Should include status code
    assertStringIncludes(debugOutput, "200")

    // Must NOT include raw tokens or auth headers
    assertNoSecrets(debugOutput, "debug log output")
    assertEquals(debugOutput.includes("test-token-abc123"), false)
    assertEquals(debugOutput.includes("Bearer"), false)
  } finally {
    if (originalDebug !== undefined) {
      Deno.env.set("TIMESLIP_DEBUG", originalDebug)
    } else {
      Deno.env.delete("TIMESLIP_DEBUG")
    }
  }
})

Deno.test("debug logging is silent when TIMESLIP_DEBUG is not set", async () => {
  const originalDebug = Deno.env.get("TIMESLIP_DEBUG")
  Deno.env.delete("TIMESLIP_DEBUG")

  try {
    const { fetch } = createMockFetch(() => ({
      status: 200,
      body: { id: 1 },
    }))
    const client = makeClient(fetch)

    const chunks: string[] = []
    const origError = console.error
    console.error = (...args: unknown[]) => {
      chunks.push(args.map(String).join(" "))
    }
    try {
      await client.request("/users/me")
    } finally {
      console.error = origError
    }

    assertEquals(
      chunks.length,
      0,
      "No debug output when TIMESLIP_DEBUG is not set",
    )
  } finally {
    if (originalDebug !== undefined) {
      Deno.env.set("TIMESLIP_DEBUG", originalDebug)
    }
  }
})

Deno.test("debug logging redacts token-like query params", async () => {
  const originalDebug = Deno.env.get("TIMESLIP_DEBUG")
  Deno.env.set("TIMESLIP_DEBUG", "1")

  try {
    const { fetch } = createMockFetch(() => ({
      status: 200,
      body: {},
    }))
    const client = makeClient(fetch)

    const chunks: string[] = []
    const origError = console.error
    console.error = (...args: unknown[]) => {
      chunks.push(args.map(String).join(" "))
    }
    try {
      await client.request("/callback", {
        params: { access_token: "secrettoken1234567890abcdefghij" },
      })
    } finally {
      console.error = origError
    }

    const debugOutput = chunks.join("\n")
    // The raw token should be redacted in debug output
    assertEquals(
      debugOutput.includes("secrettoken1234567890abcdefghij"),
      false,
      "Raw access_token query param must be redacted in debug logs",
    )
  } finally {
    if (originalDebug !== undefined) {
      Deno.env.set("TIMESLIP_DEBUG", originalDebug)
    } else {
      Deno.env.delete("TIMESLIP_DEBUG")
    }
  }
})

// ---------------------------------------------------------------------------
// Error messages preserve useful server context
// ---------------------------------------------------------------------------

Deno.test("error messages preserve server message for diagnosis", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 422,
    body: { message: "Project is archived and cannot accept time entries" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.request("/time_entries", {
        method: "POST",
        body: { project_id: 1 },
      }),
    ValidationError,
  )
  // The original server message should be preserved for user diagnosis
  assertStringIncludes(
    err.message,
    "Project is archived and cannot accept time entries",
  )
})

// ---------------------------------------------------------------------------
// Error types carry correct exit codes
// ---------------------------------------------------------------------------

Deno.test("AuthError carries auth exit code", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 401,
    body: { message: "Unauthorized" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/users/me"),
    AuthError,
  )
  assertEquals(err.exitCode, 4) // ExitCode.Auth
})

Deno.test("ValidationError carries validation exit code", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 422,
    body: { message: "Invalid" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries", { method: "POST", body: {} }),
    ValidationError,
  )
  assertEquals(err.exitCode, 2) // ExitCode.Validation
})

Deno.test("ProviderError carries runtime exit code and status code", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 503,
    body: { message: "Service Unavailable" },
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.request("/time_entries"),
    ProviderError,
  )
  assertEquals(err.exitCode, 1) // ExitCode.Runtime
  assertEquals(err.statusCode, 503)
})

// ---------------------------------------------------------------------------
// Raw transport — requestRaw
// ---------------------------------------------------------------------------

Deno.test("requestRaw returns status, headers, and body text", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: { time_entries: [{ id: 1 }] },
  }))
  const client = makeClient(fetch)

  const raw: RawResponse = await client.requestRaw("/time_entries")

  assertEquals(raw.status, 200)
  // Body is the raw JSON text, not parsed
  const parsed = JSON.parse(raw.body)
  assertEquals(parsed.time_entries[0].id, 1)
  // Headers are ordered tuples
  const contentType = raw.headers.find(([k]) => k === "content-type")
  assertEquals(contentType?.[1], "application/json")
})

Deno.test("requestRaw sends auth headers", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.requestRaw("/users/me")

  assertEquals(captured[0].headers["Authorization"], "Bearer test-token-abc123")
  assertEquals(captured[0].headers["Harvest-Account-Id"], "999888")
  assertEquals(captured[0].headers["User-Agent"], USER_AGENT)
})

Deno.test("requestRaw preserves auth headers when caller passes custom headers", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await client.requestRaw("/users/me", {
    headers: {
      "Authorization": "Bearer attacker-token",
      "Harvest-Account-Id": "000000",
      "X-Trace-Id": "trace-123",
    },
  })

  assertEquals(captured[0].headers["Authorization"], "Bearer test-token-abc123")
  assertEquals(captured[0].headers["Harvest-Account-Id"], "999888")
  assertEquals(captured[0].headers["X-Trace-Id"], "trace-123")
})

Deno.test("requestRaw does not throw on error status codes", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 404,
    body: { message: "Not Found" },
  }))
  const client = makeClient(fetch)

  const raw = await client.requestRaw("/time_entries/99999")

  assertEquals(raw.status, 404)
  assertStringIncludes(raw.body, "Not Found")
})

Deno.test("requestRaw wraps network errors in ProviderError", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () => {
    throw new TypeError("fetch failed")
  }
  const client = makeClient(fetch)

  const err = await assertRejects(
    () => client.requestRaw("/users/me"),
    ProviderError,
  )
  assertStringIncludes(err.message, "Network error")
})

Deno.test("requestRaw supports POST with body", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 201,
    body: { id: 42 },
  }))
  const client = makeClient(fetch)

  const raw = await client.requestRaw("/time_entries", {
    method: "POST",
    body: { project_id: 10 },
  })

  assertEquals(raw.status, 201)
  assertEquals(captured[0].method, "POST")
  assertEquals(captured[0].body, { project_id: 10 })
})

Deno.test("requestRaw supports rawBody and relative paths without a leading slash", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 202,
    body: { ok: true },
    headers: { "Content-Type": "application/custom+json" },
  }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2/",
  })

  const raw = await client.requestRaw("time_entries", {
    method: "POST",
    headers: {
      "Content-Type": "application/custom+json",
    },
    rawBody: '{"project_id":10,"hours":"2.50"}',
  })

  assertEquals(raw.status, 202)
  assertEquals(captured[0].url, "http://localhost:9999/api/v2/time_entries")
  assertEquals(captured[0].headers["Content-Type"], "application/custom+json")
  assertEquals(captured[0].body, { project_id: 10, hours: "2.50" })
})

// ---------------------------------------------------------------------------
// Raw transport — requestAbsoluteRaw
// ---------------------------------------------------------------------------

Deno.test("requestAbsoluteRaw returns raw response for valid absolute URL", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: { time_entries: [] },
  }))
  const client = makeClient(fetch)

  const raw = await client.requestAbsoluteRaw(
    "https://api.harvestapp.com/api/v2/time_entries?page=2",
  )

  assertEquals(raw.status, 200)
  const parsed = JSON.parse(raw.body)
  assertEquals(parsed.time_entries.length, 0)
})

Deno.test("requestAbsoluteRaw accepts mock server URLs matching baseUrl", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: { entries: [{ id: 1 }] },
  }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2",
  })

  const raw = await client.requestAbsoluteRaw(
    "http://localhost:9999/api/v2/time_entries?page=3",
  )

  assertEquals(raw.status, 200)
})

Deno.test("requestAbsoluteRaw supports non-GET methods and rawBody", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 202,
    body: { ok: true },
  }))
  const client = makeClient(fetch)

  const raw = await client.requestAbsoluteRaw(
    "https://api.harvestapp.com/api/v2/time_entries/123?expand=projects",
    {
      method: "PATCH",
      headers: { "X-Trace-Id": "req-123" },
      rawBody: '{"notes":"updated"}',
    },
  )

  assertEquals(raw.status, 202)
  assertEquals(captured[0].method, "PATCH")
  assertEquals(
    captured[0].url,
    "https://api.harvestapp.com/api/v2/time_entries/123?expand=projects",
  )
  assertEquals(captured[0].headers["X-Trace-Id"], "req-123")
  assertEquals(captured[0].body, { notes: "updated" })
})

Deno.test("requestAbsoluteRaw wraps network errors in ProviderError", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () => {
    throw new TypeError("fetch failed")
  }
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.requestAbsoluteRaw(
        "https://api.harvestapp.com/api/v2/time_entries?page=2",
      ),
    ProviderError,
  )

  assertStringIncludes(err.message, "Network error")
  assertStringIncludes(err.suggestion!, "internet connection")
})

// ---------------------------------------------------------------------------
// URL validation — absolute URLs must match base URL prefix
// ---------------------------------------------------------------------------

Deno.test("requestAbsolute rejects URLs with foreign host", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await assertRejects(
    () =>
      client.requestAbsolute("https://evil.example.com/api/v2/time_entries"),
    ValidationError,
    "does not match",
  )
})

Deno.test("requestAbsoluteRaw rejects URLs with foreign host", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await assertRejects(
    () =>
      client.requestAbsoluteRaw(
        "https://evil.example.com/api/v2/time_entries",
      ),
    ValidationError,
    "does not match",
  )
})

Deno.test("requestAbsoluteRaw validation failures redact secret-bearing query params", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.requestAbsoluteRaw(
        "https://evil.example.com/api/v2/time_entries?page=2&access_token=secrettoken1234567890abcdefghij",
      ),
    ValidationError,
  )

  const rendered = [err.message, err.suggestion].filter(Boolean).join("\n")
  assertNoSecrets(rendered, "absolute raw validation error")
  assertEquals(rendered.includes("test-token-abc123"), false)
  assertEquals(rendered.includes("999888"), false)
})

Deno.test("requestRaw network failures do not expose tokens in provider errors", async () => {
  // deno-lint-ignore require-await
  const fetch: typeof globalThis.fetch = async () => {
    throw new TypeError(
      "connect failed for Authorization: Bearer test-token-abc123",
    )
  }
  const client = makeClient(fetch)

  const err = await assertRejects(
    () =>
      client.requestRaw("/time_entries", {
        params: { access_token: "secrettoken1234567890abcdefghij" },
      }),
    ProviderError,
  )

  assertNoSecrets(err.message, "raw network error message")
  assertEquals(err.message.includes("test-token-abc123"), false)
  assertStringIncludes(err.message, "Network error")
})

Deno.test("requestAbsolute rejects URLs with wrong path prefix", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await assertRejects(
    () =>
      client.requestAbsolute(
        "https://api.harvestapp.com/other/endpoint",
      ),
    ValidationError,
    "does not match",
  )
})

Deno.test("requestAbsolute rejects URLs with sibling path prefix", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await assertRejects(
    () =>
      client.requestAbsolute(
        "https://api.harvestapp.com/api/v22/time_entries",
      ),
    ValidationError,
    "does not match",
  )
})

Deno.test("requestAbsoluteRaw rejects URLs with sibling path prefix", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch)

  await assertRejects(
    () =>
      client.requestAbsoluteRaw(
        "https://api.harvestapp.com/api/v22/time_entries",
      ),
    ValidationError,
    "does not match",
  )
})

Deno.test("requestAbsolute accepts valid pagination URL", async () => {
  const { fetch, captured } = createMockFetch(() => ({
    status: 200,
    body: { time_entries: [] },
  }))
  const client = makeClient(fetch)

  await client.requestAbsolute(
    "https://api.harvestapp.com/api/v2/time_entries?page=2&per_page=100",
  )

  assertEquals(captured.length, 1)
  assertStringIncludes(captured[0].url, "page=2")
})

Deno.test("URL validation works with custom baseUrl for mock servers", async () => {
  const { fetch } = createMockFetch(() => ({
    status: 200,
    body: {},
  }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2",
  })

  // Valid mock URL
  await client.requestAbsolute(
    "http://localhost:9999/api/v2/time_entries?page=2",
  )

  // Foreign URL rejected even with mock server baseUrl
  await assertRejects(
    () =>
      client.requestAbsolute(
        "https://api.harvestapp.com/api/v2/time_entries",
      ),
    ValidationError,
  )
})

// ---------------------------------------------------------------------------
// Raw transport — debug logging with redaction
// ---------------------------------------------------------------------------

Deno.test("requestRaw debug logging includes method/path and redacts tokens", async () => {
  const originalDebug = Deno.env.get("TIMESLIP_DEBUG")
  Deno.env.set("TIMESLIP_DEBUG", "1")

  try {
    const { fetch } = createMockFetch(() => ({
      status: 200,
      body: {},
    }))
    const client = makeClient(fetch)

    const chunks: string[] = []
    const origError = console.error
    console.error = (...args: unknown[]) => {
      chunks.push(args.map(String).join(" "))
    }
    try {
      await client.requestRaw("/time_entries", {
        params: { access_token: "secrettoken1234567890abcdefghij" },
      })
    } finally {
      console.error = origError
    }

    const debugOutput = chunks.join("\n")

    assertStringIncludes(debugOutput, "[harvest]")
    assertStringIncludes(debugOutput, "GET")
    assertStringIncludes(debugOutput, "time_entries")

    // Tokens must be redacted
    assertNoSecrets(debugOutput, "raw transport debug log")
    assertEquals(
      debugOutput.includes("secrettoken1234567890abcdefghij"),
      false,
    )
    assertEquals(debugOutput.includes("test-token-abc123"), false)
    assertEquals(debugOutput.includes("Bearer"), false)
  } finally {
    if (originalDebug !== undefined) {
      Deno.env.set("TIMESLIP_DEBUG", originalDebug)
    } else {
      Deno.env.delete("TIMESLIP_DEBUG")
    }
  }
})

// ---------------------------------------------------------------------------
// baseUrl getter
// ---------------------------------------------------------------------------

Deno.test("baseUrl getter returns configured base URL", () => {
  const { fetch } = createMockFetch(() => ({ status: 200, body: {} }))
  const client = makeClient(fetch, {
    baseUrl: "http://localhost:9999/api/v2/",
  })

  // Trailing slashes are stripped
  assertEquals(client.baseUrl, "http://localhost:9999/api/v2")
})
