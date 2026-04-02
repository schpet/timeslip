import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { buildRootHelp, printRootHelp } from "./root.ts"
import { captureStdout } from "../test_helpers.ts"

// ---------------------------------------------------------------------------
// buildRootHelp — structure and content
// ---------------------------------------------------------------------------

Deno.test("buildRootHelp returns non-empty array of strings", () => {
  const lines = buildRootHelp()
  assertEquals(Array.isArray(lines), true)
  assertEquals(lines.length > 0, true)
  for (const line of lines) {
    assertEquals(typeof line, "string")
  }
})

Deno.test("buildRootHelp snapshot", async (t) => {
  const lines = buildRootHelp()
  await assertSnapshot(t, lines)
})

Deno.test("buildRootHelp includes version string", () => {
  const text = buildRootHelp().join("\n")
  // Should contain a version like "v0.1.0"
  assertEquals(/v\d+\.\d+\.\d+/.test(text), true)
})

Deno.test("buildRootHelp includes all command groups", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "AUTH")
  assertStringIncludes(text, "TIME ENTRIES")
  assertStringIncludes(text, "DISCOVERY")
  assertStringIncludes(text, "HARVEST LOW-LEVEL")
  assertStringIncludes(text, "GLOBAL FLAGS")
  assertStringIncludes(text, "ENVIRONMENT")
})

Deno.test("buildRootHelp includes all auth subcommands", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "auth login")
  assertStringIncludes(text, "auth logout")
  assertStringIncludes(text, "auth list")
  assertStringIncludes(text, "auth default")
  assertStringIncludes(text, "auth whoami")
})

Deno.test("buildRootHelp includes all entry subcommands", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "entry add")
  assertStringIncludes(text, "entry update")
  assertStringIncludes(text, "entry remove")
  assertStringIncludes(text, "entry list")
})

Deno.test("buildRootHelp includes discovery subcommands", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "project list")
  assertStringIncludes(text, "client list")
})

Deno.test("buildRootHelp includes harvest low-level commands", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "harvest api")
  assertStringIncludes(text, "harvest schema")
})

Deno.test("buildRootHelp includes global flags", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "--account")
  assertStringIncludes(text, "--json")
  assertStringIncludes(text, "--help")
  assertStringIncludes(text, "--version")
})

Deno.test("buildRootHelp includes environment variables", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "TIMESLIP_ACCOUNT")
  assertStringIncludes(text, "TIMESLIP_DEBUG")
})

Deno.test("buildRootHelp includes usage line", () => {
  const text = buildRootHelp().join("\n")
  assertStringIncludes(text, "USAGE")
  assertStringIncludes(text, "timeslip")
})

// ---------------------------------------------------------------------------
// printRootHelp — prints to stdout
// ---------------------------------------------------------------------------

Deno.test("printRootHelp writes all lines to stdout", () => {
  const captured = captureStdout(() => printRootHelp())
  const expected = buildRootHelp()
  for (const line of expected) {
    // Lines may contain ANSI codes in real usage, but with NO_COLOR they match
    assertStringIncludes(captured, line)
  }
})

// ---------------------------------------------------------------------------
// No secrets in help output
// ---------------------------------------------------------------------------

Deno.test("buildRootHelp contains no token-shaped strings", () => {
  const text = buildRootHelp().join("\n")
  // No hex strings 20+ chars
  assertEquals(/\b[0-9a-f]{20,}\b/i.test(text), false)
  // No bearer tokens
  assertEquals(/Bearer\s+\S+/.test(text), false)
})
