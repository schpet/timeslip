/**
 * Tests for version.ts — VERSION constant and USER_AGENT helper.
 */

import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert"
import { USER_AGENT, VERSION } from "./version.ts"

// ---------------------------------------------------------------------------
// VERSION
// ---------------------------------------------------------------------------

Deno.test("VERSION is a valid semver string", () => {
  assertMatch(VERSION, /^\d+\.\d+\.\d+$/)
})

Deno.test("VERSION matches deno.json version", async () => {
  const denoJson = JSON.parse(
    await Deno.readTextFile(
      new URL("../deno.json", import.meta.url).pathname,
    ),
  )
  assertEquals(VERSION, denoJson.version)
})

// ---------------------------------------------------------------------------
// USER_AGENT
// ---------------------------------------------------------------------------

Deno.test("USER_AGENT starts with timeslip/", () => {
  assertStringIncludes(USER_AGENT, "timeslip/")
})

Deno.test("USER_AGENT contains the current version", () => {
  assertEquals(USER_AGENT, `timeslip/${VERSION}`)
})

Deno.test("USER_AGENT is suitable for HTTP headers", () => {
  // No newlines, no control chars
  assertEquals(/[\r\n]/.test(USER_AGENT), false)
  // Reasonable length
  assertEquals(USER_AGENT.length > 0, true)
  assertEquals(USER_AGENT.length < 100, true)
})
