import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { writeJsonSuccess } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { ENTRY_REMOVE_FIELDS, writeRobotRow } from "../../output/robot.ts"

export const removeCommand = new Command()
  .description("Delete a time entry")
  .arguments("<entry-id:number>")
  .action(async (_options, entryId) => {
    const account = await resolveAccount({
      flagAccount: getGlobalAccount(),
      envAccount: Deno.env.get("TIMESLIP_ACCOUNT"),
    })

    const provider = new HarvestProvider({
      accessToken: account.accessToken,
      accountId: account.accountId,
      userId: account.userId,
    })

    await provider.deleteEntry(entryId)

    if (isJsonMode()) {
      writeJsonSuccess({ entry_id: entryId })
    } else if (isRobotMode()) {
      writeRobotRow({ entry_id: entryId }, ENTRY_REMOVE_FIELDS)
    } else {
      printConfirmation("Deleted", `entry #${entryId}`)
    }
  })
