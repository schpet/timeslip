import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"

const MAIN_PATH = new URL("../../main.ts", import.meta.url).pathname
const SCHEMA_PATH = new URL(
  "../../../schemas/harvest-openapi.yaml",
  import.meta.url,
)

async function runCliRaw(
  args: string[],
  options?: {
    cwd?: string
    env?: Record<string, string>
    configDir?: string
  },
): Promise<{
  code: number
  stdout: Uint8Array
  stderr: Uint8Array
}> {
  const configDir = options?.configDir ?? await Deno.makeTempDir()
  const env: Record<string, string> = {
    ...options?.env,
    XDG_CONFIG_HOME: configDir,
    NO_COLOR: "1",
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      "--quiet",
      MAIN_PATH,
      ...args,
    ],
    cwd: options?.cwd,
    env,
    stdout: "piped",
    stderr: "piped",
  })

  const output = await cmd.output()
  return {
    code: output.code,
    stdout: output.stdout,
    stderr: output.stderr,
  }
}

Deno.test("harvest --help: exits 0 with subcommand list", async () => {
  const result = await runCli(["harvest", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "api")
  assertStringIncludes(result.stdout, "schema")
  assertEquals(result.stderr, "")
  assertNoSecrets(result.stdout, "harvest --help stdout")
  assertNoSecrets(result.stderr, "harvest --help stderr")
})

Deno.test("harvest --help: snapshot", async (t) => {
  const result = await runCli(["harvest", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("harvest api --help: includes scoping warning and examples", async () => {
  const result = await runCli(["harvest", "api", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(
    result.stdout,
    "Harvest credentials are scoped to a specific account, not to the",
  )
  assertStringIncludes(
    result.stdout,
    "Every data-access endpoint returns account-wide results unless",
  )
  assertStringIncludes(result.stdout, "timeslip harvest api /users/me")
  assertStringIncludes(
    result.stdout,
    "timeslip harvest api /time_entries -F user_id=@me -F from=2026-03-17",
  )
  assertStringIncludes(
    result.stdout,
    "timeslip harvest api /time_entries -F user_id=@me -F is_running=true",
  )
  assertStringIncludes(
    result.stdout,
    "timeslip harvest api /projects --paginate",
  )
  assertStringIncludes(
    result.stdout,
    "timeslip harvest schema | rg '/time_entries'",
  )
  assertEquals(result.stderr, "")
  assertNoSecrets(result.stdout, "harvest api --help stdout")
  assertNoSecrets(result.stderr, "harvest api --help stderr")
})

Deno.test("harvest api --help: snapshot", async (t) => {
  const result = await runCli(["harvest", "api", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("harvest schema --help: describes verbatim offline dump", async () => {
  const result = await runCli(["harvest", "schema", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "local operation")
  assertStringIncludes(result.stdout, "no network calls are made")
  assertStringIncludes(result.stdout, "unmodified YAML exactly as bundled")
  assertEquals(result.stderr, "")
  assertNoSecrets(result.stdout, "harvest schema --help stdout")
  assertNoSecrets(result.stderr, "harvest schema --help stderr")
})

Deno.test("harvest schema --help: snapshot", async (t) => {
  const result = await runCli(["harvest", "schema", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("harvest schema: outputs bundled schema bytes exactly", async () => {
  const result = await runCliRaw(["harvest", "schema"])
  const expected = await Deno.readFile(SCHEMA_PATH)
  const stderr = new TextDecoder().decode(result.stderr)

  assertEquals(result.code, 0)
  assertEquals(result.stdout, expected)
  assertEquals(stderr, "")
})

Deno.test("harvest schema: resolves bundled schema from a different cwd", async () => {
  const cwd = await Deno.makeTempDir({ prefix: "timeslip_schema_cwd_" })
  try {
    const result = await runCliRaw(["harvest", "schema"], { cwd })
    const expected = await Deno.readFile(SCHEMA_PATH)
    const stderr = new TextDecoder().decode(result.stderr)

    assertEquals(result.code, 0)
    assertEquals(result.stdout, expected)
    assertEquals(stderr, "")
  } finally {
    await Deno.remove(cwd, { recursive: true }).catch(() => {})
  }
})
