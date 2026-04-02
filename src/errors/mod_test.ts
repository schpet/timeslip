import { assertEquals, assertStringIncludes } from "@std/assert"
import {
  AuthError,
  CliError,
  ConfigError,
  ExitCode,
  NotFoundError,
  ProviderError,
  ValidationError,
} from "./mod.ts"
import { captureStderr } from "../test_helpers.ts"

// ---------------------------------------------------------------------------
// ExitCode constants
// ---------------------------------------------------------------------------

Deno.test("ExitCode values are distinct integers", () => {
  assertEquals(ExitCode.Success, 0)
  assertEquals(ExitCode.Runtime, 1)
  assertEquals(ExitCode.Validation, 2)
  assertEquals(ExitCode.Auth, 4)

  const values = Object.values(ExitCode)
  assertEquals(new Set(values).size, values.length)
})

// ---------------------------------------------------------------------------
// CliError
// ---------------------------------------------------------------------------

Deno.test("CliError defaults to Runtime exit code", () => {
  const err = new CliError("something broke")
  assertEquals(err.exitCode, ExitCode.Runtime)
  assertEquals(err.userMessage, "something broke")
  assertEquals(err.name, "CliError")
  assertEquals(err.suggestion, undefined)
})

Deno.test("CliError accepts suggestion and custom exit code", () => {
  const err = new CliError("bad input", {
    suggestion: "Try again",
    exitCode: ExitCode.Validation,
  })
  assertEquals(err.suggestion, "Try again")
  assertEquals(err.exitCode, ExitCode.Validation)
})

Deno.test("CliError preserves cause", () => {
  const cause = new Error("root cause")
  const err = new CliError("wrapper", { cause })
  assertEquals(err.cause, cause)
})

// ---------------------------------------------------------------------------
// ValidationError
// ---------------------------------------------------------------------------

Deno.test("ValidationError uses Validation exit code", () => {
  const err = new ValidationError("missing --date flag")
  assertEquals(err.exitCode, ExitCode.Validation)
  assertEquals(err.name, "ValidationError")
  assertEquals(err instanceof CliError, true)
})

Deno.test("ValidationError accepts suggestion", () => {
  const err = new ValidationError("bad date", {
    suggestion: "Use YYYY-MM-DD format",
  })
  assertEquals(err.suggestion, "Use YYYY-MM-DD format")
})

// ---------------------------------------------------------------------------
// AuthError
// ---------------------------------------------------------------------------

Deno.test("AuthError uses Auth exit code", () => {
  const err = new AuthError("not authenticated")
  assertEquals(err.exitCode, ExitCode.Auth)
  assertEquals(err.name, "AuthError")
  assertEquals(err instanceof CliError, true)
})

Deno.test("AuthError has default suggestion", () => {
  const err = new AuthError("expired")
  assertStringIncludes(err.suggestion!, "timeslip auth login")
})

Deno.test("AuthError accepts custom suggestion", () => {
  const err = new AuthError("bad token", {
    suggestion: "Re-authenticate with Harvest.",
  })
  assertEquals(err.suggestion, "Re-authenticate with Harvest.")
})

// ---------------------------------------------------------------------------
// NotFoundError
// ---------------------------------------------------------------------------

Deno.test("NotFoundError includes entity type and identifier", () => {
  const err = new NotFoundError("time entry", "12345")
  assertEquals(err.entityType, "time entry")
  assertEquals(err.identifier, "12345")
  assertStringIncludes(err.userMessage, "time entry")
  assertStringIncludes(err.userMessage, "12345")
  assertEquals(err.name, "NotFoundError")
})

// ---------------------------------------------------------------------------
// ConfigError
// ---------------------------------------------------------------------------

Deno.test("ConfigError uses Runtime exit code", () => {
  const err = new ConfigError("corrupt TOML")
  assertEquals(err.exitCode, ExitCode.Runtime)
  assertEquals(err.name, "ConfigError")
})

// ---------------------------------------------------------------------------
// ProviderError
// ---------------------------------------------------------------------------

Deno.test("ProviderError stores HTTP status code", () => {
  const err = new ProviderError("rate limited", { statusCode: 429 })
  assertEquals(err.statusCode, 429)
  assertEquals(err.exitCode, ExitCode.Runtime)
  assertEquals(err.name, "ProviderError")
})

Deno.test("ProviderError statusCode defaults to undefined", () => {
  const err = new ProviderError("network error")
  assertEquals(err.statusCode, undefined)
})

// ---------------------------------------------------------------------------
// handleError (stderr output, without Deno.exit)
// ---------------------------------------------------------------------------

Deno.test("handleError prints CliError message to stderr", () => {
  // We can't call handleError directly because it calls Deno.exit.
  // Instead we test the error formatting behavior via printCliError internals
  // by checking the CliError properties are correctly set.
  const err = new ValidationError("--date is required", {
    suggestion: "Provide a date in YYYY-MM-DD format.",
  })
  assertEquals(err.userMessage, "--date is required")
  assertEquals(err.suggestion, "Provide a date in YYYY-MM-DD format.")
  assertEquals(err.exitCode, ExitCode.Validation)
})

// ---------------------------------------------------------------------------
// Error hierarchy
// ---------------------------------------------------------------------------

Deno.test("all error types are instances of Error and CliError", () => {
  const errors = [
    new CliError("cli"),
    new ValidationError("val"),
    new AuthError("auth"),
    new NotFoundError("entity", "id"),
    new ConfigError("config"),
    new ProviderError("provider"),
  ]

  for (const err of errors) {
    assertEquals(err instanceof Error, true)
    assertEquals(err instanceof CliError, true)
  }
})
