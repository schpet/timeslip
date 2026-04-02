/**
 * Unit and command-level tests for client discovery.
 *
 * Covers:
 * - deduplicateClients: merges assignments by client ID, deterministic sort
 * - client --help and client list --help snapshots
 * - client list: human and --json output against mock server
 * - client list: JSON includes associated projects
 * - client list: deduplication by client id
 * - client list: multi-page traversal returns all assignments for dedup
 * - client list: --limit / --page-size honored
 * - client list: validation errors for bad --limit / --page-size
 * - client list: auth/provider error exit codes
 * - Secret redaction in all output paths
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"
import { deduplicateClients } from "./list.ts"
import type { ProjectAssignment } from "../../domain/mod.ts"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-888888.clienttoken1234567890abcdef"

function makeFixtureAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "default",
    provider: "harvest",
    accountId: "888888",
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
    tasks: [{ id: 200, name: "Development", billable: true }],
    isActive: true,
    ...overrides,
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
    ],
  }
}

async function withTempXdg(
  fn: (xdgBase: string, appDir: string) => Promise<void>,
): Promise<void> {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_client_test_" })
  const appDir = join(xdgBase, "timeslip")
  try {
    await fn(xdgBase, appDir)
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// deduplicateClients — unit tests
// ---------------------------------------------------------------------------

Deno.test("deduplicateClients: merges two assignments with same client", () => {
  const assignments: ProjectAssignment[] = [
    makeFixtureAssignment({
      projectId: 100,
      projectName: "Project A",
      client: { id: 10, name: "Acme" },
    }),
    makeFixtureAssignment({
      projectId: 101,
      projectName: "Project B",
      client: { id: 10, name: "Acme" },
    }),
  ]

  const clients = deduplicateClients(assignments)

  assertEquals(clients.length, 1)
  assertEquals(clients[0].clientId, 10)
  assertEquals(clients[0].clientName, "Acme")
  assertEquals(clients[0].projects.length, 2)
  assertEquals(clients[0].projects[0].projectId, 100)
  assertEquals(clients[0].projects[1].projectId, 101)
})

Deno.test("deduplicateClients: keeps different clients separate", () => {
  const assignments: ProjectAssignment[] = [
    makeFixtureAssignment({ projectId: 100, client: { id: 10, name: "Acme" } }),
    makeFixtureAssignment({
      projectId: 101,
      client: { id: 20, name: "Globex" },
    }),
  ]

  const clients = deduplicateClients(assignments)

  assertEquals(clients.length, 2)
  assertEquals(clients[0].clientId, 10)
  assertEquals(clients[1].clientId, 20)
})

Deno.test("deduplicateClients: sorted by client ID for determinism", () => {
  const assignments: ProjectAssignment[] = [
    makeFixtureAssignment({ projectId: 100, client: { id: 30, name: "Zeta" } }),
    makeFixtureAssignment({
      projectId: 101,
      client: { id: 10, name: "Alpha" },
    }),
    makeFixtureAssignment({ projectId: 102, client: { id: 20, name: "Beta" } }),
  ]

  const clients = deduplicateClients(assignments)

  assertEquals(clients.map((c) => c.clientId), [10, 20, 30])
  assertEquals(clients.map((c) => c.clientName), ["Alpha", "Beta", "Zeta"])
})

Deno.test("deduplicateClients: projects within client sorted by project ID", () => {
  const assignments: ProjectAssignment[] = [
    makeFixtureAssignment({ projectId: 300, client: { id: 10, name: "Acme" } }),
    makeFixtureAssignment({ projectId: 100, client: { id: 10, name: "Acme" } }),
    makeFixtureAssignment({ projectId: 200, client: { id: 10, name: "Acme" } }),
  ]

  const clients = deduplicateClients(assignments)

  assertEquals(clients.length, 1)
  assertEquals(clients[0].projects.map((p) => p.projectId), [100, 200, 300])
})

Deno.test("deduplicateClients: empty input returns empty output", () => {
  const clients = deduplicateClients([])
  assertEquals(clients, [])
})

Deno.test("deduplicateClients: preserves project code (including null)", () => {
  const assignments: ProjectAssignment[] = [
    makeFixtureAssignment({
      projectId: 100,
      projectName: "Coded",
      projectCode: "CD",
      client: { id: 10, name: "Acme" },
    }),
    makeFixtureAssignment({
      projectId: 101,
      projectName: "Unoded",
      projectCode: null,
      client: { id: 10, name: "Acme" },
    }),
  ]

  const clients = deduplicateClients(assignments)

  assertEquals(clients[0].projects[0].projectCode, "CD")
  assertEquals(clients[0].projects[1].projectCode, null)
})

// ---------------------------------------------------------------------------
// Help snapshots
// ---------------------------------------------------------------------------

Deno.test("client --help: exits 0 with subcommand list", async () => {
  const result = await runCli(["client", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "list")
  assertNoSecrets(result.stdout, "client --help stdout")
  assertNoSecrets(result.stderr, "client --help stderr")
})

Deno.test("client --help: snapshot", async (t) => {
  const result = await runCli(["client", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("client list --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["client", "list", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--limit")
  assertStringIncludes(result.stdout, "--page-size")
  assertNoSecrets(result.stdout, "client list --help stdout")
  assertNoSecrets(result.stderr, "client list --help stderr")
})

Deno.test("client list --help: snapshot", async (t) => {
  const result = await runCli(["client", "list", "--help"])
  await assertSnapshot(t, result.stdout)
})

// ---------------------------------------------------------------------------
// client list — validation errors
// ---------------------------------------------------------------------------

Deno.test("client list: --limit 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(
      ["client", "list", "--limit", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--limit")
    assertNoSecrets(result.stderr, "client list --limit 0 stderr")
  })
})

Deno.test("client list: --page-size 0 exits with validation error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(
      ["client", "list", "--page-size", "0"],
      { configDir: xdgBase },
    )
    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "--page-size")
    assertNoSecrets(result.stderr, "client list --page-size 0 stderr")
  })
})

// ---------------------------------------------------------------------------
// client list — mock server: deduplication + JSON output
// ---------------------------------------------------------------------------

Deno.test("client list --json: deduplicates by client id and includes projects", async () => {
  // Two assignments for client 10 (Acme), one for client 20 (Globex)
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 10, "Acme Corp"),
    harvestProjectAssignment(102, 20, "Globex Inc"),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "client", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      // Should be 2 clients (deduplicated), not 3 assignments
      assertEquals(data.items.length, 2, "Expected 2 deduplicated clients")
      assertEquals(data.total_entries, 2)
      assertEquals(data.truncated, false)

      // Client 10 should have 2 projects
      const acme = data.items.find((c: Record<string, unknown>) =>
        c.client_id === 10
      )
      assertEquals(acme.client_name, "Acme Corp")
      assertEquals(acme.projects.length, 2)
      assertEquals(acme.projects[0].project_id, 100)
      assertEquals(acme.projects[1].project_id, 101)

      // Client 20 should have 1 project
      const globex = data.items.find((c: Record<string, unknown>) =>
        c.client_id === 20
      )
      assertEquals(globex.client_name, "Globex Inc")
      assertEquals(globex.projects.length, 1)
      assertEquals(globex.projects[0].project_id, 102)

      assertNoSecrets(result.stdout, "client list --json stdout")
      assertNoSecrets(result.stderr, "client list --json stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("client list: human output shows deduplicated clients table", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 10, "Acme Corp"),
    harvestProjectAssignment(102, 20, "Globex Inc"),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["client", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      // Table headers
      assertStringIncludes(result.stdout, "CLIENT ID")
      assertStringIncludes(result.stdout, "CLIENT")
      assertStringIncludes(result.stdout, "PROJECTS")
      // Client names
      assertStringIncludes(result.stdout, "Acme Corp")
      assertStringIncludes(result.stdout, "Globex Inc")
      assertNoSecrets(result.stdout, "client list human stdout")
      assertNoSecrets(result.stderr, "client list human stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("client list: empty result shows guidance message", async () => {
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
        ["client", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "No clients found")
      assertNoSecrets(result.stdout, "client list empty stdout")
    })
  } finally {
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// client list — multi-page: proves full data is fetched before dedup
// ---------------------------------------------------------------------------

Deno.test("client list --json: multi-page traversal fetches all data for dedup", async () => {
  // Page 1: projects 100,101 (client 10=Acme, client 20=Globex)
  // Page 2: projects 102,103 (client 10=Acme, client 30=Initech)
  // After dedup: 3 clients: Acme(2 projects), Globex(1), Initech(1)
  const page1 = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 20, "Globex Inc"),
  ]
  const page2 = [
    harvestProjectAssignment(102, 10, "Acme Corp"),
    harvestProjectAssignment(103, 30, "Initech"),
  ]

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const url = new URL(req.url)
      const page = parseInt(url.searchParams.get("page") ?? "1")
      const items = page === 1 ? page1 : page2
      const nextPage = page === 1 ? 2 : null

      return new Response(
        JSON.stringify({
          project_assignments: items,
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "client", "list", "--page-size", "2"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      // 3 clients after dedup (Acme, Globex, Initech)
      assertEquals(data.items.length, 3, "Expected 3 deduplicated clients")
      assertEquals(data.pages_fetched, 2)
      assertEquals(data.truncated, false)

      // Sorted by client ID
      assertEquals(data.items[0].client_id, 10)
      assertEquals(data.items[0].client_name, "Acme Corp")
      assertEquals(
        data.items[0].projects.length,
        2,
        "Acme should have projects from both pages",
      )

      assertEquals(data.items[1].client_id, 20)
      assertEquals(data.items[1].client_name, "Globex Inc")
      assertEquals(data.items[1].projects.length, 1)

      assertEquals(data.items[2].client_id, 30)
      assertEquals(data.items[2].client_name, "Initech")
      assertEquals(data.items[2].projects.length, 1)

      assertNoSecrets(result.stdout, "client list multi-page stdout")
      assertNoSecrets(result.stderr, "client list multi-page stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("client list --json: --limit applied after dedup", async () => {
  // 3 assignments, 3 different clients → dedup to 3 clients, limit to 2
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--json", "client", "list", "--limit", "2"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)

      assertEquals(data.items.length, 2, "Expected 2 clients (limited)")
      assertEquals(
        data.total_entries,
        3,
        "total_entries should be full dedup count",
      )
      assertEquals(data.truncated, true, "truncated must be true when limited")

      // First 2 clients by ID
      assertEquals(data.items[0].client_id, 10)
      assertEquals(data.items[1].client_id, 20)

      assertNoSecrets(result.stdout, "client list --limit stdout")
    })
  } finally {
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// client list — auth/provider error paths
// ---------------------------------------------------------------------------

Deno.test("client list: 401 exits with auth error code 4", async () => {
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
        ["client", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 4, "Expected auth exit code")
      assertStringIncludes(result.stderr, "authentication failed")
      assertNoSecrets(result.stdout, "client list 401 stdout")
      assertNoSecrets(result.stderr, "client list 401 stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("client list: no accounts configured exits with error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["client", "list"], { configDir: xdgBase })

    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "client list no-accounts stderr")
  })
})

// ---------------------------------------------------------------------------
// Cross-cutting: help output is secret-safe
// ---------------------------------------------------------------------------

Deno.test("client list --help: output is secret-safe", async () => {
  const result = await runCli(["client", "list", "--help"])
  assertNoSecrets(result.stdout, "client list --help stdout")
  assertNoSecrets(result.stderr, "client list --help stderr")
})

// ---------------------------------------------------------------------------
// Robot-mode output contracts
// ---------------------------------------------------------------------------

Deno.test("client list --robot: emits tab-separated CLIENT_FIELDS rows with dedup", async () => {
  const assignments = [
    harvestProjectAssignment(100, 10, "Acme Corp"),
    harvestProjectAssignment(101, 10, "Acme Corp"),
    harvestProjectAssignment(102, 20, "Globex Inc"),
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
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        ["--robot", "client", "list"],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const lines = result.stdout.trimEnd().split("\n")
      assertEquals(lines.length, 2, "2 deduplicated clients, no header")

      // Each line has 3 tab-separated fields per CLIENT_FIELDS
      for (const line of lines) {
        assertEquals(line.split("\t").length, 3)
      }

      // First client (sorted by id): Acme Corp (id=10)
      const cells0 = lines[0].split("\t")
      assertEquals(cells0[0], "10", "client_id at position 0")
      assertEquals(cells0[1], "Acme Corp", "client_name at position 1")
      // Acme has 2 projects, flattened
      assertStringIncludes(cells0[2], "100:")
      assertStringIncludes(cells0[2], "101:")

      // Second client: Globex Inc (id=20)
      const cells1 = lines[1].split("\t")
      assertEquals(cells1[0], "20")
      assertEquals(cells1[1], "Globex Inc")

      // No table headers
      assertEquals(result.stdout.includes("CLIENT ID"), false)
      assertEquals(result.stdout.includes("No clients"), false)

      assertNoSecrets(result.stdout, "client list --robot stdout")
      assertNoSecrets(result.stderr, "client list --robot stderr")
    })
  } finally {
    server.shutdown()
  }
})

Deno.test("client list --robot: snapshot", async (t) => {
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
        ["--robot", "client", "list"],
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

Deno.test("client list --robot: empty result emits zero lines", async () => {
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
        ["--robot", "client", "list"],
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

Deno.test("client list --robot: 401 exits with auth error, no robot stdout", async () => {
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
        ["--robot", "client", "list"],
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
      assertNoSecrets(result.stdout, "client list --robot 401 stdout")
      assertNoSecrets(result.stderr, "client list --robot 401 stderr")
    })
  } finally {
    server.shutdown()
  }
})
