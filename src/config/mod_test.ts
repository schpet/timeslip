/**
 * Config persistence, resolution order, and redaction tests.
 *
 * Covers:
 * - XDG path resolution across environment setups
 * - Atomic write/read round-trips with temp directories
 * - Default-account resolution precedence and logout edge cases
 * - Corrupt TOML and missing-field ConfigError surfaces
 * - Token redaction contract for safe logging
 */

import { assertEquals, assertRejects, assertStringIncludes } from "@std/assert"
import { join } from "@std/path"
import { stringify as stringifyToml } from "@std/toml"
import { ConfigError } from "../errors/mod.ts"
import type { Account } from "../domain/mod.ts"
import {
  accountsPath,
  loadAccount,
  loadConfig,
  redactAccount,
  redactToken,
  redactTokensInText,
  removeAccount,
  resolveAccount,
  resolveConfigDir,
  saveConfig,
  setDefault,
  upsertAccount,
} from "./mod.ts"
import { assertNoSecrets } from "../test_helpers.ts"

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

function makeAccount(overrides: Partial<Account> = {}): Account {
  return {
    name: "work",
    provider: "harvest",
    accountId: "123456",
    accessToken: "sk_live_abcdef1234567890abcdef1234567890",
    userId: 42,
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    isDefault: false,
    ...overrides,
  }
}

function makeAccount2(overrides: Partial<Account> = {}): Account {
  return {
    name: "personal",
    provider: "harvest",
    accountId: "789012",
    accessToken: "pat_xyzabc1234567890xyzabc1234567890",
    userId: 99,
    firstName: "John",
    lastName: "Smith",
    email: "john@example.com",
    isDefault: false,
    ...overrides,
  }
}

async function withTempDir(
  fn: (dir: string) => Promise<void>,
): Promise<void> {
  const dir = await Deno.makeTempDir({ prefix: "timeslip_test_" })
  try {
    await fn(dir)
  } finally {
    await Deno.remove(dir, { recursive: true }).catch(() => {})
  }
}

// ---------------------------------------------------------------------------
// XDG path resolution
// ---------------------------------------------------------------------------

Deno.test("resolveConfigDir: explicit override takes priority", () => {
  const dir = resolveConfigDir("/custom/config")
  assertEquals(dir, "/custom/config")
})

Deno.test("resolveConfigDir: XDG_CONFIG_HOME is used when set", () => {
  const original = Deno.env.get("XDG_CONFIG_HOME")
  try {
    Deno.env.set("XDG_CONFIG_HOME", "/tmp/xdg-test")
    const dir = resolveConfigDir()
    assertEquals(dir, join("/tmp/xdg-test", "timeslip"))
  } finally {
    if (original) {
      Deno.env.set("XDG_CONFIG_HOME", original)
    } else {
      Deno.env.delete("XDG_CONFIG_HOME")
    }
  }
})

Deno.test("resolveConfigDir: falls back to HOME/.config when XDG unset", () => {
  const origXdg = Deno.env.get("XDG_CONFIG_HOME")
  const origHome = Deno.env.get("HOME")
  try {
    Deno.env.delete("XDG_CONFIG_HOME")
    Deno.env.set("HOME", "/tmp/home-test")
    const dir = resolveConfigDir()
    assertEquals(dir, join("/tmp/home-test", ".config", "timeslip"))
  } finally {
    if (origXdg) Deno.env.set("XDG_CONFIG_HOME", origXdg)
    else Deno.env.delete("XDG_CONFIG_HOME")
    if (origHome) Deno.env.set("HOME", origHome)
    else Deno.env.delete("HOME")
  }
})

Deno.test("accountsPath: returns accounts.toml within config dir", () => {
  const path = accountsPath("/my/config")
  assertEquals(path, join("/my/config", "accounts.toml"))
})

// ---------------------------------------------------------------------------
// Atomic write/read round-trip
// ---------------------------------------------------------------------------

Deno.test("saveConfig + loadConfig: round-trips accounts correctly", async () => {
  await withTempDir(async (dir) => {
    const acct = makeAccount({ isDefault: true })
    await saveConfig([acct], "work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.defaultName, "work")
    assertEquals(result.accounts.length, 1)
    assertEquals(result.accounts[0].name, "work")
    assertEquals(result.accounts[0].provider, "harvest")
    assertEquals(result.accounts[0].accessToken, acct.accessToken)
    assertEquals(result.accounts[0].userId, 42)
    assertEquals(result.accounts[0].email, "jane@example.com")
  })
})

Deno.test("saveConfig + loadConfig: handles multiple accounts", async () => {
  await withTempDir(async (dir) => {
    const acct1 = makeAccount({ isDefault: true })
    const acct2 = makeAccount2()
    await saveConfig([acct1, acct2], "work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.defaultName, "work")
    assertEquals(result.accounts.length, 2)
    const names = result.accounts.map((a) => a.name).sort()
    assertEquals(names, ["personal", "work"])
  })
})

Deno.test("saveConfig: overwrites previous config atomically", async () => {
  await withTempDir(async (dir) => {
    const acct = makeAccount()
    await saveConfig([acct], "work", dir)

    // Overwrite with updated email
    const updated = makeAccount({ email: "updated@example.com" })
    await saveConfig([updated], "work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.accounts[0].email, "updated@example.com")
  })
})

Deno.test("loadConfig: returns empty state when file does not exist", async () => {
  await withTempDir(async (dir) => {
    const result = await loadConfig(dir)
    assertEquals(result.defaultName, undefined)
    assertEquals(result.accounts, [])
  })
})

Deno.test("saveConfig: creates directory structure if missing", async () => {
  await withTempDir(async (dir) => {
    const nested = join(dir, "deep", "nested")
    await saveConfig([makeAccount()], "work", nested)
    const result = await loadConfig(nested)
    assertEquals(result.accounts.length, 1)
  })
})

// ---------------------------------------------------------------------------
// Config validation — corrupt TOML and missing fields
// ---------------------------------------------------------------------------

Deno.test("loadConfig: rejects invalid TOML syntax with ConfigError", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    await Deno.writeTextFile(configPath, "{{{{ not valid toml !!!!")

    const err = await assertRejects(
      () => loadConfig(dir),
      ConfigError,
    )
    assertStringIncludes(err.message, "Failed to parse")
    assertEquals(err.suggestion !== undefined, true)
  })
})

Deno.test("loadConfig: rejects account missing required string field", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    // Missing access_token field
    const toml = stringifyToml({
      default: "broken",
      accounts: {
        broken: {
          provider: "harvest",
          account_id: "123",
          // access_token is missing
          user_id: 1,
          first_name: "A",
          last_name: "B",
          email: "a@b.com",
        },
      },
    } as Record<string, unknown>)
    await Deno.writeTextFile(configPath, toml)

    const err = await assertRejects(
      () => loadConfig(dir),
      ConfigError,
    )
    assertStringIncludes(err.message, "access_token")
    assertStringIncludes(err.message, "missing required field")
  })
})

Deno.test("loadConfig: rejects account with wrong field type", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    // user_id as string instead of number
    const toml = stringifyToml({
      accounts: {
        bad: {
          provider: "harvest",
          account_id: "123",
          access_token: "token_value",
          user_id: "not_a_number",
          first_name: "A",
          last_name: "B",
          email: "a@b.com",
        },
      },
    } as Record<string, unknown>)
    await Deno.writeTextFile(configPath, toml)

    const err = await assertRejects(
      () => loadConfig(dir),
      ConfigError,
    )
    assertStringIncludes(err.message, "user_id")
    assertStringIncludes(err.message, "must be a number")
  })
})

Deno.test("loadConfig: rejects non-table accounts section", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    await Deno.writeTextFile(configPath, 'accounts = "not a table"\n')

    await assertRejects(
      () => loadConfig(dir),
      ConfigError,
      "must be a TOML table",
    )
  })
})

Deno.test("loadConfig: rejects non-string default field", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    await Deno.writeTextFile(configPath, "default = 42\n")

    await assertRejects(
      () => loadConfig(dir),
      ConfigError,
      "'default' must be a string",
    )
  })
})

Deno.test("ConfigError includes actionable suggestion for corrupt config", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    await Deno.writeTextFile(configPath, "not valid {{toml}}")

    try {
      await loadConfig(dir)
    } catch (err) {
      assertEquals(err instanceof ConfigError, true)
      const ce = err as ConfigError
      assertStringIncludes(ce.suggestion!, "Delete it")
    }
  })
})

Deno.test("ConfigError for missing field suggests re-login", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    const toml = stringifyToml({
      accounts: {
        incomplete: {
          provider: "harvest",
          // Missing most fields
        },
      },
    } as Record<string, unknown>)
    await Deno.writeTextFile(configPath, toml)

    try {
      await loadConfig(dir)
    } catch (err) {
      assertEquals(err instanceof ConfigError, true)
      const ce = err as ConfigError
      assertStringIncludes(ce.suggestion!, "timeslip auth login")
    }
  })
})

// ---------------------------------------------------------------------------
// Account mutations — upsert, remove, setDefault
// ---------------------------------------------------------------------------

Deno.test("upsertAccount: adds first account and auto-sets default", async () => {
  await withTempDir(async (dir) => {
    const acct = makeAccount()
    await upsertAccount(acct, dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.defaultName, "work")
  })
})

Deno.test("upsertAccount: updates existing account by name", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount({ email: "new@example.com" }), dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.accounts[0].email, "new@example.com")
  })
})

Deno.test("upsertAccount: second account does not change default", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 2)
    assertEquals(result.defaultName, "work")
  })
})

Deno.test("removeAccount: removes account and returns true", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    const removed = await removeAccount("work", dir)
    assertEquals(removed, true)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 0)
  })
})

Deno.test("removeAccount: returns false for non-existent account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    const removed = await removeAccount("nonexistent", dir)
    assertEquals(removed, false)
  })
})

Deno.test("removeAccount: clears default when default account is removed", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    // "work" is the default (first account)
    await removeAccount("work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.defaultName, undefined)
  })
})

Deno.test("removeAccount: preserves default when non-default is removed", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await removeAccount("personal", dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.defaultName, "work")
  })
})

Deno.test("setDefault: changes default to existing account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await setDefault("personal", dir)

    const result = await loadConfig(dir)
    assertEquals(result.defaultName, "personal")
  })
})

Deno.test("setDefault: throws ConfigError for non-existent account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)

    const err = await assertRejects(
      () => setDefault("ghost", dir),
      ConfigError,
    )
    assertStringIncludes(err.message, "'ghost' not found")
  })
})

Deno.test("loadAccount: finds account by name", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    const acct = await loadAccount("work", dir)
    assertEquals(acct?.name, "work")
    assertEquals(acct?.email, "jane@example.com")
  })
})

Deno.test("loadAccount: returns undefined for missing account", async () => {
  await withTempDir(async (dir) => {
    const acct = await loadAccount("nonexistent", dir)
    assertEquals(acct, undefined)
  })
})

// ---------------------------------------------------------------------------
// Default-account transitions (logout edge cases)
// ---------------------------------------------------------------------------

Deno.test("logout: removing only account leaves empty config", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await removeAccount("work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 0)
    assertEquals(result.defaultName, undefined)
  })
})

Deno.test("logout: removing default with other accounts clears default but keeps accounts", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await removeAccount("work", dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.accounts[0].name, "personal")
    assertEquals(result.defaultName, undefined)
  })
})

Deno.test("logout then re-login: first account auto-becomes default", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await removeAccount("work", dir)
    // Re-login with a different account
    await upsertAccount(makeAccount2(), dir)

    const result = await loadConfig(dir)
    assertEquals(result.accounts.length, 1)
    assertEquals(result.defaultName, "personal")
  })
})

// ---------------------------------------------------------------------------
// resolveAccount — precedence order
// ---------------------------------------------------------------------------

Deno.test("resolveAccount: flag takes highest priority", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await setDefault("work", dir)

    const acct = await resolveAccount({
      flagAccount: "personal",
      envAccount: "work",
      configDir: dir,
    })
    assertEquals(acct.name, "personal")
  })
})

Deno.test("resolveAccount: env variable is second priority", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await setDefault("work", dir)

    const acct = await resolveAccount({
      envAccount: "personal",
      configDir: dir,
    })
    assertEquals(acct.name, "personal")
  })
})

Deno.test("resolveAccount: stored default is third priority", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)
    await upsertAccount(makeAccount2(), dir)
    await setDefault("personal", dir)

    const acct = await resolveAccount({ configDir: dir })
    assertEquals(acct.name, "personal")
  })
})

Deno.test("resolveAccount: single account used when no explicit target", async () => {
  await withTempDir(async (dir) => {
    // Manually save without a default to test the fallback
    await saveConfig([makeAccount()], undefined, dir)

    const acct = await resolveAccount({ configDir: dir })
    assertEquals(acct.name, "work")
  })
})

Deno.test("resolveAccount: throws when no accounts configured", async () => {
  await withTempDir(async (dir) => {
    const err = await assertRejects(
      () => resolveAccount({ configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "No accounts configured")
    assertStringIncludes(err.suggestion!, "timeslip auth login")
  })
})

Deno.test("resolveAccount: throws when multiple accounts but no default", async () => {
  await withTempDir(async (dir) => {
    await saveConfig([makeAccount(), makeAccount2()], undefined, dir)

    const err = await assertRejects(
      () => resolveAccount({ configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "Multiple accounts")
    assertStringIncludes(err.suggestion!, "timeslip auth default")
  })
})

Deno.test("resolveAccount: throws when flag references non-existent account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)

    const err = await assertRejects(
      () => resolveAccount({ flagAccount: "ghost", configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "'ghost' not found")
  })
})

Deno.test("resolveAccount: throws when env references non-existent account", async () => {
  await withTempDir(async (dir) => {
    await upsertAccount(makeAccount(), dir)

    const err = await assertRejects(
      () => resolveAccount({ envAccount: "ghost", configDir: dir }),
      ConfigError,
    )
    assertStringIncludes(err.message, "'ghost' not found")
  })
})

// ---------------------------------------------------------------------------
// Token redaction contract
// ---------------------------------------------------------------------------

Deno.test("redactToken: long tokens show first/last 4 chars only", () => {
  const token = "abcdefghijklmnopqrstuvwxyz123456"
  const redacted = redactToken(token)
  assertEquals(redacted.startsWith("abcd"), true)
  assertEquals(redacted.endsWith("3456"), true)
  assertEquals(redacted.includes("efghijklmnopqrstuvwxyz12"), false)
  assertNoSecrets(redacted, "redacted long token")
})

Deno.test("redactToken: short tokens replaced entirely", () => {
  assertEquals(redactToken("abc"), "****")
  assertEquals(redactToken(""), "****")
  assertEquals(redactToken("12345678901"), "****") // 11 chars
})

Deno.test("redactToken: 12-char boundary token is partially redacted", () => {
  const token = "abcdefghijkl" // exactly 12
  const redacted = redactToken(token)
  assertEquals(redacted.startsWith("abcd"), true)
  assertEquals(redacted.endsWith("ijkl"), true)
  assertEquals(redacted.length > 0, true)
})

Deno.test("redactTokensInText: redacts long mixed-case token-shaped strings", () => {
  const text = "Token: AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"
  const result = redactTokensInText(text)
  assertEquals(result.includes("AbCdEfGhIjKlMnOpQrStUvWxYz1234567890"), false)
})

Deno.test("redactTokensInText: preserves short normal words", () => {
  const text = "Hello world, this is fine"
  assertEquals(redactTokensInText(text), text)
})

Deno.test("redactAccount: token is redacted, other fields preserved", () => {
  const acct = makeAccount()
  const redacted = redactAccount(acct)

  assertEquals(redacted.name, "work")
  assertEquals(redacted.provider, "harvest")
  assertEquals(redacted.email, "jane@example.com")
  assertEquals(redacted.userId, 42)
  assertEquals(redacted.isDefault, false)
  // Token must not appear
  assertEquals(
    (redacted.accessToken as string).includes(acct.accessToken),
    false,
  )
  assertNoSecrets(JSON.stringify(redacted), "redactAccount JSON")
})

Deno.test("redactAccount: stringified output has no secret-shaped strings", () => {
  const acct = makeAccount({
    accessToken: "pat_SuperSecretTokenValue1234567890xyzabc",
  })
  const output = JSON.stringify(redactAccount(acct))
  assertNoSecrets(output, "redactAccount stringified")
})

// ---------------------------------------------------------------------------
// E2E: config written by one invocation is readable by the next
// ---------------------------------------------------------------------------

Deno.test("e2e: config persists across separate saveConfig/loadConfig calls", async () => {
  await withTempDir(async (dir) => {
    // Simulate first CLI invocation writing config
    const acct = makeAccount({ isDefault: true })
    await saveConfig([acct], "work", dir)

    // Simulate second CLI invocation reading config
    const result = await loadConfig(dir)
    assertEquals(result.defaultName, "work")
    assertEquals(result.accounts.length, 1)
    assertEquals(result.accounts[0].accessToken, acct.accessToken)

    // Simulate third invocation modifying config
    await upsertAccount(makeAccount2(), dir)
    const result2 = await loadConfig(dir)
    assertEquals(result2.accounts.length, 2)
    assertEquals(result2.defaultName, "work")
  })
})

// ---------------------------------------------------------------------------
// E2E: config error messages never leak tokens
// ---------------------------------------------------------------------------

Deno.test("e2e: ConfigError messages from corrupt config never contain tokens", async () => {
  await withTempDir(async (dir) => {
    const configPath = join(dir, "accounts.toml")
    await Deno.mkdir(dir, { recursive: true })
    await Deno.writeTextFile(configPath, "invalid {{toml}}")

    try {
      await loadConfig(dir)
    } catch (err) {
      const msg = String(err)
      assertNoSecrets(msg, "ConfigError string")
      if (err instanceof ConfigError && err.suggestion) {
        assertNoSecrets(err.suggestion, "ConfigError suggestion")
      }
    }
  })
})

Deno.test("e2e: debug representations of accounts are secret-safe", () => {
  const acct = makeAccount()
  const redacted = redactAccount(acct)
  const debugStr = JSON.stringify(redacted, null, 2)
  assertNoSecrets(debugStr, "debug account representation")
})
