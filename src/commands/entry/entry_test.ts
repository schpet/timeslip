/**
 * Unit and command-level tests for entry mutations (add, update, remove).
 *
 * Covers:
 * - buildPatch: sparse patch construction, --clear-description, field inclusion
 * - renderEntry: normalized JSON output shape from domain TimeEntry
 * - entry/add/update/remove --help snapshots
 * - entry add: rejects --hours 0, accepts omitted hours, preserves description
 * - entry update: rejects empty patch, rejects --description + --clear-description,
 *   only sends explicitly provided fields
 * - entry remove: emits confirmation/success payload, maps 404 to not-found
 * - Exit-code assertions for validation vs provider/auth failures
 * - Human and JSON output contracts for all mutations
 * - Secret redaction in all output paths
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"
import { buildPatch } from "./update.ts"
import { renderEntry } from "./render.ts"
import type { TimeEntry } from "../../domain/mod.ts"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-777777.testtoken1234567890abcdef"

function makeFixtureAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "default",
    provider: "harvest",
    accountId: "777777",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    isDefault: true,
    ...overrides,
  }
}

function makeFixtureEntry(overrides: Partial<TimeEntry> = {}): TimeEntry {
  return {
    id: 101,
    date: "2026-03-16",
    hours: 2.5,
    roundedHours: 2.5,
    notes: "Working on tests",
    isRunning: false,
    isBillable: true,
    isLocked: false,
    projectId: 10,
    projectName: "Timeslip",
    taskId: 20,
    taskName: "Development",
    clientId: 30,
    clientName: "Acme Corp",
    ...overrides,
  }
}

/** Harvest API response shape for a time entry. */
function harvestEntryResponse(overrides: Record<string, unknown> = {}) {
  return {
    id: 101,
    spent_date: "2026-03-16",
    hours: 2.5,
    rounded_hours: 2.5,
    notes: "Working on tests",
    is_running: false,
    billable: true,
    is_locked: false,
    project: { id: 10, name: "Timeslip" },
    task: { id: 20, name: "Development" },
    client: { id: 30, name: "Acme Corp" },
    ...overrides,
  }
}

async function withTempXdg(
  fn: (xdgBase: string, appDir: string) => Promise<void>,
): Promise<void> {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_entry_test_" })
  const appDir = join(xdgBase, "timeslip")
  try {
    await fn(xdgBase, appDir)
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
}

/** Captured request from mock server. */
interface CapturedRequest {
  url: string
  method: string
  headers: Record<string, string>
  body: unknown
}

/** Start a local HTTP mock that records requests and serves canned responses. */
function startMockHarvest(
  handler: (req: Request) => Response | Promise<Response>,
): { port: number; close: () => void; requests: CapturedRequest[] } {
  const requests: CapturedRequest[] = []

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      let body: unknown = undefined
      if (req.method !== "GET" && req.method !== "HEAD") {
        try {
          body = await req.json()
        } catch {
          // no body
        }
      }
      requests.push({ url: req.url, method: req.method, headers, body })
      return handler(req)
    },
  )

  const addr = server.addr as Deno.NetAddr
  return {
    port: addr.port,
    close: () => server.shutdown(),
    requests,
  }
}

// ===========================================================================
// buildPatch — sparse patch construction
// ===========================================================================

Deno.test("buildPatch: empty options produces empty patch", () => {
  const patch = buildPatch({})
  assertEquals(patch, {})
})

Deno.test("buildPatch: includes only explicitly provided fields", () => {
  const patch = buildPatch({ hours: 3 })
  assertEquals(patch, { hours: 3 })
  assertEquals("notes" in patch, false)
  assertEquals("date" in patch, false)
  assertEquals("projectId" in patch, false)
  assertEquals("taskId" in patch, false)
})

Deno.test("buildPatch: hours=0 is a valid patch value", () => {
  const patch = buildPatch({ hours: 0 })
  assertEquals(patch, { hours: 0 })
})

Deno.test("buildPatch: description maps to notes field", () => {
  const patch = buildPatch({ description: "Updated notes" })
  assertEquals(patch, { notes: "Updated notes" })
})

Deno.test("buildPatch: --clear-description sets notes to empty string", () => {
  const patch = buildPatch({ clearDescription: true })
  assertEquals(patch, { notes: "" })
})

Deno.test("buildPatch: --clear-description takes priority over description", () => {
  // If both are somehow provided, clearDescription wins
  const patch = buildPatch({
    clearDescription: true,
    description: "should be ignored",
  })
  assertEquals(patch, { notes: "" })
})

Deno.test("buildPatch: all fields provided produces full patch", () => {
  const patch = buildPatch({
    hours: 5,
    description: "Full patch",
    date: "2026-04-01",
    projectId: 99,
    taskId: 88,
  })
  assertEquals(patch, {
    hours: 5,
    notes: "Full patch",
    date: "2026-04-01",
    projectId: 99,
    taskId: 88,
  })
})

Deno.test("buildPatch: date field passes through verbatim", () => {
  const patch = buildPatch({ date: "2026-12-31" })
  assertEquals(patch, { date: "2026-12-31" })
})

// ===========================================================================
// renderEntry — JSON output normalization
// ===========================================================================

Deno.test("renderEntry: maps all domain fields to snake_case output", () => {
  const entry = makeFixtureEntry()
  const rendered = renderEntry(entry)

  assertEquals(rendered.id, 101)
  assertEquals(rendered.date, "2026-03-16")
  assertEquals(rendered.hours, 2.5)
  assertEquals(rendered.rounded_hours, 2.5)
  assertEquals(rendered.notes, "Working on tests")
  assertEquals(rendered.is_running, false)
  assertEquals(rendered.is_billable, true)
  assertEquals(rendered.is_locked, false)
  assertEquals(rendered.project_id, 10)
  assertEquals(rendered.project_name, "Timeslip")
  assertEquals(rendered.task_id, 20)
  assertEquals(rendered.task_name, "Development")
  assertEquals(rendered.client_id, 30)
  assertEquals(rendered.client_name, "Acme Corp")
})

Deno.test("renderEntry: snapshot of rendered output", async (t) => {
  const entry = makeFixtureEntry()
  await assertSnapshot(t, renderEntry(entry))
})

Deno.test("renderEntry: null notes preserved", () => {
  const entry = makeFixtureEntry({ notes: null })
  assertEquals(renderEntry(entry).notes, null)
})

Deno.test("renderEntry: running timer entry", () => {
  const entry = makeFixtureEntry({ isRunning: true, hours: 0 })
  const rendered = renderEntry(entry)
  assertEquals(rendered.is_running, true)
  assertEquals(rendered.hours, 0)
})

Deno.test("renderEntry: output has exactly 14 fields", () => {
  const rendered = renderEntry(makeFixtureEntry())
  assertEquals(Object.keys(rendered).length, 14)
})

// ===========================================================================
// Help snapshots
// ===========================================================================

Deno.test("entry --help: exits 0 with subcommand list", async () => {
  const result = await runCli(["entry", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "add")
  assertStringIncludes(result.stdout, "update")
  assertStringIncludes(result.stdout, "remove")
  assertStringIncludes(result.stdout, "list")
  assertNoSecrets(result.stdout, "entry --help stdout")
  assertNoSecrets(result.stderr, "entry --help stderr")
})

Deno.test("entry --help: snapshot", async (t) => {
  const result = await runCli(["entry", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("entry add --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["entry", "add", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--project-id")
  assertStringIncludes(result.stdout, "--task-id")
  assertStringIncludes(result.stdout, "--date")
  assertStringIncludes(result.stdout, "--hours")
  assertStringIncludes(result.stdout, "--description")
  assertNoSecrets(result.stdout, "entry add --help stdout")
})

Deno.test("entry add --help: snapshot", async (t) => {
  const result = await runCli(["entry", "add", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("entry update --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["entry", "update", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--hours")
  assertStringIncludes(result.stdout, "--description")
  assertStringIncludes(result.stdout, "--clear-description")
  assertStringIncludes(result.stdout, "--date")
  assertStringIncludes(result.stdout, "--project-id")
  assertStringIncludes(result.stdout, "--task-id")
  assertNoSecrets(result.stdout, "entry update --help stdout")
})

Deno.test("entry update --help: snapshot", async (t) => {
  const result = await runCli(["entry", "update", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("entry remove --help: exits 0", async () => {
  const result = await runCli(["entry", "remove", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "entry-id")
  assertNoSecrets(result.stdout, "entry remove --help stdout")
})

Deno.test("entry remove --help: snapshot", async (t) => {
  const result = await runCli(["entry", "remove", "--help"])
  await assertSnapshot(t, result.stdout)
})

// ===========================================================================
// entry add — validation
// ===========================================================================

Deno.test("entry add: --hours 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
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
        "0",
      ],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Cannot set --hours to 0")
    assertStringIncludes(result.stderr, "running timer")
    assertNoSecrets(result.stdout, "add hours=0 stdout")
    assertNoSecrets(result.stderr, "add hours=0 stderr")
  })
})

// ===========================================================================
// entry add — success with mock server
// ===========================================================================

Deno.test("entry add: creates entry and prints human confirmation", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
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
          "2.5",
          "--description",
          "Working on tests",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Created")
      assertStringIncludes(result.stdout, "entry #101")
      assertStringIncludes(result.stdout, "Timeslip")
      assertStringIncludes(result.stdout, "Development")
      assertNoSecrets(result.stdout, "entry add stdout")
      assertNoSecrets(result.stderr, "entry add stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add: sends correct request body to provider", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      await runCli(
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
          "2.5",
          "--description",
          "Test notes",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      // Find the POST request
      const post = mock.requests.find((r) => r.method === "POST")
      assertEquals(post !== undefined, true, "Expected a POST request")
      const body = post!.body as Record<string, unknown>
      assertEquals(body.project_id, 10)
      assertEquals(body.task_id, 20)
      assertEquals(body.spent_date, "2026-03-16")
      assertEquals(body.hours, 2.5)
      assertEquals(body.notes, "Test notes")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add: omitted hours sends no hours field (timer mode)", async () => {
  const mock = startMockHarvest(() =>
    new Response(
      JSON.stringify(harvestEntryResponse({ is_running: true, hours: 0 })),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
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
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "timer running")

      // Verify no hours in request body
      const post = mock.requests.find((r) => r.method === "POST")
      const body = post!.body as Record<string, unknown>
      assertEquals(
        "hours" in body,
        false,
        "hours should not be in request body when omitted",
      )
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add --json: returns structured JSON entry", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
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
          "2.5",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)
      assertEquals(data.id, 101)
      assertEquals(data.date, "2026-03-16")
      assertEquals(data.hours, 2.5)
      assertEquals(data.project_name, "Timeslip")
      assertEquals(data.task_name, "Development")
      assertEquals(data.is_running, false)
      assertNoSecrets(result.stdout, "entry add --json stdout")
      assertNoSecrets(result.stderr, "entry add --json stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add --json: snapshot of JSON output", async (t) => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
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
          "2.5",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, JSON.parse(result.stdout))
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add: preserves description in request body", async () => {
  const mock = startMockHarvest(() =>
    new Response(
      JSON.stringify(harvestEntryResponse({ notes: "My important note" })),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      },
    )
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
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
          "--description",
          "My important note",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const post = mock.requests.find((r) => r.method === "POST")
      assertEquals(
        (post!.body as Record<string, unknown>).notes,
        "My important note",
      )
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry add — auth failure
// ===========================================================================

Deno.test("entry add: 401 exits with auth error code", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
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
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 4, "Expected exit code 4 (Auth)")
      assertStringIncludes(result.stderr, "authentication failed")
      assertNoSecrets(result.stdout, "add 401 stdout")
      assertNoSecrets(result.stderr, "add 401 stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry update — validation
// ===========================================================================

Deno.test("entry update: empty patch exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "update", "101"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "No fields to update")
    assertNoSecrets(result.stderr, "update empty patch stderr")
  })
})

Deno.test("entry update: --description and --clear-description conflict exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "update", "101", "--description", "foo", "--clear-description"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(
      result.stderr,
      "Cannot use --description and --clear-description together",
    )
    assertNoSecrets(result.stderr, "update conflict stderr")
  })
})

// ===========================================================================
// entry update — success with mock server
// ===========================================================================

Deno.test("entry update: sends only provided fields in PATCH body", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse({ hours: 5 })), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "update", "101", "--hours", "5"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Updated")
      assertStringIncludes(result.stdout, "entry #101")

      // Verify the outgoing PATCH body only contains hours
      const patch = mock.requests.find((r) => r.method === "PATCH")
      assertEquals(patch !== undefined, true, "Expected a PATCH request")
      const body = patch!.body as Record<string, unknown>
      assertEquals(body.hours, 5)
      assertEquals(
        "notes" in body,
        false,
        "notes should not be in sparse patch",
      )
      assertEquals(
        "spent_date" in body,
        false,
        "spent_date should not be in sparse patch",
      )
      assertEquals(
        "project_id" in body,
        false,
        "project_id should not be in sparse patch",
      )
      assertEquals(
        "task_id" in body,
        false,
        "task_id should not be in sparse patch",
      )
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update: --clear-description sends notes='' in PATCH body", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse({ notes: null })), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "update", "101", "--clear-description"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const patch = mock.requests.find((r) => r.method === "PATCH")
      const body = patch!.body as Record<string, unknown>
      assertEquals(body.notes, "")
      assertEquals(
        "hours" in body,
        false,
        "hours should not be in patch for --clear-description only",
      )
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update --json: returns structured JSON entry", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse({ hours: 8 })), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "update", "101", "--hours", "8"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)
      assertEquals(data.id, 101)
      assertEquals(data.hours, 8)
      assertEquals(data.project_name, "Timeslip")
      assertNoSecrets(result.stdout, "update --json stdout")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update --json: snapshot", async (t) => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse({ hours: 8 })), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "update", "101", "--hours", "8"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, JSON.parse(result.stdout))
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update: multiple fields sends all in PATCH body", async () => {
  const mock = startMockHarvest(() =>
    new Response(
      JSON.stringify(harvestEntryResponse({
        hours: 4,
        spent_date: "2026-04-01",
        notes: "New notes",
      })),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        [
          "entry",
          "update",
          "101",
          "--hours",
          "4",
          "--date",
          "2026-04-01",
          "--description",
          "New notes",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const patch = mock.requests.find((r) => r.method === "PATCH")
      const body = patch!.body as Record<string, unknown>
      assertEquals(body.hours, 4)
      assertEquals(body.spent_date, "2026-04-01")
      assertEquals(body.notes, "New notes")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry update — 404 not found
// ===========================================================================

Deno.test("entry update: 404 exits with not-found error", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ message: "Record not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "update", "99999", "--hours", "1"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 1, "Expected exit code 1 (Runtime/NotFound)")
      assertStringIncludes(result.stderr, "not found")
      assertNoSecrets(result.stderr, "update 404 stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry remove — success
// ===========================================================================

Deno.test("entry remove: prints human confirmation on success", async () => {
  const mock = startMockHarvest(() => new Response(null, { status: 204 }))
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Deleted")
      assertStringIncludes(result.stdout, "entry #101")
      assertNoSecrets(result.stdout, "remove stdout")
      assertNoSecrets(result.stderr, "remove stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry remove --json: returns structured success payload", async () => {
  const mock = startMockHarvest(() => new Response(null, { status: 204 }))
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)
      assertEquals(data.ok, true)
      assertEquals(data.entry_id, 101)
      assertNoSecrets(result.stdout, "remove --json stdout")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry remove --json: snapshot", async (t) => {
  const mock = startMockHarvest(() => new Response(null, { status: 204 }))
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, JSON.parse(result.stdout))
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry remove — 404 not found
// ===========================================================================

Deno.test("entry remove: 404 exits with not-found error", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ message: "Record not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "remove", "99999"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 1, "Expected exit code 1 (Runtime/NotFound)")
      assertStringIncludes(result.stderr, "not found")
      assertNoSecrets(result.stderr, "remove 404 stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry remove — auth failure
// ===========================================================================

Deno.test("entry remove: 401 exits with auth error code", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 4, "Expected exit code 4 (Auth)")
      assertStringIncludes(result.stderr, "authentication failed")
      assertNoSecrets(result.stderr, "remove 401 stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry add — no account configured
// ===========================================================================

Deno.test("entry add: no account configured exits with error", async () => {
  await withTempXdg(async (xdgBase) => {
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
      { configDir: xdgBase },
    )
    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "add no-account stderr")
  })
})

// ===========================================================================
// entry list --help
// ===========================================================================

Deno.test("entry list --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["entry", "list", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--today")
  assertStringIncludes(result.stdout, "--from")
  assertStringIncludes(result.stdout, "--to")
  assertStringIncludes(result.stdout, "--all")
  assertStringIncludes(result.stdout, "--running")
  assertStringIncludes(result.stdout, "--project-id")
  assertStringIncludes(result.stdout, "--client-id")
  assertStringIncludes(result.stdout, "--limit")
  assertStringIncludes(result.stdout, "--page-size")
  assertNoSecrets(result.stdout, "entry list --help stdout")
  assertNoSecrets(result.stderr, "entry list --help stderr")
})

Deno.test("entry list --help: snapshot", async (t) => {
  const result = await runCli(["entry", "list", "--help"])
  await assertSnapshot(t, result.stdout)
})

// ===========================================================================
// entry list — date scope validation
// ===========================================================================

Deno.test("entry list: --today and --all conflict exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--today", "--all"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Cannot combine")
    assertNoSecrets(result.stderr, "list today+all stderr")
  })
})

Deno.test("entry list: --today and --from conflict exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--today", "--from", "2026-01-01"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Cannot combine")
    assertNoSecrets(result.stderr, "list today+from stderr")
  })
})

Deno.test("entry list: --all and --from conflict exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--all", "--from", "2026-01-01"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Cannot combine")
    assertNoSecrets(result.stderr, "list all+from stderr")
  })
})

Deno.test("entry list: --from after --to exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--from", "2026-03-20", "--to", "2026-03-10"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "must not be after")
    assertNoSecrets(result.stderr, "list from>to stderr")
  })
})

Deno.test("entry list: invalid --from date exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--from", "not-a-date"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Invalid --from date")
    assertNoSecrets(result.stderr, "list bad-from stderr")
  })
})

Deno.test("entry list: invalid --to date exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--to", "xyz"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Invalid --to date")
    assertNoSecrets(result.stderr, "list bad-to stderr")
  })
})

Deno.test("entry list: --limit 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--limit must be at least 1")
    assertNoSecrets(result.stderr, "list limit=0 stderr")
  })
})

Deno.test("entry list: --page-size 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      ["entry", "list", "--page-size", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--page-size must be at least 1")
    assertNoSecrets(result.stderr, "list page-size=0 stderr")
  })
})

// ===========================================================================
// entry list — implicit --today default scope
// ===========================================================================

Deno.test("entry list: defaults to today's entries (implicit --today)", async () => {
  const requests: CapturedRequest[] = []
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    requests.push({
      url: req.url,
      method: req.method,
      headers: {},
      body: undefined,
    })
    return new Response(
      JSON.stringify({
        time_entries: [harvestEntryResponse()],
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      // Verify the request used today's date for from/to
      const getReq = requests.find((r) => r.method === "GET")
      assertEquals(getReq !== undefined, true, "Expected a GET request")
      const reqUrl = new URL(getReq!.url)
      const from = reqUrl.searchParams.get("from")
      const to = reqUrl.searchParams.get("to")
      assertEquals(from !== null, true, "from param should be set by default")
      assertEquals(to !== null, true, "to param should be set by default")
      assertEquals(from, to, "default scope should set from=to=today")
      // Verify date format is YYYY-MM-DD
      assertEquals(
        /^\d{4}-\d{2}-\d{2}$/.test(from!),
        true,
        "from should be YYYY-MM-DD",
      )
      assertNoSecrets(result.stdout, "list default stdout")
      assertNoSecrets(result.stderr, "list default stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry list — filter/query construction
// ===========================================================================

Deno.test("entry list: --all omits from/to and includes user_id", async () => {
  const requests: CapturedRequest[] = []
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    requests.push({
      url: req.url,
      method: req.method,
      headers: {},
      body: undefined,
    })
    return new Response(
      JSON.stringify({
        time_entries: [],
        per_page: 100,
        total_pages: 1,
        total_entries: 0,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      await runCli(
        ["entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      const getReq = requests.find((r) => r.method === "GET")
      const reqUrl = new URL(getReq!.url)
      assertEquals(
        reqUrl.searchParams.get("from"),
        null,
        "--all should not set from",
      )
      assertEquals(
        reqUrl.searchParams.get("to"),
        null,
        "--all should not set to",
      )
      assertEquals(
        reqUrl.searchParams.get("user_id"),
        "42",
        "user_id must always be set",
      )
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: --running sends is_running=true", async () => {
  const requests: CapturedRequest[] = []
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    requests.push({
      url: req.url,
      method: req.method,
      headers: {},
      body: undefined,
    })
    return new Response(
      JSON.stringify({
        time_entries: [],
        per_page: 100,
        total_pages: 1,
        total_entries: 0,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      await runCli(
        ["entry", "list", "--all", "--running"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      const getReq = requests.find((r) => r.method === "GET")
      const reqUrl = new URL(getReq!.url)
      assertEquals(reqUrl.searchParams.get("is_running"), "true")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: --project-id and --client-id sent as query params", async () => {
  const requests: CapturedRequest[] = []
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    requests.push({
      url: req.url,
      method: req.method,
      headers: {},
      body: undefined,
    })
    return new Response(
      JSON.stringify({
        time_entries: [],
        per_page: 100,
        total_pages: 1,
        total_entries: 0,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      await runCli(
        ["entry", "list", "--all", "--project-id", "55", "--client-id", "66"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      const getReq = requests.find((r) => r.method === "GET")
      const reqUrl = new URL(getReq!.url)
      assertEquals(reqUrl.searchParams.get("project_id"), "55")
      assertEquals(reqUrl.searchParams.get("client_id"), "66")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: --from and --to sent as query params", async () => {
  const requests: CapturedRequest[] = []
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    requests.push({
      url: req.url,
      method: req.method,
      headers: {},
      body: undefined,
    })
    return new Response(
      JSON.stringify({
        time_entries: [],
        per_page: 100,
        total_pages: 1,
        total_entries: 0,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      await runCli(
        ["entry", "list", "--from", "2026-03-01", "--to", "2026-03-31"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      const getReq = requests.find((r) => r.method === "GET")
      const reqUrl = new URL(getReq!.url)
      assertEquals(reqUrl.searchParams.get("from"), "2026-03-01")
      assertEquals(reqUrl.searchParams.get("to"), "2026-03-31")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry list — multi-page pagination
// ===========================================================================

/** Build a Harvest paginated response with the given entries and pagination info. */
function harvestListPage(
  entries: Record<string, unknown>[],
  page: number,
  totalPages: number,
  totalEntries: number,
  nextPage: number | null,
  nextUrl: string | null,
) {
  return {
    time_entries: entries,
    per_page: entries.length,
    total_pages: totalPages,
    total_entries: totalEntries,
    next_page: nextPage,
    previous_page: page > 1 ? page - 1 : null,
    page,
    links: {
      first: "http://ignored",
      last: "http://ignored",
      next: nextUrl,
      previous: null,
    },
  }
}

Deno.test("entry list: walks all pages and returns all entries", async () => {
  // 3 pages of 2 entries each = 6 total entries
  const page1Entries = [
    harvestEntryResponse({ id: 1, notes: "page 1 entry 1" }),
    harvestEntryResponse({ id: 2, notes: "page 1 entry 2" }),
  ]
  const page2Entries = [
    harvestEntryResponse({ id: 3, notes: "page 2 entry 1" }),
    harvestEntryResponse({ id: 4, notes: "page 2 entry 2" }),
  ]
  const page3Entries = [
    harvestEntryResponse({ id: 5, notes: "page 3 entry 1" }),
    harvestEntryResponse({ id: 6, notes: "page 3 entry 2" }),
  ]

  let requestCount = 0
  const mock = startMockHarvest((req) => {
    requestCount++
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") ?? "1")

    // Verify user_id is present on every request
    assertEquals(
      url.searchParams.get("user_id"),
      "42",
      `user_id missing on request ${requestCount}`,
    )

    let body: unknown
    if (page === 1) {
      body = harvestListPage(page1Entries, 1, 3, 6, 2, null)
    } else if (page === 2) {
      body = harvestListPage(page2Entries, 2, 3, 6, 3, null)
    } else {
      body = harvestListPage(page3Entries, 3, 3, 6, null, null)
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })

  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      // JSON mode to verify all entries are returned
      const result = await runCli(
        ["--json", "entry", "list", "--all", "--page-size", "2"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      // All 6 entries from 3 pages must be present
      assertEquals(data.items.length, 6, "Expected all 6 entries from 3 pages")
      assertEquals(data.total_entries, 6)
      assertEquals(data.pages_fetched, 3)
      assertEquals(data.truncated, false)

      // Verify entry IDs are in order
      const ids = data.items.map((e: Record<string, unknown>) => e.id)
      assertEquals(ids, [1, 2, 3, 4, 5, 6])

      assertNoSecrets(result.stdout, "list multi-page stdout")
      assertNoSecrets(result.stderr, "list multi-page stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: --limit truncates and marks metadata as truncated", async () => {
  // 2 pages of 3 entries each = 6 total, but limit=4
  const page1Entries = [
    harvestEntryResponse({ id: 1 }),
    harvestEntryResponse({ id: 2 }),
    harvestEntryResponse({ id: 3 }),
  ]
  const page2Entries = [
    harvestEntryResponse({ id: 4 }),
    harvestEntryResponse({ id: 5 }),
    harvestEntryResponse({ id: 6 }),
  ]

  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") ?? "1")
    let body: unknown
    if (page === 1) {
      body = harvestListPage(page1Entries, 1, 2, 6, 2, null)
    } else {
      body = harvestListPage(page2Entries, 2, 2, 6, null, null)
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })

  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "list", "--all", "--limit", "4"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      assertEquals(data.items.length, 4, "Expected 4 entries (limited)")
      assertEquals(
        data.total_entries,
        6,
        "total_entries should reflect server total",
      )
      assertEquals(data.truncated, true, "truncated must be true when limited")
      assertEquals(
        data.pages_fetched >= 2,
        true,
        "Should fetch at least 2 pages to get 4 items",
      )

      assertNoSecrets(result.stdout, "list limit stdout")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry list — JSON output contract
// ===========================================================================

Deno.test("entry list --json: returns envelope with items and metadata", async () => {
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: [harvestEntryResponse()],
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      // Verify envelope shape
      assertEquals(Array.isArray(data.items), true, "items must be an array")
      assertEquals(
        typeof data.total_entries,
        "number",
        "total_entries must be a number",
      )
      assertEquals(
        typeof data.pages_fetched,
        "number",
        "pages_fetched must be a number",
      )
      assertEquals(
        typeof data.truncated,
        "boolean",
        "truncated must be a boolean",
      )

      // Verify entry shape within items
      const entry = data.items[0]
      assertEquals(entry.id, 101)
      assertEquals(entry.date, "2026-03-16")
      assertEquals(entry.hours, 2.5)
      assertEquals(entry.project_name, "Timeslip")
      assertEquals(entry.task_name, "Development")
      assertEquals(entry.client_name, "Acme Corp")
      assertEquals(entry.is_running, false)
      assertEquals(typeof entry.project_id, "number")
      assertEquals(typeof entry.task_id, "number")
      assertEquals(typeof entry.client_id, "number")

      assertNoSecrets(result.stdout, "list --json stdout")
      assertNoSecrets(result.stderr, "list --json stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list --json: snapshot of list output", async (t) => {
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: [harvestEntryResponse()],
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--json", "entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, JSON.parse(result.stdout))
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry list — human output
// ===========================================================================

Deno.test("entry list: human output shows table with entries", async () => {
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: [harvestEntryResponse()],
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "ID")
      assertStringIncludes(result.stdout, "DATE")
      assertStringIncludes(result.stdout, "HOURS")
      assertStringIncludes(result.stdout, "PROJECT")
      assertStringIncludes(result.stdout, "101")
      assertStringIncludes(result.stdout, "2026-03-16")
      assertStringIncludes(result.stdout, "Timeslip")
      assertNoSecrets(result.stdout, "list human stdout")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: human output shows 'No entries found' for empty result", async () => {
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: [],
        per_page: 100,
        total_pages: 1,
        total_entries: 0,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "No entries found")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: human output shows truncation notice when limited", async () => {
  const entries = [
    harvestEntryResponse({ id: 1 }),
    harvestEntryResponse({ id: 2 }),
    harvestEntryResponse({ id: 3 }),
  ]
  const mock = startMockHarvest(() =>
    new Response(
      JSON.stringify({
        time_entries: entries,
        per_page: 100,
        total_pages: 1,
        total_entries: 10,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: "http://x",
          last: "http://x",
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list", "--all", "--limit", "3"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "limited")
      assertStringIncludes(result.stdout, "3")
      assertNoSecrets(result.stdout, "list truncation notice stdout")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// entry list — auth/provider error paths
// ===========================================================================

Deno.test("entry list: 401 exits with auth error code", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 4, "Expected exit code 4 (Auth)")
      assertStringIncludes(result.stderr, "authentication failed")
      assertNoSecrets(result.stdout, "list 401 stdout")
      assertNoSecrets(result.stderr, "list 401 stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list: no account configured exits with error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(
      ["entry", "list"],
      { configDir: xdgBase },
    )
    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "list no-account stderr")
  })
})

// ===========================================================================
// entry list — debug output with secret safety
// ===========================================================================

Deno.test("entry list: TIMESLIP_DEBUG=1 shows pagination progress without secrets", async () => {
  let requestNum = 0
  const mock = startMockHarvest((req) => {
    requestNum++
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get("page") ?? "1")
    const entries = [harvestEntryResponse({ id: requestNum * 10 })]
    let body: unknown
    if (page === 1) {
      body = harvestListPage(entries, 1, 2, 4, 2, null)
    } else {
      body = harvestListPage(entries, 2, 2, 4, null, null)
    }
    return new Response(JSON.stringify(body), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
            TIMESLIP_DEBUG: "1",
          },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      // Debug output should mention harvest and GET
      assertStringIncludes(result.stderr, "[harvest]")
      assertStringIncludes(result.stderr, "GET")
      assertStringIncludes(result.stderr, "time_entries")
      // Token must not appear
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes("Bearer"), false)
      assertNoSecrets(result.stdout, "debug list stdout")
      assertNoSecrets(result.stderr, "debug list stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// Cross-cutting: no subcommand help output contains secrets
// ===========================================================================

const ENTRY_SUBCOMMANDS = ["add", "update", "remove", "list"]

for (const sub of ENTRY_SUBCOMMANDS) {
  Deno.test(`entry ${sub} --help: output is secret-safe`, async () => {
    const result = await runCli(["entry", sub, "--help"])
    assertNoSecrets(result.stdout, `entry ${sub} --help stdout`)
    assertNoSecrets(result.stderr, `entry ${sub} --help stderr`)
  })
}

// ===========================================================================
// Debug output checks — secrets redacted in debug mode
// ===========================================================================

Deno.test("entry add: TIMESLIP_DEBUG=1 does not leak tokens", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
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
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
            TIMESLIP_DEBUG: "1",
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      // Debug output should contain context
      assertStringIncludes(result.stderr, "[harvest]")
      assertStringIncludes(result.stderr, "POST")
      assertStringIncludes(result.stderr, "time_entries")
      // Token must not appear
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes("Bearer"), false)
      assertNoSecrets(result.stdout, "debug add stdout")
      assertNoSecrets(result.stderr, "debug add stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update: TIMESLIP_DEBUG=1 shows PATCH context without secrets", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse({ hours: 5 })), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "update", "101", "--hours", "5"],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
            TIMESLIP_DEBUG: "1",
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stderr, "[harvest]")
      assertStringIncludes(result.stderr, "PATCH")
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "debug update stdout")
      assertNoSecrets(result.stderr, "debug update stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry remove: TIMESLIP_DEBUG=1 shows DELETE context without secrets", async () => {
  const mock = startMockHarvest(() => new Response(null, { status: 204 }))
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
            TIMESLIP_DEBUG: "1",
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stderr, "[harvest]")
      assertStringIncludes(result.stderr, "DELETE")
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "debug remove stdout")
      assertNoSecrets(result.stderr, "debug remove stderr")
    })
  } finally {
    mock.close()
  }
})

// ===========================================================================
// Robot-mode output contracts
// ===========================================================================

Deno.test("entry add --robot: emits tab-separated row with ENTRY_FIELDS order", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        [
          "--robot",
          "entry",
          "add",
          "--project-id",
          "10",
          "--task-id",
          "20",
          "--date",
          "2026-03-16",
          "--hours",
          "2.5",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const lines = result.stdout.trimEnd().split("\n")
      assertEquals(lines.length, 1, "Robot output must be exactly one line")

      const cells = lines[0].split("\t")
      assertEquals(cells.length, 14, "Must have 14 fields per ENTRY_FIELDS")

      // Verify field positions match contract
      assertEquals(cells[0], "101", "id at position 0")
      assertEquals(cells[1], "2026-03-16", "date at position 1")
      assertEquals(cells[2], "2.5", "hours at position 2")
      assertEquals(cells[3], "2.5", "rounded_hours at position 3")
      assertEquals(cells[4], "Working on tests", "notes at position 4")
      assertEquals(cells[5], "false", "is_running at position 5")
      assertEquals(cells[6], "true", "is_billable at position 6")
      assertEquals(cells[7], "false", "is_locked at position 7")
      assertEquals(cells[8], "10", "project_id at position 8")
      assertEquals(cells[9], "Timeslip", "project_name at position 9")
      assertEquals(cells[10], "20", "task_id at position 10")
      assertEquals(cells[11], "Development", "task_name at position 11")
      assertEquals(cells[12], "30", "client_id at position 12")
      assertEquals(cells[13], "Acme Corp", "client_name at position 13")

      // No headers, no prose
      assertEquals(result.stdout.includes("ID"), false, "No column headers")
      assertEquals(result.stdout.includes("Created"), false, "No human prose")

      assertNoSecrets(result.stdout, "entry add --robot stdout")
      assertNoSecrets(result.stderr, "entry add --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry add --robot: snapshot", async (t) => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify(harvestEntryResponse()), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        [
          "--robot",
          "entry",
          "add",
          "--project-id",
          "10",
          "--task-id",
          "20",
          "--date",
          "2026-03-16",
          "--hours",
          "2.5",
        ],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, result.stdout)
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry update --robot: emits tab-separated row with ENTRY_FIELDS order", async () => {
  const mock = startMockHarvest(() =>
    new Response(
      JSON.stringify(harvestEntryResponse({ hours: 3.0, rounded_hours: 3.0 })),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--robot", "entry", "update", "101", "--hours", "3.0"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const cells = result.stdout.trimEnd().split("\t")
      assertEquals(cells.length, 14)
      assertEquals(cells[0], "101")
      assertEquals(cells[2], "3", "Updated hours")

      // No human prose
      assertEquals(result.stdout.includes("Updated"), false)

      assertNoSecrets(result.stdout, "entry update --robot stdout")
      assertNoSecrets(result.stderr, "entry update --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry remove --robot: emits single entry_id field", async () => {
  const mock = startMockHarvest(() => new Response(null, { status: 204 }))
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--robot", "entry", "remove", "101"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertEquals(result.stdout.trimEnd(), "101")

      // No prose
      assertEquals(result.stdout.includes("Deleted"), false)

      assertNoSecrets(result.stdout, "entry remove --robot stdout")
      assertNoSecrets(result.stderr, "entry remove --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list --robot: emits multiple tab-separated rows without headers", async () => {
  const entries = [
    harvestEntryResponse({ id: 1, hours: 1.0, rounded_hours: 1.0 }),
    harvestEntryResponse({ id: 2, hours: 2.0, rounded_hours: 2.0 }),
  ]
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: entries,
        per_page: 100,
        total_pages: 1,
        total_entries: 2,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--robot", "entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const lines = result.stdout.trimEnd().split("\n")
      assertEquals(lines.length, 2, "One line per entry, no header")

      // Each line has 14 tab-separated fields
      for (const line of lines) {
        assertEquals(line.split("\t").length, 14)
      }

      // First entry id
      assertEquals(lines[0].split("\t")[0], "1")
      // Second entry id
      assertEquals(lines[1].split("\t")[0], "2")

      // No table headers, no column names
      assertEquals(result.stdout.includes("ID\t"), false)
      assertEquals(result.stdout.includes("DATE\t"), false)

      assertNoSecrets(result.stdout, "entry list --robot stdout")
      assertNoSecrets(result.stderr, "entry list --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("entry list --robot: snapshot", async (t) => {
  const mock = startMockHarvest((req) => {
    const url = new URL(req.url)
    return new Response(
      JSON.stringify({
        time_entries: [harvestEntryResponse()],
        per_page: 100,
        total_pages: 1,
        total_entries: 1,
        next_page: null,
        previous_page: null,
        page: 1,
        links: {
          first: url.origin,
          last: url.origin,
          next: null,
          previous: null,
        },
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--robot", "entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, result.stdout)
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// Robot-mode error paths: deterministic errors, no mixed human text
// ---------------------------------------------------------------------------

Deno.test("entry add --robot: validation error emits to stderr, no robot stdout", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)
    const result = await runCli(
      [
        "--robot",
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
    assertEquals(result.code, 2, "Expected validation exit code")
    assertEquals(result.stdout, "", "Robot stdout must be empty on error")
    assertStringIncludes(result.stderr, "--hours")
    assertNoSecrets(result.stderr, "entry add --robot validation stderr")
  })
})

Deno.test("entry list --robot: 401 emits error to stderr, no robot stdout", async () => {
  const mock = startMockHarvest(() =>
    new Response(JSON.stringify({ error: "invalid_token" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  )
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)
      const result = await runCli(
        ["--robot", "entry", "list", "--all"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 4, "Expected auth exit code")
      assertEquals(
        result.stdout,
        "",
        "Robot stdout must be empty on auth error",
      )
      assertNoSecrets(result.stdout, "entry list --robot 401 stdout")
      assertNoSecrets(result.stderr, "entry list --robot 401 stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("--json and --robot together exits with validation error", async () => {
  const result = await runCli(["--json", "--robot", "entry", "list", "--all"])
  assertEquals(result.code, 2, "Expected validation exit code")
  assertStringIncludes(result.stderr, "--json")
  assertStringIncludes(result.stderr, "--robot")
})
