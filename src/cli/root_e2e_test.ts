import { assertEquals, assertMatch, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../test_helpers.ts"

// ---------------------------------------------------------------------------
// E2E: zero-argument invocation
// ---------------------------------------------------------------------------

Deno.test("e2e: zero-argument invocation prints root help", async () => {
  const result = await runCli([])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "timeslip")
  assertStringIncludes(result.stdout, "USAGE")
  assertStringIncludes(result.stdout, "AUTH")
  assertStringIncludes(result.stdout, "TIME ENTRIES")
  assertStringIncludes(result.stdout, "DISCOVERY")
  assertStringIncludes(result.stdout, "HARVEST LOW-LEVEL")
  assertStringIncludes(result.stdout, "GLOBAL FLAGS")
})

Deno.test("e2e: zero-argument output snapshot", async (t) => {
  const result = await runCli([])
  await assertSnapshot(t, result.stdout)
})

// ---------------------------------------------------------------------------
// E2E: --help flag
// ---------------------------------------------------------------------------

Deno.test("e2e: --help prints help and exits 0", async () => {
  const result = await runCli(["--help"])
  assertEquals(result.code, 0)
  // Cliffy's built-in help includes the description
  assertStringIncludes(result.stdout, "Harvest time tracking")
})

Deno.test("e2e: --help output snapshot", async (t) => {
  const result = await runCli(["--help"])
  await assertSnapshot(t, result.stdout)
})

// ---------------------------------------------------------------------------
// E2E: --version flag
// ---------------------------------------------------------------------------

Deno.test("e2e: --version prints version and exits 0", async () => {
  const result = await runCli(["--version"])
  assertEquals(result.code, 0)
  assertMatch(result.stdout.trim(), /^timeslip \d+\.\d+\.\d+$/)
})

// ---------------------------------------------------------------------------
// E2E: invalid flag → validation error exit code
// ---------------------------------------------------------------------------

Deno.test("e2e: unknown flag exits with non-zero code", async () => {
  const result = await runCli(["--not-a-real-flag"])
  assertEquals(
    result.code !== 0,
    true,
    `Expected non-zero exit, got ${result.code}`,
  )
  // Stderr should contain an error message
  assertEquals(
    result.stderr.length > 0,
    true,
    "Expected stderr output for invalid flag",
  )
})

// ---------------------------------------------------------------------------
// E2E: JSON mode on root (no command) should still work
// ---------------------------------------------------------------------------

Deno.test("e2e: --json with no command prints help (not JSON)", async () => {
  // Root action prints help regardless of --json flag — it's the discovery entry point
  const result = await runCli(["--json"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "timeslip")
})

// ---------------------------------------------------------------------------
// E2E: secret safety — no tokens in any output
// ---------------------------------------------------------------------------

Deno.test("e2e: no secrets in zero-argument stdout", async () => {
  const result = await runCli([])
  assertNoSecrets(result.stdout, "stdout")
  assertNoSecrets(result.stderr, "stderr")
})

Deno.test("e2e: no secrets in --help stdout", async () => {
  const result = await runCli(["--help"])
  assertNoSecrets(result.stdout, "stdout")
  assertNoSecrets(result.stderr, "stderr")
})

// ---------------------------------------------------------------------------
// E2E: subcommand help
// ---------------------------------------------------------------------------

Deno.test("e2e: auth --help exits 0", async () => {
  const result = await runCli(["auth", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "auth")
})

Deno.test("e2e: entry --help exits 0", async () => {
  const result = await runCli(["entry", "--help"])
  assertEquals(result.code, 0)
})

Deno.test("e2e: project --help exits 0", async () => {
  const result = await runCli(["project", "--help"])
  assertEquals(result.code, 0)
})

Deno.test("e2e: client --help exits 0", async () => {
  const result = await runCli(["client", "--help"])
  assertEquals(result.code, 0)
})

Deno.test("e2e: harvest --help exits 0", async () => {
  const result = await runCli(["harvest", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "harvest")
})

Deno.test("e2e: harvest api --help exits 0", async () => {
  const result = await runCli(["harvest", "api", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "harvest")
})

Deno.test("e2e: harvest schema --help exits 0", async () => {
  const result = await runCli(["harvest", "schema", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "harvest")
})

// ---------------------------------------------------------------------------
// E2E logging: verify no debug noise on normal invocations
// ---------------------------------------------------------------------------

Deno.test("e2e: no debug noise on stderr without TIMESLIP_DEBUG", async () => {
  const result = await runCli([])
  // stderr should be empty for a successful invocation without debug mode
  assertEquals(
    result.stderr,
    "",
    "Expected no stderr output without TIMESLIP_DEBUG",
  )
})
