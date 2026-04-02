/**
 * E2E test harness tests — validates the test infrastructure itself,
 * including the CLI runner, secret-scanning assertions, and logging safety.
 *
 * These tests ensure the shared e2e tooling is correct and that
 * secret-redaction scanning catches token-shaped leaks in all output
 * channels (stdout, stderr, debug logs).
 */

import { assertEquals, assertThrows } from "@std/assert"
import { assertNoSecrets, runCli } from "./test_helpers.ts"

// ---------------------------------------------------------------------------
// assertNoSecrets — detection of token-shaped strings
// ---------------------------------------------------------------------------

Deno.test("assertNoSecrets passes for clean text", () => {
  assertNoSecrets("Hello world, this is normal text.", "clean text")
  assertNoSecrets("Error: something went wrong", "error message")
  assertNoSecrets("timeslip v0.1.0", "version string")
})

Deno.test("assertNoSecrets catches hex-like tokens (20+ chars)", () => {
  assertThrows(
    () => assertNoSecrets("token: abcdef1234567890abcdef", "hex token"),
    Error,
    "Secret-looking string",
  )
})

Deno.test("assertNoSecrets catches Bearer tokens", () => {
  assertThrows(
    () =>
      assertNoSecrets(
        "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.payload",
        "bearer",
      ),
    Error,
    "Secret-looking string",
  )
})

Deno.test("assertNoSecrets catches common token prefixes", () => {
  const prefixed = [
    "sk_live_abcdef1234",
    "pk_test_abcdef1234",
    "pat_abcdefghij1234",
    "ghp_abcdef1234ghij",
  ]
  for (const token of prefixed) {
    assertThrows(
      () => assertNoSecrets(`token=${token}`, token),
      Error,
      "Secret-looking string",
    )
  }
})

// ---------------------------------------------------------------------------
// runCli harness — basic invocation
// ---------------------------------------------------------------------------

Deno.test("runCli uses isolated temp config dir by default", async () => {
  const result = await runCli(["--version"])
  assertEquals(result.code, 0)
  // Should output version, no config errors
  assertEquals(result.stderr, "")
})

Deno.test("runCli respects custom env variables", async () => {
  const result = await runCli([], { env: { NO_COLOR: "1" } })
  assertEquals(result.code, 0)
})

Deno.test("runCli captures separate stdout and stderr", async () => {
  const result = await runCli(["--version"])
  // stdout has version, stderr is empty for successful invocation
  assertEquals(result.stdout.trim().length > 0, true)
  assertEquals(result.stderr, "")
})

// ---------------------------------------------------------------------------
// E2E secret safety across all subcommand help pages
// ---------------------------------------------------------------------------

const SUBCOMMANDS = ["auth", "entry", "project", "client"]

for (const sub of SUBCOMMANDS) {
  Deno.test(`e2e: no secrets in '${sub} --help' output`, async () => {
    const result = await runCli([sub, "--help"])
    assertNoSecrets(result.stdout, `${sub} --help stdout`)
    assertNoSecrets(result.stderr, `${sub} --help stderr`)
  })
}

// ---------------------------------------------------------------------------
// E2E: debug mode does not leak secrets with no account configured
// ---------------------------------------------------------------------------

Deno.test("e2e: TIMESLIP_DEBUG=1 does not leak secrets on help", async () => {
  const result = await runCli(["--help"], {
    env: { TIMESLIP_DEBUG: "1" },
  })
  assertNoSecrets(result.stdout, "debug stdout")
  assertNoSecrets(result.stderr, "debug stderr")
})

// ---------------------------------------------------------------------------
// E2E: all output from error paths is secret-safe
// ---------------------------------------------------------------------------

Deno.test("e2e: invalid subcommand error output is secret-safe", async () => {
  const result = await runCli(["nonexistent-command"])
  assertNoSecrets(result.stdout, "invalid cmd stdout")
  assertNoSecrets(result.stderr, "invalid cmd stderr")
})

// ---------------------------------------------------------------------------
// E2E: config written externally is readable by CLI process
// ---------------------------------------------------------------------------

Deno.test("e2e: CLI reads config written by a prior invocation without error", async () => {
  const { join } = await import("@std/path")
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_" })
  // runCli sets XDG_CONFIG_HOME=xdgBase, and resolveConfigDir appends "timeslip"
  const appConfigDir = join(xdgBase, "timeslip")
  try {
    const { saveConfig } = await import("./config/mod.ts")
    // Simulate a previous session writing config
    await saveConfig(
      [
        {
          name: "e2e-test",
          provider: "harvest",
          accountId: "999",
          accessToken: "tok_e2eTestToken1234567890abcdefghij",
          userId: 1,
          firstName: "E2E",
          lastName: "Test",
          email: "e2e@test.com",
          isDefault: true,
        },
      ],
      "e2e-test",
      appConfigDir,
    )

    // A second CLI process should be able to start without config errors
    const result = await runCli(["--help"], { configDir: xdgBase })
    assertEquals(result.code, 0)
    assertNoSecrets(result.stdout, "e2e config stdout")
    assertNoSecrets(result.stderr, "e2e config stderr")
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

// ---------------------------------------------------------------------------
// E2E: codegen task wiring check
// ---------------------------------------------------------------------------

Deno.test("e2e: codegen task is defined in deno.json", async () => {
  const denoJson = JSON.parse(
    await Deno.readTextFile(
      new URL("../deno.json", import.meta.url).pathname,
    ),
  )
  assertEquals(
    typeof denoJson.tasks?.codegen,
    "string",
    "deno.json must define a codegen task",
  )
  assertEquals(
    denoJson.tasks.codegen.includes("codegen"),
    true,
    "codegen task should reference the codegen script",
  )
})
