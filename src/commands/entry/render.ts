import type { TimeEntry } from "../../domain/mod.ts"

/** Normalize a TimeEntry into a stable JSON-safe record for output. */
export function renderEntry(entry: TimeEntry): Record<string, unknown> {
  return {
    id: entry.id,
    date: entry.date,
    hours: entry.hours,
    rounded_hours: entry.roundedHours,
    notes: entry.notes,
    is_running: entry.isRunning,
    is_billable: entry.isBillable,
    is_locked: entry.isLocked,
    project_id: entry.projectId,
    project_name: entry.projectName,
    task_id: entry.taskId,
    task_name: entry.taskName,
    client_id: entry.clientId,
    client_name: entry.clientName,
  }
}
