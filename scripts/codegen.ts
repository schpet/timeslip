#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env
/**
 * Generate TypeScript types from the Harvest OpenAPI schema.
 *
 * Usage: deno task codegen
 */

import openapiTS, { astToString } from "openapi-typescript"
import * as path from "@std/path"

const root = path.dirname(path.dirname(path.fromFileUrl(import.meta.url)))
const schemaPath = path.join(root, "schemas", "harvest-openapi.yaml")
const outPath = path.join(
  root,
  "src",
  "providers",
  "harvest",
  "generated",
  "harvest.openapi.ts",
)

const header = [
  "// AUTO-GENERATED — do not edit by hand.",
  "// Re-run `deno task codegen` to regenerate.",
  "// Source: schemas/harvest-openapi.yaml",
  "",
].join("\n")

const ast = await openapiTS(new URL(`file://${schemaPath}`))
const contents = header + astToString(ast)

await Deno.mkdir(path.dirname(outPath), { recursive: true })
await Deno.writeTextFile(outPath, contents)

console.log(`Generated ${path.relative(root, outPath)}`)
