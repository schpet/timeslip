import { Command } from "@cliffy/command"
import { harvestApiCommand } from "./api.ts"
import { harvestSchemaCommand } from "./schema.ts"

export const harvestCommand = new Command()
  .description("Low-level Harvest API access and schema tools")
  .action(function () {
    this.showHelp()
  })
  .command("api", harvestApiCommand)
  .command("schema", harvestSchemaCommand)
