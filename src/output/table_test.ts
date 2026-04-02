import { assertEquals } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import {
  type Column,
  padDisplay,
  printConfirmation,
  printTable,
  renderTable,
  truncateText,
} from "./table.ts"
import { captureStdout } from "../test_helpers.ts"

// ---------------------------------------------------------------------------
// padDisplay
// ---------------------------------------------------------------------------

Deno.test("padDisplay pads ASCII string to target width", () => {
  assertEquals(padDisplay("abc", 6), "abc   ")
})

Deno.test("padDisplay returns original when already at target width", () => {
  assertEquals(padDisplay("abcdef", 6), "abcdef")
})

Deno.test("padDisplay returns original when exceeding target width", () => {
  assertEquals(padDisplay("abcdefgh", 6), "abcdefgh")
})

Deno.test("padDisplay handles empty string", () => {
  assertEquals(padDisplay("", 4), "    ")
})

// ---------------------------------------------------------------------------
// truncateText
// ---------------------------------------------------------------------------

Deno.test("truncateText returns original when within limit", () => {
  assertEquals(truncateText("hello", 10), "hello")
})

Deno.test("truncateText truncates with ellipsis when exceeding limit", () => {
  assertEquals(truncateText("hello world", 8), "hello...")
})

Deno.test("truncateText handles maxWidth less than 3", () => {
  assertEquals(truncateText("hello", 2), "he")
})

Deno.test("truncateText handles exact boundary", () => {
  assertEquals(truncateText("hello", 5), "hello")
})

Deno.test("truncateText handles maxWidth of 3", () => {
  assertEquals(truncateText("hello", 3), "...")
})

// ---------------------------------------------------------------------------
// renderTable
// ---------------------------------------------------------------------------

Deno.test("renderTable returns empty array for no rows", () => {
  const columns: Column[] = [{ header: "Name" }]
  assertEquals(renderTable(columns, []), [])
})

Deno.test("renderTable snapshot: basic two-column table", async (t) => {
  const columns: Column[] = [
    { header: "ID", minWidth: 4 },
    { header: "NAME" },
  ]
  const rows = [
    ["1", "Alpha"],
    ["2", "Bravo"],
    ["33", "Charlie"],
  ]
  const output = renderTable(columns, rows)
  await assertSnapshot(t, output)
})

Deno.test("renderTable snapshot: right-aligned numeric column", async (t) => {
  const columns: Column[] = [
    { header: "PROJECT" },
    { header: "HOURS", align: "right", minWidth: 6 },
  ]
  const rows = [
    ["Website", "1.5"],
    ["API", "12.25"],
    ["Docs", "0.5"],
  ]
  const output = renderTable(columns, rows)
  await assertSnapshot(t, output)
})

Deno.test("renderTable snapshot: column with maxWidth truncation", async (t) => {
  const columns: Column[] = [
    { header: "ID", minWidth: 3 },
    { header: "DESCRIPTION", maxWidth: 15 },
  ]
  const rows = [
    ["1", "Short note"],
    ["2", "This is a much longer description that should be truncated"],
  ]
  const output = renderTable(columns, rows)
  await assertSnapshot(t, output)
})

Deno.test("renderTable handles single-row single-column", () => {
  const columns: Column[] = [{ header: "VALUE" }]
  const rows = [["hello"]]
  const output = renderTable(columns, rows)
  assertEquals(output.length, 2) // header + 1 row
})

// ---------------------------------------------------------------------------
// printTable
// ---------------------------------------------------------------------------

Deno.test("printTable writes rendered lines to stdout", () => {
  const columns: Column[] = [{ header: "A" }, { header: "B" }]
  const rows = [["x", "y"]]
  const captured = captureStdout(() => printTable(columns, rows))
  // Should contain both header and data
  assertEquals(captured.includes("A"), true)
  assertEquals(captured.includes("x"), true)
})

Deno.test("printTable outputs nothing for empty rows", () => {
  const captured = captureStdout(() => printTable([{ header: "A" }], []))
  assertEquals(captured, "")
})

// ---------------------------------------------------------------------------
// printConfirmation
// ---------------------------------------------------------------------------

Deno.test("printConfirmation prints verb and entity", () => {
  const captured = captureStdout(() =>
    printConfirmation("Created", "entry #42")
  )
  assertEquals(captured.includes("Created"), true)
  assertEquals(captured.includes("entry #42"), true)
})

Deno.test("printConfirmation prints with optional detail", () => {
  const captured = captureStdout(() =>
    printConfirmation("Deleted", "entry #7", "(2.5h on 2024-01-15)")
  )
  assertEquals(captured.includes("Deleted"), true)
  assertEquals(captured.includes("entry #7"), true)
  assertEquals(captured.includes("(2.5h on 2024-01-15)"), true)
})
