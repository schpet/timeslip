import { Command } from "@cliffy/command"
import { VERSION } from "./version.ts"
import { printRootHelp } from "./cli/root.ts"
import { handleError, ValidationError } from "./errors/mod.ts"
import { authCommand } from "./commands/auth/auth.ts"
import { entryCommand } from "./commands/entry/entry.ts"
import { projectCommand } from "./commands/project/project.ts"
import { clientCommand } from "./commands/client/client.ts"
import { harvestCommand } from "./commands/harvest/harvest.ts"
import { setGlobalAccount, setJsonMode, setRobotMode } from "./cli/globals.ts"

// Re-export for any existing consumers
export { getGlobalAccount, isJsonMode, isRobotMode } from "./cli/globals.ts"

try {
  await new Command()
    .name("timeslip")
    .version(VERSION)
    .description("Harvest time tracking from the command line.")
    .globalOption(
      "-a, --account <name:string>",
      "Use a specific stored account",
    )
    .globalOption("-j, --json", "Output structured JSON instead of tables")
    .globalOption("-r, --robot", "Output headerless tab-separated values")
    .globalAction((options) => {
      setGlobalAccount(
        options.account ?? Deno.env.get("TIMESLIP_ACCOUNT") ?? undefined,
      )
      setJsonMode(options.json ?? false)
      setRobotMode(options.robot ?? false)

      if (options.json && options.robot) {
        throw new ValidationError(
          "Cannot use --json and --robot together. Choose one output mode.",
        )
      }
    })
    .action(() => {
      printRootHelp()
    })
    .command("auth", authCommand)
    .command("entry", entryCommand)
    .command("project", projectCommand)
    .command("client", clientCommand)
    .command("harvest", harvestCommand)
    .parse(Deno.args)
} catch (error) {
  if (
    error instanceof Error &&
    !(error instanceof ValidationError) &&
    error.constructor.name === "ValidationError" &&
    "message" in error
  ) {
    // Cliffy throws its own ValidationError for bad flags/args — wrap it in ours
    handleError(
      new ValidationError(error.message),
    )
  }
  handleError(error)
}
