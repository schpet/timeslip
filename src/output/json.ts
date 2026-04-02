/**
 * Strict JSON output writer. Emits structured JSON only — no banners,
 * no explanatory text. Used when --json is active.
 */

/** Write a JSON value to stdout. Pretty-prints for TTY, compact for pipes. */
export function writeJson(data: unknown): void {
  if (Deno.stdout.isTerminal()) {
    console.log(JSON.stringify(data, null, 2))
  } else {
    Deno.stdout.writeSync(
      new TextEncoder().encode(JSON.stringify(data) + "\n"),
    )
  }
}

/** Wrap list output in the standard envelope with pagination metadata. */
export function writeJsonList(
  items: unknown[],
  meta: { total_entries: number; pages_fetched: number; truncated: boolean },
): void {
  writeJson({ items, ...meta })
}

/** Minimal success payload for mutations (e.g. delete). */
export function writeJsonSuccess(payload: Record<string, unknown>): void {
  writeJson({ ok: true, ...payload })
}
