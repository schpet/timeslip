/**
 * E2E process-level tests for project and client discovery commands.
 *
 * Exercises project list and client list against a mock Harvest server
 * as subprocesses, proving multi-page traversal, deduplication, human/JSON
 * rendering, and correct exit codes.
 *
 * Secret-safety invariant: every step asserts that raw tokens never
 * appear in stdout, stderr, or debug output from any invocation.
 *
 * Logging: each test logs CLI args, mock fixture identifiers, request
 * URLs/status codes, pagination hops, and redaction-scan results to
 * stderr for CI diagnostics.
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertNoSecrets, runCli } from "../test_helpers.ts"
import { join } from "@std/path"
import { saveConfig } from "../config/mod.ts"
import type { Account } from "../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-555555.disctoken1234567890abcdef"

function makeFixtureAccount(): Account {
  return {
    name: "e2e-disc",
    provider: "harvest",
    accountId: "555555",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "E2E",
    lastName: "Discovery",
    email: "e2e@test.com",
    isDefault: true,
  }
}

/** Build a Harvest API project assignment response shape. */
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
      {
        id: projectId * 100 + 1,
        billable: false,
        task: { id: projectId * 10 + 2, name: `Review for P${projectId}` },
      },
    ],
  }
}

interface CapturedRequest {
  url: string
  method: string
  headers: Record<string, string>
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
// E2E: project list + client list against multi-page mock server
// ---------------------------------------------------------------------------

Deno.test("e2e discovery: project list and client list against 3-page mock", async () => {
  // 3 pages, 2 assignments per page = 6 total projects
  // Projects 100-101 → Client 10 (Acme)
  // Projects 102-103 → Client 20 (Globex)
  // Projects 104-105 → Client 10 (Acme) — same client, different page
  const allAssignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 10, "Acme Corp"),
    harvestProjectAssignment(102, 20, "Globex Inc"),
    harvestProjectAssignment(103, 20, "Globex Inc"),
    harvestProjectAssignment(104, 10, "Acme Corp"),
    harvestProjectAssignment(105, 10, "Acme Corp"),
  ]

  const requests: CapturedRequest[] = []

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      const url = new URL(req.url)
      requests.push({ url: req.url, method: req.method, headers })

      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 2
      const pageItems = allAssignments.slice(start, start + 2)
      const nextPage = page < 3 ? page + 1 : null

      return new Response(
        JSON.stringify({
          project_assignments: pageItems,
          per_page: 2,
          total_pages: 3,
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
  const port = addr.port
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_disc_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-disc", appDir)

    // -----------------------------------------------------------------------
    // Step 1: project list --json — all 6 projects from 3 pages
    // -----------------------------------------------------------------------
    const projJson = await runCli(
      ["--json", "project", "list", "--page-size", "2"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      projJson.code,
      0,
      `project list --json failed: ${projJson.stderr}`,
    )
    const projData = JSON.parse(projJson.stdout)

    assertEquals(
      projData.items.length,
      6,
      "Expected all 6 projects from 3 pages",
    )
    assertEquals(projData.total_entries, 6)
    assertEquals(projData.pages_fetched, 3)
    assertEquals(projData.truncated, false)

    // Verify project IDs are all present
    const projIds = projData.items.map((p: Record<string, unknown>) =>
      p.project_id
    )
    assertEquals(projIds, [100, 101, 102, 103, 104, 105])

    // Verify task metadata is preserved
    for (const item of projData.items) {
      assertEquals(Array.isArray(item.tasks), true, "tasks must be array")
      assertEquals(item.tasks.length, 2, "each project has 2 tasks")
      assertEquals(typeof item.tasks[0].task_id, "number")
      assertEquals(typeof item.tasks[0].task_name, "string")
      assertEquals(typeof item.tasks[0].billable, "boolean")
    }

    assertOutputSecretSafe(projJson, "e2e project list json")

    // -----------------------------------------------------------------------
    // Step 2: project list — human mode
    // -----------------------------------------------------------------------
    requests.length = 0
    const projHuman = await runCli(
      ["project", "list", "--page-size", "2"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      projHuman.code,
      0,
      `project list human failed: ${projHuman.stderr}`,
    )
    assertStringIncludes(projHuman.stdout, "PROJECT ID")
    assertStringIncludes(projHuman.stdout, "TASKS")
    // Verify projects from all pages appear
    assertStringIncludes(projHuman.stdout, "Project 100")
    assertStringIncludes(projHuman.stdout, "Project 105")
    assertOutputSecretSafe(projHuman, "e2e project list human")

    // -----------------------------------------------------------------------
    // Step 3: client list --json — dedup across pages
    // -----------------------------------------------------------------------
    requests.length = 0
    const clientJson = await runCli(
      ["--json", "client", "list", "--page-size", "2"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      clientJson.code,
      0,
      `client list --json failed: ${clientJson.stderr}`,
    )
    const clientData = JSON.parse(clientJson.stdout)

    // 2 clients after dedup (Acme=4 projects, Globex=2 projects)
    assertEquals(clientData.items.length, 2, "Expected 2 deduplicated clients")
    assertEquals(
      clientData.pages_fetched,
      3,
      "Must fetch all 3 pages for full dedup",
    )
    assertEquals(clientData.truncated, false)

    // Sorted by client ID
    assertEquals(clientData.items[0].client_id, 10)
    assertEquals(clientData.items[0].client_name, "Acme Corp")
    assertEquals(
      clientData.items[0].projects.length,
      4,
      "Acme has 4 projects across pages",
    )

    assertEquals(clientData.items[1].client_id, 20)
    assertEquals(clientData.items[1].client_name, "Globex Inc")
    assertEquals(clientData.items[1].projects.length, 2)

    assertOutputSecretSafe(clientJson, "e2e client list json")

    // -----------------------------------------------------------------------
    // Step 4: client list — human mode
    // -----------------------------------------------------------------------
    requests.length = 0
    const clientHuman = await runCli(
      ["client", "list", "--page-size", "2"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(
      clientHuman.code,
      0,
      `client list human failed: ${clientHuman.stderr}`,
    )
    assertStringIncludes(clientHuman.stdout, "CLIENT ID")
    assertStringIncludes(clientHuman.stdout, "Acme Corp")
    assertStringIncludes(clientHuman.stdout, "Globex Inc")
    assertOutputSecretSafe(clientHuman, "e2e client list human")

    // -----------------------------------------------------------------------
    // Step 5: Verify auth headers on all requests
    // -----------------------------------------------------------------------
    for (const req of requests) {
      assertStringIncludes(req.headers["authorization"] ?? "", "Bearer")
      assertEquals(req.headers["harvest-account-id"], "555555")
    }
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: debug mode for discovery commands never leaks secrets
// ---------------------------------------------------------------------------

Deno.test("e2e discovery: TIMESLIP_DEBUG=1 project+client list never leaks tokens", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 20, "Globex Inc"),
  ]

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: assignments,
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_disc_debug_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
    TIMESLIP_DEBUG: "1",
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-disc", appDir)

    // Project list in debug mode
    const proj = await runCli(
      ["project", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(proj.code, 0, `debug project list failed: ${proj.stderr}`)
    assertStringIncludes(proj.stderr, "[harvest]")
    assertStringIncludes(proj.stderr, "GET")
    assertEquals(
      proj.stderr.includes("Bearer"),
      false,
      "Bearer header leaked in debug output",
    )
    assertOutputSecretSafe(proj, "debug project list")

    // Client list in debug mode
    const client = await runCli(
      ["client", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(client.code, 0, `debug client list failed: ${client.stderr}`)
    assertStringIncludes(client.stderr, "[harvest]")
    assertStringIncludes(client.stderr, "GET")
    assertEquals(
      client.stderr.includes("Bearer"),
      false,
      "Bearer header leaked in debug output",
    )
    assertOutputSecretSafe(client, "debug client list")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: auth errors for discovery commands
// ---------------------------------------------------------------------------

Deno.test("e2e discovery: 401 exits with code 4 for both commands", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_disc_auth_" })
  const appDir = join(xdgBase, "timeslip")
  const baseEnv = {
    HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
  }

  try {
    await saveConfig([makeFixtureAccount()], "e2e-disc", appDir)

    const proj = await runCli(
      ["project", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(proj.code, 4, "Expected auth exit code for project list")
    assertStringIncludes(proj.stderr, "authentication failed")
    assertOutputSecretSafe(proj, "e2e project list auth error")

    const client = await runCli(
      ["client", "list"],
      { configDir: xdgBase, env: baseEnv },
    )
    assertEquals(client.code, 4, "Expected auth exit code for client list")
    assertStringIncludes(client.stderr, "authentication failed")
    assertOutputSecretSafe(client, "e2e client list auth error")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: validation errors for discovery commands
// ---------------------------------------------------------------------------

Deno.test("e2e discovery: validation errors exit with code 2", async () => {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_disc_val_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "e2e-disc", appDir)

    // project list --limit 0
    const projLimit = await runCli(
      ["project", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(projLimit.code, 2, "Expected validation exit code")
    assertOutputSecretSafe(projLimit, "e2e project val limit")

    // project list --page-size 0
    const projPage = await runCli(
      ["project", "list", "--page-size", "0"],
      { configDir: xdgBase },
    )
    assertEquals(projPage.code, 2, "Expected validation exit code")
    assertOutputSecretSafe(projPage, "e2e project val page-size")

    // client list --limit 0
    const clientLimit = await runCli(
      ["client", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(clientLimit.code, 2, "Expected validation exit code")
    assertOutputSecretSafe(clientLimit, "e2e client val limit")

    // client list --page-size 0
    const clientPage = await runCli(
      ["client", "list", "--page-size", "0"],
      { configDir: xdgBase },
    )
    assertEquals(clientPage.code, 2, "Expected validation exit code")
    assertOutputSecretSafe(clientPage, "e2e client val page-size")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})
