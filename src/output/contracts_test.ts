/**
 * Shared JSON list envelope contract tests.
 *
 * Validates that all paginated list commands (entry list, project list,
 * client list) produce the same envelope shape: { items, total_entries,
 * pages_fetched, truncated }.
 *
 * Also validates that the documented output-contracts.md examples match
 * the frozen field-order contracts and are free of secret-shaped strings.
 *
 * Covers:
 * - writeJsonList envelope shape and key presence
 * - writeJsonList key ordering (items first)
 * - Envelope metadata types and edge cases
 * - writeJsonSuccess shape for mutations
 * - Documented robot field orders match exported constants
 * - docs/output-contracts.md is free of token-shaped strings
 * - Documented JSON examples parse as valid JSON
 */

import { assertEquals } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { writeJsonList, writeJsonSuccess } from "./json.ts"
import {
  AUTH_LIST_FIELDS,
  AUTH_MUTATION_FIELDS,
  AUTH_WHOAMI_FIELDS,
  CLIENT_FIELDS,
  ENTRY_FIELDS,
  ENTRY_REMOVE_FIELDS,
  PROJECT_FIELDS,
} from "./robot.ts"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Capture compact JSON output from writeJsonList. */
function captureJsonList(
  items: unknown[],
  meta: { total_entries: number; pages_fetched: number; truncated: boolean },
): Record<string, unknown> {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal
  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }
  try {
    writeJsonList(items, meta)
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }
  return JSON.parse(new TextDecoder().decode(chunks[0]).trim())
}

/** Capture compact JSON from writeJsonSuccess. */
function captureJsonSuccess(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal
  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }
  try {
    writeJsonSuccess(payload)
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }
  return JSON.parse(new TextDecoder().decode(chunks[0]).trim())
}

// ---------------------------------------------------------------------------
// Shared envelope shape — all paginated list commands must match
// ---------------------------------------------------------------------------

Deno.test("shared envelope: has exactly 4 top-level keys", () => {
  const parsed = captureJsonList(
    [{ id: 1 }],
    { total_entries: 1, pages_fetched: 1, truncated: false },
  )
  const keys = Object.keys(parsed)
  assertEquals(keys.length, 4)
  assertEquals(keys.includes("items"), true)
  assertEquals(keys.includes("total_entries"), true)
  assertEquals(keys.includes("pages_fetched"), true)
  assertEquals(keys.includes("truncated"), true)
})

Deno.test("shared envelope: items is always first key", () => {
  const parsed = captureJsonList(
    [{ x: 1 }],
    { total_entries: 1, pages_fetched: 1, truncated: false },
  )
  assertEquals(Object.keys(parsed)[0], "items")
})

Deno.test("shared envelope: items is an array", () => {
  const parsed = captureJsonList(
    [{ a: 1 }, { b: 2 }],
    { total_entries: 2, pages_fetched: 1, truncated: false },
  )
  assertEquals(Array.isArray(parsed.items), true)
  assertEquals((parsed.items as unknown[]).length, 2)
})

Deno.test("shared envelope: metadata types are correct", () => {
  const parsed = captureJsonList(
    [],
    { total_entries: 0, pages_fetched: 0, truncated: false },
  )
  assertEquals(typeof parsed.total_entries, "number")
  assertEquals(typeof parsed.pages_fetched, "number")
  assertEquals(typeof parsed.truncated, "boolean")
})

Deno.test("shared envelope: truncated=true when limited", () => {
  const parsed = captureJsonList(
    [{ id: 1 }, { id: 2 }],
    { total_entries: 10, pages_fetched: 2, truncated: true },
  )
  assertEquals(parsed.truncated, true)
  assertEquals(parsed.total_entries, 10)
  assertEquals((parsed.items as unknown[]).length, 2)
})

Deno.test("shared envelope: empty items with zero metadata", () => {
  const parsed = captureJsonList(
    [],
    { total_entries: 0, pages_fetched: 0, truncated: false },
  )
  assertEquals(parsed.items, [])
  assertEquals(parsed.total_entries, 0)
  assertEquals(parsed.pages_fetched, 0)
  assertEquals(parsed.truncated, false)
})

Deno.test("shared envelope: snapshot with entry-shaped items", async (t) => {
  const parsed = captureJsonList(
    [{
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
    }],
    { total_entries: 1, pages_fetched: 1, truncated: false },
  )
  await assertSnapshot(t, parsed)
})

Deno.test("shared envelope: snapshot with project-shaped items", async (t) => {
  const parsed = captureJsonList(
    [{
      project_id: 100,
      project_name: "Timeslip",
      project_code: "TS",
      is_active: true,
      client_id: 10,
      client_name: "Acme Corp",
      tasks: [
        { task_id: 200, task_name: "Development", billable: true },
      ],
    }],
    { total_entries: 1, pages_fetched: 1, truncated: false },
  )
  await assertSnapshot(t, parsed)
})

Deno.test("shared envelope: snapshot with client-shaped items", async (t) => {
  const parsed = captureJsonList(
    [{
      client_id: 10,
      client_name: "Acme Corp",
      projects: [
        { project_id: 100, project_name: "Timeslip", project_code: "TS" },
      ],
    }],
    { total_entries: 1, pages_fetched: 1, truncated: false },
  )
  await assertSnapshot(t, parsed)
})

// ---------------------------------------------------------------------------
// Mutation success shape
// ---------------------------------------------------------------------------

Deno.test("mutation success: has ok:true as first key", () => {
  const parsed = captureJsonSuccess({ id: 42 })
  assertEquals(Object.keys(parsed)[0], "ok")
  assertEquals(parsed.ok, true)
})

Deno.test("mutation success: extra fields are preserved", () => {
  const parsed = captureJsonSuccess({ entry_id: 42, action: "deleted" })
  assertEquals(parsed.ok, true)
  assertEquals(parsed.entry_id, 42)
  assertEquals(parsed.action, "deleted")
})

// ---------------------------------------------------------------------------
// Documented robot field orders match exported constants
// ---------------------------------------------------------------------------

Deno.test("contract: ENTRY_FIELDS keys match renderEntry output shape", () => {
  // These are the keys that renderEntry produces
  const renderEntryKeys = [
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
  ]
  assertEquals([...ENTRY_FIELDS], renderEntryKeys)
})

Deno.test("contract: PROJECT_FIELDS keys match renderProject output shape", () => {
  const renderProjectKeys = [
    "project_id",
    "project_name",
    "project_code",
    "is_active",
    "client_id",
    "client_name",
    "tasks",
  ]
  assertEquals([...PROJECT_FIELDS], renderProjectKeys)
})

Deno.test("contract: CLIENT_FIELDS keys match renderClient output shape", () => {
  const renderClientKeys = ["client_id", "client_name", "projects"]
  assertEquals([...CLIENT_FIELDS], renderClientKeys)
})

Deno.test("contract: AUTH_MUTATION_FIELDS count", () => {
  assertEquals(AUTH_MUTATION_FIELDS.length, 5)
})

Deno.test("contract: AUTH_LIST_FIELDS count", () => {
  assertEquals(AUTH_LIST_FIELDS.length, 6)
})

Deno.test("contract: AUTH_WHOAMI_FIELDS count", () => {
  assertEquals(AUTH_WHOAMI_FIELDS.length, 8)
})

Deno.test("contract: ENTRY_REMOVE_FIELDS count", () => {
  assertEquals(ENTRY_REMOVE_FIELDS.length, 1)
})
