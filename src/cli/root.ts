/**
 * Dense, scan-friendly root help printed when `timeslip` is invoked with no
 * arguments. Designed to surface the full CLI surface area in one screen so
 * humans and agents can discover commands without guessing.
 */

import { bold, gray } from "@std/fmt/colors"
import { VERSION } from "../version.ts"

export function printRootHelp(): void {
  const lines = buildRootHelp()
  for (const line of lines) {
    console.log(line)
  }
}

export function buildRootHelp(): string[] {
  return [
    `${bold("timeslip")} ${
      gray(`v${VERSION}`)
    } — Harvest time tracking from the command line`,
    "",
    `${bold("USAGE")}`,
    `  timeslip [--account <name>] [--json | --robot] <command>`,
    "",
    `${bold("AUTH")}`,
    `  auth login     Store credentials for a Harvest account`,
    `  auth logout    Remove a stored account`,
    `  auth list      Show configured accounts`,
    `  auth default   Set the default account`,
    `  auth whoami    Verify credentials and print identity`,
    "",
    `${bold("TIME ENTRIES")}`,
    `  entry add      Create a time entry`,
    `  entry update   Modify an existing entry`,
    `  entry remove   Delete an entry`,
    `  entry list     List entries (default: today)`,
    "",
    `${bold("DISCOVERY")}`,
    `  project list   List assigned projects and tasks`,
    `  client list    List clients from project assignments`,
    "",
    `${bold("HARVEST LOW-LEVEL")}`,
    `  harvest api      Send authenticated requests to the Harvest API`,
    `  harvest schema   Print the bundled OpenAPI schema (offline)`,
    "",
    `${bold("GLOBAL FLAGS")}`,
    `  --account <name>   Use a specific stored account`,
    `  --json             Output structured JSON instead of tables`,
    `  --robot            Output headerless tab-separated values`,
    `  --help             Show help for any command`,
    `  --version          Print version`,
    "",
    `${bold("ENVIRONMENT")}`,
    `  TIMESLIP_ACCOUNT   Default account (overridden by --account)`,
    `  TIMESLIP_DEBUG=1   Show stack traces and request details`,
    "",
    gray("Run `timeslip <command> --help` for details on a specific command."),
  ]
}
