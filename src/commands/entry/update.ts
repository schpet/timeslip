import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { ValidationError } from "../../errors/mod.ts"
import type { UpdateEntryInput } from "../../providers/mod.ts"
import { writeJson } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { renderEntry } from "./render.ts"
import { ENTRY_FIELDS, writeRobotRow } from "../../output/robot.ts"

/** Build a sparse patch from explicitly-provided flags. */
export function buildPatch(options: {
  hours?: number
  description?: string
  clearDescription?: boolean
  date?: string
  projectId?: number
  taskId?: number
}): UpdateEntryInput {
  const patch: UpdateEntryInput = {}

  if (options.hours !== undefined) patch.hours = options.hours
  if (options.clearDescription) {
    patch.notes = ""
  } else if (options.description !== undefined) {
    patch.notes = options.description
  }
  if (options.date !== undefined) patch.date = options.date
  if (options.projectId !== undefined) patch.projectId = options.projectId
  if (options.taskId !== undefined) patch.taskId = options.taskId

  return patch
}

export const updateCommand = new Command()
  .description("Modify an existing time entry")
  .arguments("<entry-id:number>")
  .option("--hours <hours:number>", "Update hours spent")
  .option("--description <text:string>", "Update notes")
  .option("--clear-description", "Set description to blank")
  .option("--date <date:string>", "Update spent date (YYYY-MM-DD)")
  .option("--project-id <id:number>", "Update project ID")
  .option("--task-id <id:number>", "Update task ID")
  .action(async (options, entryId) => {
    if (options.description !== undefined && options.clearDescription) {
      throw new ValidationError(
        "Cannot use --description and --clear-description together.",
      )
    }

    const patch = buildPatch({
      hours: options.hours,
      description: options.description,
      clearDescription: options.clearDescription,
      date: options.date,
      projectId: options.projectId,
      taskId: options.taskId,
    })

    if (Object.keys(patch).length === 0) {
      throw new ValidationError(
        "No fields to update. Provide at least one of: --hours, --description, --clear-description, --date, --project-id, --task-id.",
      )
    }

    const account = await resolveAccount({
      flagAccount: getGlobalAccount(),
      envAccount: Deno.env.get("TIMESLIP_ACCOUNT"),
    })

    const provider = new HarvestProvider({
      accessToken: account.accessToken,
      accountId: account.accountId,
      userId: account.userId,
    })

    const entry = await provider.updateEntry(entryId, patch)

    if (isJsonMode()) {
      writeJson(renderEntry(entry))
    } else if (isRobotMode()) {
      writeRobotRow(renderEntry(entry), ENTRY_FIELDS)
    } else {
      const detail = `${entry.hours}h ${entry.projectName} / ${entry.taskName}`
      printConfirmation("Updated", `entry #${entry.id}`, detail)
    }
  })
