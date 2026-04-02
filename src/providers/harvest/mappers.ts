/**
 * Mappers from Harvest API response shapes to domain types.
 *
 * These normalize nullable/optional fields from the generated OpenAPI
 * types into the clean domain types that commands consume.
 */

import type { components } from "./generated/harvest.openapi.ts"
import type {
  ClientSummary,
  Identity,
  ProjectAssignment,
  TaskSummary,
  TimeEntry,
} from "../../domain/mod.ts"

type HarvestUser = components["schemas"]["User"]
type HarvestTimeEntry = components["schemas"]["TimeEntry"]
type HarvestProjectAssignment = components["schemas"]["ProjectAssignment"]
type HarvestTaskAssignment = components["schemas"]["TaskAssignment"]

export function mapUser(raw: HarvestUser): Identity {
  return {
    id: raw.id ?? 0,
    firstName: raw.first_name ?? "",
    lastName: raw.last_name ?? "",
    email: raw.email ?? "",
  }
}

export function mapTimeEntry(raw: HarvestTimeEntry): TimeEntry {
  return {
    id: raw.id ?? 0,
    date: raw.spent_date ?? "",
    hours: raw.hours ?? 0,
    roundedHours: raw.rounded_hours ?? 0,
    notes: raw.notes ?? null,
    isRunning: raw.is_running ?? false,
    isBillable: raw.billable ?? false,
    isLocked: raw.is_locked ?? false,
    projectId: raw.project?.id ?? 0,
    projectName: raw.project?.name ?? "",
    taskId: raw.task?.id ?? 0,
    taskName: raw.task?.name ?? "",
    clientId: raw.client?.id ?? 0,
    clientName: raw.client?.name ?? "",
  }
}

export function mapProjectAssignment(
  raw: HarvestProjectAssignment,
): ProjectAssignment {
  return {
    id: raw.id ?? 0,
    projectId: raw.project?.id ?? 0,
    projectName: raw.project?.name ?? "",
    projectCode: raw.project?.code ?? null,
    client: mapClientSummary(raw.client),
    tasks: (raw.task_assignments ?? []).map(mapTaskFromAssignment),
    isActive: raw.is_active ?? false,
  }
}

function mapClientSummary(
  raw: { id?: number | null; name?: string | null } | null | undefined,
): ClientSummary {
  return {
    id: raw?.id ?? 0,
    name: raw?.name ?? "",
  }
}

function mapTaskFromAssignment(raw: HarvestTaskAssignment): TaskSummary {
  return {
    id: raw.task?.id ?? 0,
    name: raw.task?.name ?? "",
    billable: raw.billable ?? false,
  }
}
