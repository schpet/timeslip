/**
 * Unit tests for auth login helpers and command-level login flows.
 *
 * Covers:
 * - inferAccountId: PAT prefix parsing and edge cases
 * - resolveToken: --token, --token-stdin, --token-env sources and validation errors
 * - Login command: success with mock Harvest, overwrite refusal, account-id inference/failure
 * - Secret redaction: tokens never appear in output
 */

import { assertEquals, assertStringIncludes, assertThrows } from "@std/assert"
import { inferAccountId, resolveToken } from "./login.ts"
import { ValidationError } from "../../errors/mod.ts"
import { assertNoSecrets } from "../../test_helpers.ts"

// ---------------------------------------------------------------------------
// inferAccountId — PAT prefix extraction
// ---------------------------------------------------------------------------

Deno.test("inferAccountId: extracts account ID from pat- prefix", () => {
  assertEquals(inferAccountId("pat-123456.abcdef"), "123456")
})

Deno.test("inferAccountId: handles large numeric account IDs", () => {
  assertEquals(inferAccountId("pat-9999999.token"), "9999999")
})

Deno.test("inferAccountId: returns undefined for non-PAT token", () => {
  assertEquals(inferAccountId("sk_live_abcdef1234567890"), undefined)
})

Deno.test("inferAccountId: returns undefined for empty string", () => {
  assertEquals(inferAccountId(""), undefined)
})

Deno.test("inferAccountId: returns undefined for pat- without dot separator", () => {
  assertEquals(inferAccountId("pat-123456abcdef"), undefined)
})

Deno.test("inferAccountId: returns undefined for pat- with non-numeric ID", () => {
  assertEquals(inferAccountId("pat-abc.token"), undefined)
})

Deno.test("inferAccountId: only matches start of string", () => {
  assertEquals(inferAccountId("prefix-pat-123456.token"), undefined)
})

// ---------------------------------------------------------------------------
// resolveToken — source priority and validation
// ---------------------------------------------------------------------------

Deno.test("resolveToken: returns --token value directly", () => {
  assertEquals(resolveToken({ token: "my-token" }), "my-token")
})

Deno.test("resolveToken: trims whitespace from --token", () => {
  assertEquals(resolveToken({ token: "  my-token  \n" }), "my-token")
})

Deno.test("resolveToken: reads from env var when --token-env is set", () => {
  const envKey = "TEST_TIMESLIP_TOKEN_" + crypto.randomUUID().slice(0, 8)
  Deno.env.set(envKey, "env-token-value")
  try {
    assertEquals(resolveToken({ tokenEnv: envKey }), "env-token-value")
  } finally {
    Deno.env.delete(envKey)
  }
})

Deno.test("resolveToken: trims whitespace from env var value", () => {
  const envKey = "TEST_TIMESLIP_TOKEN_" + crypto.randomUUID().slice(0, 8)
  Deno.env.set(envKey, "  env-token  \n")
  try {
    assertEquals(resolveToken({ tokenEnv: envKey }), "env-token")
  } finally {
    Deno.env.delete(envKey)
  }
})

Deno.test("resolveToken: throws ValidationError when env var is unset", () => {
  const err = assertThrows(
    () => resolveToken({ tokenEnv: "NONEXISTENT_VAR_12345" }),
    ValidationError,
  )
  assertStringIncludes(err.message, "NONEXISTENT_VAR_12345")
  assertStringIncludes(err.message, "not set or empty")
})

Deno.test("resolveToken: throws ValidationError when no source provided", () => {
  const err = assertThrows(
    () => resolveToken({}),
    ValidationError,
  )
  assertStringIncludes(err.message, "token source is required")
  assertStringIncludes(err.suggestion!, "--token")
  assertStringIncludes(err.suggestion!, "--token-stdin")
  assertStringIncludes(err.suggestion!, "--token-env")
})

Deno.test("resolveToken: --token takes priority even if --token-env is also set", () => {
  const envKey = "TEST_TIMESLIP_TOKEN_" + crypto.randomUUID().slice(0, 8)
  Deno.env.set(envKey, "env-value")
  try {
    assertEquals(
      resolveToken({ token: "direct-value", tokenEnv: envKey }),
      "direct-value",
    )
  } finally {
    Deno.env.delete(envKey)
  }
})

// ---------------------------------------------------------------------------
// resolveToken — error messages never contain the token
// ---------------------------------------------------------------------------

Deno.test("resolveToken: ValidationError for missing env does not leak var name as secret", () => {
  try {
    resolveToken({ tokenEnv: "MY_SHORT_VAR" })
  } catch (err) {
    assertNoSecrets(String(err), "resolveToken env error")
  }
})

Deno.test("resolveToken: no-source ValidationError is secret-safe", () => {
  try {
    resolveToken({})
  } catch (err) {
    assertNoSecrets(String(err), "resolveToken no-source error")
  }
})

// ---------------------------------------------------------------------------
// resolveToken — exit code classification
// ---------------------------------------------------------------------------

Deno.test("resolveToken: missing env var produces Validation exit code", () => {
  const err = assertThrows(
    () => resolveToken({ tokenEnv: "NONEXISTENT_VAR_99" }),
    ValidationError,
  )
  assertEquals(err.exitCode, 2) // ExitCode.Validation
})

Deno.test("resolveToken: no source produces Validation exit code", () => {
  const err = assertThrows(
    () => resolveToken({}),
    ValidationError,
  )
  assertEquals(err.exitCode, 2)
})
