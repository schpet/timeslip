import { Command } from "@cliffy/command"
import { HarvestClient } from "../../providers/harvest/client.ts"
import { mapUser } from "../../providers/harvest/mappers.ts"
import { loadConfig, redactToken, upsertAccount } from "../../config/mod.ts"
import { AuthError, ValidationError } from "../../errors/mod.ts"
import { writeJson } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { AUTH_MUTATION_FIELDS, writeRobotRow } from "../../output/robot.ts"
import type { Account } from "../../domain/mod.ts"

/** Infer Harvest account ID from PAT prefix if possible. */
export function inferAccountId(token: string): string | undefined {
  // Harvest PATs are sometimes prefixed with the account id
  // Format: pat-ACCOUNTID.XXXXX
  const match = token.match(/^pat-(\d+)\./)
  return match ? match[1] : undefined
}

/** Read a token from the specified source. */
export function resolveToken(options: {
  token?: string
  tokenStdin?: boolean
  tokenEnv?: string
}): string {
  if (options.token) return options.token.trim()

  if (options.tokenStdin) {
    const buf = new Uint8Array(4096)
    const n = Deno.stdin.readSync(buf)
    if (n === null || n === 0) {
      throw new ValidationError("No token received on stdin.")
    }
    return new TextDecoder().decode(buf.subarray(0, n)).trim()
  }

  if (options.tokenEnv) {
    const val = Deno.env.get(options.tokenEnv)
    if (!val) {
      throw new ValidationError(
        `Environment variable '${options.tokenEnv}' is not set or empty.`,
      )
    }
    return val.trim()
  }

  throw new ValidationError(
    "A token source is required.",
    {
      suggestion:
        "Provide your Harvest Personal Access Token via --token, --token-stdin, or --token-env.",
    },
  )
}

export const loginCommand = new Command()
  .description("Store credentials for a Harvest account")
  .option("--token <token:string>", "Harvest Personal Access Token")
  .option("--token-stdin", "Read token from stdin")
  .option(
    "--token-env <var:string>",
    "Read token from the named environment variable",
  )
  .option(
    "--account-id <id:string>",
    "Harvest Account ID (inferred from PAT prefix when possible)",
  )
  .option("--account <account:string>", "Profile name for this account")
  .option("--name <name:string>", "Profile name for this account", {
    default: "default",
  })
  .option("--overwrite", "Overwrite an existing profile with the same name")
  .action(async (options) => {
    const token = resolveToken({
      token: options.token,
      tokenStdin: options.tokenStdin,
      tokenEnv: options.tokenEnv,
    })

    // Resolve account ID
    const accountId = options.accountId ?? inferAccountId(token)
    if (!accountId) {
      throw new ValidationError(
        "Cannot infer Harvest Account ID from the token.",
        {
          suggestion:
            "Provide --account-id explicitly. Find it in Harvest under Settings > Choose Account.",
        },
      )
    }

    const profileName = options.account ?? options.name!

    // Check for existing profile unless --overwrite
    const { accounts } = await loadConfig()
    const existing = accounts.find((a) => a.name === profileName)
    if (existing && !options.overwrite) {
      throw new AuthError(
        `Account '${profileName}' already exists.`,
        {
          suggestion:
            "Use --overwrite to replace it, or choose a different --account/--name.",
        },
      )
    }

    // Validate credentials via GET /users/me
    const client = new HarvestClient({ accessToken: token, accountId })
    const rawUser = await client.request<Parameters<typeof mapUser>[0]>(
      "/users/me",
    )
    const identity = mapUser(rawUser)

    // Build and persist account
    const isFirst = accounts.length === 0 ||
      (accounts.length === 1 && existing !== undefined)
    const account: Account = {
      name: profileName,
      provider: "harvest",
      accountId,
      accessToken: token,
      userId: identity.id,
      firstName: identity.firstName,
      lastName: identity.lastName,
      email: identity.email,
      isDefault: isFirst,
    }

    await upsertAccount(account)

    if (isJsonMode()) {
      writeJson({
        ok: true,
        account: profileName,
        provider: "harvest",
        account_id: accountId,
        user_id: identity.id,
        email: identity.email,
        name: `${identity.firstName} ${identity.lastName}`,
        is_default: isFirst || existing?.isDefault === true,
      })
    } else if (isRobotMode()) {
      writeRobotRow({
        account: profileName,
        provider: "harvest",
        account_id: accountId,
        user_id: identity.id,
        email: identity.email,
      }, AUTH_MUTATION_FIELDS)
    } else {
      printConfirmation(
        "Logged in",
        `as ${identity.firstName} ${identity.lastName} (${identity.email})`,
        `account=${profileName} token=${redactToken(token)}`,
      )
    }
  })
