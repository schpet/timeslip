/**
 * Provider-neutral domain types.
 *
 * Commands import these types — never the raw generated Harvest shapes.
 * Provider adapters normalize API responses into these structures.
 */

/** A stored account credential set. */
export interface Account {
  /** User-defined profile label. */
  name: string
  /** Provider identifier (e.g. "harvest"). */
  provider: string
  /** Provider-specific account ID. */
  accountId: string
  /** Bearer token for API access. */
  accessToken: string
  /** Resolved provider user ID. */
  userId: number
  /** User display metadata. */
  firstName: string
  lastName: string
  email: string
  /** Whether this is the default account. */
  isDefault: boolean
}

/** Resolved identity from the provider's "who am I" endpoint. */
export interface Identity {
  id: number
  firstName: string
  lastName: string
  email: string
}

/** A client summary, as surfaced by project assignments. */
export interface ClientSummary {
  id: number
  name: string
}

/** A task that can receive time entries within a project. */
export interface TaskSummary {
  id: number
  name: string
  billable: boolean
}

/** A project with its associated client and available tasks. */
export interface ProjectAssignment {
  id: number
  projectId: number
  projectName: string
  projectCode: string | null
  client: ClientSummary
  tasks: TaskSummary[]
  isActive: boolean
}

/** A single time entry. */
export interface TimeEntry {
  id: number
  date: string
  hours: number
  roundedHours: number
  notes: string | null
  isRunning: boolean
  isBillable: boolean
  isLocked: boolean
  projectId: number
  projectName: string
  taskId: number
  taskName: string
  clientId: number
  clientName: string
}

/** Pagination metadata returned alongside list results. */
export interface PaginationMeta {
  totalEntries: number
  pagesFetched: number
  truncated: boolean
}

/** A page of results with pagination cursors. */
export interface Page<T> {
  items: T[]
  page: number
  totalPages: number
  totalEntries: number
  nextPage: number | null
  previousPage: number | null
}
