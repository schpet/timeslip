import { Command } from "@cliffy/command"
import { addCommand } from "./add.ts"
import { updateCommand } from "./update.ts"
import { removeCommand } from "./remove.ts"
import { listCommand } from "./list.ts"

export const entryCommand = new Command()
  .description("Manage time entries")
  .action(function () {
    this.showHelp()
  })
  .command("add", addCommand)
  .command("update", updateCommand)
  .command("remove", removeCommand)
  .command("list", listCommand)
