import { Command } from "@cliffy/command"
import { loadConfig } from "../../config/mod.ts"
import { writeJson } from "../../output/json.ts"
import { printTable } from "../../output/table.ts"
import { isJsonMode, isRobotMode } from "../../cli/globals.ts"
import { AUTH_LIST_FIELDS, writeRobotRows } from "../../output/robot.ts"

export const listCommand = new Command()
  .description("Show configured accounts")
  .action(async () => {
    const { defaultName, accounts } = await loadConfig()

    if (isJsonMode()) {
      writeJson({
        default: defaultName ?? null,
        accounts: accounts.map((a) => ({
          name: a.name,
          provider: a.provider,
          account_id: a.accountId,
          user_id: a.userId,
          email: a.email,
          first_name: a.firstName,
          last_name: a.lastName,
          is_default: a.name === defaultName,
        })),
      })
      return
    }

    if (isRobotMode()) {
      writeRobotRows(
        accounts.map((a) => ({
          name: a.name,
          provider: a.provider,
          account_id: a.accountId,
          user_id: a.userId,
          email: a.email,
          is_default: a.name === defaultName,
        })),
        AUTH_LIST_FIELDS,
      )
      return
    }

    if (accounts.length === 0) {
      console.log(
        "No accounts configured. Run `timeslip auth login` to add one.",
      )
      return
    }

    printTable(
      [
        { header: "NAME", minWidth: 8 },
        { header: "PROVIDER", minWidth: 8 },
        { header: "ACCOUNT", minWidth: 8 },
        { header: "USER", maxWidth: 30 },
        { header: "EMAIL", maxWidth: 30 },
        { header: "DEFAULT" },
      ],
      accounts.map((a) => [
        a.name,
        a.provider,
        a.accountId,
        `${a.firstName} ${a.lastName}`,
        a.email,
        a.name === defaultName ? "*" : "",
      ]),
    )
  })
