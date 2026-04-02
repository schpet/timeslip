import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { ValidationError } from "../../errors/mod.ts"
import { writeJsonList } from "../../output/json.ts"
import { type Column, printTable } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { PROJECT_FIELDS, writeRobotRows } from "../../output/robot.ts"
import type { ProjectAssignment } from "../../domain/mod.ts"
import { gray } from "@std/fmt/colors"

/** Render a ProjectAssignment into a stable JSON-safe record. */
export function renderProject(
  assignment: ProjectAssignment,
): Record<string, unknown> {
  return {
    project_id: assignment.projectId,
    project_name: assignment.projectName,
    project_code: assignment.projectCode,
    is_active: assignment.isActive,
    client_id: assignment.client.id,
    client_name: assignment.client.name,
    tasks: assignment.tasks.map((t) => ({
      task_id: t.id,
      task_name: t.name,
      billable: t.billable,
    })),
  }
}

export const projectListCommand = new Command()
  .description("List assigned projects and tasks")
  .option("--limit <n:number>", "Maximum projects to return")
  .option("--page-size <n:number>", "Projects per API page")
  .action(async (options) => {
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

    const result = await provider.listAllProjectAssignments({
      perPage: options.pageSize,
      limit: options.limit,
    })

    if (isJsonMode()) {
      writeJsonList(
        result.items.map(renderProject),
        {
          total_entries: result.meta.totalEntries,
          pages_fetched: result.meta.pagesFetched,
          truncated: result.meta.truncated,
        },
      )
    } else if (isRobotMode()) {
      writeRobotRows(result.items.map(renderProject), PROJECT_FIELDS)
    } else {
      if (result.items.length === 0) {
        console.log(gray("No project assignments found."))
        return
      }

      const columns: Column[] = [
        { header: "PROJECT ID", minWidth: 10, align: "right" },
        { header: "PROJECT", maxWidth: 28 },
        { header: "CLIENT", maxWidth: 20 },
        { header: "TASKS", maxWidth: 40 },
      ]

      const rows = result.items.map((a) => [
        String(a.projectId),
        a.projectCode ? `${a.projectName} (${a.projectCode})` : a.projectName,
        a.client.name,
        a.tasks.map((t) => `${t.id}:${t.name}`).join(", "),
      ])

      printTable(columns, rows)

      if (result.meta.truncated) {
        console.log(
          gray(
            `\nShowing ${result.items.length} of ${result.meta.totalEntries} projects (limited).`,
          ),
        )
      }
    }
  })
