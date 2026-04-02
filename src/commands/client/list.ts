import { Command } from "@cliffy/command"
import { resolveAccount } from "../../config/mod.ts"
import { HarvestProvider } from "../../providers/harvest/provider.ts"
import { ValidationError } from "../../errors/mod.ts"
import { writeJsonList } from "../../output/json.ts"
import { type Column, printTable } from "../../output/table.ts"
import { getGlobalAccount, isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { CLIENT_FIELDS, writeRobotRows } from "../../output/robot.ts"
import type { ProjectAssignment } from "../../domain/mod.ts"
import { gray } from "@std/fmt/colors"

/** A client with its associated projects, derived from project assignments. */
interface ClientWithProjects {
  clientId: number
  clientName: string
  projects: {
    projectId: number
    projectName: string
    projectCode: string | null
  }[]
}

/**
 * Deduplicate clients from project assignments.
 * Deterministic: sorted by client ID, projects sorted by project ID.
 */
export function deduplicateClients(
  assignments: ProjectAssignment[],
): ClientWithProjects[] {
  const clientMap = new Map<number, ClientWithProjects>()

  for (const a of assignments) {
    const existing = clientMap.get(a.client.id)
    const project = {
      projectId: a.projectId,
      projectName: a.projectName,
      projectCode: a.projectCode,
    }

    if (existing) {
      existing.projects.push(project)
    } else {
      clientMap.set(a.client.id, {
        clientId: a.client.id,
        clientName: a.client.name,
        projects: [project],
      })
    }
  }

  // Sort clients by ID for deterministic output
  const clients = [...clientMap.values()].sort(
    (a, b) => a.clientId - b.clientId,
  )

  // Sort each client's projects by project ID
  for (const client of clients) {
    client.projects.sort((a, b) => a.projectId - b.projectId)
  }

  return clients
}

/** Render a ClientWithProjects into a stable JSON-safe record. */
function renderClient(client: ClientWithProjects): Record<string, unknown> {
  return {
    client_id: client.clientId,
    client_name: client.clientName,
    projects: client.projects.map((p) => ({
      project_id: p.projectId,
      project_name: p.projectName,
      project_code: p.projectCode,
    })),
  }
}

export const clientListCommand = new Command()
  .description("List clients from project assignments")
  .option("--limit <n:number>", "Maximum clients to return")
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

    // Fetch all project assignments (no limit — we need full data for dedup)
    const result = await provider.listAllProjectAssignments({
      perPage: options.pageSize,
    })

    const clients = deduplicateClients(result.items)

    // Apply client-level limit after deduplication
    const limited = options.limit !== undefined
      ? clients.slice(0, options.limit)
      : clients
    const truncated = options.limit !== undefined &&
      clients.length > options.limit

    if (isJsonMode()) {
      writeJsonList(
        limited.map(renderClient),
        {
          total_entries: clients.length,
          pages_fetched: result.meta.pagesFetched,
          truncated,
        },
      )
    } else if (isRobotMode()) {
      writeRobotRows(limited.map(renderClient), CLIENT_FIELDS)
    } else {
      if (limited.length === 0) {
        console.log(gray("No clients found."))
        return
      }

      const columns: Column[] = [
        { header: "CLIENT ID", minWidth: 9, align: "right" },
        { header: "CLIENT", maxWidth: 28 },
        { header: "PROJECTS", maxWidth: 48 },
      ]

      const rows = limited.map((c) => [
        String(c.clientId),
        c.clientName,
        c.projects.map((p) => p.projectName).join(", "),
      ])

      printTable(columns, rows)

      if (truncated) {
        console.log(
          gray(
            `\nShowing ${limited.length} of ${clients.length} clients (limited).`,
          ),
        )
      }
    }
  })
