import { Command } from "@cliffy/command"
import { loadConfig, setDefault } from "../../config/mod.ts"
import { writeJsonSuccess } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { AUTH_MUTATION_FIELDS, writeRobotRow } from "../../output/robot.ts"

export const defaultCommand = new Command()
  .description("Set the default account")
  .arguments("<name:string>")
  .action(async (_options, name: string) => {
    await setDefault(name)

    if (isJsonMode()) {
      const { accounts } = await loadConfig()
      const account = accounts.find((a) => a.name === name)
      writeJsonSuccess({
        default: name,
        provider: account?.provider ?? null,
        account_id: account?.accountId ?? null,
        email: account?.email ?? null,
      })
    } else if (isRobotMode()) {
      const { accounts } = await loadConfig()
      const account = accounts.find((a) => a.name === name)
      writeRobotRow({
        account: name,
        provider: account?.provider ?? "",
        account_id: account?.accountId ?? "",
        user_id: account?.userId ?? "",
        email: account?.email ?? "",
      }, AUTH_MUTATION_FIELDS)
    } else {
      printConfirmation("Default set", `to '${name}'`)
    }
  })
