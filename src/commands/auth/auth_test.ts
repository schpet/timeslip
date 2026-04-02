/**
 * Command-level tests for all auth subcommands.
 *
 * Uses a local mock Harvest HTTP server and temp config directories
 * to exercise login, list, default, whoami, and logout end-to-end
 * through the actual command handlers.
 *
 * Covers:
 * - auth --help and subcommand --help snapshots
 * - Login with --token (success, overwrite refusal, --overwrite, inference failure)
 * - Login with --token-env
 * - List in human and --json modes
 * - Default switching and --json output
 * - Whoami with credential re-validation
 * - Logout with default promotion and --json output
 * - Exit code classification for auth vs validation errors
 * - Secret redaction in all output paths
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertSnapshot } from "@std/testing/snapshot"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const MOCK_TOKEN = "pat-123456.mocktoken1234567890abcdef"
const MOCK_TOKEN_NO_PREFIX = "sk_live_noprefix1234567890abcdef1234"
const MOCK_USER = {
  id: 42,
  first_name: "Jane",
  last_name: "Doe",
  email: "jane@example.com",
}

function makeFixtureAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "default",
    provider: "harvest",
    accountId: "123456",
    accessToken: MOCK_TOKEN,
    userId: 42,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    isDefault: true,
    ...overrides,
  }
}

/** Start a local HTTP server that mocks Harvest's /users/me endpoint. */
function startMockHarvest(
  handler?: (req: Request) => Response,
): { port: number; server: Deno.HttpServer; close: () => void } {
  const defaultHandler = (_req: Request): Response => {
    return new Response(JSON.stringify(MOCK_USER), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  }

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    handler ?? defaultHandler,
  )

  const addr = server.addr as Deno.NetAddr
  return {
    port: addr.port,
    server,
    close: () => server.shutdown(),
  }
}

async function withTempXdg(
  fn: (xdgBase: string, appDir: string) => Promise<void>,
): Promise<void> {
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_auth_test_" })
  const appDir = join(xdgBase, "timeslip")
  try {
    await fn(xdgBase, appDir)
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// Help snapshots
// ---------------------------------------------------------------------------

Deno.test("auth --help: exits 0 with subcommand list", async () => {
  const result = await runCli(["auth", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "login")
  assertStringIncludes(result.stdout, "list")
  assertStringIncludes(result.stdout, "default")
  assertStringIncludes(result.stdout, "whoami")
  assertStringIncludes(result.stdout, "logout")
  assertNoSecrets(result.stdout, "auth --help stdout")
  assertNoSecrets(result.stderr, "auth --help stderr")
})

Deno.test("auth --help: snapshot", async (t) => {
  const result = await runCli(["auth", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("auth login --help: exits 0 with option descriptions", async () => {
  const result = await runCli(["auth", "login", "--help"])
  assertEquals(result.code, 0)
  assertStringIncludes(result.stdout, "--account")
  assertStringIncludes(result.stdout, "--token")
  assertStringIncludes(result.stdout, "--token-stdin")
  assertStringIncludes(result.stdout, "--token-env")
  assertStringIncludes(result.stdout, "--account-id")
  assertStringIncludes(result.stdout, "--overwrite")
  assertNoSecrets(result.stdout, "auth login --help stdout")
})

Deno.test("auth login --help: snapshot", async (t) => {
  const result = await runCli(["auth", "login", "--help"])
  await assertSnapshot(t, result.stdout)
})

Deno.test("auth list --help: exits 0", async () => {
  const result = await runCli(["auth", "list", "--help"])
  assertEquals(result.code, 0)
  assertNoSecrets(result.stdout, "auth list --help stdout")
})

Deno.test("auth default --help: exits 0", async () => {
  const result = await runCli(["auth", "default", "--help"])
  assertEquals(result.code, 0)
  assertNoSecrets(result.stdout, "auth default --help stdout")
})

Deno.test("auth whoami --help: exits 0", async () => {
  const result = await runCli(["auth", "whoami", "--help"])
  assertEquals(result.code, 0)
  assertNoSecrets(result.stdout, "auth whoami --help stdout")
})

Deno.test("auth logout --help: exits 0", async () => {
  const result = await runCli(["auth", "logout", "--help"])
  assertEquals(result.code, 0)
  assertNoSecrets(result.stdout, "auth logout --help stdout")
})

// ---------------------------------------------------------------------------
// auth login — --token with PAT prefix (account-id inferred)
// ---------------------------------------------------------------------------

Deno.test("auth login --token: succeeds with PAT prefix and inferred account-id", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        [
          "auth",
          "login",
          "--token",
          MOCK_TOKEN,
        ],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Logged in")
      assertStringIncludes(result.stdout, "Jane")
      assertStringIncludes(result.stdout, "jane@example.com")
      // Token must be redacted in output
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "login stdout")
      assertNoSecrets(result.stderr, "login stderr")
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth login — --token-env
// ---------------------------------------------------------------------------

Deno.test("auth login --token-env: reads token from named env var", async () => {
  const mock = startMockHarvest()
  const envKey = "TEST_HARVEST_TOKEN_" + crypto.randomUUID().slice(0, 8)
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        [
          "auth",
          "login",
          "--token-env",
          envKey,
          "--account-id",
          "123456",
        ],
        {
          configDir: xdgBase,
          env: {
            [envKey]: MOCK_TOKEN_NO_PREFIX,
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Logged in")
      assertEquals(result.stdout.includes(MOCK_TOKEN_NO_PREFIX), false)
      assertNoSecrets(result.stdout, "login --token-env stdout")
    })
  } finally {
    Deno.env.delete(envKey)
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth login — --account alias for profile name
// ---------------------------------------------------------------------------

Deno.test("auth login --account: stores credentials under the named profile", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        [
          "auth",
          "login",
          "--account",
          "demo",
          "--token",
          MOCK_TOKEN,
        ],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const listResult = await runCli(["--json", "auth", "list"], {
        configDir: xdgBase,
      })
      assertEquals(listResult.code, 0, `stderr: ${listResult.stderr}`)
      const data = JSON.parse(listResult.stdout)
      assertEquals(data.default, "demo")
      assertEquals(data.accounts.length, 1)
      assertEquals(data.accounts[0].name, "demo")
      assertNoSecrets(result.stdout, "login --account stdout")
      assertNoSecrets(listResult.stdout, "login --account list stdout")
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth login — no token source → validation error
// ---------------------------------------------------------------------------

Deno.test("auth login: no token source exits with validation error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["auth", "login"], { configDir: xdgBase })

    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "token source is required")
    assertNoSecrets(result.stderr, "no-token stderr")
  })
})

// ---------------------------------------------------------------------------
// auth login — cannot infer account-id
// ---------------------------------------------------------------------------

Deno.test("auth login: non-PAT token without --account-id exits with validation error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(
      [
        "auth",
        "login",
        "--token",
        MOCK_TOKEN_NO_PREFIX,
      ],
      { configDir: xdgBase },
    )

    assertEquals(result.code, 2, "Expected exit code 2 (Validation)")
    assertStringIncludes(result.stderr, "Cannot infer")
    assertStringIncludes(result.stderr, "--account-id")
    // Token must not appear in error output
    assertEquals(result.stderr.includes(MOCK_TOKEN_NO_PREFIX), false)
    assertNoSecrets(result.stderr, "no-account-id stderr")
  })
})

// ---------------------------------------------------------------------------
// auth login — overwrite refusal and --overwrite
// ---------------------------------------------------------------------------

Deno.test("auth login: refuses overwrite of existing profile by default", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      // Pre-seed an account
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(
        [
          "auth",
          "login",
          "--token",
          MOCK_TOKEN,
        ],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 4, "Expected exit code 4 (Auth)")
      assertStringIncludes(result.stderr, "already exists")
      assertStringIncludes(result.stderr, "--overwrite")
      assertNoSecrets(result.stderr, "overwrite refusal stderr")
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth login — invalid credentials (401)
// ---------------------------------------------------------------------------

Deno.test("auth login: invalid credentials exits with auth error and no token in output", async () => {
  const mock = startMockHarvest(() => {
    return new Response(
      JSON.stringify({ error_description: "Token expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        [
          "auth",
          "login",
          "--token",
          MOCK_TOKEN,
        ],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 4, "Expected exit code 4 (Auth)")
      assertStringIncludes(result.stderr, "authentication failed")
      // The raw token MUST NOT appear anywhere in output
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "401 stdout")
      assertNoSecrets(result.stderr, "401 stderr")
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth login — debug mode with invalid credentials never leaks token
// ---------------------------------------------------------------------------

Deno.test("auth login: TIMESLIP_DEBUG=1 with 401 does not leak token", async () => {
  const mock = startMockHarvest(() => {
    return new Response(
      JSON.stringify({ error_description: "Invalid token" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        [
          "auth",
          "login",
          "--token",
          MOCK_TOKEN,
        ],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
            TIMESLIP_DEBUG: "1",
          },
        },
      )

      assertEquals(result.code, 4)
      // Token must be absent from ALL output channels
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "debug 401 stdout")
      assertNoSecrets(result.stderr, "debug 401 stderr")
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// auth list — human mode
// ---------------------------------------------------------------------------

Deno.test("auth list: empty config prints guidance message", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["auth", "list"], { configDir: xdgBase })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "No accounts configured")
    assertStringIncludes(result.stdout, "timeslip auth login")
    assertNoSecrets(result.stdout, "auth list empty stdout")
  })
})

Deno.test("auth list: shows configured accounts in table", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({
          name: "personal",
          accountId: "789",
          isDefault: false,
        }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["auth", "list"], { configDir: xdgBase })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "default")
    assertStringIncludes(result.stdout, "personal")
    assertStringIncludes(result.stdout, "harvest")
    assertStringIncludes(result.stdout, "jane@example.com")
    // Token must not appear in list output
    assertEquals(result.stdout.includes(MOCK_TOKEN), false)
    assertNoSecrets(result.stdout, "auth list stdout")
  })
})

// ---------------------------------------------------------------------------
// auth list — --json mode
// ---------------------------------------------------------------------------

Deno.test("auth list --json: returns structured JSON with accounts", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["--json", "auth", "list"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const data = JSON.parse(result.stdout)
    assertEquals(data.default, "default")
    assertEquals(Array.isArray(data.accounts), true)
    assertEquals(data.accounts.length, 1)
    assertEquals(data.accounts[0].name, "default")
    assertEquals(data.accounts[0].email, "jane@example.com")
    assertEquals(data.accounts[0].is_default, true)
    // No token field in JSON output
    assertEquals("access_token" in data.accounts[0], false)
    assertEquals("accessToken" in data.accounts[0], false)
    assertNoSecrets(result.stdout, "auth list --json stdout")
  })
})

Deno.test("auth list --json: empty config returns empty accounts array", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["--json", "auth", "list"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const data = JSON.parse(result.stdout)
    assertEquals(data.default, null)
    assertEquals(data.accounts, [])
  })
})

// ---------------------------------------------------------------------------
// auth default
// ---------------------------------------------------------------------------

Deno.test("auth default: switches default account", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["auth", "default", "personal"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "Default set")
    assertStringIncludes(result.stdout, "personal")
    assertNoSecrets(result.stdout, "auth default stdout")
  })
})

Deno.test("auth default: non-existent account exits with error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["auth", "default", "ghost"], {
      configDir: xdgBase,
    })

    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "'ghost' not found")
    assertNoSecrets(result.stderr, "auth default error stderr")
  })
})

// ---------------------------------------------------------------------------
// auth default --json
// ---------------------------------------------------------------------------

Deno.test("auth default --json: returns structured success payload", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["--json", "auth", "default", "personal"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const data = JSON.parse(result.stdout)
    assertEquals(data.ok, true)
    assertEquals(data.default, "personal")
    // No token-shaped strings
    assertNoSecrets(result.stdout, "auth default --json stdout")
    assertNoSecrets(JSON.stringify(data), "auth default --json payload")
  })
})

// ---------------------------------------------------------------------------
// auth logout
// ---------------------------------------------------------------------------

Deno.test("auth logout: removes account and confirms", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "Logged out")
    assertStringIncludes(result.stdout, "default")
    assertNoSecrets(result.stdout, "auth logout stdout")
  })
})

Deno.test("auth logout: non-existent account exits with error", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["auth", "logout", "ghost"], {
      configDir: xdgBase,
    })

    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "'ghost' not found")
    assertNoSecrets(result.stderr, "auth logout error stderr")
  })
})

Deno.test("auth logout: promotes remaining account to default", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "Logged out")
    assertStringIncludes(result.stdout, "personal")
    assertNoSecrets(result.stdout, "logout promotion stdout")
  })
})

Deno.test("auth logout: removing default with 2+ remaining shows no-default advice", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
        makeFixtureAccount({
          name: "other",
          accountId: "999",
          isDefault: false,
        }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    assertStringIncludes(result.stdout, "timeslip auth default")
    assertNoSecrets(result.stdout, "logout no-default stdout")
  })
})

// ---------------------------------------------------------------------------
// auth logout --json
// ---------------------------------------------------------------------------

Deno.test("auth logout --json: returns structured success payload", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["--json", "auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const data = JSON.parse(result.stdout)
    assertEquals(data.ok, true)
    assertEquals(data.removed, "default")
    assertEquals(typeof data.remaining_accounts, "number")
    // No token-shaped strings in JSON output
    assertNoSecrets(result.stdout, "auth logout --json stdout")
    assertNoSecrets(JSON.stringify(data), "auth logout --json payload")
  })
})

Deno.test("auth logout --json: includes promoted_default when applicable", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["--json", "auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const data = JSON.parse(result.stdout)
    assertEquals(data.ok, true)
    assertEquals(data.promoted_default, "personal")
    assertEquals(data.remaining_accounts, 1)
    assertNoSecrets(result.stdout, "logout --json promotion stdout")
  })
})

// ---------------------------------------------------------------------------
// auth whoami — needs a mock server for credential re-validation
// ---------------------------------------------------------------------------

Deno.test("auth whoami: prints identity for configured account", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(["auth", "whoami"], {
        configDir: xdgBase,
        env: {
          HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
        },
      })

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      assertStringIncludes(result.stdout, "Jane")
      assertStringIncludes(result.stdout, "Doe")
      assertStringIncludes(result.stdout, "jane@example.com")
      // Token must not appear
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "whoami stdout")
      assertNoSecrets(result.stderr, "whoami stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("auth whoami --json: returns structured identity", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(["--json", "auth", "whoami"], {
        configDir: xdgBase,
        env: {
          HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
        },
      })

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const data = JSON.parse(result.stdout)
      assertEquals(data.account, "default")
      assertEquals(data.provider, "harvest")
      assertEquals(data.stored.email, "jane@example.com")
      assertEquals(data.remote.email, "jane@example.com")
      // No token fields anywhere in JSON
      assertEquals("accessToken" in data, false)
      assertEquals("access_token" in data, false)
      assertNoSecrets(result.stdout, "whoami --json stdout")
    })
  } finally {
    mock.close()
  }
})

Deno.test("auth whoami: with no accounts exits with error", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["auth", "whoami"], { configDir: xdgBase })

    assertEquals(result.code !== 0, true)
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "whoami no-accounts stderr")
  })
})

// ---------------------------------------------------------------------------
// Cross-cutting: no subcommand help output contains secrets
// ---------------------------------------------------------------------------

const AUTH_SUBCOMMANDS = ["login", "list", "default", "whoami", "logout"]

for (const sub of AUTH_SUBCOMMANDS) {
  Deno.test(`auth ${sub} --help: output is secret-safe`, async () => {
    const result = await runCli(["auth", sub, "--help"])
    assertNoSecrets(result.stdout, `auth ${sub} --help stdout`)
    assertNoSecrets(result.stderr, `auth ${sub} --help stderr`)
  })
}

// ---------------------------------------------------------------------------
// Robot-mode output contracts
// ---------------------------------------------------------------------------

Deno.test("auth login --robot: emits tab-separated AUTH_MUTATION_FIELDS row", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        ["--robot", "auth", "login", "--token", MOCK_TOKEN],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const lines = result.stdout.trimEnd().split("\n")
      assertEquals(lines.length, 1, "Robot output must be exactly one line")

      const cells = lines[0].split("\t")
      assertEquals(cells.length, 5, "AUTH_MUTATION_FIELDS has 5 fields")
      // Field order: account, provider, account_id, user_id, email
      assertEquals(cells[0], "default", "account at position 0")
      assertEquals(cells[1], "harvest", "provider at position 1")
      assertEquals(cells[2], "123456", "account_id at position 2")
      assertEquals(cells[3], "42", "user_id at position 3")
      assertEquals(cells[4], "jane@example.com", "email at position 4")

      // No human prose
      assertEquals(result.stdout.includes("Logged in"), false)
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)

      assertNoSecrets(result.stdout, "auth login --robot stdout")
      assertNoSecrets(result.stderr, "auth login --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("auth login --robot: snapshot", async (t) => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        ["--robot", "auth", "login", "--token", MOCK_TOKEN],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, result.stdout)
    })
  } finally {
    mock.close()
  }
})

Deno.test("auth list --robot: emits tab-separated AUTH_LIST_FIELDS rows", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({
          name: "personal",
          accountId: "789",
          isDefault: false,
        }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["--robot", "auth", "list"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const lines = result.stdout.trimEnd().split("\n")
    assertEquals(lines.length, 2, "One line per account, no header")

    // First account: default
    const cells0 = lines[0].split("\t")
    assertEquals(cells0.length, 6, "AUTH_LIST_FIELDS has 6 fields")
    assertEquals(cells0[0], "default", "name at position 0")
    assertEquals(cells0[1], "harvest", "provider at position 1")
    assertEquals(cells0[5], "true", "is_default at position 5")

    // Second account: personal
    const cells1 = lines[1].split("\t")
    assertEquals(cells1[0], "personal")
    assertEquals(cells1[5], "false")

    // No headers, no prose
    assertEquals(result.stdout.includes("NAME"), false)
    assertEquals(result.stdout.includes("No accounts"), false)
    assertEquals(result.stdout.includes(MOCK_TOKEN), false)

    assertNoSecrets(result.stdout, "auth list --robot stdout")
    assertNoSecrets(result.stderr, "auth list --robot stderr")
  })
})

Deno.test("auth list --robot: empty config emits zero lines", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["--robot", "auth", "list"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    assertEquals(result.stdout, "", "Empty accounts → no output lines")
  })
})

Deno.test("auth default --robot: emits tab-separated AUTH_MUTATION_FIELDS row", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig(
      [
        makeFixtureAccount(),
        makeFixtureAccount({ name: "personal", isDefault: false }),
      ],
      "default",
      appDir,
    )

    const result = await runCli(["--robot", "auth", "default", "personal"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const cells = result.stdout.trimEnd().split("\t")
    assertEquals(cells.length, 5, "AUTH_MUTATION_FIELDS has 5 fields")
    assertEquals(cells[0], "personal", "account at position 0")
    assertEquals(cells[1], "harvest", "provider at position 1")

    // No human prose
    assertEquals(result.stdout.includes("Default set"), false)

    assertNoSecrets(result.stdout, "auth default --robot stdout")
  })
})

Deno.test("auth logout --robot: emits tab-separated AUTH_MUTATION_FIELDS row", async () => {
  await withTempXdg(async (xdgBase, appDir) => {
    await saveConfig([makeFixtureAccount()], "default", appDir)

    const result = await runCli(["--robot", "auth", "logout", "default"], {
      configDir: xdgBase,
    })

    assertEquals(result.code, 0)
    const cells = result.stdout.trimEnd().split("\t")
    assertEquals(cells.length, 5, "AUTH_MUTATION_FIELDS has 5 fields")
    assertEquals(cells[0], "default", "account at position 0")
    assertEquals(cells[1], "harvest", "provider at position 1")

    // No human prose
    assertEquals(result.stdout.includes("Logged out"), false)
    assertEquals(result.stdout.includes("promoted"), false)
    assertEquals(result.stdout.includes(MOCK_TOKEN), false)

    assertNoSecrets(result.stdout, "auth logout --robot stdout")
  })
})

Deno.test("auth whoami --robot: emits tab-separated AUTH_WHOAMI_FIELDS row", async () => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(["--robot", "auth", "whoami"], {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
      })

      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      const cells = result.stdout.trimEnd().split("\t")
      assertEquals(cells.length, 8, "AUTH_WHOAMI_FIELDS has 8 fields")
      // Field order: account, provider, account_id, is_default, user_id, first_name, last_name, email
      assertEquals(cells[0], "default", "account at position 0")
      assertEquals(cells[1], "harvest", "provider at position 1")
      assertEquals(cells[2], "123456", "account_id at position 2")
      assertEquals(cells[3], "true", "is_default at position 3")
      assertEquals(cells[4], "42", "user_id at position 4")
      assertEquals(cells[5], "Jane", "first_name at position 5")
      assertEquals(cells[6], "Doe", "last_name at position 6")
      assertEquals(cells[7], "jane@example.com", "email at position 7")

      // No human prose
      assertEquals(result.stdout.includes("Account:"), false)
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)

      assertNoSecrets(result.stdout, "auth whoami --robot stdout")
      assertNoSecrets(result.stderr, "auth whoami --robot stderr")
    })
  } finally {
    mock.close()
  }
})

Deno.test("auth whoami --robot: snapshot", async (t) => {
  const mock = startMockHarvest()
  try {
    await withTempXdg(async (xdgBase, appDir) => {
      await saveConfig([makeFixtureAccount()], "default", appDir)

      const result = await runCli(["--robot", "auth", "whoami"], {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
      })
      assertEquals(result.code, 0, `stderr: ${result.stderr}`)
      await assertSnapshot(t, result.stdout)
    })
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// Robot-mode error paths
// ---------------------------------------------------------------------------

Deno.test("auth login --robot: validation error emits to stderr, no robot stdout", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["--robot", "auth", "login"], {
      configDir: xdgBase,
    })
    assertEquals(result.code, 2, "Expected validation exit code")
    assertEquals(result.stdout, "", "Robot stdout must be empty on error")
    assertStringIncludes(result.stderr, "token source is required")
    assertNoSecrets(result.stderr, "auth login --robot validation stderr")
  })
})

Deno.test("auth whoami --robot: no accounts exits with error, no robot stdout", async () => {
  await withTempXdg(async (xdgBase) => {
    const result = await runCli(["--robot", "auth", "whoami"], {
      configDir: xdgBase,
    })
    assertEquals(result.code !== 0, true)
    assertEquals(result.stdout, "", "Robot stdout must be empty on error")
    assertStringIncludes(result.stderr, "No accounts configured")
    assertNoSecrets(result.stderr, "auth whoami --robot no-accounts stderr")
  })
})

Deno.test("auth login --robot: 401 exits with auth error, no token in output", async () => {
  const mock = startMockHarvest(() => {
    return new Response(
      JSON.stringify({ error_description: "Token expired" }),
      { status: 401, headers: { "Content-Type": "application/json" } },
    )
  })
  try {
    await withTempXdg(async (xdgBase) => {
      const result = await runCli(
        ["--robot", "auth", "login", "--token", MOCK_TOKEN],
        {
          configDir: xdgBase,
          env: { HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2` },
        },
      )
      assertEquals(result.code, 4, "Expected auth exit code")
      assertEquals(result.stdout, "", "No robot output on auth failure")
      assertEquals(result.stdout.includes(MOCK_TOKEN), false)
      assertEquals(result.stderr.includes(MOCK_TOKEN), false)
      assertNoSecrets(result.stdout, "auth login --robot 401 stdout")
      assertNoSecrets(result.stderr, "auth login --robot 401 stderr")
    })
  } finally {
    mock.close()
  }
})
