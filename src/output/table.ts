/**
 * Human-readable table and confirmation renderers.
 * Terse tables for list commands, compact confirmations for mutations.
 */

import { unicodeWidth } from "@std/cli"
import { bold, gray, green } from "@std/fmt/colors"

/** A column definition for table rendering. */
export interface Column {
  header: string
  /** Minimum display width. The renderer may expand columns to fit content. */
  minWidth?: number
  /** Hard maximum width. Content is truncated with "..." if it exceeds this. */
  maxWidth?: number
  /** Right-align values (useful for numeric columns). */
  align?: "left" | "right"
}

/** Pad a string to a target display width, respecting unicode widths. */
export function padDisplay(s: string, width: number): string {
  const w = unicodeWidth(s)
  return s + " ".repeat(Math.max(0, width - w))
}

/** Truncate a string to a maximum display width with "..." suffix. */
export function truncateText(text: string, maxWidth: number): string {
  if (unicodeWidth(text) <= maxWidth) return text
  if (maxWidth < 3) return text.slice(0, maxWidth)

  let truncated = ""
  let width = 0
  const maxContent = maxWidth - 3

  for (const char of text) {
    const charWidth = unicodeWidth(char)
    if (width + charWidth > maxContent) break
    truncated += char
    width += charWidth
  }

  return truncated + "..."
}

/**
 * Render a simple table to stdout with column headers and rows.
 * Columns are auto-sized based on content, within the specified constraints.
 */
export function renderTable(
  columns: Column[],
  rows: string[][],
): string[] {
  if (rows.length === 0) return []

  // Compute effective widths
  const widths = columns.map((col, i) => {
    const headerWidth = unicodeWidth(col.header)
    const contentMax = rows.reduce(
      (max, row) => Math.max(max, unicodeWidth(row[i] ?? "")),
      0,
    )
    let width = Math.max(headerWidth, contentMax, col.minWidth ?? 0)
    if (col.maxWidth) width = Math.min(width, col.maxWidth)
    return width
  })

  const gap = "  "
  const lines: string[] = []

  // Header
  const headerLine = columns
    .map((col, i) => gray(padDisplay(col.header, widths[i])))
    .join(gap)
  lines.push(headerLine)

  // Rows
  for (const row of rows) {
    const cells = columns.map((col, i) => {
      let cell = row[i] ?? ""
      if (col.maxWidth && unicodeWidth(cell) > col.maxWidth) {
        cell = truncateText(cell, col.maxWidth)
      }
      if (col.align === "right") {
        const padding = Math.max(0, widths[i] - unicodeWidth(cell))
        return " ".repeat(padding) + cell
      }
      return padDisplay(cell, widths[i])
    })
    lines.push(cells.join(gap))
  }

  return lines
}

/** Print a table to stdout. */
export function printTable(columns: Column[], rows: string[][]): void {
  const lines = renderTable(columns, rows)
  for (const line of lines) {
    console.log(line)
  }
}

/** Print a compact confirmation for a successful mutation. */
export function printConfirmation(
  verb: string,
  entity: string,
  detail?: string,
): void {
  const msg = detail
    ? `${green(bold(verb))} ${entity} ${gray(detail)}`
    : `${green(bold(verb))} ${entity}`
  console.log(msg)
}
