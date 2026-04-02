import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { writeJson } from "../../output/json.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { AUTH_WHOAMI_FIELDS, writeRobotRow } from "../../output/robot.ts"
import { bold, gray, green } from "@std/fmt/colors"

export const whoamiCommand = new Command()
  .description("Verify credentials and print identity")
  .action(async () => {
    const account = await resolveAccount({
      flagAccount: getGlobalAccount(),
      envAccount: Deno.env.get("TIMESLIP_ACCOUNT"),
    })

    // Revalidate against the provider
    const provider = new HarvestProvider({
      accessToken: account.accessToken,
      accountId: account.accountId,
      userId: account.userId,
    })

    const identity = await provider.whoAmI()

    if (isJsonMode()) {
      writeJson({
        account: account.name,
        provider: account.provider,
        account_id: account.accountId,
        is_default: account.isDefault,
        stored: {
          user_id: account.userId,
          first_name: account.firstName,
          last_name: account.lastName,
          email: account.email,
        },
        remote: {
          user_id: identity.id,
          first_name: identity.firstName,
          last_name: identity.lastName,
          email: identity.email,
        },
      })
    } else if (isRobotMode()) {
      // Robot mode emits the remote (verified) identity
      writeRobotRow({
        account: account.name,
        provider: account.provider,
        account_id: account.accountId,
        is_default: account.isDefault,
        user_id: identity.id,
        first_name: identity.firstName,
        last_name: identity.lastName,
        email: identity.email,
      }, AUTH_WHOAMI_FIELDS)
    } else {
      console.log(`${bold("Account:")}   ${account.name}`)
      console.log(`${bold("Provider:")}  ${account.provider}`)
      console.log(
        `${bold("Account ID:")} ${account.accountId}`,
      )
      console.log(
        `${bold("Default:")}   ${account.isDefault ? green("yes") : "no"}`,
      )
      console.log("")
      console.log(
        `${bold("User:")}      ${identity.firstName} ${identity.lastName}`,
      )
      console.log(`${bold("Email:")}     ${identity.email}`)
      console.log(`${bold("User ID:")}   ${identity.id}`)

      // Flag if stored and remote identity diverge
      if (
        account.userId !== identity.id ||
        account.firstName !== identity.firstName ||
        account.lastName !== identity.lastName ||
        account.email !== identity.email
      ) {
        console.log("")
        console.log(
          gray(
            "Note: stored identity differs from remote. Re-run `timeslip auth login --overwrite` to update.",
          ),
        )
      }
    }
  })
