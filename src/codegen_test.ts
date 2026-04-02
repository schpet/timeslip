/**
 * Codegen reproducibility and configuration tests.
 *
 * Verifies that:
 * 1. `deno task codegen` reproduces the committed generated output.
 * 2. Generated files are excluded from fmt/lint in deno.json.
 * 3. Hand-written provider/domain files are NOT excluded.
 */

import { assertEquals } from "@std/assert"
import * as path from "@std/path"

const ROOT = path.dirname(path.fromFileUrl(import.meta.url)).replace(
  /\/src$/,
  "",
)

// ---------------------------------------------------------------------------
// Codegen reproducibility
// ---------------------------------------------------------------------------

Deno.test("deno task codegen reproduces committed output", async () => {
  const generatedPath = path.join(
    ROOT,
    "src",
    "providers",
    "harvest",
    "generated",
    "harvest.openapi.ts",
  )

  // Read the committed generated file
  const before = await Deno.readTextFile(generatedPath)

  // Run codegen
  const cmd = new Deno.Command(Deno.execPath(), {
    args: ["task", "codegen"],
    cwd: ROOT,
    stdout: "piped",
    stderr: "piped",
  })
  const output = await cmd.output()
  assertEquals(output.code, 0, "codegen task should exit 0")

  // Read the regenerated file
  const after = await Deno.readTextFile(generatedPath)

  assertEquals(
    after,
    before,
    "codegen output differs from committed file — run `deno task codegen` and commit the result",
  )
})

// ---------------------------------------------------------------------------
// Generated file has expected header
// ---------------------------------------------------------------------------

Deno.test("generated file starts with AUTO-GENERATED header", async () => {
  const generatedPath = path.join(
    ROOT,
    "src",
    "providers",
    "harvest",
    "generated",
    "harvest.openapi.ts",
  )
  const content = await Deno.readTextFile(generatedPath)
  assertEquals(
    content.startsWith("// AUTO-GENERATED"),
    true,
    "generated file must start with AUTO-GENERATED comment",
  )
})

// ---------------------------------------------------------------------------
// deno.json excludes generated files from fmt and lint
// ---------------------------------------------------------------------------

Deno.test("deno.json excludes generated dir from fmt", async () => {
  const denoJson = JSON.parse(
    await Deno.readTextFile(path.join(ROOT, "deno.json")),
  )
  const fmtExclude: string[] = denoJson.fmt?.exclude ?? []
  assertEquals(
    fmtExclude.some((p: string) => p.includes("generated")),
    true,
    "fmt.exclude should contain the generated directory",
  )
})

Deno.test("deno.json excludes generated dir from lint", async () => {
  const denoJson = JSON.parse(
    await Deno.readTextFile(path.join(ROOT, "deno.json")),
  )
  const lintExclude: string[] = denoJson.lint?.exclude ?? []
  assertEquals(
    lintExclude.some((p: string) => p.includes("generated")),
    true,
    "lint.exclude should contain the generated directory",
  )
})

// ---------------------------------------------------------------------------
// Hand-written provider files are NOT excluded from fmt/lint
// ---------------------------------------------------------------------------

Deno.test("hand-written provider files are not excluded from fmt", async () => {
  const denoJson = JSON.parse(
    await Deno.readTextFile(path.join(ROOT, "deno.json")),
  )
  const fmtExclude: string[] = denoJson.fmt?.exclude ?? []
  // None of the exclude patterns should match non-generated provider files
  const handWritten = [
    "src/providers/harvest/client.ts",
    "src/providers/harvest/mappers.ts",
    "src/providers/harvest/paginator.ts",
    "src/providers/harvest/provider.ts",
    "src/providers/mod.ts",
    "src/domain/mod.ts",
  ]
  for (const file of handWritten) {
    for (const pattern of fmtExclude) {
      assertEquals(
        file.startsWith(pattern.replace(/\/$/, "")),
        false,
        `hand-written file ${file} should not be excluded from fmt by pattern "${pattern}"`,
      )
    }
  }
})
