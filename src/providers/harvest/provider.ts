/**
 * Harvest provider adapter.
 *
 * Implements the Provider interface using the Harvest HTTP client,
 * paginator, and mappers. Commands call this — never the raw client.
 */

import type {
  CreateEntryInput,
  ListAllEntriesOptions,
  ListAllEntriesResult,
  ListAllProjectAssignmentsOptions,
  ListAllProjectAssignmentsResult,
  ListEntriesOptions,
  ListProjectAssignmentsOptions,
  Provider,
  UpdateEntryInput,
} from "../mod.ts"
import type {
  Identity,
  Page,
  ProjectAssignment,
  TimeEntry,
} from "../../domain/mod.ts"
import type { components } from "./generated/harvest.openapi.ts"
import { HarvestClient, type HarvestClientOptions } from "./client.ts"
import { fetchPage, paginate } from "./paginator.ts"
import { mapProjectAssignment, mapTimeEntry, mapUser } from "./mappers.ts"

type HarvestUser = components["schemas"]["User"]
type HarvestTimeEntry = components["schemas"]["TimeEntry"]

export interface HarvestProviderOptions extends HarvestClientOptions {
  /** The authenticated user's Harvest user ID, for scoping list queries. */
  userId: number
}

export class HarvestProvider implements Provider {
  readonly #client: HarvestClient
  readonly #userId: number

  constructor(options: HarvestProviderOptions) {
    this.#client = new HarvestClient(options)
    this.#userId = options.userId
  }

  async whoAmI(): Promise<Identity> {
    const raw = await this.#client.request<HarvestUser>("/users/me")
    return mapUser(raw)
  }

  async listProjectAssignments(
    options?: ListProjectAssignmentsOptions,
  ): Promise<Page<ProjectAssignment>> {
    const params: Record<string, string | number | boolean | undefined> = {}
    if (options?.page !== undefined) params["page"] = options.page
    if (options?.perPage !== undefined) params["per_page"] = options.perPage

    const result = await fetchPage<components["schemas"]["ProjectAssignment"]>(
      this.#client,
      "/users/me/project_assignments",
      "project_assignments",
      params,
    )

    return {
      items: result.items.map(mapProjectAssignment),
      page: result.page,
      totalPages: result.totalPages,
      totalEntries: result.totalEntries,
      nextPage: result.nextPage,
      previousPage: result.previousPage,
    }
  }

  async listAllProjectAssignments(
    options?: ListAllProjectAssignmentsOptions,
  ): Promise<ListAllProjectAssignmentsResult> {
    const result = await paginate<components["schemas"]["ProjectAssignment"]>(
      this.#client,
      "/users/me/project_assignments",
      "project_assignments",
      {},
      { perPage: options?.perPage, limit: options?.limit },
    )

    return {
      items: result.items.map(mapProjectAssignment),
      meta: result.meta,
    }
  }

  async listEntries(options?: ListEntriesOptions): Promise<Page<TimeEntry>> {
    const params: Record<string, string | number | boolean | undefined> = {
      user_id: this.#userId,
    }
    if (options?.from !== undefined) params["from"] = options.from
    if (options?.to !== undefined) params["to"] = options.to
    if (options?.projectId !== undefined) {
      params["project_id"] = options.projectId
    }
    if (options?.clientId !== undefined) {
      params["client_id"] = options.clientId
    }
    if (options?.isRunning !== undefined) {
      params["is_running"] = options.isRunning
    }
    if (options?.page !== undefined) params["page"] = options.page
    if (options?.perPage !== undefined) params["per_page"] = options.perPage

    const result = await fetchPage<HarvestTimeEntry>(
      this.#client,
      "/time_entries",
      "time_entries",
      params,
    )

    return {
      items: result.items.map(mapTimeEntry),
      page: result.page,
      totalPages: result.totalPages,
      totalEntries: result.totalEntries,
      nextPage: result.nextPage,
      previousPage: result.previousPage,
    }
  }

  async listAllEntries(
    options?: ListAllEntriesOptions,
  ): Promise<ListAllEntriesResult> {
    const params: Record<string, string | number | boolean | undefined> = {
      user_id: this.#userId,
    }
    if (options?.from !== undefined) params["from"] = options.from
    if (options?.to !== undefined) params["to"] = options.to
    if (options?.projectId !== undefined) {
      params["project_id"] = options.projectId
    }
    if (options?.clientId !== undefined) {
      params["client_id"] = options.clientId
    }
    if (options?.isRunning !== undefined) {
      params["is_running"] = options.isRunning
    }

    const result = await paginate<HarvestTimeEntry>(
      this.#client,
      "/time_entries",
      "time_entries",
      params,
      { perPage: options?.perPage, limit: options?.limit },
    )

    return {
      items: result.items.map(mapTimeEntry),
      meta: result.meta,
    }
  }

  async createEntry(input: CreateEntryInput): Promise<TimeEntry> {
    const raw = await this.#client.request<HarvestTimeEntry>("/time_entries", {
      method: "POST",
      body: {
        project_id: input.projectId,
        task_id: input.taskId,
        spent_date: input.date,
        hours: input.hours,
        notes: input.notes,
      },
    })
    return mapTimeEntry(raw)
  }

  async getEntry(id: number): Promise<TimeEntry> {
    const raw = await this.#client.request<HarvestTimeEntry>(
      `/time_entries/${id}`,
    )
    return mapTimeEntry(raw)
  }

  async updateEntry(id: number, input: UpdateEntryInput): Promise<TimeEntry> {
    const body: Record<string, unknown> = {}
    if (input.hours !== undefined) body["hours"] = input.hours
    if (input.notes !== undefined) body["notes"] = input.notes
    if (input.date !== undefined) body["spent_date"] = input.date
    if (input.projectId !== undefined) body["project_id"] = input.projectId
    if (input.taskId !== undefined) body["task_id"] = input.taskId

    const raw = await this.#client.request<HarvestTimeEntry>(
      `/time_entries/${id}`,
      { method: "PATCH", body },
    )
    return mapTimeEntry(raw)
  }

  async deleteEntry(id: number): Promise<void> {
    await this.#client.request<void>(`/time_entries/${id}`, {
      method: "DELETE",
    })
  }

  async stopTimer(id: number): Promise<TimeEntry> {
    const raw = await this.#client.request<HarvestTimeEntry>(
      `/time_entries/${id}/stop`,
      { method: "PATCH" },
    )
    return mapTimeEntry(raw)
  }

  async restartTimer(id: number): Promise<TimeEntry> {
    const raw = await this.#client.request<HarvestTimeEntry>(
      `/time_entries/${id}/restart`,
      { method: "PATCH" },
    )
    return mapTimeEntry(raw)
  }
}
