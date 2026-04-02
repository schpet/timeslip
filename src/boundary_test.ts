/**
 * Boundary tests — verify that command-layer modules depend on
 * normalized domain types rather than raw generated Harvest payload types.
 *
 * These are structural tests that scan import statements in source files.
 * They fail if commands start importing generated Harvest shapes directly.
 */

import { assertEquals } from "@std/assert"
import * as path from "@std/path"

const ROOT = path.dirname(path.fromFileUrl(import.meta.url)).replace(
  /\/src$/,
  "",
)

const GENERATED_IMPORT_PATTERN =
  /from\s+["'][^"']*\/generated\/[^"']*["']|import\s*\([^)]*\/generated\/[^)]*\)/

/**
 * Recursively collect .ts files in a directory, excluding test files.
 */
async function collectTsFiles(dir: string): Promise<string[]> {
  const files: string[] = []
  for await (const entry of Deno.readDir(dir)) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory) {
      files.push(...await collectTsFiles(full))
    } else if (
      entry.name.endsWith(".ts") && !entry.name.endsWith("_test.ts")
    ) {
      files.push(full)
    }
  }
  return files
}

// ---------------------------------------------------------------------------
// Commands must not import generated types
// ---------------------------------------------------------------------------

Deno.test("command modules do not import from generated/", async () => {
  const commandsDir = path.join(ROOT, "src", "commands")
  const files = await collectTsFiles(commandsDir)
  assertEquals(files.length > 0, true, "should find command files")

  const violations: string[] = []
  for (const file of files) {
    const content = await Deno.readTextFile(file)
    if (GENERATED_IMPORT_PATTERN.test(content)) {
      violations.push(path.relative(ROOT, file))
    }
  }

  assertEquals(
    violations,
    [],
    `Command modules must not import generated types directly. Violations:\n${
      violations.join("\n")
    }`,
  )
})

// ---------------------------------------------------------------------------
// CLI layer must not import generated types
// ---------------------------------------------------------------------------

Deno.test("CLI modules do not import from generated/", async () => {
  const cliDir = path.join(ROOT, "src", "cli")
  const files = await collectTsFiles(cliDir)
  assertEquals(files.length > 0, true, "should find CLI files")

  const violations: string[] = []
  for (const file of files) {
    const content = await Deno.readTextFile(file)
    if (GENERATED_IMPORT_PATTERN.test(content)) {
      violations.push(path.relative(ROOT, file))
    }
  }

  assertEquals(
    violations,
    [],
    `CLI modules must not import generated types directly. Violations:\n${
      violations.join("\n")
    }`,
  )
})

// ---------------------------------------------------------------------------
// Output modules must not import generated types
// ---------------------------------------------------------------------------

Deno.test("output modules do not import from generated/", async () => {
  const outputDir = path.join(ROOT, "src", "output")
  const files = await collectTsFiles(outputDir)
  assertEquals(files.length > 0, true, "should find output files")

  const violations: string[] = []
  for (const file of files) {
    const content = await Deno.readTextFile(file)
    if (GENERATED_IMPORT_PATTERN.test(content)) {
      violations.push(path.relative(ROOT, file))
    }
  }

  assertEquals(
    violations,
    [],
    `Output modules must not import generated types directly. Violations:\n${
      violations.join("\n")
    }`,
  )
})

// ---------------------------------------------------------------------------
// Domain module must not import generated types
// ---------------------------------------------------------------------------

Deno.test("domain module does not import from generated/", async () => {
  const domainFile = path.join(ROOT, "src", "domain", "mod.ts")
  const content = await Deno.readTextFile(domainFile)
  assertEquals(
    GENERATED_IMPORT_PATTERN.test(content),
    false,
    "domain/mod.ts must not import generated types",
  )
})

// ---------------------------------------------------------------------------
// Provider adapter files ARE allowed to import generated types
// (this is a sanity check that our boundary is correct)
// ---------------------------------------------------------------------------

Deno.test("provider adapter files import from generated/ (expected)", async () => {
  const mappersFile = path.join(
    ROOT,
    "src",
    "providers",
    "harvest",
    "mappers.ts",
  )
  const content = await Deno.readTextFile(mappersFile)
  assertEquals(
    GENERATED_IMPORT_PATTERN.test(content),
    true,
    "mappers.ts should import generated types (it's in the provider layer)",
  )
})
