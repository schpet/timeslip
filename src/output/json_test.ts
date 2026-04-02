import { assertEquals } from "@std/assert"
import { writeJson, writeJsonList, writeJsonSuccess } from "./json.ts"

// ---------------------------------------------------------------------------
// writeJson
// ---------------------------------------------------------------------------

Deno.test("writeJson emits valid JSON to stdout", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  // Force non-TTY path for deterministic compact output
  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJson({ hello: "world", count: 42 })
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const output = new TextDecoder().decode(chunks[0])
  assertEquals(output, '{"hello":"world","count":42}\n')
  // Verify it parses as valid JSON
  const parsed = JSON.parse(output.trim())
  assertEquals(parsed.hello, "world")
  assertEquals(parsed.count, 42)
})

Deno.test("writeJson emits no banners or explanatory text", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJson([1, 2, 3])
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const output = new TextDecoder().decode(chunks[0])
  // Entire output must be valid JSON — no prefix or suffix text
  assertEquals(output.trim(), JSON.stringify([1, 2, 3]))
})

Deno.test("writeJson pretty-prints for TTY", () => {
  const lines: string[] = []
  const original = console.log
  const originalIsTerminal = Deno.stdout.isTerminal
  Deno.stdout.isTerminal = () => true
  console.log = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "))
  }

  try {
    writeJson({ a: 1 })
  } finally {
    console.log = original
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const output = lines.join("\n")
  // Pretty-printed JSON has newlines and indentation
  assertEquals(output.includes("\n"), true)
  assertEquals(output.includes("  "), true)
  // Still valid JSON
  const parsed = JSON.parse(output)
  assertEquals(parsed.a, 1)
})

// ---------------------------------------------------------------------------
// writeJsonList
// ---------------------------------------------------------------------------

Deno.test("writeJsonList emits envelope with items and metadata", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJsonList(
      [{ id: 1 }, { id: 2 }],
      { total_entries: 2, pages_fetched: 1, truncated: false },
    )
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const output = new TextDecoder().decode(chunks[0])
  const parsed = JSON.parse(output.trim())

  assertEquals(parsed.items.length, 2)
  assertEquals(parsed.total_entries, 2)
  assertEquals(parsed.pages_fetched, 1)
  assertEquals(parsed.truncated, false)
})

Deno.test("writeJsonList emits empty items array correctly", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJsonList([], { total_entries: 0, pages_fetched: 0, truncated: false })
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const parsed = JSON.parse(new TextDecoder().decode(chunks[0]).trim())
  assertEquals(parsed.items, [])
  assertEquals(parsed.total_entries, 0)
})

// ---------------------------------------------------------------------------
// writeJsonSuccess
// ---------------------------------------------------------------------------

Deno.test("writeJsonSuccess emits ok:true with extra fields", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJsonSuccess({ id: 42, action: "deleted" })
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const parsed = JSON.parse(new TextDecoder().decode(chunks[0]).trim())
  assertEquals(parsed.ok, true)
  assertEquals(parsed.id, 42)
  assertEquals(parsed.action, "deleted")
})

Deno.test("writeJsonSuccess with empty payload still has ok:true", () => {
  const chunks: Uint8Array[] = []
  const originalWriteSync = Deno.stdout.writeSync
  const originalIsTerminal = Deno.stdout.isTerminal

  Deno.stdout.isTerminal = () => false
  Deno.stdout.writeSync = (data: Uint8Array) => {
    chunks.push(new Uint8Array(data))
    return data.byteLength
  }

  try {
    writeJsonSuccess({})
  } finally {
    Deno.stdout.writeSync = originalWriteSync
    Deno.stdout.isTerminal = originalIsTerminal
  }

  const parsed = JSON.parse(new TextDecoder().decode(chunks[0]).trim())
  assertEquals(parsed.ok, true)
  assertEquals(Object.keys(parsed).length, 1)
})
