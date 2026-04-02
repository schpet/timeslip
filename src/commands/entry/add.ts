import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { ValidationError } from "../../errors/mod.ts"
import { writeJson } from "../../output/json.ts"
import { printConfirmation } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { renderEntry } from "./render.ts"
import { ENTRY_FIELDS, writeRobotRow } from "../../output/robot.ts"

export const addCommand = new Command()
  .description("Create a time entry")
  .option("--project-id <id:number>", "Project ID", { required: true })
  .option("--task-id <id:number>", "Task ID", { required: true })
  .option("--date <date:string>", "Spent date (YYYY-MM-DD)", { required: true })
  .option(
    "--hours <hours:number>",
    "Hours spent (omit to start a running timer)",
  )
  .option("--description <text:string>", "Notes for the entry")
  .action(async (options) => {
    if (options.hours !== undefined && options.hours === 0) {
      throw new ValidationError(
        "Cannot set --hours to 0. Omit --hours to start a running timer instead.",
        {
          suggestion:
            "Use `timeslip entry add --project-id ... --task-id ... --date ...` without --hours to start a timer.",
        },
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

    const entry = await provider.createEntry({
      projectId: options.projectId,
      taskId: options.taskId,
      date: options.date,
      hours: options.hours,
      notes: options.description,
    })

    if (isJsonMode()) {
      writeJson(renderEntry(entry))
    } else if (isRobotMode()) {
      writeRobotRow(renderEntry(entry), ENTRY_FIELDS)
    } else {
      const detail = entry.isRunning
        ? `(timer running) ${entry.projectName} / ${entry.taskName}`
        : `${entry.hours}h ${entry.projectName} / ${entry.taskName}`
      printConfirmation("Created", `entry #${entry.id}`, detail)
    }
  })
