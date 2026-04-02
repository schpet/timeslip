/**
 * E2E process-level auth workflow tests.
 *
 * These tests invoke the actual CLI binary as a subprocess, proving that
 * config written by one invocation (login) is consumable by subsequent
 * invocations (whoami, list, default, logout).
 *
 * A local HTTP server mocks the Harvest /users/me endpoint.
 *
 * Secret-safety invariant: every test asserts that raw tokens never
 * appear in stdout, stderr, or debug output from any invocation.
 */

import { assertEquals, assertStringIncludes } from "@std/assert"
import { assertNoSecrets, runCli } from "../../test_helpers.ts"

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const TOKEN_A = "pat-111111.aaaa_bbbb_cccc_dddd_eeee_ffff"
const TOKEN_B = "pat-222222.xxxx_yyyy_zzzz_1111_2222_3333"
const USER_A = {
  id: 10,
  first_name: "Alice",
  last_name: "Wonderland",
  email: "alice@example.com",
}
const USER_B = {
  id: 20,
  first_name: "Bob",
  last_name: "Builder",
  email: "bob@example.com",
}

function startMockHarvest(): {
  port: number
  close: () => void
  requests: { url: string; headers: Record<string, string> }[]
} {
  const requests: { url: string; headers: Record<string, string> }[] = []

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    (req: Request) => {
      const headers: Record<string, string> = {}
      req.headers.forEach((v, k) => {
        headers[k] = v
      })
      requests.push({ url: req.url, headers })

      // Route based on account-id header
      const accountId = headers["harvest-account-id"]
      let user = USER_A
      if (accountId === "222222") user = USER_B

      return new Response(JSON.stringify(user), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    },
  )

  const addr = server.addr as Deno.NetAddr
  return {
    port: addr.port,
    close: () => server.shutdown(),
    requests,
  }
}

/** Scan all output for raw tokens. */
function assertOutputSecretSafe(
  result: { stdout: string; stderr: string },
  label: string,
  ...tokens: string[]
): void {
  for (const token of tokens) {
    assertEquals(
      result.stdout.includes(token),
      false,
      `Raw token found in ${label} stdout`,
    )
    assertEquals(
      result.stderr.includes(token),
      false,
      `Raw token found in ${label} stderr`,
    )
  }
  assertNoSecrets(result.stdout, `${label} stdout`)
  assertNoSecrets(result.stderr, `${label} stderr`)
}

// ---------------------------------------------------------------------------
// E2E workflow: login → list → whoami → default → logout
// ---------------------------------------------------------------------------

Deno.test("e2e auth workflow: login creates config consumable by whoami and list", async () => {
  const mock = startMockHarvest()
  try {
    const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_auth_" })
    const baseEnv = {
      HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
    }

    try {
      // Step 1: Login first account
      const login1 = await runCli(
        ["auth", "login", "--token", TOKEN_A, "--name", "alice"],
        { configDir: xdgBase, env: baseEnv },
      )
      assertEquals(login1.code, 0, `login1 failed: ${login1.stderr}`)
      assertStringIncludes(login1.stdout, "Alice")
      assertOutputSecretSafe(login1, "login1", TOKEN_A, TOKEN_B)

      // Step 2: Login second account
      const login2 = await runCli(
        ["auth", "login", "--token", TOKEN_B, "--name", "bob"],
        { configDir: xdgBase, env: baseEnv },
      )
      assertEquals(login2.code, 0, `login2 failed: ${login2.stderr}`)
      assertStringIncludes(login2.stdout, "Bob")
      assertOutputSecretSafe(login2, "login2", TOKEN_A, TOKEN_B)

      // Step 3: List accounts — should show both
      const list = await runCli(["auth", "list"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(list.code, 0)
      assertStringIncludes(list.stdout, "alice")
      assertStringIncludes(list.stdout, "bob")
      assertOutputSecretSafe(list, "list", TOKEN_A, TOKEN_B)

      // Step 4: List --json — verify no tokens in JSON
      const listJson = await runCli(["--json", "auth", "list"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(listJson.code, 0)
      const listData = JSON.parse(listJson.stdout)
      assertEquals(listData.accounts.length, 2)
      // Verify no token field anywhere in the JSON
      const listStr = JSON.stringify(listData)
      assertEquals(listStr.includes(TOKEN_A), false, "Token A in list JSON")
      assertEquals(listStr.includes(TOKEN_B), false, "Token B in list JSON")
      assertNoSecrets(listStr, "list JSON")

      // Step 5: Whoami — should show the default (first) account
      const whoami = await runCli(["auth", "whoami"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(whoami.code, 0, `whoami failed: ${whoami.stderr}`)
      assertStringIncludes(whoami.stdout, "Alice")
      assertOutputSecretSafe(whoami, "whoami", TOKEN_A, TOKEN_B)

      // Step 6: Whoami --json
      const whoamiJson = await runCli(["--json", "auth", "whoami"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(
        whoamiJson.code,
        0,
        `whoami --json failed: ${whoamiJson.stderr}`,
      )
      const whoamiData = JSON.parse(whoamiJson.stdout)
      assertEquals(whoamiData.account, "alice")
      const whoamiStr = JSON.stringify(whoamiData)
      assertEquals(whoamiStr.includes(TOKEN_A), false)
      assertNoSecrets(whoamiStr, "whoami JSON")

      // Step 7: Switch default to bob
      const setDefault = await runCli(["auth", "default", "bob"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(setDefault.code, 0)
      assertStringIncludes(setDefault.stdout, "bob")
      assertOutputSecretSafe(setDefault, "default", TOKEN_A, TOKEN_B)

      // Step 8: Default --json
      const defaultJson = await runCli(["--json", "auth", "default", "bob"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(defaultJson.code, 0)
      const defaultData = JSON.parse(defaultJson.stdout)
      assertEquals(defaultData.ok, true)
      assertEquals(defaultData.default, "bob")
      assertNoSecrets(JSON.stringify(defaultData), "default JSON")

      // Step 9: Whoami now shows bob
      const whoami2 = await runCli(["auth", "whoami"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(whoami2.code, 0, `whoami2 failed: ${whoami2.stderr}`)
      assertStringIncludes(whoami2.stdout, "Bob")
      assertOutputSecretSafe(whoami2, "whoami2", TOKEN_A, TOKEN_B)

      // Step 10: Logout bob (default), alice should be promoted
      const logout = await runCli(["auth", "logout", "bob"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(logout.code, 0)
      assertStringIncludes(logout.stdout, "Logged out")
      assertOutputSecretSafe(logout, "logout", TOKEN_A, TOKEN_B)

      // Step 11: Logout --json
      const logoutJson = await runCli(["--json", "auth", "logout", "alice"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(logoutJson.code, 0)
      const logoutData = JSON.parse(logoutJson.stdout)
      assertEquals(logoutData.ok, true)
      assertEquals(logoutData.removed, "alice")
      assertNoSecrets(JSON.stringify(logoutData), "logout JSON")

      // Step 12: List should now be empty
      const listFinal = await runCli(["auth", "list"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(listFinal.code, 0)
      assertStringIncludes(listFinal.stdout, "No accounts configured")
    } finally {
      await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    }
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// E2E: debug mode across the entire workflow never leaks tokens
// ---------------------------------------------------------------------------

Deno.test("e2e auth: TIMESLIP_DEBUG=1 login+whoami never leaks tokens", async () => {
  const mock = startMockHarvest()
  try {
    const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_debug_" })
    const baseEnv = {
      HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
      TIMESLIP_DEBUG: "1",
    }

    try {
      const login = await runCli(
        ["auth", "login", "--token", TOKEN_A, "--name", "debugtest"],
        { configDir: xdgBase, env: baseEnv },
      )
      assertEquals(login.code, 0, `login failed: ${login.stderr}`)
      assertOutputSecretSafe(login, "debug login", TOKEN_A)

      const whoami = await runCli(["auth", "whoami"], {
        configDir: xdgBase,
        env: baseEnv,
      })
      assertEquals(whoami.code, 0, `whoami failed: ${whoami.stderr}`)
      assertOutputSecretSafe(whoami, "debug whoami", TOKEN_A)
    } finally {
      await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    }
  } finally {
    mock.close()
  }
})

// ---------------------------------------------------------------------------
// E2E: login with invalid credentials — token must not leak into error output
// ---------------------------------------------------------------------------

Deno.test("e2e auth: 401 login error output is secret-safe", async () => {
  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    () =>
      new Response(JSON.stringify({ error: "invalid_token" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }),
  )
  const addr = server.addr as Deno.NetAddr

  try {
    const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_401_" })
    try {
      const result = await runCli(
        ["auth", "login", "--token", TOKEN_A],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${addr.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 4, "Expected auth exit code")
      assertOutputSecretSafe(result, "401 login", TOKEN_A)
    } finally {
      await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    }
  } finally {
    server.shutdown()
  }
})

// ---------------------------------------------------------------------------
// E2E: mock server request log proves auth headers were sent (but test
// output does not contain them)
// ---------------------------------------------------------------------------

Deno.test("e2e auth: mock server receives auth headers but CLI output is clean", async () => {
  const mock = startMockHarvest()
  try {
    const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_e2e_hdr_" })
    try {
      const result = await runCli(
        ["auth", "login", "--token", TOKEN_A, "--name", "hdrtest"],
        {
          configDir: xdgBase,
          env: {
            HARVEST_BASE_URL: `http://127.0.0.1:${mock.port}/api/v2`,
          },
        },
      )

      assertEquals(result.code, 0, `login failed: ${result.stderr}`)

      // Verify the mock received the request with auth headers
      assertEquals(mock.requests.length >= 1, true)
      assertStringIncludes(
        mock.requests[0].headers["authorization"] ?? "",
        "Bearer",
      )

      // But CLI output must not contain auth headers or tokens
      assertOutputSecretSafe(result, "header test", TOKEN_A)
      assertEquals(result.stdout.includes("Bearer"), false)
      assertEquals(result.stderr.includes("Bearer"), false)
    } finally {
      await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    }
  } finally {
    mock.close()
  }
})
