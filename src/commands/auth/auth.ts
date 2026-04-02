import { Command } from "@cliffy/command"
import { loginCommand } from "./login.ts"
import { listCommand } from "./list.ts"
import { defaultCommand } from "./default.ts"
import { whoamiCommand } from "./whoami.ts"
import { logoutCommand } from "./logout.ts"

export const authCommand = new Command()
  .description("Manage authentication and stored accounts")
  .action(function () {
    this.showHelp()
  })
  .command("login", loginCommand)
  .command("list", listCommand)
  .command("default", defaultCommand)
  .command("whoami", whoamiCommand)
  .command("logout", logoutCommand)
