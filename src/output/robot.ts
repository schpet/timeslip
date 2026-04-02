/**
 * Deterministic robot output writer. Emits headerless tab-separated values
 * with no color, banners, or explanatory prose. Used when --robot is active.
 *
 * Each command family defines its own field-order contract so shell pipelines
 * can rely on column positions without scraping human-readable tables.
 */

// ---------------------------------------------------------------------------
// Field-order contracts
//
// Each array defines the stable column order for --robot output. The values
// are the snake_case keys used by the JSON renderers so all three output
// modes stay semantically aligned. Commands that emit nested structures
// (tasks within projects, projects within clients) flatten them into a
// single delimited cell.
// ---------------------------------------------------------------------------

/** auth login / auth default / auth logout success payloads. */
export const AUTH_MUTATION_FIELDS = [
  "account",
  "provider",
  "account_id",
  "user_id",
  "email",
] as const

/** auth list — one row per account. */
export const AUTH_LIST_FIELDS = [
  "name",
  "provider",
  "account_id",
  "user_id",
  "email",
  "is_default",
] as const

/** auth whoami — single-row identity. */
export const AUTH_WHOAMI_FIELDS = [
  "account",
  "provider",
  "account_id",
  "is_default",
  "user_id",
  "first_name",
  "last_name",
  "email",
] as const

/** entry list / entry add / entry update — one row per entry. */
export const ENTRY_FIELDS = [
  "id",
  "date",
  "hours",
  "rounded_hours",
  "notes",
  "is_running",
  "is_billable",
  "is_locked",
  "project_id",
  "project_name",
  "task_id",
  "task_name",
  "client_id",
  "client_name",
] as const

/** entry remove — success confirmation. */
export const ENTRY_REMOVE_FIELDS = [
  "entry_id",
] as const

/** project list — one row per project assignment. */
export const PROJECT_FIELDS = [
  "project_id",
  "project_name",
  "project_code",
  "is_active",
  "client_id",
  "client_name",
  "tasks",
] as const

/** client list — one row per client. */
export const CLIENT_FIELDS = [
  "client_id",
  "client_name",
  "projects",
] as const

// ---------------------------------------------------------------------------
// Writers
// ---------------------------------------------------------------------------

/**
 * Write a single robot-mode row from a key-value record.
 * Fields are emitted in the order specified by the contract array.
 * Missing keys become empty strings; values are stringified.
 */
export function writeRobotRow(
  record: Record<string, unknown>,
  fields: readonly string[],
): void {
  const cells = fields.map((key) => formatCell(record[key]))
  writeLine(cells.join("\t"))
}

/**
 * Write multiple robot-mode rows from an array of records.
 * Each record is emitted as a single tab-separated line.
 */
export function writeRobotRows(
  records: Record<string, unknown>[],
  fields: readonly string[],
): void {
  for (const record of records) {
    writeRobotRow(record, fields)
  }
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Format a cell value for robot output. */
function formatCell(value: unknown): string {
  if (value === null || value === undefined) return ""
  if (typeof value === "boolean") return value ? "true" : "false"
  if (Array.isArray(value)) {
    // Flatten arrays of objects into a comma-separated string of their
    // displayable representation (e.g., tasks → "id:name,id:name")
    return value
      .map((item) => {
        if (typeof item === "object" && item !== null) {
          return Object.values(item).join(":")
        }
        return String(item)
      })
      .join(",")
  }
  return String(value)
}

/** Write a line to stdout without color or trailing whitespace. */
function writeLine(line: string): void {
  Deno.stdout.writeSync(new TextEncoder().encode(line + "\n"))
}
