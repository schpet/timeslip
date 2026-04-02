# timeslip

Harvest time tracking from the command line.

## install

### homebrew

```sh
brew install schpet/tap/timeslip
```

### shell script

```sh
curl --proto '=https' --tlsv1.2 -LsSf https://github.com/schpet/timeslip/releases/latest/download/timeslip-installer.sh | sh
```

### binaries

Download from [releases](https://github.com/schpet/timeslip/releases/latest) for macOS, Linux, or Windows.

## setup

Get a Personal Access Token from https://id.getharvest.com/developers, then run:

```sh
timeslip auth login --token <your-token>
```

The account ID is inferred from the token. If it can't be inferred, pass `--account-id <id>` as well.

## commands

### auth

```sh
timeslip auth login --token <token>        # store credentials
timeslip auth login --token-stdin          # read token from stdin
timeslip auth login --token-env VAR        # read token from env var
timeslip auth list                         # show stored accounts
timeslip auth whoami                       # verify credentials and print identity
timeslip auth default <name>               # set the default account
timeslip auth logout <name>                # remove a stored account
```

Multiple accounts are supported. Use `--account <name>` on any command (or set `TIMESLIP_ACCOUNT`) to select a non-default account.

### entry

```sh
timeslip entry list                        # today's entries
timeslip entry list --from 2026-01-01      # entries from a date
timeslip entry list --from 2026-01-01 --to 2026-01-31
timeslip entry list --all                  # all entries (no date filter)
timeslip entry list --running              # only running timers

timeslip entry add --project-id 123 --task-id 456 --date 2026-04-01 --hours 2.5
timeslip entry add --project-id 123 --task-id 456 --date 2026-04-01  # starts a timer

timeslip entry update <id> --hours 3
timeslip entry update <id> --description "code review"
timeslip entry update <id> --clear-description

timeslip entry remove <id>
```

### project and client

```sh
timeslip project list                      # assigned projects and their tasks
timeslip client list                       # clients from project assignments
```

Use these to find project IDs and task IDs for `entry add`.

### harvest api

Direct access to the Harvest REST API, authenticated with your stored credentials.

```sh
timeslip harvest api /users/me
timeslip harvest api /time_entries -F user_id=@me -F from=2026-04-01
timeslip harvest api /projects --paginate
timeslip harvest api /time_entries -X POST -F project_id=123 -F task_id=456 -F spent_date=2026-04-01 -F hours=1.5
```

`@me` expands to your numeric user ID. `-F` coerces values (booleans, numbers, null); `-f` keeps them as strings.

Note: Harvest credentials are scoped to an account, not a user. Most endpoints return account-wide data. Pass `-F user_id=@me` to filter to your own records.

### harvest schema

```sh
timeslip harvest schema                    # dump bundled OpenAPI spec to stdout
timeslip harvest schema | grep '/time_entries'
```

## output modes

All commands support `--json` and `--robot` for scripting:

```sh
timeslip entry list --json                 # structured JSON
timeslip entry list --robot               # headerless tab-separated values
```

## environment variables

| Variable           | Description                                      |
| ------------------ | ------------------------------------------------ |
| `TIMESLIP_ACCOUNT` | Default account name (overridden by `--account`) |
| `TIMESLIP_DEBUG=1` | Show stack traces and request details            |

## global flags

```
-a, --account <name>   use a specific stored account
-j, --json             output JSON
-r, --robot            output tab-separated values
```
