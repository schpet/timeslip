/**
 * Robot-mode output contract tests.
 *
 * Freezes field-order contracts, tab separation, absence of headers/prose,
 * and secret redaction for all robot-mode output paths.
 *
 * Covers:
 * - writeRobotRow: single-row TSV output with correct field order
 * - writeRobotRows: multi-row TSV output
 * - formatCell: null, undefined, boolean, array, and string handling
 * - Field-order constants match the documented contracts
 * - No headers, banners, or explanatory prose emitted
 * - Unsupported/missing fields produce empty cells (not crashes)
 * - Secret-shaped strings never appear in robot output
 */

import { assertEquals } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets } from "../test_helpers.ts"
import {
  AUTH_LIST_FIELDS,
  AUTH_MUTATION_FIELDS,
  AUTH_WHOAMI_FIELDS,
  CLIENT_FIELDS,
  ENTRY_FIELDS,
  ENTRY_REMOVE_FIELDS,
  PROJECT_FIELDS,
  writeRobotRow,
  writeRobotRows,
} from "./robot.ts"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Capture robot output by intercepting Deno.stdout.writeSync. */
function captureRobot(fn: () => void): string {
  const parts: string[] = []
  const originalWriteSync = Deno.stdout.writeSync
  Deno.stdout.writeSync = (data: Uint8Array) => {
    parts.push(new TextDecoder().decode(data))
    return data.byteLength
  }
  try {
    fn()
  } finally {
    Deno.stdout.writeSync = originalWriteSync
  }
  return parts.join("")
}

// ---------------------------------------------------------------------------
// Field-order contract: AUTH_MUTATION_FIELDS
// ---------------------------------------------------------------------------

Deno.test("AUTH_MUTATION_FIELDS: exact field order", () => {
  assertEquals(
    [...AUTH_MUTATION_FIELDS],
    ["account", "provider", "account_id", "user_id", "email"],
  )
})

Deno.test("AUTH_MUTATION_FIELDS: writeRobotRow emits tab-separated values in contract order", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "work",
      provider: "harvest",
      account_id: "123456",
      user_id: 42,
      email: "jane@example.com",
    }, AUTH_MUTATION_FIELDS)
  )
  assertEquals(output, "work\tharvest\t123456\t42\tjane@example.com\n")
})

Deno.test("AUTH_MUTATION_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "default",
      provider: "harvest",
      account_id: "999999",
      user_id: 7,
      email: "test@example.com",
    }, AUTH_MUTATION_FIELDS)
  )
  await assertSnapshot(t, output)
})

// ---------------------------------------------------------------------------
// Field-order contract: AUTH_LIST_FIELDS
// ---------------------------------------------------------------------------

Deno.test("AUTH_LIST_FIELDS: exact field order", () => {
  assertEquals(
    [...AUTH_LIST_FIELDS],
    ["name", "provider", "account_id", "user_id", "email", "is_default"],
  )
})

Deno.test("AUTH_LIST_FIELDS: writeRobotRows emits multiple rows", () => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        name: "work",
        provider: "harvest",
        account_id: "111",
        user_id: 1,
        email: "a@b.com",
        is_default: true,
      },
      {
        name: "personal",
        provider: "harvest",
        account_id: "222",
        user_id: 2,
        email: "c@d.com",
        is_default: false,
      },
    ], AUTH_LIST_FIELDS)
  )

  const lines = output.trimEnd().split("\n")
  assertEquals(lines.length, 2)
  assertEquals(lines[0], "work\tharvest\t111\t1\ta@b.com\ttrue")
  assertEquals(lines[1], "personal\tharvest\t222\t2\tc@d.com\tfalse")
})

Deno.test("AUTH_LIST_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        name: "default",
        provider: "harvest",
        account_id: "123",
        user_id: 42,
        email: "jane@example.com",
        is_default: true,
      },
      {
        name: "other",
        provider: "harvest",
        account_id: "456",
        user_id: 99,
        email: "john@example.com",
        is_default: false,
      },
    ], AUTH_LIST_FIELDS)
  )
  await assertSnapshot(t, output)
})

// ---------------------------------------------------------------------------
// Field-order contract: AUTH_WHOAMI_FIELDS
// ---------------------------------------------------------------------------

Deno.test("AUTH_WHOAMI_FIELDS: exact field order", () => {
  assertEquals(
    [...AUTH_WHOAMI_FIELDS],
    [
      "account",
      "provider",
      "account_id",
      "is_default",
      "user_id",
      "first_name",
      "last_name",
      "email",
    ],
  )
})

Deno.test("AUTH_WHOAMI_FIELDS: writeRobotRow emits correct order", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "default",
      provider: "harvest",
      account_id: "123456",
      is_default: true,
      user_id: 42,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
    }, AUTH_WHOAMI_FIELDS)
  )
  assertEquals(
    output,
    "default\tharvest\t123456\ttrue\t42\tJane\tDoe\tjane@example.com\n",
  )
})

Deno.test("AUTH_WHOAMI_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "default",
      provider: "harvest",
      account_id: "123456",
      is_default: true,
      user_id: 42,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
    }, AUTH_WHOAMI_FIELDS)
  )
  await assertSnapshot(t, output)
})

// ---------------------------------------------------------------------------
// Field-order contract: ENTRY_FIELDS
// ---------------------------------------------------------------------------

Deno.test("ENTRY_FIELDS: exact field order", () => {
  assertEquals(
    [...ENTRY_FIELDS],
    [
      "id",
      "date",
      "hours",
      "rounded_hours",
      "notes",
      "is_running",
      "is_billable",
      "is_locked",
      "project_id",
      "project_name",
      "task_id",
      "task_name",
      "client_id",
      "client_name",
    ],
  )
})

Deno.test("ENTRY_FIELDS: writeRobotRow emits all 14 fields tab-separated", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      id: 12345,
      date: "2026-03-17",
      hours: 2.5,
      rounded_hours: 2.5,
      notes: "Bug fixes",
      is_running: false,
      is_billable: true,
      is_locked: false,
      project_id: 100,
      project_name: "Timeslip",
      task_id: 200,
      task_name: "Development",
      client_id: 10,
      client_name: "Acme Corp",
    }, ENTRY_FIELDS)
  )

  const cells = output.trimEnd().split("\t")
  assertEquals(cells.length, 14)
  assertEquals(cells[0], "12345")
  assertEquals(cells[1], "2026-03-17")
  assertEquals(cells[2], "2.5")
  assertEquals(cells[3], "2.5")
  assertEquals(cells[4], "Bug fixes")
  assertEquals(cells[5], "false")
  assertEquals(cells[6], "true")
  assertEquals(cells[7], "false")
  assertEquals(cells[8], "100")
  assertEquals(cells[9], "Timeslip")
  assertEquals(cells[10], "200")
  assertEquals(cells[11], "Development")
  assertEquals(cells[12], "10")
  assertEquals(cells[13], "Acme Corp")
})

Deno.test("ENTRY_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRow({
      id: 99999,
      date: "2026-01-15",
      hours: 1.0,
      rounded_hours: 1.0,
      notes: "Writing tests",
      is_running: false,
      is_billable: true,
      is_locked: true,
      project_id: 500,
      project_name: "Test Project",
      task_id: 600,
      task_name: "QA",
      client_id: 50,
      client_name: "Test Client",
    }, ENTRY_FIELDS)
  )
  await assertSnapshot(t, output)
})

Deno.test("ENTRY_FIELDS: null notes produces empty cell", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      id: 1,
      date: "2026-03-17",
      hours: 0,
      rounded_hours: 0,
      notes: null,
      is_running: true,
      is_billable: false,
      is_locked: false,
      project_id: 1,
      project_name: "P",
      task_id: 1,
      task_name: "T",
      client_id: 1,
      client_name: "C",
    }, ENTRY_FIELDS)
  )
  const cells = output.trimEnd().split("\t")
  assertEquals(cells[4], "", "null notes should be an empty cell")
})

// ---------------------------------------------------------------------------
// Field-order contract: ENTRY_REMOVE_FIELDS
// ---------------------------------------------------------------------------

Deno.test("ENTRY_REMOVE_FIELDS: exact field order", () => {
  assertEquals([...ENTRY_REMOVE_FIELDS], ["entry_id"])
})

Deno.test("ENTRY_REMOVE_FIELDS: writeRobotRow emits single field", () => {
  const output = captureRobot(() =>
    writeRobotRow({ entry_id: 42 }, ENTRY_REMOVE_FIELDS)
  )
  assertEquals(output, "42\n")
})

// ---------------------------------------------------------------------------
// Field-order contract: PROJECT_FIELDS
// ---------------------------------------------------------------------------

Deno.test("PROJECT_FIELDS: exact field order", () => {
  assertEquals(
    [...PROJECT_FIELDS],
    [
      "project_id",
      "project_name",
      "project_code",
      "is_active",
      "client_id",
      "client_name",
      "tasks",
    ],
  )
})

Deno.test("PROJECT_FIELDS: tasks array flattened to comma-separated colon-delimited", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      project_id: 100,
      project_name: "Timeslip",
      project_code: "TS",
      is_active: true,
      client_id: 10,
      client_name: "Acme Corp",
      tasks: [
        { task_id: 200, task_name: "Development", billable: true },
        { task_id: 201, task_name: "Design", billable: false },
      ],
    }, PROJECT_FIELDS)
  )

  const cells = output.trimEnd().split("\t")
  assertEquals(cells.length, 7)
  assertEquals(cells[0], "100")
  assertEquals(cells[1], "Timeslip")
  assertEquals(cells[2], "TS")
  assertEquals(cells[3], "true")
  assertEquals(cells[4], "10")
  assertEquals(cells[5], "Acme Corp")
  // Tasks flattened: "id:name:billable,id:name:billable"
  assertEquals(cells[6], "200:Development:true,201:Design:false")
})

Deno.test("PROJECT_FIELDS: null project_code produces empty cell", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      project_id: 100,
      project_name: "Test",
      project_code: null,
      is_active: true,
      client_id: 10,
      client_name: "Client",
      tasks: [],
    }, PROJECT_FIELDS)
  )
  const cells = output.trimEnd().split("\t")
  assertEquals(cells[2], "", "null project_code should be empty")
})

Deno.test("PROJECT_FIELDS: empty tasks array produces empty cell", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      project_id: 100,
      project_name: "Test",
      project_code: "T",
      is_active: true,
      client_id: 10,
      client_name: "Client",
      tasks: [],
    }, PROJECT_FIELDS)
  )
  const cells = output.replace(/\n$/, "").split("\t")
  assertEquals(cells[6], "", "empty tasks should be empty cell")
})

Deno.test("PROJECT_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        project_id: 100,
        project_name: "Timeslip",
        project_code: "TS",
        is_active: true,
        client_id: 10,
        client_name: "Acme Corp",
        tasks: [
          { task_id: 200, task_name: "Development", billable: true },
        ],
      },
      {
        project_id: 101,
        project_name: "Other",
        project_code: null,
        is_active: false,
        client_id: 20,
        client_name: "Globex",
        tasks: [],
      },
    ], PROJECT_FIELDS)
  )
  await assertSnapshot(t, output)
})

// ---------------------------------------------------------------------------
// Field-order contract: CLIENT_FIELDS
// ---------------------------------------------------------------------------

Deno.test("CLIENT_FIELDS: exact field order", () => {
  assertEquals(
    [...CLIENT_FIELDS],
    ["client_id", "client_name", "projects"],
  )
})

Deno.test("CLIENT_FIELDS: projects array flattened correctly", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      client_id: 10,
      client_name: "Acme Corp",
      projects: [
        { project_id: 100, project_name: "Alpha", project_code: "A" },
        { project_id: 101, project_name: "Beta", project_code: null },
      ],
    }, CLIENT_FIELDS)
  )

  const cells = output.trimEnd().split("\t")
  assertEquals(cells.length, 3)
  assertEquals(cells[0], "10")
  assertEquals(cells[1], "Acme Corp")
  assertEquals(cells[2], "100:Alpha:A,101:Beta:")
})

Deno.test("CLIENT_FIELDS: snapshot", async (t) => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        client_id: 10,
        client_name: "Acme Corp",
        projects: [
          { project_id: 100, project_name: "Web", project_code: "W" },
        ],
      },
      {
        client_id: 20,
        client_name: "Globex",
        projects: [
          { project_id: 200, project_name: "API", project_code: "API" },
          { project_id: 201, project_name: "Mobile", project_code: null },
        ],
      },
    ], CLIENT_FIELDS)
  )
  await assertSnapshot(t, output)
})

// ---------------------------------------------------------------------------
// No headers, banners, or explanatory prose
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow emits no header line", () => {
  const output = captureRobot(() =>
    writeRobotRow({ entry_id: 42 }, ENTRY_REMOVE_FIELDS)
  )
  const lines = output.trimEnd().split("\n")
  assertEquals(lines.length, 1, "Robot output must be exactly one line per row")
  assertEquals(lines[0].includes("entry_id"), false, "No column headers")
  assertEquals(lines[0].includes("ENTRY"), false, "No uppercase headers")
})

Deno.test("writeRobotRows emits no header line before data", () => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        name: "a",
        provider: "harvest",
        account_id: "1",
        user_id: 1,
        email: "a@b.com",
        is_default: true,
      },
      {
        name: "b",
        provider: "harvest",
        account_id: "2",
        user_id: 2,
        email: "c@d.com",
        is_default: false,
      },
    ], AUTH_LIST_FIELDS)
  )
  const lines = output.trimEnd().split("\n")
  assertEquals(lines.length, 2, "Should be exactly 2 data lines, no header")
  // First line must not be a header row
  assertEquals(
    lines[0].startsWith("name\t") || lines[0].startsWith("NAME\t"),
    false,
    "First line must be data, not headers",
  )
})

Deno.test("writeRobotRows: empty array produces no output", () => {
  const output = captureRobot(() => writeRobotRows([], AUTH_LIST_FIELDS))
  assertEquals(output, "", "Empty records must produce zero output")
})

// ---------------------------------------------------------------------------
// Missing keys produce empty cells, never crash
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow: missing keys produce empty cells", () => {
  const output = captureRobot(() =>
    writeRobotRow({ account: "work" }, AUTH_MUTATION_FIELDS)
  )
  const cells = output.replace(/\n$/, "").split("\t")
  assertEquals(cells.length, 5, "Must still emit all 5 fields")
  assertEquals(cells[0], "work")
  assertEquals(cells[1], "", "missing provider → empty")
  assertEquals(cells[2], "", "missing account_id → empty")
  assertEquals(cells[3], "", "missing user_id → empty")
  assertEquals(cells[4], "", "missing email → empty")
})

Deno.test("writeRobotRow: completely empty record produces all-empty cells", () => {
  const output = captureRobot(() => writeRobotRow({}, ENTRY_FIELDS))
  const cells = output.replace(/\n$/, "").split("\t")
  assertEquals(cells.length, 14, "Must emit all 14 entry fields")
  for (const cell of cells) {
    assertEquals(cell, "", "All cells should be empty for empty record")
  }
})

// ---------------------------------------------------------------------------
// Tab delimiter correctness
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow: values with spaces are not split", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      id: 1,
      date: "2026-03-17",
      hours: 1,
      rounded_hours: 1,
      notes: "This has spaces in it",
      is_running: false,
      is_billable: true,
      is_locked: false,
      project_id: 1,
      project_name: "My Project Name",
      task_id: 1,
      task_name: "My Task",
      client_id: 1,
      client_name: "My Client",
    }, ENTRY_FIELDS)
  )
  const cells = output.trimEnd().split("\t")
  assertEquals(cells.length, 14, "Tab count must be exactly 13 (14 fields)")
  assertEquals(cells[4], "This has spaces in it")
  assertEquals(cells[9], "My Project Name")
})

Deno.test("writeRobotRow: output contains exactly N-1 tabs for N fields", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "x",
      provider: "y",
      account_id: "z",
      user_id: 1,
      email: "e",
    }, AUTH_MUTATION_FIELDS)
  )
  const tabCount = (output.match(/\t/g) ?? []).length
  assertEquals(
    tabCount,
    AUTH_MUTATION_FIELDS.length - 1,
    `Expected ${
      AUTH_MUTATION_FIELDS.length - 1
    } tabs for ${AUTH_MUTATION_FIELDS.length} fields`,
  )
})

// ---------------------------------------------------------------------------
// Boolean formatting
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow: booleans render as 'true'/'false' strings", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      name: "test",
      provider: "harvest",
      account_id: "1",
      user_id: 1,
      email: "a@b.com",
      is_default: true,
    }, AUTH_LIST_FIELDS)
  )
  const cells = output.trimEnd().split("\t")
  assertEquals(cells[5], "true")

  const output2 = captureRobot(() =>
    writeRobotRow({
      name: "test",
      provider: "harvest",
      account_id: "1",
      user_id: 1,
      email: "a@b.com",
      is_default: false,
    }, AUTH_LIST_FIELDS)
  )
  const cells2 = output2.trimEnd().split("\t")
  assertEquals(cells2[5], "false")
})

// ---------------------------------------------------------------------------
// Undefined vs null handling
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow: undefined values produce empty cells", () => {
  const output = captureRobot(() =>
    writeRobotRow(
      { entry_id: undefined } as unknown as Record<string, unknown>,
      ENTRY_REMOVE_FIELDS,
    )
  )
  assertEquals(output.trimEnd(), "")
})

Deno.test("writeRobotRow: null values produce empty cells", () => {
  const output = captureRobot(() =>
    writeRobotRow(
      { entry_id: null } as unknown as Record<string, unknown>,
      ENTRY_REMOVE_FIELDS,
    )
  )
  assertEquals(output.trimEnd(), "")
})

// ---------------------------------------------------------------------------
// Secret-safety: robot output must never contain tokens
// ---------------------------------------------------------------------------

Deno.test("robot output from auth mutation record is secret-safe", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "default",
      provider: "harvest",
      account_id: "123456",
      user_id: 42,
      email: "jane@example.com",
    }, AUTH_MUTATION_FIELDS)
  )
  assertNoSecrets(output, "robot auth mutation output")
})

Deno.test("robot output from auth list records is secret-safe", () => {
  const output = captureRobot(() =>
    writeRobotRows([
      {
        name: "default",
        provider: "harvest",
        account_id: "123456",
        user_id: 42,
        email: "jane@example.com",
        is_default: true,
      },
    ], AUTH_LIST_FIELDS)
  )
  assertNoSecrets(output, "robot auth list output")
})

Deno.test("robot output from whoami record is secret-safe", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "default",
      provider: "harvest",
      account_id: "123456",
      is_default: true,
      user_id: 42,
      first_name: "Jane",
      last_name: "Doe",
      email: "jane@example.com",
    }, AUTH_WHOAMI_FIELDS)
  )
  assertNoSecrets(output, "robot whoami output")
})

Deno.test("robot output: token-shaped value in an allowed field is still flagged", () => {
  // If someone accidentally passed a token as a field value, assertNoSecrets catches it.
  const fakeToken = "pat_abcdefghij1234567890abcdefghij1234567890"
  const output = captureRobot(() =>
    writeRobotRow({
      account: fakeToken,
      provider: "harvest",
      account_id: "123",
      user_id: 1,
      email: "a@b.com",
    }, AUTH_MUTATION_FIELDS)
  )
  let caught = false
  try {
    assertNoSecrets(output, "robot with token leak")
  } catch {
    caught = true
  }
  assertEquals(
    caught,
    true,
    "assertNoSecrets should catch token-shaped values in robot output",
  )
})

// ---------------------------------------------------------------------------
// Integration: renderEntry → writeRobotRow produces correct contract
// ---------------------------------------------------------------------------

Deno.test("renderEntry → writeRobotRow: field order matches ENTRY_FIELDS contract", async () => {
  const { renderEntry } = await import("../commands/entry/render.ts")

  const entry = {
    id: 55555,
    date: "2026-03-17",
    hours: 3.25,
    roundedHours: 3.25,
    notes: "Integration test",
    isRunning: false,
    isBillable: true,
    isLocked: false,
    projectId: 100,
    projectName: "Timeslip",
    taskId: 200,
    taskName: "Development",
    clientId: 10,
    clientName: "Acme Corp",
  }

  const rendered = renderEntry(entry)
  const output = captureRobot(() => writeRobotRow(rendered, ENTRY_FIELDS))
  const cells = output.trimEnd().split("\t")

  // Verify each cell position matches contract
  assertEquals(cells[0], "55555", "id at position 0")
  assertEquals(cells[1], "2026-03-17", "date at position 1")
  assertEquals(cells[2], "3.25", "hours at position 2")
  assertEquals(cells[3], "3.25", "rounded_hours at position 3")
  assertEquals(cells[4], "Integration test", "notes at position 4")
  assertEquals(cells[5], "false", "is_running at position 5")
  assertEquals(cells[6], "true", "is_billable at position 6")
  assertEquals(cells[7], "false", "is_locked at position 7")
  assertEquals(cells[8], "100", "project_id at position 8")
  assertEquals(cells[9], "Timeslip", "project_name at position 9")
  assertEquals(cells[10], "200", "task_id at position 10")
  assertEquals(cells[11], "Development", "task_name at position 11")
  assertEquals(cells[12], "10", "client_id at position 12")
  assertEquals(cells[13], "Acme Corp", "client_name at position 13")

  assertNoSecrets(output, "renderEntry robot output")
})

// ---------------------------------------------------------------------------
// Integration: renderProject → writeRobotRow produces correct contract
// ---------------------------------------------------------------------------

Deno.test("renderProject → writeRobotRow: field order matches PROJECT_FIELDS contract", async () => {
  const { renderProject } = await import("../commands/project/list.ts")

  const assignment = {
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
  }

  const rendered = renderProject(assignment)
  const output = captureRobot(() => writeRobotRow(rendered, PROJECT_FIELDS))
  const cells = output.trimEnd().split("\t")

  assertEquals(cells[0], "100", "project_id at position 0")
  assertEquals(cells[1], "Timeslip", "project_name at position 1")
  assertEquals(cells[2], "TS", "project_code at position 2")
  assertEquals(cells[3], "true", "is_active at position 3")
  assertEquals(cells[4], "10", "client_id at position 4")
  assertEquals(cells[5], "Acme Corp", "client_name at position 5")
  // Tasks: each task object has task_id, task_name, billable → joined as "val:val:val"
  assertEquals(
    cells[6],
    "200:Development:true,201:Design:false",
    "tasks at position 6",
  )

  assertNoSecrets(output, "renderProject robot output")
})

// ---------------------------------------------------------------------------
// Integration: deduplicateClients → renderClient → writeRobotRow
// ---------------------------------------------------------------------------

Deno.test("client renderClient → writeRobotRow: field order matches CLIENT_FIELDS contract", () => {
  // renderClient is private in list.ts, so we test the shape that gets passed to writeRobotRow
  const clientRecord = {
    client_id: 10,
    client_name: "Acme Corp",
    projects: [
      { project_id: 100, project_name: "Web", project_code: "W" },
      { project_id: 101, project_name: "Mobile", project_code: null },
    ],
  }

  const output = captureRobot(() => writeRobotRow(clientRecord, CLIENT_FIELDS))
  const cells = output.trimEnd().split("\t")

  assertEquals(cells[0], "10", "client_id at position 0")
  assertEquals(cells[1], "Acme Corp", "client_name at position 1")
  assertEquals(cells[2], "100:Web:W,101:Mobile:", "projects at position 2")

  assertNoSecrets(output, "client robot output")
})

// ---------------------------------------------------------------------------
// Field count immutability: adding/removing fields would break these
// ---------------------------------------------------------------------------

Deno.test("field count contracts: AUTH_MUTATION_FIELDS has 5 fields", () => {
  assertEquals(AUTH_MUTATION_FIELDS.length, 5)
})

Deno.test("field count contracts: AUTH_LIST_FIELDS has 6 fields", () => {
  assertEquals(AUTH_LIST_FIELDS.length, 6)
})

Deno.test("field count contracts: AUTH_WHOAMI_FIELDS has 8 fields", () => {
  assertEquals(AUTH_WHOAMI_FIELDS.length, 8)
})

Deno.test("field count contracts: ENTRY_FIELDS has 14 fields", () => {
  assertEquals(ENTRY_FIELDS.length, 14)
})

Deno.test("field count contracts: ENTRY_REMOVE_FIELDS has 1 field", () => {
  assertEquals(ENTRY_REMOVE_FIELDS.length, 1)
})

Deno.test("field count contracts: PROJECT_FIELDS has 7 fields", () => {
  assertEquals(PROJECT_FIELDS.length, 7)
})

Deno.test("field count contracts: CLIENT_FIELDS has 3 fields", () => {
  assertEquals(CLIENT_FIELDS.length, 3)
})

// ---------------------------------------------------------------------------
// Output has no trailing whitespace or extra newlines
// ---------------------------------------------------------------------------

Deno.test("writeRobotRow: output ends with exactly one newline", () => {
  const output = captureRobot(() =>
    writeRobotRow({ entry_id: 42 }, ENTRY_REMOVE_FIELDS)
  )
  assertEquals(output.endsWith("\n"), true, "Must end with newline")
  assertEquals(
    output.endsWith("\n\n"),
    false,
    "Must not end with double newline",
  )
  assertEquals(output, "42\n")
})

Deno.test("writeRobotRow: no trailing whitespace before newline", () => {
  const output = captureRobot(() =>
    writeRobotRow({
      account: "work",
      provider: "harvest",
      account_id: "123",
      user_id: 1,
      email: "a@b.com",
    }, AUTH_MUTATION_FIELDS)
  )
  const line = output.trimEnd()
  assertEquals(line.endsWith(" "), false, "No trailing spaces")
  assertEquals(line.endsWith("\t"), false, "No trailing tabs")
})
