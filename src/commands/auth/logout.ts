import { Command } from "@cliffy/command"
import { loadConfig, saveConfig } from "../../config/mod.ts"
import { ConfigError } from "../../errors/mod.ts"
import { writeJsonSuccess } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { AUTH_MUTATION_FIELDS, writeRobotRow } from "../../output/robot.ts"

export const logoutCommand = new Command()
  .description("Remove a stored account")
  .arguments("<name:string>")
  .action(async (_options, name: string) => {
    // Load current state before removal, to handle default promotion
    const { defaultName, accounts } = await loadConfig()
    const target = accounts.find((a) => a.name === name)
    if (!target) {
      throw new ConfigError(`Account '${name}' not found.`, {
        suggestion: "Run `timeslip auth list` to see available accounts.",
      })
    }

    const remaining = accounts.filter((a) => a.name !== name)
    let newDefault = defaultName === name ? undefined : defaultName

    // If we removed the default and there's exactly one remaining, promote it
    if (defaultName === name && remaining.length === 1) {
      newDefault = remaining[0].name
    }

    await saveConfig(remaining, newDefault)

    const promoted = defaultName === name && newDefault !== undefined
      ? newDefault
      : null

    if (isJsonMode()) {
      writeJsonSuccess({
        removed: name,
        promoted_default: promoted,
        remaining_accounts: remaining.length,
      })
    } else if (isRobotMode()) {
      writeRobotRow({
        account: name,
        provider: target.provider,
        account_id: target.accountId,
        user_id: target.userId,
        email: target.email,
      }, AUTH_MUTATION_FIELDS)
    } else {
      printConfirmation("Logged out", `account '${name}'`)
      if (promoted) {
        console.log(`  Default promoted to '${promoted}'.`)
      } else if (defaultName === name && remaining.length > 1) {
        console.log(
          "  No default account set. Run `timeslip auth default <name>` to choose one.",
        )
      }
    }
  })
