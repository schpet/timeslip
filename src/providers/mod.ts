/**
 * Provider interface — the contract that every backend must implement.
 *
 * Commands depend on this interface, never on provider internals.
 * Each provider module supplies an adapter that returns domain types.
 */

import type {
  Identity,
  Page,
  PaginationMeta,
  ProjectAssignment,
  TimeEntry,
} from "../domain/mod.ts"

/** Options for listing time entries (single page). */
export interface ListEntriesOptions {
  from?: string
  to?: string
  projectId?: number
  clientId?: number
  isRunning?: boolean
  page?: number
  perPage?: number
}

/** Options for listing all entries with pagination traversal. */
export interface ListAllEntriesOptions {
  from?: string
  to?: string
  projectId?: number
  clientId?: number
  isRunning?: boolean
  perPage?: number
  limit?: number
}

/** Result of an exhaustive list operation with pagination metadata. */
export interface ListAllEntriesResult {
  items: TimeEntry[]
  meta: PaginationMeta
}

/** Options for listing project assignments. */
export interface ListProjectAssignmentsOptions {
  page?: number
  perPage?: number
}

/** Options for listing all project assignments with pagination traversal. */
export interface ListAllProjectAssignmentsOptions {
  perPage?: number
  limit?: number
}

/** Result of an exhaustive project-assignment list operation. */
export interface ListAllProjectAssignmentsResult {
  items: ProjectAssignment[]
  meta: PaginationMeta
}

/** Fields for creating a time entry. */
export interface CreateEntryInput {
  projectId: number
  taskId: number
  date: string
  hours?: number
  notes?: string
}

/** Fields for updating a time entry. */
export interface UpdateEntryInput {
  hours?: number
  notes?: string
  date?: string
  projectId?: number
  taskId?: number
}

/** The provider contract. */
export interface Provider {
  /** Verify credentials and return the authenticated user. */
  whoAmI(): Promise<Identity>

  /** List project assignments for the current user. */
  listProjectAssignments(
    options?: ListProjectAssignmentsOptions,
  ): Promise<Page<ProjectAssignment>>

  /** List all project assignments, walking every page, with optional limit. */
  listAllProjectAssignments(
    options?: ListAllProjectAssignmentsOptions,
  ): Promise<ListAllProjectAssignmentsResult>

  /** List time entries with optional filters. */
  listEntries(options?: ListEntriesOptions): Promise<Page<TimeEntry>>

  /** List all entries, walking every page, with optional limit. */
  listAllEntries(options?: ListAllEntriesOptions): Promise<ListAllEntriesResult>

  /** Create a new time entry. */
  createEntry(input: CreateEntryInput): Promise<TimeEntry>

  /** Retrieve a single time entry by ID. */
  getEntry(id: number): Promise<TimeEntry>

  /** Update an existing time entry. */
  updateEntry(id: number, input: UpdateEntryInput): Promise<TimeEntry>

  /** Delete a time entry. */
  deleteEntry(id: number): Promise<void>

  /** Stop a running timer. */
  stopTimer(id: number): Promise<TimeEntry>

  /** Restart a stopped timer. */
  restartTimer(id: number): Promise<TimeEntry>
}
