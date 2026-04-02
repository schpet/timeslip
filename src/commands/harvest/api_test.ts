/**
 * Harvest API command preflight tests — account resolution and path validation.
 *
 * Covers:
 * - validateEndpoint: relative path acceptance, absolute URL acceptance,
 *   foreign URL rejection, empty/invalid input rejection
 * - Account resolution reuse: same resolveAccount() precedence as other
 *   commands, typed CLI errors for missing/ambiguous/unknown accounts
 * - Secret safety: preflight failures never leak tokens or credentials
 */

import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert"
import {
  type ApiRequest,
  buildApiRequest,
  detectPagination,
  executeApiRequest,
  formatResponseHeaders,
  validateEndpoint,
} from "./api.ts"
import { resolveAccount } from "../../config/mod.ts"
import { ConfigError, ValidationError } from "../../errors/mod.ts"
import { assertNoSecrets } from "../../test_helpers.ts"
import type { Account } from "../../domain/mod.ts"
import { saveConfig, upsertAccount } from "../../config/mod.ts"
import { HarvestClient, type RawResponse } from "../../providers/harvest/mod.ts"

const HARVEST_BASE = "https://api.harvestapp.com/api/v2"

// ---------------------------------------------------------------------------
// validateEndpoint — relative paths
// ---------------------------------------------------------------------------

Deno.test("validateEndpoint: accepts relative path starting with /", () => {
  const form = validateEndpoint("/users/me", HARVEST_BASE)
  assertEquals(form, "relative")
})

Deno.test("validateEndpoint: accepts relative path with segments", () => {
  const form = validateEndpoint("/time_entries", HARVEST_BASE)
  assertEquals(form, "relative")
})

Deno.test("validateEndpoint: accepts deep relative path", () => {
  const form = validateEndpoint("/projects/123/task_assignments", HARVEST_BASE)
  assertEquals(form, "relative")
})

// ---------------------------------------------------------------------------
// validateEndpoint — absolute URLs
// ---------------------------------------------------------------------------

Deno.test("validateEndpoint: accepts absolute URL matching base", () => {
  const form = validateEndpoint(
    "https://api.harvestapp.com/api/v2/users/me",
    HARVEST_BASE,
  )
  assertEquals(form, "absolute")
})

Deno.test("validateEndpoint: accepts absolute URL with query string", () => {
  const form = validateEndpoint(
    "https://api.harvestapp.com/api/v2/time_entries?page=2",
    HARVEST_BASE,
  )
  assertEquals(form, "absolute")
})

Deno.test("validateEndpoint: accepts absolute URL matching base exactly", () => {
  const form = validateEndpoint(
    "https://api.harvestapp.com/api/v2",
    HARVEST_BASE,
  )
  assertEquals(form, "absolute")
})

// ---------------------------------------------------------------------------
// validateEndpoint — rejected foreign URLs
// ---------------------------------------------------------------------------

Deno.test("validateEndpoint: rejects URL with different host", () => {
  const err = (() => {
    try {
      validateEndpoint("https://evil.example.com/api/v2/users/me", HARVEST_BASE)
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "does not match the Harvest base URL")
  assertStringIncludes(err!.suggestion!, "Only URLs under")
})

Deno.test("validateEndpoint: rejects URL with different path prefix", () => {
  const err = (() => {
    try {
      validateEndpoint(
        "https://api.harvestapp.com/other/path",
        HARVEST_BASE,
      )
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "does not match the Harvest base URL")
})

Deno.test("validateEndpoint: rejects URL with sibling path prefix", () => {
  const err = (() => {
    try {
      validateEndpoint(
        "https://api.harvestapp.com/api/v22/users/me",
        HARVEST_BASE,
      )
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "does not match the Harvest base URL")
})

Deno.test("validateEndpoint: rejects URL with different protocol", () => {
  const err = (() => {
    try {
      validateEndpoint(
        "http://api.harvestapp.com/api/v2/users/me",
        HARVEST_BASE,
      )
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "does not match the Harvest base URL")
})

// ---------------------------------------------------------------------------
// validateEndpoint — invalid input
// ---------------------------------------------------------------------------

Deno.test("validateEndpoint: rejects empty string", () => {
  const err = (() => {
    try {
      validateEndpoint("", HARVEST_BASE)
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "must not be empty")
})

Deno.test("validateEndpoint: rejects whitespace-only string", () => {
  const err = (() => {
    try {
      validateEndpoint("   ", HARVEST_BASE)
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "must not be empty")
})

Deno.test("validateEndpoint: rejects bare word (not a path or URL)", () => {
  const err = (() => {
    try {
      validateEndpoint("users/me", HARVEST_BASE)
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "not a relative path")
})

// ---------------------------------------------------------------------------
// validateEndpoint — custom base URL (for testing overrides)
// ---------------------------------------------------------------------------

Deno.test("validateEndpoint: respects custom base URL", () => {
  const customBase = "http://localhost:9292/api/v2"
  const form = validateEndpoint(
    "http://localhost:9292/api/v2/users/me",
    customBase,
  )
  assertEquals(form, "absolute")
})

Deno.test("validateEndpoint: rejects harvest URL when base is custom", () => {
  const customBase = "http://localhost:9292/api/v2"
  const err = (() => {
    try {
      validateEndpoint(
        "https://api.harvestapp.com/api/v2/users/me",
        customBase,
      )
    } catch (e) {
      return e as ValidationError
    }
  })()

  assertEquals(err instanceof ValidationError, true)
  assertStringIncludes(err!.message, "does not match the Harvest base URL")
})

// ---------------------------------------------------------------------------
// Account resolution — reuses resolveAccount() with typed errors
// ---------------------------------------------------------------------------

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "test-acct",
    provider: "harvest",
    accountId: "123456",
    accessToken: "pat_abc123def456ghi789",
    userId: 42,
    firstName: "Test",
    lastName: "User",
    email: "test@example.com",
    isDefault: true,
    ...overrides,
  }
}

async function withTempDir(
  fn: (dir: string) => Promise<void>,
): Promise<void> {
  const dir = await Deno.makeTempDir()
  try {
    await fn(dir)
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
}

Deno.test("account resolution: throws ConfigError when no accounts configured", async () => {
  await withTempDir(async (dir) => {
    const err = await assertRejects(
      () => resolveAccount({ configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "No accounts configured")
    assertStringIncludes(err.suggestion!, "timeslip auth login")
  })
})

Deno.test("account resolution: throws ConfigError for non-existent flag account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)

    const err = await assertRejects(
      () =>
        resolveAccount({
          flagAccount: "nonexistent",
          configDir: dir,
        }),
      ConfigError,
    )
    assertStringIncludes(err.message, "'nonexistent' not found")
    assertStringIncludes(err.suggestion!, "timeslip auth list")
  })
})

Deno.test("account resolution: throws ConfigError for non-existent env account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)

    const err = await assertRejects(
      () =>
        resolveAccount({
          envAccount: "nonexistent",
          configDir: dir,
        }),
      ConfigError,
    )
    assertStringIncludes(err.message, "'nonexistent' not found")
  })
})

Deno.test("account resolution: throws ConfigError when multiple accounts but no default", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount({ name: "acct1" }), dir)
    await upsertAccount(makeAccount({ name: "acct2" }), dir)
    // Clear default by saving config without a default
    await saveConfig(
      [
        makeAccount({ name: "acct1", isDefault: false }),
        makeAccount({ name: "acct2", isDefault: false }),
      ],
      undefined,
      dir,
    )

    const err = await assertRejects(
      () => resolveAccount({ configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "Multiple accounts configured")
    assertStringIncludes(err.suggestion!, "timeslip auth default")
  })
})

Deno.test("account resolution: flag takes priority over env and default", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount({ name: "flag-acct" }), dir)
    await upsertAccount(makeAccount({ name: "env-acct" }), dir)

    const account = await resolveAccount({
      flagAccount: "flag-acct",
      envAccount: "env-acct",
      configDir: dir,
    })
    assertEquals(account.name, "flag-acct")
  })
})

Deno.test("account resolution: env takes priority over default", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount({ name: "default-acct" }), dir)
    await upsertAccount(makeAccount({ name: "env-acct" }), dir)

    const account = await resolveAccount({
      envAccount: "env-acct",
      configDir: dir,
    })
    assertEquals(account.name, "env-acct")
  })
})

Deno.test("account resolution: single account used when no explicit target", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount({ name: "only-acct" }), dir)

    const account = await resolveAccount({ configDir: dir })
    assertEquals(account.name, "only-acct")
  })
})

// ---------------------------------------------------------------------------
// Secret safety — preflight errors must not leak credentials
// ---------------------------------------------------------------------------

Deno.test("secret safety: ConfigError messages do not leak tokens", async () => {
  await withTempDir(async (dir) => {
    const acct = makeAccount()
    await upsertAccount(acct, dir)

    const err = await assertRejects(
      () =>
        resolveAccount({
          flagAccount: "nonexistent",
          configDir: dir,
        }),
      ConfigError,
    )

    assertNoSecrets(err.message, "ConfigError.message")
    assertNoSecrets(err.suggestion!, "ConfigError.suggestion")
  })
})

Deno.test("secret safety: ValidationError messages do not leak tokens", () => {
  try {
    validateEndpoint("https://evil.example.com/api/v2/users/me", HARVEST_BASE)
  } catch (e) {
    const err = e as ValidationError
    assertNoSecrets(err.message, "ValidationError.message")
    assertNoSecrets(err.suggestion!, "ValidationError.suggestion")
  }
})

// ---------------------------------------------------------------------------
// Request construction
// ---------------------------------------------------------------------------

async function withStubbedStdin<T>(
  text: string,
  fn: () => Promise<T>,
): Promise<T> {
  const originalStdin = Deno.stdin
  const bytes = new TextEncoder().encode(text)
  Object.defineProperty(Deno, "stdin", {
    value: {
      readable: new ReadableStream<Uint8Array>({
        start(controller) {
          controller.enqueue(bytes)
          controller.close()
        },
      }),
    },
    configurable: true,
    writable: true,
  })

  try {
    return await fn()
  } finally {
    Object.defineProperty(Deno, "stdin", {
      value: originalStdin,
      configurable: true,
      writable: true,
    })
  }
}

Deno.test("buildApiRequest: defaults to GET and encodes fields into query params", async () => {
  const request = await buildApiRequest(
    "/time_entries",
    HARVEST_BASE,
    42,
    {
      field: ["project_id=123", "is_running=true", "user_id=@me"],
      rawField: ["note=@me", "external_reference=00123"],
    },
  )

  assertEquals(request.method, "GET")
  assertEquals(request.endpointForm, "relative")
  assertEquals(request.queryParams, {
    project_id: "123",
    is_running: "true",
    user_id: "42",
    note: "@me",
    external_reference: "00123",
  })
  assertEquals(request.body, undefined)
})

Deno.test("buildApiRequest: builds a flat JSON body for non-GET requests", async () => {
  const request = await buildApiRequest(
    "/time_entries",
    HARVEST_BASE,
    42,
    {
      method: "post",
      field: [
        "project_id=123",
        "is_running=false",
        "hours=1.5",
        "notes=null",
      ],
      rawField: ["spent_date=2026-03-17", "external_reference=@me"],
    },
  )

  assertEquals(request.method, "POST")
  assertEquals(request.queryParams, {})
  assertEquals(JSON.parse(request.body!), {
    project_id: 123,
    is_running: false,
    hours: 1.5,
    notes: null,
    spent_date: "2026-03-17",
    external_reference: "@me",
  })
  assertEquals(request.body!.includes('"user_id"'), false)
})

Deno.test("buildApiRequest: expands @me only for exact typed field values", async () => {
  const request = await buildApiRequest(
    "/time_entries",
    HARVEST_BASE,
    42,
    {
      field: ["user_id=@me", "notes=prefix-@me"],
      rawField: ["reviewer=@me"],
    },
  )

  assertEquals(request.queryParams, {
    user_id: "42",
    notes: "prefix-@me",
    reviewer: "@me",
  })
})

Deno.test("buildApiRequest: reads --input file body verbatim", async () => {
  const dir = await Deno.makeTempDir()
  try {
    const path = `${dir}/payload.json`
    const payload = '{\n  "project_id": 123,\n  "notes": "@me stays raw"\n}'
    await Deno.writeTextFile(path, payload)

    const request = await buildApiRequest(
      "/time_entries",
      HARVEST_BASE,
      42,
      {
        method: "PATCH",
        input: path,
      },
    )

    assertEquals(request.method, "PATCH")
    assertEquals(request.body, payload)
    assertEquals(request.queryParams, {})
  } finally {
    await Deno.remove(dir, { recursive: true })
  }
})

Deno.test("buildApiRequest: reads --input from stdin verbatim", async () => {
  const payload = '{"project_id":123,"notes":"stdin payload"}'
  await withStubbedStdin(payload, async () => {
    const request = await buildApiRequest(
      "/time_entries",
      HARVEST_BASE,
      42,
      {
        method: "POST",
        input: "-",
      },
    )

    assertEquals(request.body, payload)
    assertEquals(request.queryParams, {})
  })
})

Deno.test("buildApiRequest: rejects --input combined with field-building flags", async () => {
  const err = await assertRejects(
    () =>
      buildApiRequest("/time_entries", HARVEST_BASE, 42, {
        input: "payload.json",
        field: ["project_id=123"],
      }),
    ValidationError,
  )

  assertStringIncludes(err.message, "Cannot combine --input")
  assertNoSecrets(err.message, "buildApiRequest input conflict")
})

Deno.test("buildApiRequest: allows caller-supplied non-protected headers", async () => {
  const request = await buildApiRequest(
    "/reports",
    HARVEST_BASE,
    42,
    {
      header: ["Accept:text/csv", "X-Trace-Id: req-123"],
    },
  )

  assertEquals(request.headers, {
    Accept: "text/csv",
    "X-Trace-Id": "req-123",
  })
})

Deno.test("buildApiRequest: rejects protected header overrides case-insensitively", async () => {
  const authorizationErr = await assertRejects(
    () =>
      buildApiRequest("/users/me", HARVEST_BASE, 42, {
        header: ["AUTHORIZATION: Bearer pat_abc123def456ghi789"],
      }),
    ValidationError,
  )
  assertStringIncludes(authorizationErr.message, "protected header")
  assertNoSecrets(
    authorizationErr.message,
    "buildApiRequest protected Authorization header",
  )

  const accountErr = await assertRejects(
    () =>
      buildApiRequest("/users/me", HARVEST_BASE, 42, {
        header: ["harvest-account-id: 999888"],
      }),
    ValidationError,
  )
  assertStringIncludes(accountErr.message, "protected header")
})

// ---------------------------------------------------------------------------
// Response passthrough and formatting tests
// ---------------------------------------------------------------------------

// Helper to capture stdout/stderr writes
function createCapture(): { write(text: string): void; output: string[] } {
  const output: string[] = []
  return {
    write(text: string) {
      output.push(text)
    },
    output,
  }
}

// Helper to create a mock fetch for response tests
function createMockFetch(
  handler: (url: string) => {
    status: number
    body?: unknown
    headers?: Record<string, string>
  },
): typeof globalThis.fetch {
  // deno-lint-ignore require-await
  return async (
    input: string | URL | Request,
    init?: RequestInit,
  ) => {
    const url = typeof input === "string"
      ? input
      : input instanceof URL
      ? input.toString()
      : input.url
    void init
    const result = handler(url)
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
}

function makeTestClient(
  mockFetch: typeof globalThis.fetch,
): HarvestClient {
  return new HarvestClient({
    accessToken: "test-token-abc123",
    accountId: "999888",
    fetch: mockFetch,
  })
}

function makeApiRequest(overrides: Partial<ApiRequest> = {}): ApiRequest {
  return {
    method: "GET",
    endpoint: "/users/me",
    endpointForm: "relative",
    queryParams: {},
    body: undefined,
    headers: {},
    paginate: false,
    include: false,
    ...overrides,
  }
}

type RelativeCall = {
  kind: "relative"
  path: string
  options?: Parameters<HarvestClient["requestRaw"]>[1]
}

type AbsoluteCall = {
  kind: "absolute"
  url: string
  options?: Parameters<HarvestClient["requestAbsoluteRaw"]>[1]
}

function makeQueuedRawClient(
  responses: RawResponse[],
): HarvestClient & {
  calls: Array<RelativeCall | AbsoluteCall>
} {
  const queue = [...responses]
  const calls: Array<RelativeCall | AbsoluteCall> = []

  const nextResponse = () => {
    const response = queue.shift()
    if (!response) {
      throw new Error("No queued RawResponse available for test client")
    }
    return response
  }

  return {
    calls,
    async requestRaw(
      path: string,
      options?: Parameters<HarvestClient["requestRaw"]>[1],
    ) {
      calls.push({ kind: "relative", path, options })
      return nextResponse()
    },
    async requestAbsoluteRaw(
      url: string,
      options?: Parameters<HarvestClient["requestAbsoluteRaw"]>[1],
    ) {
      calls.push({ kind: "absolute", url, options })
      return nextResponse()
    },
  } as HarvestClient & {
    calls: typeof calls
  }
}

// ---------------------------------------------------------------------------
// formatResponseHeaders
// ---------------------------------------------------------------------------

Deno.test("formatResponseHeaders: formats status and headers", () => {
  const result = formatResponseHeaders(200, [
    ["content-type", "application/json"],
    ["x-request-id", "abc123"],
  ])
  assertEquals(
    result,
    "HTTP 200\ncontent-type: application/json\nx-request-id: abc123\n",
  )
})

Deno.test("formatResponseHeaders: handles empty headers", () => {
  const result = formatResponseHeaders(404, [])
  assertEquals(result, "HTTP 404\n")
})

// ---------------------------------------------------------------------------
// detectPagination
// ---------------------------------------------------------------------------

Deno.test("detectPagination: detects links.next", () => {
  const body = JSON.stringify({
    time_entries: [],
    links: { next: "https://api.harvestapp.com/api/v2/time_entries?page=2" },
    next_page: 2,
  })
  const result = detectPagination(body)
  assertEquals(
    result!.nextUrl,
    "https://api.harvestapp.com/api/v2/time_entries?page=2",
  )
  assertEquals(result!.nextPage, 2)
})

Deno.test("detectPagination: falls back to next_page when links.next is null", () => {
  const body = JSON.stringify({
    time_entries: [],
    links: { next: null },
    next_page: 3,
  })
  const result = detectPagination(body)
  assertEquals(result!.nextUrl, null)
  assertEquals(result!.nextPage, 3)
})

Deno.test("detectPagination: returns null when no pagination markers", () => {
  const body = JSON.stringify({
    time_entries: [],
    links: { next: null },
    next_page: null,
  })
  assertEquals(detectPagination(body), null)
})

Deno.test("detectPagination: returns null for non-JSON body", () => {
  assertEquals(detectPagination("not json"), null)
})

Deno.test("detectPagination: returns null for empty object", () => {
  assertEquals(detectPagination("{}"), null)
})

// ---------------------------------------------------------------------------
// executeApiRequest — response passthrough
// ---------------------------------------------------------------------------

Deno.test("executeApiRequest: emits raw body on stdout for 200", async () => {
  const body = { id: 1, name: "Test User" }
  const fetch = createMockFetch(() => ({ status: 200, body }))
  const client = makeTestClient(fetch)
  const stdout = createCapture()
  const stderr = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest(),
    { stdout, stderr },
  )

  assertEquals(exitCode, 0)
  const output = stdout.output.join("")
  assertStringIncludes(output, '"id":1')
  assertStringIncludes(output, '"name":"Test User"')
  assertEquals(stderr.output.length, 0)
})

Deno.test("executeApiRequest: emits body and returns 1 for non-2xx", async () => {
  const body = { error: "Not Found" }
  const fetch = createMockFetch(() => ({ status: 404, body }))
  const client = makeTestClient(fetch)
  const stdout = createCapture()
  const stderr = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest(),
    { stdout, stderr },
  )

  assertEquals(exitCode, 1)
  const output = stdout.output.join("")
  assertStringIncludes(output, '"error":"Not Found"')
})

Deno.test("executeApiRequest: 204 produces no body output", async () => {
  const fetch = createMockFetch(() => ({ status: 204 }))
  const client = makeTestClient(fetch)
  const stdout = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({ method: "DELETE" }),
    { stdout },
  )

  assertEquals(exitCode, 0)
  assertEquals(stdout.output.join(""), "")
})

// ---------------------------------------------------------------------------
// executeApiRequest — --include
// ---------------------------------------------------------------------------

Deno.test("executeApiRequest: --include prefixes with status and headers", async () => {
  const body = { ok: true }
  const fetch = createMockFetch(() => ({
    status: 200,
    body,
    headers: { "x-request-id": "req-abc" },
  }))
  const client = makeTestClient(fetch)
  const stdout = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({ include: true }),
    { stdout },
  )

  assertEquals(exitCode, 0)
  const output = stdout.output.join("")
  assertStringIncludes(output, "HTTP 200")
  assertStringIncludes(output, "x-request-id: req-abc")
  assertStringIncludes(output, '"ok":true')
})

// ---------------------------------------------------------------------------
// executeApiRequest — pagination warning
// ---------------------------------------------------------------------------

Deno.test("executeApiRequest: warns on stderr when pages exist without --paginate", async () => {
  const body = {
    projects: [{ id: 1 }],
    links: { next: "https://api.harvestapp.com/api/v2/projects?page=2" },
    next_page: 2,
  }
  const fetch = createMockFetch(() => ({ status: 200, body }))
  const client = makeTestClient(fetch)
  const stdout = createCapture()
  const stderr = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({ paginate: false }),
    { stdout, stderr },
  )

  assertEquals(exitCode, 0)
  assertEquals(stderr.output.length, 1)
  assertStringIncludes(stderr.output[0], "additional pages")
  assertStringIncludes(stderr.output[0], "--paginate")
})

// ---------------------------------------------------------------------------
// executeApiRequest — pagination following
// ---------------------------------------------------------------------------

Deno.test("executeApiRequest: follows links.next when --paginate is set", async () => {
  let callCount = 0
  const fetch = createMockFetch((url: string) => {
    callCount++
    if (url.includes("page=2")) {
      return {
        status: 200,
        body: {
          projects: [{ id: 2 }],
          links: { next: null },
          next_page: null,
        },
      }
    }
    return {
      status: 200,
      body: {
        projects: [{ id: 1 }],
        links: { next: "https://api.harvestapp.com/api/v2/projects?page=2" },
        next_page: 2,
      },
    }
  })
  const client = makeTestClient(fetch)
  const stdout = createCapture()
  const stderr = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({ endpoint: "/projects", paginate: true }),
    { stdout, stderr },
  )

  assertEquals(exitCode, 0)
  assertEquals(callCount, 2)
  const output = stdout.output.join("")
  assertStringIncludes(output, '"id":1')
  assertStringIncludes(output, '"id":2')
})

Deno.test("executeApiRequest: follows next_page fallback when links.next is absent", async () => {
  const client = makeQueuedRawClient([
    {
      status: 200,
      headers: [["content-type", "application/json"]],
      body: JSON.stringify({
        items: [{ id: 1 }],
        links: { next: null },
        next_page: 2,
      }),
    },
    {
      status: 200,
      headers: [["content-type", "application/json"]],
      body: JSON.stringify({
        items: [{ id: 2 }],
        links: { next: null },
        next_page: null,
      }),
    },
  ])
  const stdout = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({
      endpoint: "/items",
      paginate: true,
      queryParams: { user_id: "42", from: "2026-03-17" },
    }),
    { stdout },
  )

  assertEquals(exitCode, 0)
  assertEquals(client.calls.length, 2)
  assertEquals(client.calls[0], {
    kind: "relative",
    path: "/items",
    options: {
      method: "GET",
      params: { user_id: "42", from: "2026-03-17" },
      headers: {},
      rawBody: undefined,
    },
  })
  assertEquals(client.calls[1], {
    kind: "relative",
    path: "/items",
    options: {
      method: "GET",
      params: { user_id: "42", from: "2026-03-17", page: "2" },
      headers: {},
      rawBody: undefined,
    },
  })
})

Deno.test("executeApiRequest: absolute endpoints preserve method body and query params", async () => {
  const client = makeQueuedRawClient([
    {
      status: 200,
      headers: [["content-type", "application/json"]],
      body: JSON.stringify({ ok: true }),
    },
  ])
  const stdout = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({
      method: "PATCH",
      endpoint: "https://api.harvestapp.com/api/v2/time_entries/123",
      endpointForm: "absolute",
      queryParams: { updated_by: "42" },
      body: '{"notes":"patched"}',
      headers: { "X-Trace-Id": "req-123" },
    }),
    { stdout },
  )

  assertEquals(exitCode, 0)
  assertEquals(client.calls.length, 1)
  assertEquals(client.calls[0], {
    kind: "absolute",
    url: "https://api.harvestapp.com/api/v2/time_entries/123?updated_by=42",
    options: {
      method: "PATCH",
      headers: { "X-Trace-Id": "req-123" },
      rawBody: '{"notes":"patched"}',
    },
  })
  assertStringIncludes(stdout.output.join(""), '"ok":true')
})

Deno.test("executeApiRequest: each page is a separate document with --include", async () => {
  let callCount = 0
  const fetch = createMockFetch((url: string) => {
    callCount++
    if (url.includes("page=2")) {
      return {
        status: 200,
        body: { items: [{ id: 2 }], links: { next: null }, next_page: null },
      }
    }
    return {
      status: 200,
      body: {
        items: [{ id: 1 }],
        links: { next: "https://api.harvestapp.com/api/v2/items?page=2" },
        next_page: 2,
      },
    }
  })
  const client = makeTestClient(fetch)
  const stdout = createCapture()

  const exitCode = await executeApiRequest(
    client,
    makeApiRequest({ endpoint: "/items", paginate: true, include: true }),
    { stdout },
  )

  assertEquals(exitCode, 0)
  assertEquals(callCount, 2)
  const output = stdout.output.join("")
  // Should have two "HTTP 200" lines — one per page
  const httpLines = output.split("\n").filter((l) => l === "HTTP 200")
  assertEquals(httpLines.length, 2)
})
