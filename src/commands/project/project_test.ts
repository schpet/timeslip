/**
 * Unit and command-level tests for project discovery.
 *
 * Covers:
 * - renderProject: normalized JSON output shape from domain ProjectAssignment
 * - project --help and project list --help snapshots
 * - project list: human and --json output against mock server
 * - project list: task ids/names are preserved in output
 * - project list: multi-page traversal returns all assignments
 * - project list: --limit / --page-size honored
 * - project list: validation errors for bad --limit / --page-size
 * - project list: auth/provider error exit codes
 * - Secret redaction in all output paths
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"
import { renderProject } from "./list.ts"
import type { ProjectAssignment } from "../../domain/mod.ts"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-999999.projtoken1234567890abcdef"

function makeFixtureAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "default",
    provider: "harvest",
    accountId: "999999",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    isDefault: true,
    ...overrides,
  }
}

function makeFixtureAssignment(
  overrides: Partial<ProjectAssignment> = {},
): ProjectAssignment {
  return {
    id: 1,
    projectId: 100,
    projectName: "Timeslip",
    projectCode: "TS",
    client: { id: 10, name: "Acme Corp" },
    tasks: [
      { id: 200, name: "Development", billable: true },
      { id: 201, name: "Design", billable: false },
    ],
    isActive: true,
    ...overrides,
  }
}

/** Build a Harvest API project assignment response shape. */
function harvestProjectAssignment(
  projectId: number,
  clientId: number,
  clientName: string,
  overrides: Record<string, unknown> = {},
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
    ...overrides,
  }
}

async function withTempXdg(
  fn: (xdgBase: string, appDir: string) => Promise<void>,
): Promise<void> {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_proj_test_" })
  const appDir = join(xdgBase, "timeslip")
  try {
    await fn(xdgBase, appDir)
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// renderProject — unit tests
// ---------------------------------------------------------------------------

Deno.test("renderProject: includes all fields with correct keys", () => {
  const assignment = makeFixtureAssignment()
  const result = renderProject(assignment)

  assertEquals(result.project_id, 100)
  assertEquals(result.project_name, "Timeslip")
  assertEquals(result.project_code, "TS")
  assertEquals(result.is_active, true)
  assertEquals(result.client_id, 10)
  assertEquals(result.client_name, "Acme Corp")
})

Deno.test("renderProject: tasks include id, name, and billable", () => {
  const assignment = makeFixtureAssignment()
  const result = renderProject(assignment)

  const tasks = result.tasks as {
    task_id: number
    task_name: string
    billable: boolean
  }[]
  assertEquals(tasks.length, 2)
  assertEquals(tasks[0].task_id, 200)
  assertEquals(tasks[0].task_name, "Development")
  assertEquals(tasks[0].billable, true)
  assertEquals(tasks[1].task_id, 201)
  assertEquals(tasks[1].task_name, "Design")
  assertEquals(tasks[1].billable, false)
})

Deno.test("renderProject: null project_code preserved", () => {
  const assignment = makeFixtureAssignment({ projectCode: null })
  const result = renderProject(assignment)
  assertEquals(result.project_code, null)
})

Deno.test("renderProject: empty tasks array preserved", () => {
  const assignment = makeFixtureAssignment({ tasks: [] })
  const result = renderProject(assignment)
  assertEquals((result.tasks as unknown[]).length, 0)
})

// ---------------------------------------------------------------------------
// Help snapshots
// ---------------------------------------------------------------------------

Deno.test("project --help: exits 0 with subcommand list", async () => {
  const result = await runCli(["project", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "list")
  assertNoSecrets(result.stdout, "project --help stdout")
  assertNoSecrets(result.stderr, "project --help stderr")
})

Deno.test("project --help: snapshot", async (t) => {
  const result = await runCli(["project", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("project list --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["project", "list", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--limit")
  assertStringIncludes(result.stdout, "--page-size")
  assertNoSecrets(result.stdout, "project list --help stdout")
  assertNoSecrets(result.stderr, "project list --help stderr")
})

Deno.test("project list --help: snapshot", async (t) => {
  const result = await runCli(["project", "list", "--help"])
  await assertSnapshot(t, result.stdout)
})

// ---------------------------------------------------------------------------
// project list — validation errors
// ---------------------------------------------------------------------------

Deno.test("project list: --limit 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(
      ["project", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--limit")
    assertNoSecrets(result.stderr, "project list --limit 0 stderr")
  })
})

Deno.test("project list: --page-size 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(
      ["project", "list", "--page-size", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--page-size")
    assertNoSecrets(result.stderr, "project list --page-size 0 stderr")
  })
})

// ---------------------------------------------------------------------------
// project list — mock server tests (human + JSON)
// ---------------------------------------------------------------------------

Deno.test("project list: human output shows table with task ids", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 10, "Acme Corp"),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      // Table headers
      assertStringIncludes(result.stdout, "PROJECT ID")
      assertStringIncludes(result.stdout, "PROJECT")
      assertStringIncludes(result.stdout, "CLIENT")
      assertStringIncludes(result.stdout, "TASKS")
      // Project names
      assertStringIncludes(result.stdout, "Project 100")
      assertStringIncludes(result.stdout, "Project 101")
      // Task ids should appear in human output (id:name format)
      assertStringIncludes(result.stdout, "1001:")
      assertStringIncludes(result.stdout, "1011:")
      assertNoSecrets(result.stdout, "project list human stdout")
      assertNoSecrets(result.stderr, "project list human stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list --json: returns structured JSON with task metadata", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 20, "Globex"),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      assertEquals(data.items.length, 2)
      assertEquals(data.total_entries, 2)
      assertEquals(data.pages_fetched, 1)
      assertEquals(data.truncated, false)

      // Verify task metadata is present
      const item0 = data.items[0]
      assertEquals(item0.project_id, 100)
      assertEquals(item0.project_name, "Project 100")
      assertEquals(item0.project_code, "P100")
      assertEquals(item0.client_id, 10)
      assertEquals(item0.client_name, "Acme Corp")
      assertEquals(Array.isArray(item0.tasks), true)
      assertEquals(item0.tasks.length, 1)
      assertEquals(item0.tasks[0].task_id, 1001)
      assertEquals(item0.tasks[0].task_name, "Task for P100")
      assertEquals(item0.tasks[0].billable, true)

      assertNoSecrets(result.stdout, "project list --json stdout")
      assertNoSecrets(result.stderr, "project list --json stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list: empty result shows guidance message", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "No project assignments found")
      assertNoSecrets(result.stdout, "project list empty stdout")
    })
  } finally {
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// project list — multi-page pagination
// ---------------------------------------------------------------------------

Deno.test("project list --json: walks multiple pages without truncating", async () => {
  // 3 pages, 2 assignments each = 6 total
  const allAssignments = Array.from(
    { length: 6 },
    (_, i) =>
      harvestProjectAssignment(100 + i, 10 + (i % 3), `Client ${10 + (i % 3)}`),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "project", "list", "--page-size", "2"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      assertEquals(
        data.items.length,
        6,
        "Expected all 6 assignments from 3 pages",
      )
      assertEquals(data.total_entries, 6)
      assertEquals(data.pages_fetched, 3)
      assertEquals(data.truncated, false)

      // Verify all project IDs are present (not truncated)
      const ids = data.items.map((p: Record<string, unknown>) => p.project_id)
      assertEquals(ids, [100, 101, 102, 103, 104, 105])

      assertNoSecrets(result.stdout, "project list multi-page stdout")
      assertNoSecrets(result.stderr, "project list multi-page stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list --json: --limit truncates results with correct metadata", async () => {
  // 2 pages of 3 = 6 total, limit=4
  const allAssignments = Array.from(
    { length: 6 },
    (_, i) => harvestProjectAssignment(100 + i, 10, "Acme"),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const start = (page - 1) * 3
      const pageItems = allAssignments.slice(start, start + 3)
      const nextPage = page < 2 ? page + 1 : null

      return new Response(
        JSON.stringify({
          project_assignments: pageItems,
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "project", "list", "--limit", "4"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      assertEquals(data.items.length, 4, "Expected exactly 4 items")
      assertEquals(
        data.total_entries,
        6,
        "total_entries should reflect server total",
      )
      assertEquals(data.truncated, true, "truncated must be true when limited")

      const ids = data.items.map((p: Record<string, unknown>) => p.project_id)
      assertEquals(ids, [100, 101, 102, 103])

      assertNoSecrets(result.stdout, "project list --limit stdout")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list: human mode shows truncation notice when limited", async () => {
  const allAssignments = Array.from(
    { length: 4 },
    (_, i) => harvestProjectAssignment(100 + i, 10, "Acme"),
  )

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: allAssignments.slice(0, 2),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["project", "list", "--limit", "2"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Showing 2 of")
      assertStringIncludes(result.stdout, "limited")
      assertNoSecrets(result.stdout, "project list truncation stdout")
    })
  } finally {
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// project list — auth/provider error paths
// ---------------------------------------------------------------------------

Deno.test("project list: 401 exits with auth error code 4", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 4, "Expected auth exit code")
      assertStringIncludes(result.stderr, "authentication failed")
      assertNoSecrets(result.stdout, "project list 401 stdout")
      assertNoSecrets(result.stderr, "project list 401 stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list: no accounts configured exits with error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["project", "list"], { configDir: xdgBase })

    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "project list no-accounts stderr")
  })
})

// ---------------------------------------------------------------------------
// Cross-cutting: help output is secret-safe
// ---------------------------------------------------------------------------

Deno.test("project list --help: output is secret-safe", async () => {
  const result = await runCli(["project", "list", "--help"])
  assertNoSecrets(result.stdout, "project list --help stdout")
  assertNoSecrets(result.stderr, "project list --help stderr")
})

// ---------------------------------------------------------------------------
// Robot-mode output contracts
// ---------------------------------------------------------------------------

Deno.test("project list --robot: emits tab-separated PROJECT_FIELDS rows without headers", async () => {
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--robot", "project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const lines = result.stdout.trimEnd().split("\n")
      assertEquals(lines.length, 2, "One line per project, no header")

      // Each line has 7 tab-separated fields per PROJECT_FIELDS
      for (const line of lines) {
        assertEquals(line.split("\t").length, 7)
      }

      // Verify first row field positions
      const cells = lines[0].split("\t")
      assertEquals(cells[0], "100", "project_id at position 0")
      assertEquals(cells[1], "Project 100", "project_name at position 1")
      assertEquals(cells[2], "P100", "project_code at position 2")
      assertEquals(cells[3], "true", "is_active at position 3")
      assertEquals(cells[4], "10", "client_id at position 4")
      assertEquals(cells[5], "Acme Corp", "client_name at position 5")
      // tasks flattened
      assertStringIncludes(cells[6], "1001:")

      // No table headers
      assertEquals(result.stdout.includes("PROJECT ID"), false)
      assertEquals(result.stdout.includes("No project"), false)

      assertNoSecrets(result.stdout, "project list --robot stdout")
      assertNoSecrets(result.stderr, "project list --robot stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list --robot: snapshot", async (t) => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
  ]

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
        JSON.stringify({
          project_assignments: assignments,
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--robot", "project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, result.stdout)
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list --robot: empty result emits zero lines", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(
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
      ),
  )

  const addr = server.addr as Deno.NetAddr
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--robot", "project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertEquals(result.stdout, "", "Empty list → no output")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("project list --robot: 401 exits with auth error, no robot stdout", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )

  const addr = server.addr as Deno.NetAddr
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--robot", "project", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 4, "Expected auth exit code")
      assertEquals(
        result.stdout,
        "",
        "Robot stdout must be empty on auth error",
      )
      assertNoSecrets(result.stdout, "project list --robot 401 stdout")
      assertNoSecrets(result.stderr, "project list --robot 401 stderr")
    })
  } finally {
    server.shutdown()
  }
})
