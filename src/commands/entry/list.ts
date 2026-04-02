import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { ValidationError } from "../../errors/mod.ts"
import { writeJsonList } from "../../output/json.ts"
import { type Column, printTable } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { renderEntry } from "./render.ts"
import { ENTRY_FIELDS, writeRobotRows } from "../../output/robot.ts"
import type { ListAllEntriesOptions } from "../../providers/mod.ts"
import { gray } from "@std/fmt/colors"

/** Format today's date as YYYY-MM-DD in local time. */
function todayDate(): string {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}

/** Validate a YYYY-MM-DD date string. */
function isValidDate(s: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s))
}

export const listCommand = new Command()
  .description("List time entries (default: today)")
  .option("--today", "Show today's entries (default)")
  .option("--from <date:string>", "Start date (YYYY-MM-DD)")
  .option("--to <date:string>", "End date (YYYY-MM-DD)")
  .option("--all", "Fetch all entries (no date filter)")
  .option("--running", "Show only running timers")
  .option("--project-id <id:number>", "Filter by project ID")
  .option("--client-id <id:number>", "Filter by client ID")
  .option("--limit <n:number>", "Maximum entries to return")
  .option("--page-size <n:number>", "Entries per API page")
  .action(async (options) => {
    // Validate date scope combinations
    const hasDateRange = options.from !== undefined || options.to !== undefined
    const scopeCount = [options.today, hasDateRange, options.all].filter(
      Boolean,
    ).length

    if (scopeCount > 1) {
      throw new ValidationError(
        "Cannot combine --today, --from/--to, and --all. Choose one date scope.",
        {
          suggestion:
            "Use --today for today's entries, --from/--to for a date range, or --all for everything.",
        },
      )
    }

    if (options.from !== undefined && !isValidDate(options.from)) {
      throw new ValidationError(
        `Invalid --from date: "${options.from}". Expected YYYY-MM-DD.`,
      )
    }
    if (options.to !== undefined && !isValidDate(options.to)) {
      throw new ValidationError(
        `Invalid --to date: "${options.to}". Expected YYYY-MM-DD.`,
      )
    }

    if (
      options.from !== undefined &&
      options.to !== undefined &&
      options.from > options.to
    ) {
      throw new ValidationError(
        `--from (${options.from}) must not be after --to (${options.to}).`,
      )
    }

    if (options.limit !== undefined && options.limit < 1) {
      throw new ValidationError("--limit must be at least 1.")
    }

    if (options.pageSize !== undefined && options.pageSize < 1) {
      throw new ValidationError("--page-size must be at least 1.")
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

    // Build list options
    const listOptions: ListAllEntriesOptions = {}

    if (options.all) {
      // No date filter — fetch everything
    } else if (hasDateRange) {
      listOptions.from = options.from
      listOptions.to = options.to
    } else {
      // Default: today
      const today = todayDate()
      listOptions.from = today
      listOptions.to = today
    }

    if (options.running) listOptions.isRunning = true
    if (options.projectId !== undefined) {
      listOptions.projectId = options.projectId
    }
    if (options.clientId !== undefined) {
      listOptions.clientId = options.clientId
    }
    if (options.limit !== undefined) listOptions.limit = options.limit
    if (options.pageSize !== undefined) listOptions.perPage = options.pageSize

    const result = await provider.listAllEntries(listOptions)

    if (isJsonMode()) {
      writeJsonList(
        result.items.map(renderEntry),
        {
          total_entries: result.meta.totalEntries,
          pages_fetched: result.meta.pagesFetched,
          truncated: result.meta.truncated,
        },
      )
    } else if (isRobotMode()) {
      writeRobotRows(result.items.map(renderEntry), ENTRY_FIELDS)
    } else {
      if (result.items.length === 0) {
        console.log(gray("No entries found."))
        return
      }

      const columns: Column[] = [
        { header: "ID", minWidth: 6, align: "right" },
        { header: "DATE", minWidth: 10 },
        { header: "HOURS", minWidth: 5, align: "right" },
        { header: "PROJECT", maxWidth: 24 },
        { header: "TASK", maxWidth: 24 },
        { header: "NOTES", maxWidth: 32 },
      ]

      const rows = result.items.map((e) => [
        String(e.id),
        e.date,
        e.isRunning ? "run" : String(e.hours),
        e.projectName,
        e.taskName,
        e.notes ?? "",
      ])

      printTable(columns, rows)

      if (result.meta.truncated) {
        console.log(
          gray(
            `\nShowing ${result.items.length} of ${result.meta.totalEntries} entries (limited).`,
          ),
        )
      }
    }
  })
