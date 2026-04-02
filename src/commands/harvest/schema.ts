import { Command } from "@cliffy/command"
import * as path from "@std/path"

const SCHEMA_PATH = path.fromFileUrl(
  new URL("../../../schemas/harvest-openapi.yaml", import.meta.url),
)

export const harvestSchemaCommand = new Command()
  .description(
    `Print the bundled Harvest OpenAPI schema as YAML.

Dumps the full OpenAPI specification bundled with this CLI verbatim to
stdout. This is a local operation — no network calls are made. Pipe into
grep, rg, or yq for quick lookups.

The output is the unmodified YAML exactly as bundled at build time. No
filtering, path selection, or format conversion flags are supported.`,
  )
  .action(async function () {
    const bytes = await Deno.readFile(SCHEMA_PATH)
    Deno.stdout.writeSync(bytes)
  })
