import { Command } from "@cliffy/command"
import { projectListCommand } from "./list.ts"

export const projectCommand = new Command()
  .description("List and inspect projects")
  .action(function () {
    this.showHelp()
  })
  .command("list", projectListCommand)
