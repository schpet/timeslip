/**
 * XDG-aware account storage, resolution, and redaction helpers.
 *
 * Accounts are persisted in `accounts.toml` inside the timeslip config
 * directory. Writes are atomic (temp file + rename) with restrictive
 * permissions on platforms that support them.
 *
 * All path resolution is injectable for testing — pass `configDir` to
 * override the default XDG location.
 */

import { join } from "@std/path"
import { parse as parseToml, stringify as stringifyToml } from "@std/toml"
import { ConfigError } from "../errors/mod.ts"
import type { Account } from "../domain/mod.ts"

// ---------------------------------------------------------------------------
// XDG path resolution
// ---------------------------------------------------------------------------

const APP_NAME = "timeslip"
const ACCOUNTS_FILE = "accounts.toml"

/** Resolve the timeslip config directory using XDG conventions. */
export function resolveConfigDir(override?: string): string {
  if (override) return override

  if (Deno.build.os === "windows") {
    const appData = Deno.env.get("APPDATA")
    if (appData) return join(appData, APP_NAME)
    const home = Deno.env.get("USERPROFILE")
    if (home) return join(home, "AppData", "Roaming", APP_NAME)
  } else {
    const xdg = Deno.env.get("XDG_CONFIG_HOME")
    if (xdg) return join(xdg, APP_NAME)
    const home = Deno.env.get("HOME")
    if (home) return join(home, ".config", APP_NAME)
  }

  throw new ConfigError(
    "Cannot determine config directory: no HOME or XDG_CONFIG_HOME set.",
    { suggestion: "Set the HOME or XDG_CONFIG_HOME environment variable." },
  )
}

/** Full path to accounts.toml within the config directory. */
export function accountsPath(configDir?: string): string {
  return join(resolveConfigDir(configDir), ACCOUNTS_FILE)
}

// ---------------------------------------------------------------------------
// TOML shape — what we persist to disk
// ---------------------------------------------------------------------------

/** Shape of a single account entry in TOML. */
interface TomlAccount {
  provider: string
  account_id: string
  access_token: string
  user_id: number
  first_name: string
  last_name: string
  email: string
}

/** Top-level TOML document shape. */
interface TomlConfig {
  default?: string
  accounts?: Record<string, TomlAccount>
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function validateTomlConfig(raw: unknown): TomlConfig {
  if (raw === null || typeof raw !== "object") {
    throw new ConfigError("Corrupt config: expected a TOML table at the root.")
  }

  const obj = raw as Record<string, unknown>
  const config: TomlConfig = {}

  if ("default" in obj) {
    if (typeof obj.default !== "string") {
      throw new ConfigError("Corrupt config: 'default' must be a string.")
    }
    config.default = obj.default
  }

  if ("accounts" in obj) {
    if (typeof obj.accounts !== "object" || obj.accounts === null) {
      throw new ConfigError(
        "Corrupt config: 'accounts' must be a TOML table.",
      )
    }
    config.accounts = {}
    for (
      const [name, entry] of Object.entries(
        obj.accounts as Record<string, unknown>,
      )
    ) {
      config.accounts[name] = validateTomlAccount(name, entry)
    }
  }

  return config
}

function validateTomlAccount(name: string, raw: unknown): TomlAccount {
  if (typeof raw !== "object" || raw === null) {
    throw new ConfigError(
      `Corrupt config: account '${name}' must be a TOML table.`,
    )
  }

  const entry = raw as Record<string, unknown>
  const stringFields = [
    "provider",
    "account_id",
    "access_token",
    "first_name",
    "last_name",
    "email",
  ]
  const numberFields = ["user_id"]

  for (const field of stringFields) {
    if (!(field in entry)) {
      throw new ConfigError(
        `Corrupt config: account '${name}' is missing required field '${field}'.`,
        { suggestion: `Re-run \`timeslip auth login\` to fix this account.` },
      )
    }
    if (typeof entry[field] !== "string") {
      throw new ConfigError(
        `Corrupt config: account '${name}' field '${field}' must be a string.`,
      )
    }
  }

  for (const field of numberFields) {
    if (!(field in entry)) {
      throw new ConfigError(
        `Corrupt config: account '${name}' is missing required field '${field}'.`,
        { suggestion: `Re-run \`timeslip auth login\` to fix this account.` },
      )
    }
    if (typeof entry[field] !== "number") {
      throw new ConfigError(
        `Corrupt config: account '${name}' field '${field}' must be a number.`,
      )
    }
  }

  return {
    provider: entry.provider as string,
    account_id: entry.account_id as string,
    access_token: entry.access_token as string,
    user_id: entry.user_id as number,
    first_name: entry.first_name as string,
    last_name: entry.last_name as string,
    email: entry.email as string,
  }
}

// ---------------------------------------------------------------------------
// Conversion helpers
// ---------------------------------------------------------------------------

function tomlAccountToDomain(
  name: string,
  entry: TomlAccount,
  isDefault: boolean,
): Account {
  return {
    name,
    provider: entry.provider,
    accountId: entry.account_id,
    accessToken: entry.access_token,
    userId: entry.user_id,
    firstName: entry.first_name,
    lastName: entry.last_name,
    email: entry.email,
    isDefault,
  }
}

function domainAccountToToml(account: Account): TomlAccount {
  return {
    provider: account.provider,
    account_id: account.accountId,
    access_token: account.accessToken,
    user_id: account.userId,
    first_name: account.firstName,
    last_name: account.lastName,
    email: account.email,
  }
}

// ---------------------------------------------------------------------------
// Read
// ---------------------------------------------------------------------------

/** Load and validate the accounts config. Returns empty state if the file doesn't exist. */
export async function loadConfig(
  configDir?: string,
): Promise<{ defaultName: string | undefined; accounts: Account[] }> {
  const path = accountsPath(configDir)

  let text: string
  try {
    text = await Deno.readTextFile(path)
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      return { defaultName: undefined, accounts: [] }
    }
    throw new ConfigError(`Failed to read config: ${path}`, {
      suggestion: `Check file permissions on ${path}.`,
    })
  }

  let raw: unknown
  try {
    raw = parseToml(text)
  } catch {
    throw new ConfigError(
      `Failed to parse ${path} as TOML.`,
      {
        suggestion:
          "The file may be corrupted. Delete it and re-run `timeslip auth login`.",
      },
    )
  }

  const config = validateTomlConfig(raw)
  const accounts: Account[] = []

  if (config.accounts) {
    for (const [name, entry] of Object.entries(config.accounts)) {
      accounts.push(
        tomlAccountToDomain(name, entry, name === config.default),
      )
    }
  }

  return { defaultName: config.default, accounts }
}

/** Load a single account by name. Returns undefined if not found. */
export async function loadAccount(
  name: string,
  configDir?: string,
): Promise<Account | undefined> {
  const { accounts } = await loadConfig(configDir)
  return accounts.find((a) => a.name === name)
}

// ---------------------------------------------------------------------------
// Write (atomic)
// ---------------------------------------------------------------------------

/** Persist the full account set atomically. */
export async function saveConfig(
  accounts: Account[],
  defaultName: string | undefined,
  configDir?: string,
): Promise<void> {
  const dir = resolveConfigDir(configDir)
  const path = join(dir, ACCOUNTS_FILE)

  // Build TOML structure
  const tomlAccounts: Record<string, TomlAccount> = {}
  for (const account of accounts) {
    tomlAccounts[account.name] = domainAccountToToml(account)
  }

  const config: TomlConfig = {
    accounts: tomlAccounts,
  }
  if (defaultName) {
    config.default = defaultName
  }

  const content = stringifyToml(config as Record<string, unknown>)

  // Ensure directory exists
  await Deno.mkdir(dir, { recursive: true })

  // Atomic write: temp file + rename
  const tmpPath = path + `.tmp.${crypto.randomUUID()}`
  try {
    await Deno.writeTextFile(tmpPath, content, { mode: 0o600 })
    await Deno.rename(tmpPath, path)
  } catch (_err) {
    // Clean up temp file on failure
    try {
      await Deno.remove(tmpPath)
    } catch {
      // Ignore cleanup errors
    }
    throw new ConfigError(
      `Failed to write config: ${path}`,
      { suggestion: `Check directory permissions on ${dir}.` },
    )
  }
}

// ---------------------------------------------------------------------------
// Account mutations
// ---------------------------------------------------------------------------

/** Add or update an account. Auto-sets as default if it's the first account. */
export async function upsertAccount(
  account: Account,
  configDir?: string,
): Promise<void> {
  const { defaultName, accounts } = await loadConfig(configDir)
  const idx = accounts.findIndex((a) => a.name === account.name)
  if (idx >= 0) {
    accounts[idx] = account
  } else {
    accounts.push(account)
  }

  // First account becomes the default automatically
  const newDefault = defaultName ??
    (accounts.length === 1 ? account.name : undefined)
  await saveConfig(accounts, newDefault, configDir)
}

/** Remove an account by name. Clears default if the removed account was default. */
export async function removeAccount(
  name: string,
  configDir?: string,
): Promise<boolean> {
  const { defaultName, accounts } = await loadConfig(configDir)
  const filtered = accounts.filter((a) => a.name !== name)
  if (filtered.length === accounts.length) return false

  const newDefault = defaultName === name ? undefined : defaultName
  await saveConfig(filtered, newDefault, configDir)
  return true
}

/** Set the default account. Throws ConfigError if the account doesn't exist. */
export async function setDefault(
  name: string,
  configDir?: string,
): Promise<void> {
  const { accounts } = await loadConfig(configDir)
  if (!accounts.find((a) => a.name === name)) {
    throw new ConfigError(`Account '${name}' not found.`, {
      suggestion: "Run `timeslip auth list` to see available accounts.",
    })
  }
  await saveConfig(accounts, name, configDir)
}

// ---------------------------------------------------------------------------
// Active-account resolution
// ---------------------------------------------------------------------------

export interface ResolveOptions {
  /** Explicit account name from --account flag. */
  flagAccount?: string
  /** Environment variable value for TIMESLIP_ACCOUNT. */
  envAccount?: string
  /** Override config directory for testing. */
  configDir?: string
}

/**
 * Resolve the active account.
 *
 * Resolution order:
 * 1. `--account` flag
 * 2. `TIMESLIP_ACCOUNT` environment variable
 * 3. Stored default profile
 *
 * Throws AuthError (via ConfigError) if no account can be resolved.
 */
export async function resolveAccount(
  options: ResolveOptions = {},
): Promise<Account> {
  const { defaultName, accounts } = await loadConfig(options.configDir)

  if (accounts.length === 0) {
    throw new ConfigError("No accounts configured.", {
      suggestion: "Run `timeslip auth login` to add an account.",
    })
  }

  const targetName = options.flagAccount ?? options.envAccount ?? defaultName

  if (targetName) {
    const account = accounts.find((a) => a.name === targetName)
    if (account) return account

    throw new ConfigError(`Account '${targetName}' not found.`, {
      suggestion: "Run `timeslip auth list` to see available accounts.",
    })
  }

  // No explicit target and no default — if there's exactly one account, use it
  if (accounts.length === 1) return accounts[0]

  throw new ConfigError(
    "Multiple accounts configured but no default is set.",
    { suggestion: "Run `timeslip auth default <name>` to set a default." },
  )
}

// ---------------------------------------------------------------------------
// Token redaction
// ---------------------------------------------------------------------------

/**
 * Redact a token string for safe display. Shows first 4 and last 4 characters
 * for tokens >= 12 chars, otherwise replaces entirely with asterisks.
 */
export function redactToken(token: string): string {
  if (token.length < 12) return "****"
  return `${token.slice(0, 4)}${"*".repeat(Math.min(token.length - 8, 16))}${
    token.slice(-4)
  }`
}

/**
 * Redact all token-shaped strings in a text block. Matches common bearer
 * token patterns (hex strings >= 20 chars, base64-like strings).
 */
export function redactTokensInText(text: string): string {
  // Match hex-like token strings (20+ alphanumeric chars)
  return text.replace(/\b[A-Za-z0-9_\-.]{20,}\b/g, (match) => {
    // Only redact if it looks like a token (contains mixed case or is very long)
    if (match.length >= 30 || /[a-z]/.test(match) && /[A-Z]/.test(match)) {
      return redactToken(match)
    }
    return match
  })
}

/**
 * Return an account summary safe for logging/diagnostics.
 * Tokens are always redacted.
 */
export function redactAccount(account: Account): Record<string, unknown> {
  return {
    name: account.name,
    provider: account.provider,
    accountId: account.accountId,
    accessToken: redactToken(account.accessToken),
    userId: account.userId,
    firstName: account.firstName,
    lastName: account.lastName,
    email: account.email,
    isDefault: account.isDefault,
  }
}
