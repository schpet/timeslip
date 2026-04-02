# Harvest API v2 Reference

## Authentication

Every request requires three headers:

```
Authorization: Bearer $HARVEST_API_TOKEN
Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID
User-Agent: Timeslip CLI
```

The token format is `<account_id>.pt.<secret>` (personal access token). Tokens are created at https://id.getharvest.com/developers.

Base URL: `https://api.harvestapp.com/api/v2/`

> **Note:** The base path is `/api/v2/`, NOT `/v2/`. The OpenAPI schema may reference `/v2/` but requests will fail without the `/api` prefix.

## Scoping to the current user

**This is critical.** By default, endpoints like `/time_entries` return entries for ALL users in the account. You MUST pass `user_id` to scope results to the authenticated user.

To get the current user's ID:

```bash
curl -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/users/me.json"
```

The response includes an `id` field — this is the `user_id` to use on all subsequent calls.

## Listing time entries

```bash
curl -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/time_entries?user_id=$MY_USER_ID&per_page=10"
```

### Key query parameters

| Parameter  | Description                                      |
| ---------- | ------------------------------------------------ |
| `user_id`  | **Required for our use.** Scope to a single user |
| `from`     | Start date (YYYY-MM-DD)                          |
| `to`       | End date (YYYY-MM-DD)                            |
| `per_page` | Results per page (max 100, default 100)          |
| `page`     | Page number for pagination                       |

### Response shape

```json
{
  "time_entries": [
    {
      "id": 123456789,
      "spent_date": "2026-03-16",
      "hours": 1.5,
      "notes": "Worked on feature X",
      "is_running": true,
      "timer_started_at": "2026-03-16T10:00:00Z",
      "user": { "id": 12345, "name": "Your Name" },
      "client": { "id": 67890, "name": "Acme Corp", "currency": "USD" },
      "project": { "id": 11111, "name": "Project Alpha", "code": null },
      "task": { "id": 22222, "name": "Development" }
    }
  ],
  "per_page": 10,
  "total_pages": 1,
  "total_entries": 2,
  "next_page": null,
  "previous_page": null,
  "page": 1
}
```

### Fields relevant to the CLI

| Field          | Description                           |
| -------------- | ------------------------------------- |
| `id`           | Time entry ID (used for updates)      |
| `spent_date`   | Date of the entry                     |
| `hours`        | Total hours (including running timer) |
| `notes`        | The description — `null` if blank     |
| `is_running`   | Whether the timer is currently active |
| `project.name` | Project name for display              |
| `task.name`    | Task name for display                 |
| `client.name`  | Client name for display               |

## Listing projects and clients

The `/users/me/project_assignments` endpoint returns projects assigned to the current user, along with their client and available tasks. This is already user-scoped via the `/users/me/` path — no `user_id` param needed.

```bash
curl -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/users/me/project_assignments.json?per_page=100"
```

> **Note:** There is a separate `/clients` endpoint, but it returns ALL clients in the account (not scoped to the user). Use project assignments instead to get only the projects/clients relevant to the current user.

### Response shape

```json
{
  "project_assignments": [
    {
      "id": 444444444,
      "is_project_manager": false,
      "is_active": true,
      "project": {
        "id": 11111,
        "name": "Project Alpha",
        "code": null,
        "is_billable": true
      },
      "client": {
        "id": 67890,
        "name": "Acme Corp",
        "currency": "USD"
      },
      "task_assignments": [
        {
          "id": 99999,
          "billable": true,
          "is_active": true,
          "task": {
            "id": 22222,
            "name": "Development"
          }
        }
      ]
    }
  ],
  "per_page": 100,
  "total_pages": 1,
  "total_entries": 23,
  "next_page": null,
  "previous_page": null,
  "page": 1
}
```

### Key fields

| Field                          | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `project.id`                   | Project ID (used when creating time entries) |
| `project.name`                 | Project name for display                     |
| `client.id`                    | Client ID                                    |
| `client.name`                  | Client name for display                      |
| `task_assignments[].task.id`   | Task ID (used when creating time entries)    |
| `task_assignments[].task.name` | Task name for display (e.g. "Development")   |

This single endpoint gives us everything needed to populate project/client/task pickers in the CLI.

## Updating a time entry description

```bash
curl -X PATCH \
     -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     -H "Content-Type: application/json" \
     -d '{"notes":"Updated description here"}' \
     "https://api.harvestapp.com/api/v2/time_entries/$TIME_ENTRY_ID"
```

The PATCH response returns the full updated time entry object. Only the fields you send are modified — other fields are left unchanged. The `notes` field is the description.

### Updatable fields (relevant subset)

| Field   | Type   | Description           |
| ------- | ------ | --------------------- |
| `notes` | string | The entry description |

> There are other updatable fields (hours, project_id, task_id, spent_date, etc.) but for our CLI we only care about `notes`.

## Creating a time entry

```bash
curl -X POST \
     -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     -H "Content-Type: application/json" \
     -d '{"project_id":11111,"task_id":22222,"spent_date":"2026-03-16","notes":"Did some work"}' \
     "https://api.harvestapp.com/api/v2/time_entries"
```

### Required fields

| Field        | Type    | Description                 |
| ------------ | ------- | --------------------------- |
| `project_id` | integer | Project to log time against |
| `task_id`    | integer | Task within the project     |
| `spent_date` | string  | ISO 8601 date (YYYY-MM-DD)  |

### Timer behavior on create

- **Omit `hours`** → timer starts running (`is_running: true`, `hours: 0.0`)
- **`hours: 0.0`** → treated as "not provided", timer starts running
- **`hours: 0.01` or more** → entry created with those hours, timer NOT started (`is_running: false`)

This is a quirk: `hours: 0.0` does NOT mean "zero hours, stopped." It behaves the same as omitting `hours` entirely.

### Optional fields

| Field     | Type    | Description                             |
| --------- | ------- | --------------------------------------- |
| `notes`   | string  | Description                             |
| `hours`   | float   | Hours to log (see timer behavior above) |
| `user_id` | integer | Defaults to authenticated user          |

Response: `201 Created` with the full time entry object.

## Deleting a time entry

```bash
curl -X DELETE \
     -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/time_entries/$TIME_ENTRY_ID"
```

Response: `200 OK` with an empty JSON body. No confirmation prompt from the API.

## Starting and stopping timers

Dedicated endpoints — no request body needed:

```bash
# Start/restart a stopped timer
curl -X PATCH \
     -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/time_entries/$TIME_ENTRY_ID/restart"

# Stop a running timer
curl -X PATCH \
     -H "Authorization: Bearer $HARVEST_API_TOKEN" \
     -H "Harvest-Account-ID: $HARVEST_API_ACCOUNT_ID" \
     -H "User-Agent: Timeslip CLI" \
     "https://api.harvestapp.com/api/v2/time_entries/$TIME_ENTRY_ID/stop"
```

Both return the full time entry object. Stopping an already-stopped timer or restarting an already-running timer returns a validation error.

## Pagination

Harvest supports both **offset-based** and **cursor-based** pagination. Responses include:

```json
{
  "per_page": 100,
  "total_pages": 54,
  "total_entries": 5390,
  "page": 1,
  "next_page": 2,
  "previous_page": null,
  "links": {
    "first": "https://api.harvestapp.com/v2/time_entries?page=1&per_page=100&...",
    "next": "https://api.harvestapp.com/v2/time_entries?cursor=eyJ...&per_page=100&...",
    "previous": null,
    "last": "https://api.harvestapp.com/v2/time_entries?page=54&per_page=100&..."
  }
}
```

- **Use `links.next`** for reliable iteration — it uses cursor-based pagination which won't skip or duplicate records if data changes between pages.
- `next_page` / `page` are offset-based and can miss records if entries are added/removed during pagination.
- **Note:** URLs in `links` use `/v2/` not `/api/v2/` — but requests work with either.
- Max `per_page` is 100 (also the default).

## Error responses

Errors come in two shapes:

### Auth errors (401)

```json
{
  "error": "invalid_token",
  "error_description": "The access token provided is expired, revoked, malformed or invalid for other reasons."
}
```

### Not found (404)

```json
{
  "status": 404,
  "error": "Not Found"
}
```

### Validation errors (422)

```json
{
  "message": "Task must exist, Project must exist, Project can't be blank, Task can't be blank, Spent date can't be blank, Spent date is not a valid date"
}
```

### Business logic errors (e.g. stopping a stopped timer)

```json
{
  "message": "can't stop a stopped timer"
}
```

Note: error shapes are inconsistent — auth errors use `error`/`error_description`, not-found uses `status`/`error`, and validation/logic errors use `message`. The CLI should handle all three.

## Rate limiting

Harvest allows 100 requests per 15 seconds per access token. No rate limit headers are returned in responses. When exceeded, the API returns `429 Too Many Requests` with a `Retry-After` header (in seconds).
