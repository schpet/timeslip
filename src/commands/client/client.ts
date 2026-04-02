import { Command } from "@cliffy/command"
import { clientListCommand } from "./list.ts"

export const clientCommand = new Command()
  .description("List and inspect clients")
  .action(function () {
    this.showHelp()
  })
  .command("list", clientListCommand)
