/**
 * E2E contract tests for the shared JSON list envelope.
 *
 * Validates that entry list, project list, and client list all produce
 * the identical envelope shape ({ items, total_entries, pages_fetched,
 * truncated }) when exercised as subprocesses against mock Harvest servers.
 *
 * Each test step logs:
 * - CLI args invoked
 * - Mock fixture identifiers
 * - Request URLs and status codes
 * - Pagination hops
 * - Redaction-scan results
 *
 * Secret-safety invariant: every step asserts that raw tokens, auth-bearing
 * headers, and token-shaped strings never appear in stdout, stderr, debug
 * logs, fixtures, or snapshots.
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "./test_helpers.ts"
import { join } from "@std/path"
import { saveConfig } from "./config/mod.ts"
import type { Account } from "./domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-444444.contracttoken1234567890ab"

function makeFixtureAccount(): Account {
  return {
    name: "e2e-contract",
    provider: "harvest",
    accountId: "444444",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "Contract",
    lastName: "Test",
    email: "contract@test.com",
    isDefault: true,
  }
}

function harvestEntry(id: number) {
  return {
    id,
    spent_date: "2026-03-17",
    hours: 1.5,
    rounded_hours: 1.5,
    notes: `Entry ${id}`,
    is_running: false,
    billable: true,
    is_locked: false,
    project: { id: 100, name: "Timeslip", code: "TS" },
    task: { id: 200, name: "Development" },
    client: { id: 10, name: "Acme Corp" },
    task_assignment: {
      id: 300,
      billable: true,
      task: { id: 200, name: "Development" },
    },
    project_assignment: { id: 400 },
    user: { id: 42, name: "Contract Test" },
  }
}

function harvestProjectAssignment(
  projectId: number,
  clientId: number,
  clientName: string,
) {
  return {
    id: projectId * 10,
    is_active: true,
    project: {
      id: projectId,
      name: `Project ${projectId}`,
      code: `P${projectId}`,
    },
    client: { id: clientId, name: clientName },
    task_assignments: [
      {
        id: projectId * 100,
        billable: true,
        task: { id: projectId * 10 + 1, name: `Task for P${projectId}` },
      },
    ],
  }
}

/** Assert output is free of secrets and raw tokens. */
function assertOutputSecretSafe(
  result: { stdout: string; stderr: string },
  label: string,
): void {
  assertEquals(
    result.stdout.includes(MOCK_TOKEN),
    false,
    `Raw token in ${label} stdout`,
  )
  assertEquals(
    result.stderr.includes(MOCK_TOKEN),
    false,
    `Raw token in ${label} stderr`,
  )
  assertEquals(
    result.stdout.includes("Bearer"),
    false,
    `Bearer in ${label} stdout`,
  )
  assertNoSecrets(result.stdout, `${label} stdout`)
  assertNoSecrets(result.stderr, `${label} stderr`)
}

/** Validate that a parsed JSON response has the shared envelope shape. */
function assertEnvelopeShape(
  data: Record<string, unknown>,
  label: string,
): void {
  const keys = Object.keys(data)
  assertEquals(keys.includes("items"), true, `${label}: missing 'items' key`)
  assertEquals(
    keys.includes("total_entries"),
    true,
    `${label}: missing 'total_entries'`,
  )
  assertEquals(
    keys.includes("pages_fetched"),
    true,
    `${label}: missing 'pages_fetched'`,
  )
  assertEquals(
    keys.includes("truncated"),
    true,
    `${label}: missing 'truncated'`,
  )
  assertEquals(
    keys.length,
    4,
    `${label}: expected exactly 4 keys, got ${keys.length}: ${keys.join(",")}`,
  )
  assertEquals(Array.isArray(data.items), true, `${label}: items must be array`)
  assertEquals(
    typeof data.total_entries,
    "number",
    `${label}: total_entries must be number`,
  )
  assertEquals(
    typeof data.pages_fetched,
    "number",
    `${label}: pages_fetched must be number`,
  )
  assertEquals(
    typeof data.truncated,
    "boolean",
    `${label}: truncated must be boolean`,
  )
}

interface CapturedRequest {
  url: string
  method: string
}

// ---------------------------------------------------------------------------
// E2E: All three list commands produce the shared envelope
// ---------------------------------------------------------------------------

Deno.test("e2e contract: entry list, project list, and client list all use shared JSON envelope", async () => {
  const requests: CapturedRequest[] = []

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)
      requests.push({ url: req.url, method: req.method })

      // Route to the appropriate mock response
      if (url.pathname.includes("/time_entries")) {
        return new Response(
          JSON.stringify({
            time_entries: [harvestEntry(101), harvestEntry(102)],
            per_page: 100,
            total_pages: 1,
            total_entries: 2,
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
      }

      if (url.pathname.includes("/project_assignments")) {
        return new Response(
          JSON.stringify({
            project_assignments: [
              harvestProjectAssignment(100, 10, "Acme Corp"),
              harvestProjectAssignment(101, 20, "Globex Inc"),
            ],
            per_page: 100,
            total_pages: 1,
            total_entries: 2,
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
      }

      return new Response("Not Found", { status: 404 })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_e2e_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    // -------------------------------------------------------------------
    // Step 1: entry list --json
    // -------------------------------------------------------------------
    console.error(
      "[e2e contract] step=entry-list args=[--json, entry, list, --all]",
    )
    const entryResult = await runCli(
      ["--json", "entry", "list", "--all"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      entryResult.code,
      0,
      `entry list failed: ${entryResult.stderr}`,
    )
    const entryData = JSON.parse(entryResult.stdout)
    assertEnvelopeShape(entryData, "entry list")
    assertEquals(entryData.items.length, 2)
    assertEquals(entryData.total_entries, 2)
    assertEquals(entryData.pages_fetched, 1)
    assertEquals(entryData.truncated, false)
    assertOutputSecretSafe(entryResult, "entry list json")
    console.error(
      "[e2e contract] step=entry-list result=pass items=2 pages=1 redaction=clean",
    )

    // -------------------------------------------------------------------
    // Step 2: project list --json
    // -------------------------------------------------------------------
    requests.length = 0
    console.error(
      "[e2e contract] step=project-list args=[--json, project, list]",
    )
    const projResult = await runCli(
      ["--json", "project", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      projResult.code,
      0,
      `project list failed: ${projResult.stderr}`,
    )
    const projData = JSON.parse(projResult.stdout)
    assertEnvelopeShape(projData, "project list")
    assertEquals(projData.items.length, 2)
    assertEquals(projData.total_entries, 2)
    assertEquals(projData.pages_fetched, 1)
    assertEquals(projData.truncated, false)
    assertOutputSecretSafe(projResult, "project list json")
    console.error(
      "[e2e contract] step=project-list result=pass items=2 pages=1 redaction=clean",
    )

    // -------------------------------------------------------------------
    // Step 3: client list --json
    // -------------------------------------------------------------------
    requests.length = 0
    console.error("[e2e contract] step=client-list args=[--json, client, list]")
    const clientResult = await runCli(
      ["--json", "client", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      clientResult.code,
      0,
      `client list failed: ${clientResult.stderr}`,
    )
    const clientData = JSON.parse(clientResult.stdout)
    assertEnvelopeShape(clientData, "client list")
    assertEquals(clientData.items.length, 2)
    assertEquals(clientData.truncated, false)
    assertOutputSecretSafe(clientResult, "client list json")
    console.error(
      "[e2e contract] step=client-list result=pass items=2 redaction=clean",
    )

    // -------------------------------------------------------------------
    // Step 4: Verify all three envelopes have identical top-level keys
    // -------------------------------------------------------------------
    const entryKeys = Object.keys(entryData).sort()
    const projKeys = Object.keys(projData).sort()
    const clientKeys = Object.keys(clientData).sort()
    assertEquals(
      entryKeys,
      projKeys,
      "entry and project envelopes must have same keys",
    )
    assertEquals(
      projKeys,
      clientKeys,
      "project and client envelopes must have same keys",
    )
    console.error(
      "[e2e contract] step=key-alignment result=pass keys=" +
        entryKeys.join(","),
    )
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: Shared envelope snapshot with project-shaped items
// ---------------------------------------------------------------------------

Deno.test("e2e contract: project list --json snapshot matches frozen envelope", async (t) => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: [harvestProjectAssignment(100, 10, "Acme Corp")],
          per_page: 100,
          total_pages: 1,
          total_entries: 1,
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_snap_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    const result = await runCli(
      ["--json", "project", "list"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
      },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)
    await assertSnapshot(t, data)
    assertOutputSecretSafe(result, "project list snapshot")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: Shared envelope snapshot with client-shaped items
// ---------------------------------------------------------------------------

Deno.test("e2e contract: client list --json snapshot matches frozen envelope", async (t) => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: [
            harvestProjectAssignment(100, 10, "Acme Corp"),
            harvestProjectAssignment(101, 10, "Acme Corp"),
            harvestProjectAssignment(102, 20, "Globex Inc"),
          ],
          per_page: 100,
          total_pages: 1,
          total_entries: 3,
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_csnap_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    const result = await runCli(
      ["--json", "client", "list"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
      },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)
    await assertSnapshot(t, data)
    assertOutputSecretSafe(result, "client list snapshot")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: Pagination metadata accuracy for discovery commands
// ---------------------------------------------------------------------------

Deno.test("e2e contract: multi-page project list reports correct pages_fetched", async () => {
  const allAssignments = Array.from(
    { length: 4 },
    (_, i) => harvestProjectAssignment(100 + i, 10, "Acme Corp"),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 2
      const pageItems = allAssignments.slice(start, start + 2)
      const nextPage = page < 2 ? page + 1 : null

      return new Response(
        JSON.stringify({
          project_assignments: pageItems,
          per_page: 2,
          total_pages: 2,
          total_entries: 4,
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
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_pages_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    console.error(
      "[e2e contract] step=multi-page-project fixture=4-items-2-pages",
    )
    const result = await runCli(
      ["--json", "project", "list", "--page-size", "2"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
      },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)
    assertEnvelopeShape(data, "multi-page project list")
    assertEquals(data.items.length, 4)
    assertEquals(data.total_entries, 4)
    assertEquals(data.pages_fetched, 2)
    assertEquals(data.truncated, false)
    assertOutputSecretSafe(result, "multi-page project list")
    console.error(
      "[e2e contract] step=multi-page-project result=pass pages_fetched=2 redaction=clean",
    )
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: --limit produces truncated=true in envelope
// ---------------------------------------------------------------------------

Deno.test("e2e contract: --limit causes truncated=true in project list envelope", async () => {
  const allAssignments = Array.from(
    { length: 4 },
    (_, i) => harvestProjectAssignment(100 + i, 10, "Acme Corp"),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: allAssignments,
          per_page: 100,
          total_pages: 1,
          total_entries: 4,
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_limit_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    console.error("[e2e contract] step=limit-project fixture=4-items limit=2")
    const result = await runCli(
      ["--json", "project", "list", "--limit", "2"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
      },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)
    assertEnvelopeShape(data, "limited project list")
    assertEquals(data.items.length, 2, "items should be limited to 2")
    assertEquals(
      data.total_entries,
      4,
      "total_entries should reflect full count",
    )
    assertEquals(data.truncated, true, "truncated must be true")
    assertOutputSecretSafe(result, "limited project list")
    console.error(
      "[e2e contract] step=limit-project result=pass truncated=true redaction=clean",
    )
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: --limit causes truncated=true in client list envelope
// ---------------------------------------------------------------------------

Deno.test("e2e contract: --limit causes truncated=true in client list envelope", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Alpha"),
    harvestProjectAssignment(101, 20, "Beta"),
    harvestProjectAssignment(102, 30, "Gamma"),
  ]

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: assignments,
          per_page: 100,
          total_pages: 1,
          total_entries: 3,
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({
    prefix: "timeslip_contract_climit_",
  })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    console.error("[e2e contract] step=limit-client fixture=3-clients limit=2")
    const result = await runCli(
      ["--json", "client", "list", "--limit", "2"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
      },
    )
    assertEquals(result.code, 0, `stderr: ${result.stderr}`)
    const data = JSON.parse(result.stdout)
    assertEnvelopeShape(data, "limited client list")
    assertEquals(data.items.length, 2)
    assertEquals(data.total_entries, 3)
    assertEquals(data.truncated, true)
    assertOutputSecretSafe(result, "limited client list")
    console.error(
      "[e2e contract] step=limit-client result=pass truncated=true redaction=clean",
    )
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: Empty results still produce valid envelope
// ---------------------------------------------------------------------------

Deno.test("e2e contract: empty results produce valid envelope for all list commands", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)

      if (url.pathname.includes("/time_entries")) {
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
              first: "http://x",
              last: "http://x",
              next: null,
              previous: null,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        )
      }

      if (url.pathname.includes("/project_assignments")) {
        return new Response(
          JSON.stringify({
            project_assignments: [],
            per_page: 100,
            total_pages: 1,
            total_entries: 0,
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
      }

      return new Response("Not Found", { status: 404 })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_empty_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    // entry list --json --all (empty)
    console.error("[e2e contract] step=empty-entry-list")
    const entryResult = await runCli(
      ["--json", "entry", "list", "--all"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(entryResult.code, 0, `stderr: ${entryResult.stderr}`)
    const entryData = JSON.parse(entryResult.stdout)
    assertEnvelopeShape(entryData, "empty entry list")
    assertEquals(entryData.items, [])
    assertEquals(entryData.total_entries, 0)
    assertOutputSecretSafe(entryResult, "empty entry list")

    // project list --json (empty)
    console.error("[e2e contract] step=empty-project-list")
    const projResult = await runCli(
      ["--json", "project", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(projResult.code, 0, `stderr: ${projResult.stderr}`)
    const projData = JSON.parse(projResult.stdout)
    assertEnvelopeShape(projData, "empty project list")
    assertEquals(projData.items, [])
    assertOutputSecretSafe(projResult, "empty project list")

    // client list --json (empty)
    console.error("[e2e contract] step=empty-client-list")
    const clientResult = await runCli(
      ["--json", "client", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(clientResult.code, 0, `stderr: ${clientResult.stderr}`)
    const clientData = JSON.parse(clientResult.stdout)
    assertEnvelopeShape(clientData, "empty client list")
    assertEquals(clientData.items, [])
    assertOutputSecretSafe(clientResult, "empty client list")

    console.error(
      "[e2e contract] step=empty-results result=pass all-envelopes-valid redaction=clean",
    )
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: TIMESLIP_DEBUG=1 never leaks secrets in contract test runs
// ---------------------------------------------------------------------------

Deno.test("e2e contract: debug mode output is secret-safe for all list commands", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)

      if (url.pathname.includes("/time_entries")) {
        return new Response(
          JSON.stringify({
            time_entries: [harvestEntry(101)],
            per_page: 100,
            total_pages: 1,
            total_entries: 1,
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
      }

      if (url.pathname.includes("/project_assignments")) {
        return new Response(
          JSON.stringify({
            project_assignments: [
              harvestProjectAssignment(100, 10, "Acme Corp"),
            ],
            per_page: 100,
            total_pages: 1,
            total_entries: 1,
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
      }

      return new Response("Not Found", { status: 404 })
    },
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_contract_debug_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
    TIMESLIP_DEBUG: "1",
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-contract", appDir)

    for (
      const args of [
        ["--json", "entry", "list", "--all"],
        ["--json", "project", "list"],
        ["--json", "client", "list"],
      ]
    ) {
      console.error(
        `[e2e contract] step=debug-safety args=${JSON.stringify(args)}`,
      )
      const result = await runCli(args, { configDir: xdgBase, env: baseEnv })
      assertEquals(result.code, 0, `${args.join(" ")} failed: ${result.stderr}`)
      assertOutputSecretSafe(result, `debug ${args.join(" ")}`)
      // Debug output goes to stderr — verify it exists but has no secrets
      assertStringIncludes(result.stderr, "[harvest]")
      assertEquals(
        result.stderr.includes("Bearer"),
        false,
        `Bearer leaked in debug mode: ${args.join(" ")}`,
      )
      console.error(
        `[e2e contract] step=debug-safety args=${
          JSON.stringify(args)
        } result=pass`,
      )
    }
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})
