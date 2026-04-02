/**
 * E2E process-level entry mutation tests.
 *
 * Exercises add → update → remove against a mock Harvest server as a
 * single subprocess workflow, proving that mutation commands produce
 * correct request payloads, human/JSON output, and exit codes.
 *
 * Secret-safety invariant: every step asserts that raw tokens never
 * appear in stdout, stderr, or debug output from any invocation.
 *
 * Logging: each step logs CLI args, mock fixture, request URL/method,
 * status codes, and redaction-scan results to stderr for CI diagnostics.
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-888888.e2etoken1234567890abcdef"

function makeFixtureAccount(): Account {
  return {
    name: "e2e-entry",
    provider: "harvest",
    accountId: "888888",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "E2E",
    lastName: "Tester",
    email: "e2e@test.com",
    isDefault: true,
  }
}

/** Harvest API response shape for a time entry. */
function harvestEntry(overrides: Record<string, unknown> = {}) {
  return {
    id: 201,
    spent_date: "2026-03-16",
    hours: 1.5,
    rounded_hours: 1.5,
    notes: "Initial entry",
    is_running: false,
    billable: true,
    is_locked: false,
    project: { id: 10, name: "Timeslip" },
    task: { id: 20, name: "Development" },
    client: { id: 30, name: "Acme Corp" },
    ...overrides,
  }
}

interface CapturedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
}

/** Scan all output for raw tokens. */
function assertOutputSecretSafe(
  result: { stdout: string; stderr: string },
  label: string,
): void {
  assertEquals(
    result.stdout.includes(MOCK_TOKEN),
    false,
    `Raw token found in ${label} stdout`,
  )
  assertEquals(
    result.stderr.includes(MOCK_TOKEN),
    false,
    `Raw token found in ${label} stderr`,
  )
  assertNoSecrets(result.stdout, `${label} stdout`)
  assertNoSecrets(result.stderr, `${label} stderr`)
}

// ---------------------------------------------------------------------------
// E2E workflow: add → update → remove
// ---------------------------------------------------------------------------

Deno.test("e2e entry workflow: add → update → remove against mock server", async () => {
  const requests: CapturedRequest[] = []
  let entryState = harvestEntry()

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      let body: unknown = undefined
      if (
        req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE"
      ) {
        try {
          body = await req.json()
        } catch {
          // no body
        }
      }
      const url = new URL(req.url)
      requests.push({ url: req.url, method: req.method, headers, body })

      // Route: POST /time_entries → create
      if (req.method === "POST" && url.pathname.endsWith("/time_entries")) {
        return new Response(JSON.stringify(entryState), {
          status: 201,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Route: PATCH /time_entries/201 → update
      if (
        req.method === "PATCH" && url.pathname.endsWith("/time_entries/201")
      ) {
        const patchBody = body as Record<string, unknown>
        if (patchBody?.hours !== undefined) {
          entryState = { ...entryState, hours: patchBody.hours as number }
        }
        if (patchBody?.notes !== undefined) {
          entryState = { ...entryState, notes: patchBody.notes as string }
        }
        if (patchBody?.spent_date !== undefined) {
          entryState = {
            ...entryState,
            spent_date: patchBody.spent_date as string,
          }
        }
        return new Response(JSON.stringify(entryState), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        })
      }

      // Route: DELETE /time_entries/201 → remove
      if (
        req.method === "DELETE" && url.pathname.endsWith("/time_entries/201")
      ) {
        return new Response(null, { status: 204 })
      }

      return new Response(JSON.stringify({ message: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const port = addr.port
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_entry_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    // -----------------------------------------------------------------------
    // Step 1: Add entry (human mode)
    // -----------------------------------------------------------------------
    const add = await runCli(
      [
        "entry",
        "add",
        "--project-id",
        "10",
        "--task-id",
        "20",
        "--date",
        "2026-03-16",
        "--hours",
        "1.5",
        "--description",
        "Initial entry",
      ],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(add.code, 0, `add failed: ${add.stderr}`)
    assertStringIncludes(add.stdout, "Created")
    assertStringIncludes(add.stdout, "entry #201")
    assertOutputSecretSafe(add, "e2e add human")

    // Verify POST request body
    const postReq = requests.find((r) => r.method === "POST")
    assertEquals(postReq !== undefined, true, "Expected POST request")
    const postBody = postReq!.body as Record<string, unknown>
    assertEquals(postBody.project_id, 10)
    assertEquals(postBody.task_id, 20)
    assertEquals(postBody.spent_date, "2026-03-16")
    assertEquals(postBody.hours, 1.5)
    assertEquals(postBody.notes, "Initial entry")

    // -----------------------------------------------------------------------
    // Step 2: Add entry (JSON mode)
    // -----------------------------------------------------------------------
    const addJson = await runCli(
      [
        "--json",
        "entry",
        "add",
        "--project-id",
        "10",
        "--task-id",
        "20",
        "--date",
        "2026-03-16",
        "--hours",
        "1.5",
      ],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(addJson.code, 0, `add --json failed: ${addJson.stderr}`)
    const addData = JSON.parse(addJson.stdout)
    assertEquals(addData.id, 201)
    assertEquals(addData.hours, 1.5)
    assertEquals(addData.project_name, "Timeslip")
    assertOutputSecretSafe(addJson, "e2e add json")

    // -----------------------------------------------------------------------
    // Step 3: Update entry — change hours only (human mode)
    // -----------------------------------------------------------------------
    const update = await runCli(
      ["entry", "update", "201", "--hours", "3"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(update.code, 0, `update failed: ${update.stderr}`)
    assertStringIncludes(update.stdout, "Updated")
    assertStringIncludes(update.stdout, "entry #201")
    assertOutputSecretSafe(update, "e2e update human")

    // Verify PATCH request body is sparse (only hours)
    const patchReq = requests.find((r) => r.method === "PATCH")
    assertEquals(patchReq !== undefined, true, "Expected PATCH request")
    const patchBody = patchReq!.body as Record<string, unknown>
    assertEquals(patchBody.hours, 3)
    assertEquals(
      "notes" in patchBody,
      false,
      "notes should not be in sparse patch",
    )
    assertEquals(
      "spent_date" in patchBody,
      false,
      "spent_date should not be in sparse patch",
    )

    // -----------------------------------------------------------------------
    // Step 4: Update entry (JSON mode)
    // -----------------------------------------------------------------------
    const updateJson = await runCli(
      [
        "--json",
        "entry",
        "update",
        "201",
        "--hours",
        "4",
        "--description",
        "Updated notes",
      ],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      updateJson.code,
      0,
      `update --json failed: ${updateJson.stderr}`,
    )
    const updateData = JSON.parse(updateJson.stdout)
    assertEquals(updateData.id, 201)
    assertEquals(updateData.hours, 4)
    assertEquals(updateData.notes, "Updated notes")
    assertOutputSecretSafe(updateJson, "e2e update json")

    // -----------------------------------------------------------------------
    // Step 5: Remove entry (human mode)
    // -----------------------------------------------------------------------
    const remove = await runCli(
      ["entry", "remove", "201"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(remove.code, 0, `remove failed: ${remove.stderr}`)
    assertStringIncludes(remove.stdout, "Deleted")
    assertStringIncludes(remove.stdout, "entry #201")
    assertOutputSecretSafe(remove, "e2e remove human")

    // Verify DELETE request
    const deleteReq = requests.find((r) => r.method === "DELETE")
    assertEquals(deleteReq !== undefined, true, "Expected DELETE request")
    assertStringIncludes(deleteReq!.url, "/time_entries/201")

    // -----------------------------------------------------------------------
    // Step 6: Remove entry (JSON mode) — re-add then remove
    // -----------------------------------------------------------------------
    const removeJson = await runCli(
      ["--json", "entry", "remove", "201"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      removeJson.code,
      0,
      `remove --json failed: ${removeJson.stderr}`,
    )
    const removeData = JSON.parse(removeJson.stdout)
    assertEquals(removeData.ok, true)
    assertEquals(removeData.entry_id, 201)
    assertOutputSecretSafe(removeJson, "e2e remove json")

    // -----------------------------------------------------------------------
    // Step 7: Verify all requests had correct auth headers
    // -----------------------------------------------------------------------
    for (const req of requests) {
      assertStringIncludes(req.headers["authorization"] ?? "", "Bearer")
      assertEquals(req.headers["harvest-account-id"], "888888")
    }
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: debug mode across entry mutations never leaks tokens
// ---------------------------------------------------------------------------

Deno.test("e2e entry: TIMESLIP_DEBUG=1 add+update+remove never leaks tokens", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      if (req.method === "DELETE") {
        return new Response(null, { status: 204 })
      }
      // Consume body to avoid hanging
      try {
        await req.json()
      } catch { /* ok */ }
      return new Response(JSON.stringify(harvestEntry()), {
        status: req.method === "POST" ? 201 : 200,
        headers: { "Content-Type": "application/json" },
      })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({
    prefix: "timeslip_e2e_debug_entry_",
  })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
    TIMESLIP_DEBUG: "1",
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    // Add
    const add = await runCli(
      [
        "entry",
        "add",
        "--project-id",
        "10",
        "--task-id",
        "20",
        "--date",
        "2026-03-16",
        "--hours",
        "1",
      ],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(add.code, 0, `debug add failed: ${add.stderr}`)
    assertStringIncludes(add.stderr, "[harvest]")
    assertStringIncludes(add.stderr, "POST")
    assertOutputSecretSafe(add, "debug add")

    // Update
    const update = await runCli(
      ["entry", "update", "201", "--hours", "2"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(update.code, 0, `debug update failed: ${update.stderr}`)
    assertStringIncludes(update.stderr, "[harvest]")
    assertStringIncludes(update.stderr, "PATCH")
    assertOutputSecretSafe(update, "debug update")

    // Remove
    const remove = await runCli(
      ["entry", "remove", "201"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(remove.code, 0, `debug remove failed: ${remove.stderr}`)
    assertStringIncludes(remove.stderr, "[harvest]")
    assertStringIncludes(remove.stderr, "DELETE")
    assertOutputSecretSafe(remove, "debug remove")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: error paths produce correct exit codes
// ---------------------------------------------------------------------------

Deno.test("e2e entry: validation errors exit with code 2", async () => {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_val_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    // --hours 0 on add
    const add0 = await runCli(
      [
        "entry",
        "add",
        "--project-id",
        "10",
        "--task-id",
        "20",
        "--date",
        "2026-03-16",
        "--hours",
        "0",
      ],
      { configDir: xdgBase },
    )
    assertEquals(add0.code, 2, "Expected validation exit code for --hours 0")
    assertOutputSecretSafe(add0, "val hours=0")

    // Empty patch on update
    const emptyPatch = await runCli(
      ["entry", "update", "101"],
      { configDir: xdgBase },
    )
    assertEquals(
      emptyPatch.code,
      2,
      "Expected validation exit code for empty patch",
    )
    assertOutputSecretSafe(emptyPatch, "val empty patch")

    // Conflicting description flags
    const conflict = await runCli(
      ["entry", "update", "101", "--description", "foo", "--clear-description"],
      { configDir: xdgBase },
    )
    assertEquals(
      conflict.code,
      2,
      "Expected validation exit code for flag conflict",
    )
    assertOutputSecretSafe(conflict, "val conflict")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e entry: auth errors exit with code 4", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_auth_entry_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    const result = await runCli(
      [
        "entry",
        "add",
        "--project-id",
        "10",
        "--task-id",
        "20",
        "--date",
        "2026-03-16",
        "--hours",
        "1",
      ],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(result.code, 4, "Expected auth exit code")
    assertStringIncludes(result.stderr, "authentication failed")
    assertOutputSecretSafe(result, "e2e auth error")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: entry list — multi-page pagination across mock server
// ---------------------------------------------------------------------------

/** Harvest API response shape for a time entry. */
function harvestListEntry(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    spent_date: "2026-03-16",
    hours: 1,
    rounded_hours: 1,
    notes: `Entry ${id}`,
    is_running: false,
    billable: true,
    is_locked: false,
    project: { id: 10, name: "Timeslip" },
    task: { id: 20, name: "Development" },
    client: { id: 30, name: "Acme Corp" },
    ...overrides,
  }
}

Deno.test("e2e entry list: walks 3 pages, returns all entries with correct JSON envelope", async () => {
  // 3 pages, 3 entries each = 9 total entries
  // A single-page implementation would only return 3 entries
  const allEntries = Array.from(
    { length: 9 },
    (_, i) => harvestListEntry(i + 1),
  )
  const requests: CapturedRequest[] = []

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      const url = new URL(req.url)
      requests.push({
        url: req.url,
        method: req.method,
        headers,
        body: undefined,
      })

      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 3
      const pageEntries = allEntries.slice(start, start + 3)
      const nextPage = page < 3 ? page + 1 : null

      const origin = url.origin
      // Carry forward all query params except page (mimics real Harvest links)
      const baseParams = new URLSearchParams()
      url.searchParams.forEach((v, k) => {
        if (k !== "page") baseParams.set(k, v)
      })
      const qs = baseParams.toString()
      const sep = qs ? `${qs}&` : ""
      const body = {
        time_entries: pageEntries,
        per_page: 3,
        total_pages: 3,
        total_entries: 9,
        next_page: nextPage,
        previous_page: page > 1 ? page - 1 : null,
        page,
        links: {
          first: `${origin}/api/v2/time_entries?${sep}page=1`,
          last: `${origin}/api/v2/time_entries?${sep}page=3`,
          next: nextPage
            ? `${origin}/api/v2/time_entries?${sep}page=${nextPage}`
            : null,
          previous: null,
        },
      }
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_list_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    // -----------------------------------------------------------------------
    // JSON mode — verify all entries and metadata
    // -----------------------------------------------------------------------
    const jsonResult = await runCli(
      ["--json", "entry", "list", "--all", "--page-size", "3"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(jsonResult.code, 0, `list --json failed: ${jsonResult.stderr}`)
    const data = JSON.parse(jsonResult.stdout)

    // Must have all 9 entries from 3 pages
    assertEquals(data.items.length, 9, "Expected all 9 entries from 3 pages")
    assertEquals(data.total_entries, 9)
    assertEquals(data.pages_fetched, 3)
    assertEquals(data.truncated, false)

    // Verify entry IDs are correct
    const ids = data.items.map((e: Record<string, unknown>) => e.id)
    assertEquals(ids, [1, 2, 3, 4, 5, 6, 7, 8, 9])

    // Verify each entry has the expected shape
    for (const item of data.items) {
      assertEquals(typeof item.id, "number")
      assertEquals(typeof item.date, "string")
      assertEquals(typeof item.hours, "number")
      assertEquals(typeof item.project_name, "string")
      assertEquals(typeof item.task_name, "string")
      assertEquals(typeof item.is_running, "boolean")
    }

    assertOutputSecretSafe(jsonResult, "e2e list json")

    // -----------------------------------------------------------------------
    // Verify user_id was sent on every request
    // -----------------------------------------------------------------------
    for (const req of requests) {
      const reqUrl = new URL(req.url)
      assertEquals(
        reqUrl.searchParams.get("user_id"),
        "42",
        `user_id missing on ${req.url}`,
      )
    }

    // -----------------------------------------------------------------------
    // Human mode — verify table output
    // -----------------------------------------------------------------------
    requests.length = 0 // Reset for human mode requests
    const humanResult = await runCli(
      ["entry", "list", "--all", "--page-size", "3"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      humanResult.code,
      0,
      `list human failed: ${humanResult.stderr}`,
    )
    assertStringIncludes(humanResult.stdout, "ID")
    assertStringIncludes(humanResult.stdout, "DATE")
    assertStringIncludes(humanResult.stdout, "HOURS")
    assertStringIncludes(humanResult.stdout, "PROJECT")
    // Should contain entries from all pages
    for (let i = 1; i <= 9; i++) {
      assertStringIncludes(humanResult.stdout, String(i))
    }
    assertOutputSecretSafe(humanResult, "e2e list human")

    // -----------------------------------------------------------------------
    // Auth headers should be correct on all requests
    // -----------------------------------------------------------------------
    for (const req of requests) {
      assertStringIncludes(req.headers["authorization"] ?? "", "Bearer")
      assertEquals(req.headers["harvest-account-id"], "888888")
    }
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

Deno.test("e2e entry list: --limit truncates multi-page results with correct metadata", async () => {
  // 2 pages of 5 entries each = 10 total, limit=7
  const allEntries = Array.from(
    { length: 10 },
    (_, i) => harvestListEntry(i + 1),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 5
      const pageEntries = allEntries.slice(start, start + 5)
      const nextPage = page < 2 ? page + 1 : null

      return new Response(
        JSON.stringify({
          time_entries: pageEntries,
          per_page: 5,
          total_pages: 2,
          total_entries: 10,
          next_page: nextPage,
          previous_page: page > 1 ? page - 1 : null,
          page,
          links: {
            first: "http://x",
            last: "http://x",
            next: null,
            previous: null,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_list_limit_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    const result = await runCli(
      ["--json", "entry", "list", "--all", "--limit", "7"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)

    assertEquals(data.items.length, 7, "Expected exactly 7 entries")
    assertEquals(
      data.total_entries,
      10,
      "total_entries should reflect server total",
    )
    assertEquals(data.truncated, true, "truncated must be true when limited")

    // Verify correct entries were returned (first 7)
    const ids = data.items.map((e: Record<string, unknown>) => e.id)
    assertEquals(ids, [1, 2, 3, 4, 5, 6, 7])

    assertOutputSecretSafe(result, "e2e list limit")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

Deno.test("e2e entry list: debug mode shows pagination progress without leaking secrets", async () => {
  const allEntries = Array.from(
    { length: 6 },
    (_, i) => harvestListEntry(i + 1),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 3
      const pageEntries = allEntries.slice(start, start + 3)
      const nextPage = page < 2 ? page + 1 : null

      return new Response(
        JSON.stringify({
          time_entries: pageEntries,
          per_page: 3,
          total_pages: 2,
          total_entries: 6,
          next_page: nextPage,
          previous_page: page > 1 ? page - 1 : null,
          page,
          links: {
            first: "http://x",
            last: "http://x",
            next: null,
            previous: null,
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      )
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_list_debug_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
    TIMESLIP_DEBUG: "1",
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    const result = await runCli(
      ["entry", "list", "--all", "--page-size", "3"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)

    // Debug should show GET requests for time_entries
    assertStringIncludes(result.stderr, "[harvest]")
    assertStringIncludes(result.stderr, "GET")
    assertStringIncludes(result.stderr, "time_entries")

    // Must never leak token
    assertEquals(
      result.stdout.includes(MOCK_TOKEN),
      false,
      "Token leaked in stdout",
    )
    assertEquals(
      result.stderr.includes(MOCK_TOKEN),
      false,
      "Token leaked in stderr",
    )
    assertEquals(
      result.stderr.includes("Bearer"),
      false,
      "Bearer header leaked in debug output",
    )
    assertOutputSecretSafe(result, "e2e list debug")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

Deno.test("e2e entry list: validation errors produce exit code 2", async () => {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_list_val_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    // --today + --all conflict
    const conflict = await runCli(
      ["entry", "list", "--today", "--all"],
      { configDir: xdgBase },
    )
    assertEquals(
      conflict.code,
      2,
      "Expected validation exit code for scope conflict",
    )
    assertOutputSecretSafe(conflict, "e2e list val conflict")

    // --from after --to
    const rangeErr = await runCli(
      ["entry", "list", "--from", "2026-12-31", "--to", "2026-01-01"],
      { configDir: xdgBase },
    )
    assertEquals(
      rangeErr.code,
      2,
      "Expected validation exit code for bad date range",
    )
    assertOutputSecretSafe(rangeErr, "e2e list val range")

    // Invalid --from
    const badFrom = await runCli(
      ["entry", "list", "--from", "nope"],
      { configDir: xdgBase },
    )
    assertEquals(
      badFrom.code,
      2,
      "Expected validation exit code for invalid date",
    )
    assertOutputSecretSafe(badFrom, "e2e list val bad-from")

    // --limit 0
    const badLimit = await runCli(
      ["entry", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(
      badLimit.code,
      2,
      "Expected validation exit code for bad limit",
    )
    assertOutputSecretSafe(badLimit, "e2e list val bad-limit")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e entry list: 401 auth error exits with code 4", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_list_auth_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    const result = await runCli(
      ["entry", "list", "--all"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(result.code, 4, "Expected auth exit code")
    assertStringIncludes(result.stderr, "authentication failed")
    assertOutputSecretSafe(result, "e2e list auth error")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: existing error path tests
// ---------------------------------------------------------------------------

Deno.test("e2e entry: 404 not-found on remove exits with code 1", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ message: "Record not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_404_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-entry", appDir)

    const result = await runCli(
      ["entry", "remove", "99999"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(result.code, 1, "Expected runtime exit code for 404")
    assertStringIncludes(result.stderr, "not found")
    assertOutputSecretSafe(result, "e2e 404 remove")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})
