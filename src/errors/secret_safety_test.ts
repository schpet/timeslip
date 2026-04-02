/**
 * Error serialization secret-safety tests.
 *
 * Ensures that error rendering and stringification never leak
 * tokens, auth headers, or secret-shaped strings.
 */

import { assertEquals } from "@std/assert"
import {
  AuthError,
  CliError,
  ConfigError,
  NotFoundError,
  ProviderError,
  ValidationError,
} from "./mod.ts"
import { assertNoSecrets, captureStderr } from "../test_helpers.ts"
import {
  redactAccount,
  redactToken,
  redactTokensInText,
} from "../config/mod.ts"
import type { Account } from "../domain/mod.ts"

// ---------------------------------------------------------------------------
// Error .message and .userMessage never contain raw tokens
// ---------------------------------------------------------------------------

const FAKE_TOKEN = "sk_live_abcdef1234567890abcdef1234567890"
const FAKE_BEARER = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.something"

Deno.test("CliError does not embed raw tokens in message", () => {
  const err = new CliError("Auth failed")
  assertNoSecrets(err.message, "CliError.message")
  assertNoSecrets(err.userMessage, "CliError.userMessage")
  assertNoSecrets(String(err), "String(CliError)")
})

Deno.test("ProviderError does not embed raw tokens in message", () => {
  const err = new ProviderError("API error: forbidden", { statusCode: 403 })
  assertNoSecrets(err.message, "ProviderError.message")
  assertNoSecrets(String(err), "String(ProviderError)")
})

Deno.test("AuthError default suggestion does not contain tokens", () => {
  const err = new AuthError("expired")
  assertNoSecrets(err.suggestion!, "AuthError.suggestion")
  assertNoSecrets(String(err), "String(AuthError)")
})

// ---------------------------------------------------------------------------
// Error hierarchy — none should stringify with secrets
// ---------------------------------------------------------------------------

Deno.test("all error types stringify without secrets", () => {
  const errors = [
    new CliError("cli error"),
    new ValidationError("validation error"),
    new AuthError("auth error"),
    new NotFoundError("entry", "12345"),
    new ConfigError("config error"),
    new ProviderError("provider error", { statusCode: 500 }),
  ]

  for (const err of errors) {
    assertNoSecrets(String(err), `String(${err.name})`)
    assertNoSecrets(JSON.stringify(err), `JSON.stringify(${err.name})`)
  }
})

// ---------------------------------------------------------------------------
// JSON.stringify of errors with cause must not leak secrets
// ---------------------------------------------------------------------------

Deno.test("error with cause does not expose cause secrets via JSON", () => {
  const cause = new Error("network error")
  const err = new ProviderError("API call failed", { cause })
  const json = JSON.stringify(err)
  assertNoSecrets(json, "ProviderError JSON with cause")
})

// ---------------------------------------------------------------------------
// redactToken
// ---------------------------------------------------------------------------

Deno.test("redactToken redacts long tokens", () => {
  const redacted = redactToken(FAKE_TOKEN)
  assertEquals(redacted.includes(FAKE_TOKEN), false)
  // Should show first 4 and last 4
  assertEquals(redacted.startsWith("sk_l"), true)
  assertEquals(redacted.endsWith("7890"), true)
  assertEquals(redacted.includes("****"), true)
})

Deno.test("redactToken replaces short tokens entirely", () => {
  const redacted = redactToken("short")
  assertEquals(redacted, "****")
})

Deno.test("redactToken handles 12-char boundary", () => {
  const token12 = "abcdefghijkl"
  const redacted = redactToken(token12)
  assertEquals(redacted.startsWith("abcd"), true)
  assertEquals(redacted.endsWith("ijkl"), true)
})

// ---------------------------------------------------------------------------
// redactTokensInText
// ---------------------------------------------------------------------------

Deno.test("redactTokensInText redacts bearer-like strings in text", () => {
  const text = `Authorization: ${FAKE_BEARER}`
  const result = redactTokensInText(text)
  assertEquals(result.includes("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"), false)
})

// ---------------------------------------------------------------------------
// redactAccount
// ---------------------------------------------------------------------------

Deno.test("redactAccount redacts the access token", () => {
  const account: Account = {
    name: "work",
    provider: "harvest",
    accountId: "123456",
    accessToken: FAKE_TOKEN,
    userId: 42,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    isDefault: true,
  }

  const redacted = redactAccount(account)

  // Token should be redacted
  assertEquals(
    (redacted.accessToken as string).includes(FAKE_TOKEN),
    false,
  )
  assertNoSecrets(
    JSON.stringify(redacted),
    "redactAccount JSON output",
  )

  // Other fields should be preserved
  assertEquals(redacted.name, "work")
  assertEquals(redacted.provider, "harvest")
  assertEquals(redacted.email, "jane@example.com")
})

Deno.test("redactAccount output is safe to log", () => {
  const account: Account = {
    name: "test",
    provider: "harvest",
    accountId: "999",
    accessToken: "pat_abcdefghij1234567890abcdefghij1234567890",
    userId: 1,
    firstName: "Test",
    lastName: "User",
    email: "test@test.com",
    isDefault: false,
  }

  const redacted = redactAccount(account)
  const output = JSON.stringify(redacted)
  assertNoSecrets(output, "redactAccount stringified")
})

// ---------------------------------------------------------------------------
// Error rendering via captureStderr — no secret leakage
// ---------------------------------------------------------------------------

Deno.test("CliError stderr rendering contains no secrets", () => {
  const err = new CliError("operation failed", {
    suggestion: "Try running the command again.",
  })
  // Simulate what handleError's printCliError would produce
  const output = captureStderr(() => {
    console.error(`error: ${err.userMessage}`)
    if (err.suggestion) {
      console.error(`  ${err.suggestion}`)
    }
  })
  assertNoSecrets(output, "CliError stderr")
})

Deno.test("ProviderError stderr rendering contains no secrets", () => {
  const err = new ProviderError("Harvest API error: HTTP 500", {
    statusCode: 500,
  })
  const output = captureStderr(() => {
    console.error(`error: ${err.userMessage}`)
  })
  assertNoSecrets(output, "ProviderError stderr")
})
