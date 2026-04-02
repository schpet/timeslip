# Output Contracts

Public output contracts for timeslip v1. JSON shapes and robot field orders are frozen — changes require a major version bump.

## Output Modes

Every command supports three output modes selected by global flags:

| Flag      | Mode  | Description                                     |
| --------- | ----- | ----------------------------------------------- |
| _(none)_  | Human | Terse tables and confirmations for terminal use |
| `--json`  | JSON  | Structured JSON only — no banners or prose      |
| `--robot` | Robot | Headerless tab-separated values for shell pipes |

`--json` and `--robot` are mutually exclusive. Combining them exits with code 2.

## Exit Codes

| Code | Meaning                                       |
| ---- | --------------------------------------------- |
| `0`  | Success                                       |
| `2`  | Usage or validation failure                   |
| `4`  | Authentication failure                        |
| `1`  | Provider, network, config, or runtime failure |

## Shared JSON List Envelope

All paginated list commands (`entry list`, `project list`, `client list`) use the same envelope:

```json
{
  "items": [],
  "total_entries": 6,
  "pages_fetched": 3,
  "truncated": false
}
```

| Field           | Type      | Description                                          |
| --------------- | --------- | ---------------------------------------------------- |
| `items`         | `array`   | Rendered records for the current result set          |
| `total_entries` | `number`  | Total items available (before any `--limit` slicing) |
| `pages_fetched` | `number`  | Number of API pages traversed to build the result    |
| `truncated`     | `boolean` | `true` when `--limit` caused early truncation        |

When `--limit` is active, `items` contains at most that many records, `total_entries` reflects the full count, and `truncated` is `true`.

## Root Help

Zero-argument invocation prints a dense command index:

```
$ timeslip
timeslip v0.1.0 — Harvest time tracking from the command line

USAGE
  timeslip [--account <name>] [--json | --robot] <command>

AUTH
  auth login     Store credentials for a Harvest account
  auth logout    Remove a stored account
  auth list      Show configured accounts
  auth default   Set the default account
  auth whoami    Verify credentials and print identity

TIME ENTRIES
  entry add      Create a time entry
  entry update   Modify an existing entry
  entry remove   Delete an entry
  entry list     List entries (default: today)

DISCOVERY
  project list   List assigned projects and tasks
  client list    List clients from project assignments

HARVEST LOW-LEVEL
  harvest api      Send authenticated requests to the Harvest API
  harvest schema   Print the bundled OpenAPI schema (offline)

GLOBAL FLAGS
  --account <name>   Use a specific stored account
  --json             Output structured JSON instead of tables
  --robot            Output headerless tab-separated values
  --help             Show help for any command
  --version          Print version

ENVIRONMENT
  TIMESLIP_ACCOUNT   Default account (overridden by --account)
  TIMESLIP_DEBUG=1   Show stack traces and request details

Run `timeslip <command> --help` for details on a specific command.
```

## Auth Commands

### auth login

Stores Harvest credentials after validating them against `/users/me`.

```
$ timeslip auth login --account work --account-id 123456 --token "$HARVEST_TOKEN"
Logged in jane@example.com (account 123456)
```

JSON mode:

```json
{
  "ok": true,
  "account": "work",
  "provider": "harvest",
  "account_id": "123456",
  "user_id": 42,
  "email": "jane@example.com"
}
```

Robot mode — fields: `account`, `provider`, `account_id`, `user_id`, `email`

```
default	harvest	123456	42	jane@example.com
```

### auth list

Shows all configured accounts.

```
$ timeslip auth list
  NAME       PROVIDER  ACCOUNT ID  USER ID  EMAIL
  default    harvest   123456      42       jane@example.com   (default)
```

JSON mode returns account objects with a default indicator:

```json
{
  "default": "default",
  "accounts": [
    {
      "name": "default",
      "provider": "harvest",
      "account_id": "123456",
      "user_id": 42,
      "email": "jane@example.com",
      "first_name": "Jane",
      "last_name": "Doe",
      "is_default": true
    }
  ]
}
```

Note: `auth list` reads from local config only — it does not use the paginated list envelope.

Robot mode — fields: `name`, `provider`, `account_id`, `user_id`, `email`, `is_default`

```
default	harvest	123456	42	jane@example.com	true
```

### auth default

Sets the default account.

```
$ timeslip auth default work
Default account set to work
```

JSON mode:

```json
{
  "ok": true,
  "account": "work",
  "provider": "harvest",
  "account_id": "456789",
  "user_id": 7,
  "email": "work@example.com"
}
```

### auth whoami

Validates credentials and prints identity.

```
$ timeslip auth whoami
jane@example.com — Jane Doe (account 123456, default)
```

JSON mode:

```json
{
  "account": "default",
  "provider": "harvest",
  "account_id": "123456",
  "is_default": true,
  "user_id": 42,
  "first_name": "Jane",
  "last_name": "Doe",
  "email": "jane@example.com"
}
```

Robot mode — fields: `account`, `provider`, `account_id`, `is_default`, `user_id`, `first_name`, `last_name`, `email`

```
default	harvest	123456	true	42	Jane	Doe	jane@example.com
```

### auth logout

Removes a stored account.

```
$ timeslip auth logout work
Logged out work
```

JSON mode:

```json
{
  "ok": true,
  "account": "work",
  "provider": "harvest",
  "account_id": "456789",
  "user_id": 7,
  "email": "work@example.com"
}
```

## Entry Commands

### entry list

Lists time entries. Defaults to today's entries.

```
$ timeslip entry list
     ID  DATE        HOURS  PROJECT     TASK          NOTES
  12345  2026-03-17    2.5  Timeslip    Development   Bug fixes
  12346  2026-03-17    1.0  Timeslip    Code Review   PR review
```

JSON mode returns the shared list envelope:

```json
{
  "items": [
    {
      "id": 12345,
      "date": "2026-03-17",
      "hours": 2.5,
      "rounded_hours": 2.5,
      "notes": "Bug fixes",
      "is_running": false,
      "is_billable": true,
      "is_locked": false,
      "project_id": 100,
      "project_name": "Timeslip",
      "task_id": 200,
      "task_name": "Development",
      "client_id": 10,
      "client_name": "Acme Corp"
    }
  ],
  "total_entries": 1,
  "pages_fetched": 1,
  "truncated": false
}
```

Robot mode — fields: `id`, `date`, `hours`, `rounded_hours`, `notes`, `is_running`, `is_billable`, `is_locked`, `project_id`, `project_name`, `task_id`, `task_name`, `client_id`, `client_name`

```
12345	2026-03-17	2.5	2.5	Bug fixes	false	true	false	100	Timeslip	200	Development	10	Acme Corp
```

### entry add

Creates a time entry.

```
$ timeslip entry add --project-id 100 --task-id 200 --date 2026-03-17 --hours 2.5 --notes "Bug fixes"
Added entry 12345 (2.5h on 2026-03-17)
```

JSON mode:

```json
{
  "ok": true,
  "id": 12345,
  "date": "2026-03-17",
  "hours": 2.5,
  "project_id": 100,
  "task_id": 200,
  "notes": "Bug fixes"
}
```

Robot mode uses the same `ENTRY_FIELDS` contract as `entry list`.

### entry update

Modifies an existing entry. Only sends explicitly provided fields.

```
$ timeslip entry update 12345 --hours 3.0 --notes "Updated notes"
Updated entry 12345
```

JSON mode:

```json
{
  "ok": true,
  "id": 12345,
  "date": "2026-03-17",
  "hours": 3.0,
  "project_id": 100,
  "task_id": 200,
  "notes": "Updated notes"
}
```

Robot mode uses `ENTRY_FIELDS`.

### entry remove

Deletes an entry.

```
$ timeslip entry remove 12345
Removed entry 12345
```

JSON mode:

```json
{ "ok": true, "entry_id": 12345 }
```

Robot mode — fields: `entry_id`

```
12345
```

## Discovery Commands

### project list

Lists assigned projects and tasks.

```
$ timeslip project list
  PROJECT ID  PROJECT          CLIENT      TASKS
         100  Timeslip (TS)    Acme Corp   200:Development, 201:Design
         101  Mobile App       Globex Inc  300:Backend
```

JSON mode returns the shared list envelope:

```json
{
  "items": [
    {
      "project_id": 100,
      "project_name": "Timeslip",
      "project_code": "TS",
      "is_active": true,
      "client_id": 10,
      "client_name": "Acme Corp",
      "tasks": [
        { "task_id": 200, "task_name": "Development", "billable": true },
        { "task_id": 201, "task_name": "Design", "billable": false }
      ]
    }
  ],
  "total_entries": 1,
  "pages_fetched": 1,
  "truncated": false
}
```

Robot mode — fields: `project_id`, `project_name`, `project_code`, `is_active`, `client_id`, `client_name`, `tasks`

Tasks are flattened to `id:name:billable` per task, comma-separated:

```
100	Timeslip	TS	true	10	Acme Corp	200:Development:true,201:Design:false
```

### client list

Lists clients derived from project assignments, deduplicated by client ID.

```
$ timeslip client list
  CLIENT ID  CLIENT      PROJECTS
         10  Acme Corp   Timeslip, Mobile App
         20  Globex Inc  API Server
```

JSON mode returns the shared list envelope:

```json
{
  "items": [
    {
      "client_id": 10,
      "client_name": "Acme Corp",
      "projects": [
        { "project_id": 100, "project_name": "Timeslip", "project_code": "TS" },
        {
          "project_id": 101,
          "project_name": "Mobile App",
          "project_code": null
        }
      ]
    }
  ],
  "total_entries": 1,
  "pages_fetched": 1,
  "truncated": false
}
```

Robot mode — fields: `client_id`, `client_name`, `projects`

Projects are flattened to `id:name:code` per project, comma-separated:

```
10	Acme Corp	100:Timeslip:TS,101:Mobile App:
```

## Robot Field-Order Contracts

Field-order constants are immutable within a major version. Each array defines the stable column order for `--robot` output.

| Constant               | Fields | Used By                               |
| ---------------------- | ------ | ------------------------------------- |
| `AUTH_MUTATION_FIELDS` | 5      | auth login, auth default, auth logout |
| `AUTH_LIST_FIELDS`     | 6      | auth list                             |
| `AUTH_WHOAMI_FIELDS`   | 8      | auth whoami                           |
| `ENTRY_FIELDS`         | 14     | entry list, entry add, entry update   |
| `ENTRY_REMOVE_FIELDS`  | 1      | entry remove                          |
| `PROJECT_FIELDS`       | 7      | project list                          |
| `CLIENT_FIELDS`        | 3      | client list                           |

### Array Flattening

Nested arrays in robot mode are flattened into a single cell using colon-delimited values, comma-separated:

- **tasks**: `task_id:task_name:billable` → `200:Development:true,201:Design:false`
- **projects**: `project_id:project_name:project_code` → `100:Timeslip:TS,101:Mobile:`
- Null values in flattened fields render as empty strings (e.g., null project_code → trailing colon)

## Safety

- Raw tokens, `Authorization` headers, and `Bearer` strings never appear in any output mode.
- The `assertNoSecrets()` helper scans for hex tokens (20+ chars), `Bearer` strings, and common prefixed tokens (`sk_`, `pat_`, `ghp_`, etc.).
- All examples in this document use synthetic credentials only.
