import { assertEquals, assertStringIncludes } from "@std/assert"
import { join } from "@std/path"
import { saveConfig } from "./config/mod.ts"
import type { Account } from "./domain/mod.ts"
import { assertNoSecrets, type CliResult, runCli } from "./test_helpers.ts"

const ACCOUNT_ID = "900001"
const USER_ID = 42
const VALID_TOKEN = "pat-900001.mockharvesttoken_1234567890_abcd"
const INVALID_TOKEN = "pat-900001.invalidmocktoken_1234567890_abcd"
const MISSING_ENTRY_ID = 99999

interface LoggedRequest {
  method: string
  url: string
  status: number
  authHeader: string
  accountIdHeader: string
  body: unknown
}

interface MockHarvestOptions {
  projectAssignmentsRateLimited?: boolean
  entryAddProviderError?: boolean
}

function makeFixtureAccount(): Account {
  return {
    name: "mock-e2e",
    provider: "harvest",
    accountId: ACCOUNT_ID,
    accessToken: VALID_TOKEN,
    userId: USER_ID,
    firstName: "Mocky",
    lastName: "McMockface",
    email: "mocky@example.com",
    isDefault: true,
  }
}

function harvestProjectAssignment(
  projectId: number,
  clientId: number,
  clientName: string,
) {
  return {
    id: projectId * 10,
    is_active: true,
    project: {
      id: projectId,
      name: `Project ${projectId}`,
      code: `P${projectId}`,
    },
    client: { id: clientId, name: clientName },
    task_assignments: [
      {
        id: projectId * 100,
        billable: true,
        task: { id: projectId * 10 + 1, name: `Build ${projectId}` },
      },
      {
        id: projectId * 100 + 1,
        billable: false,
        task: { id: projectId * 10 + 2, name: `Review ${projectId}` },
      },
    ],
  }
}

function harvestEntry(id: number, overrides: Record<string, unknown> = {}) {
  return {
    id,
    spent_date: "2026-03-17",
    hours: 1.5,
    rounded_hours: 1.5,
    notes: `Entry ${id}`,
    is_running: false,
    billable: true,
    is_locked: false,
    project: { id: 501, name: "Timeslip" },
    task: { id: 601, name: "Development" },
    client: { id: 301, name: "Acme Corp" },
    ...overrides,
  }
}

function createLogger(prefix: string): {
  lines: string[]
  log: (message: string) => void
} {
  const lines: string[] = []
  return {
    lines,
    log: (message: string) => {
      const line = `[${prefix}] ${message}`
      lines.push(line)
      console.error(line)
    },
  }
}

function assertSecretSafeResult(
  result: CliResult,
  label: string,
  rawTokens: string[] = [],
): void {
  for (const token of rawTokens) {
    assertEquals(
      result.stdout.includes(token),
      false,
      `raw token found in ${label} stdout`,
    )
    assertEquals(
      result.stderr.includes(token),
      false,
      `raw token found in ${label} stderr`,
    )
  }
  assertNoSecrets(result.stdout, `${label} stdout`)
  assertNoSecrets(result.stderr, `${label} stderr`)
}

function assertArtifactsSecretSafe(
  artifacts: Array<{ label: string; content: string }>,
): void {
  for (const artifact of artifacts) {
    assertNoSecrets(artifact.content, artifact.label)
  }
}

function makeAbsolutePageLink(
  origin: string,
  pathname: string,
  page: number,
  params: URLSearchParams,
): string {
  const nextParams = new URLSearchParams(params)
  nextParams.set("page", String(page))
  return `${origin}${pathname}?${nextParams.toString()}`
}

function startMockHarvest(options: MockHarvestOptions = {}) {
  const requests: LoggedRequest[] = []
  const logger = createLogger("mock-harvest")
  const user = {
    id: USER_ID,
    first_name: "Mocky",
    last_name: "McMockface",
    email: "mocky@example.com",
  }
  const assignments = [
    harvestProjectAssignment(501, 301, "Acme Corp"),
    harvestProjectAssignment(502, 301, "Acme Corp"),
    harvestProjectAssignment(503, 302, "Globex Inc"),
    harvestProjectAssignment(504, 303, "Initech"),
  ]
  let entries = [
    harvestEntry(701, {
      spent_date: "2026-03-15",
      notes: "Existing entry 701",
      hours: 2.25,
    }),
    harvestEntry(702, {
      spent_date: "2026-03-16",
      notes: "Existing entry 702",
      hours: 3,
    }),
    harvestEntry(703, {
      spent_date: "2026-03-17",
      notes: "Existing entry 703",
      hours: 1,
    }),
  ]
  let nextEntryId = 800

  const server = Deno.serve(
    { port: 0, hostname: "127.0.0.1", onListen: () => {} },
    async (req: Request) => {
      const url = new URL(req.url)
      const authHeader = req.headers.get("authorization") ?? ""
      const accountIdHeader = req.headers.get("harvest-account-id") ?? ""
      let body: unknown = undefined
      if (
        req.method !== "GET" && req.method !== "HEAD" && req.method !== "DELETE"
      ) {
        try {
          body = await req.json()
        } catch {
          body = undefined
        }
      }

      const finish = (
        status: number,
        payload?: unknown,
        extraHeaders?: Record<string, string>,
        fixtureId?: string,
      ) => {
        requests.push({
          method: req.method,
          url: req.url,
          status,
          authHeader,
          accountIdHeader,
          body,
        })
        logger.log(
          `${req.method} ${url.pathname}${url.search} -> ${status} fixture=${
            fixtureId ?? "none"
          } auth=present:${authHeader.length > 0}`,
        )

        const headers = new Headers(extraHeaders)
        if (payload !== undefined) {
          headers.set("Content-Type", "application/json")
        }
        return new Response(
          payload === undefined ? null : JSON.stringify(payload),
          { status, headers },
        )
      }

      if (
        authHeader !== `Bearer ${VALID_TOKEN}` ||
        accountIdHeader !== ACCOUNT_ID
      ) {
        return finish(
          401,
          { error: "invalid_token" },
          undefined,
          "invalid-credentials",
        )
      }

      if (req.method === "GET" && url.pathname.endsWith("/users/me")) {
        return finish(200, user, undefined, "users-me")
      }

      if (
        options.projectAssignmentsRateLimited &&
        req.method === "GET" &&
        url.pathname.endsWith("/users/me/project_assignments")
      ) {
        return finish(
          429,
          { error: "rate_limited" },
          { "Retry-After": "7" },
          "project-assignments-rate-limit",
        )
      }

      if (
        req.method === "GET" &&
        url.pathname.endsWith("/users/me/project_assignments")
      ) {
        const page = Number(url.searchParams.get("page") ?? "1")
        const perPage = Number(url.searchParams.get("per_page") ?? "2")
        const start = (page - 1) * perPage
        const pageItems = assignments.slice(start, start + perPage)
        const totalPages = Math.ceil(assignments.length / perPage)
        const hasNext = page < totalPages

        const nextParams = new URLSearchParams(url.searchParams)
        nextParams.delete("page")
        const links = {
          first: makeAbsolutePageLink(
            url.origin,
            url.pathname,
            1,
            nextParams,
          ),
          last: makeAbsolutePageLink(
            url.origin,
            url.pathname,
            totalPages,
            nextParams,
          ),
          next: hasNext
            ? makeAbsolutePageLink(
              url.origin,
              url.pathname,
              page + 1,
              nextParams,
            )
            : null,
          previous: page > 1
            ? makeAbsolutePageLink(
              url.origin,
              url.pathname,
              page - 1,
              nextParams,
            )
            : null,
        }

        return finish(
          200,
          {
            project_assignments: pageItems,
            per_page: perPage,
            total_pages: totalPages,
            total_entries: assignments.length,
            next_page: hasNext ? 999 : null,
            previous_page: page > 1 ? page - 1 : null,
            page,
            links,
          },
          undefined,
          `project-assignments-page-${page}`,
        )
      }

      if (
        options.entryAddProviderError &&
        req.method === "POST" &&
        url.pathname.endsWith("/time_entries")
      ) {
        return finish(
          500,
          { message: "mock upstream exploded" },
          undefined,
          "entry-add-provider-error",
        )
      }

      if (req.method === "POST" && url.pathname.endsWith("/time_entries")) {
        const payload = body as Record<string, unknown>
        const created = harvestEntry(nextEntryId++, {
          spent_date: String(payload.spent_date ?? "2026-03-17"),
          hours: Number(payload.hours ?? 0),
          rounded_hours: Number(payload.hours ?? 0),
          notes: String(payload.notes ?? ""),
          project: { id: Number(payload.project_id), name: "Timeslip" },
          task: { id: Number(payload.task_id), name: "Development" },
        })
        entries = [created, ...entries]
        return finish(201, created, undefined, "entry-create")
      }

      if (req.method === "GET" && url.pathname.endsWith("/time_entries")) {
        const page = Number(url.searchParams.get("page") ?? "1")
        const perPage = Number(url.searchParams.get("per_page") ?? "2")
        const start = (page - 1) * perPage
        const pageItems = entries.slice(start, start + perPage)
        const totalPages = Math.ceil(entries.length / perPage)
        const hasNext = page < totalPages

        const nextParams = new URLSearchParams(url.searchParams)
        nextParams.delete("page")
        const links = {
          first: makeAbsolutePageLink(
            url.origin,
            url.pathname,
            1,
            nextParams,
          ),
          last: makeAbsolutePageLink(
            url.origin,
            url.pathname,
            totalPages,
            nextParams,
          ),
          next: hasNext
            ? makeAbsolutePageLink(
              url.origin,
              url.pathname,
              page + 1,
              nextParams,
            )
            : null,
          previous: page > 1
            ? makeAbsolutePageLink(
              url.origin,
              url.pathname,
              page - 1,
              nextParams,
            )
            : null,
        }

        return finish(
          200,
          {
            time_entries: pageItems,
            per_page: perPage,
            total_pages: totalPages,
            total_entries: entries.length,
            next_page: hasNext ? 999 : null,
            previous_page: page > 1 ? page - 1 : null,
            page,
            links,
          },
          undefined,
          `time-entries-page-${page}`,
        )
      }

      const entryMatch = url.pathname.match(/\/time_entries\/(\d+)$/)
      if (entryMatch && req.method === "PATCH") {
        const entryId = Number(entryMatch[1])
        const idx = entries.findIndex((entry) => entry.id === entryId)
        if (idx === -1) {
          return finish(
            404,
            { message: `time entry ${entryId} missing` },
            undefined,
            "entry-missing",
          )
        }

        const patch = body as Record<string, unknown>
        entries[idx] = {
          ...entries[idx],
          ...(patch.hours !== undefined ? { hours: Number(patch.hours) } : {}),
          ...(patch.notes !== undefined ? { notes: String(patch.notes) } : {}),
          ...(patch.spent_date !== undefined
            ? { spent_date: String(patch.spent_date) }
            : {}),
          ...(patch.project_id !== undefined
            ? { project: { id: Number(patch.project_id), name: "Timeslip" } }
            : {}),
          ...(patch.task_id !== undefined
            ? { task: { id: Number(patch.task_id), name: "Development" } }
            : {}),
        }
        return finish(200, entries[idx], undefined, "entry-update")
      }

      if (entryMatch && req.method === "DELETE") {
        const entryId = Number(entryMatch[1])
        const idx = entries.findIndex((entry) => entry.id === entryId)
        if (idx === -1) {
          return finish(
            404,
            { message: `time entry ${entryId} missing` },
            undefined,
            "entry-missing",
          )
        }

        entries.splice(idx, 1)
        return finish(204, undefined, undefined, "entry-delete")
      }

      return finish(404, { message: "Not found" }, undefined, "fallback-404")
    },
  )

  const addr = server.addr as Deno.NetAddr
  return {
    baseUrl: `http://127.0.0.1:${addr.port}/api/v2`,
    close: () => server.shutdown(),
    requests,
    logs: logger.lines,
    fixtures: {
      user,
      assignments,
      initialEntries: entries,
    },
  }
}

Deno.test("e2e mock Harvest suite: full happy path stays pagination-complete and secret-safe", async () => {
  const mock = startMockHarvest()
  const suiteLog = createLogger("e2e-mock-suite")
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_mock_happy_" })
  const env = { HARVEST_BASE_URL: mock.baseUrl }

  try {
    suiteLog.log(`config_dir=${xdgBase}`)

    const loginArgs = [
      "auth",
      "login",
      "--token",
      VALID_TOKEN,
      "--name",
      "mock-e2e",
    ]
    suiteLog.log(`args=${JSON.stringify(loginArgs)} fixture=users-me`)
    const login = await runCli(loginArgs, { configDir: xdgBase, env })
    assertEquals(login.code, 0, `login failed: ${login.stderr}`)
    assertStringIncludes(login.stdout, "Mocky")
    assertSecretSafeResult(login, "happy-path login", [VALID_TOKEN])

    const projectArgs = ["--json", "project", "list", "--page-size", "2"]
    suiteLog.log(
      `args=${JSON.stringify(projectArgs)} fixture=project-assignments pages=2`,
    )
    const projects = await runCli(projectArgs, { configDir: xdgBase, env })
    assertEquals(projects.code, 0, `project list failed: ${projects.stderr}`)
    const projectData = JSON.parse(projects.stdout)
    assertEquals(projectData.items.length, 4)
    assertEquals(projectData.total_entries, 4)
    assertEquals(projectData.pages_fetched, 2)
    assertEquals(projectData.truncated, false)
    assertSecretSafeResult(projects, "happy-path project list", [VALID_TOKEN])

    const clientArgs = ["--json", "client", "list", "--page-size", "2"]
    suiteLog.log(
      `args=${
        JSON.stringify(clientArgs)
      } fixture=project-assignments pages=2 dedup=3-clients`,
    )
    const clients = await runCli(clientArgs, { configDir: xdgBase, env })
    assertEquals(clients.code, 0, `client list failed: ${clients.stderr}`)
    const clientData = JSON.parse(clients.stdout)
    assertEquals(clientData.items.length, 3)
    assertEquals(clientData.total_entries, 3)
    assertEquals(clientData.pages_fetched, 2)
    assertEquals(clientData.truncated, false)
    assertEquals(clientData.items[0].client_name, "Acme Corp")
    assertSecretSafeResult(clients, "happy-path client list", [VALID_TOKEN])

    const addArgs = [
      "entry",
      "add",
      "--project-id",
      "501",
      "--task-id",
      "601",
      "--date",
      "2026-03-17",
      "--hours",
      "4",
      "--description",
      "Release blocker coverage",
    ]
    suiteLog.log(`args=${JSON.stringify(addArgs)} fixture=entry-create`)
    const add = await runCli(addArgs, { configDir: xdgBase, env })
    assertEquals(add.code, 0, `entry add failed: ${add.stderr}`)
    assertStringIncludes(add.stdout, "Created")
    assertStringIncludes(add.stdout, "entry #800")
    assertSecretSafeResult(add, "happy-path entry add", [VALID_TOKEN])

    const listArgs = ["--json", "entry", "list", "--all", "--page-size", "2"]
    suiteLog.log(
      `args=${
        JSON.stringify(listArgs)
      } fixture=time-entries pages=2 absolute-next-links`,
    )
    const list = await runCli(listArgs, { configDir: xdgBase, env })
    assertEquals(list.code, 0, `entry list failed: ${list.stderr}`)
    const listData = JSON.parse(list.stdout)
    assertEquals(listData.items.length, 4)
    assertEquals(listData.total_entries, 4)
    assertEquals(listData.pages_fetched, 2)
    assertEquals(listData.truncated, false)
    assertEquals(
      listData.items.some((item: Record<string, unknown>) => item.id === 800),
      true,
      "created entry must appear in entry list",
    )
    assertSecretSafeResult(list, "happy-path entry list", [VALID_TOKEN])

    const updateArgs = [
      "entry",
      "update",
      "800",
      "--hours",
      "5.5",
      "--description",
      "Release blocker closed",
    ]
    suiteLog.log(`args=${JSON.stringify(updateArgs)} fixture=entry-update`)
    const update = await runCli(updateArgs, { configDir: xdgBase, env })
    assertEquals(update.code, 0, `entry update failed: ${update.stderr}`)
    assertStringIncludes(update.stdout, "Updated")
    assertStringIncludes(update.stdout, "entry #800")
    assertSecretSafeResult(update, "happy-path entry update", [VALID_TOKEN])

    const removeArgs = ["entry", "remove", "800"]
    suiteLog.log(`args=${JSON.stringify(removeArgs)} fixture=entry-delete`)
    const remove = await runCli(removeArgs, { configDir: xdgBase, env })
    assertEquals(remove.code, 0, `entry remove failed: ${remove.stderr}`)
    assertStringIncludes(remove.stdout, "Deleted")
    assertStringIncludes(remove.stdout, "entry #800")
    assertSecretSafeResult(remove, "happy-path entry remove", [VALID_TOKEN])

    const projectPageRequests = mock.requests.filter((request) =>
      request.method === "GET" &&
      request.url.includes("/users/me/project_assignments")
    )
    assertEquals(projectPageRequests.length, 4)
    assertEquals(
      projectPageRequests.some((request) => request.url.includes("page=999")),
      false,
      "paginator must prefer absolute links.next over bogus next_page",
    )

    const entryPageRequests = mock.requests.filter((request) =>
      request.method === "GET" &&
      request.url.includes("/time_entries")
    )
    assertEquals(entryPageRequests.length, 2)
    assertEquals(
      entryPageRequests.some((request) => request.url.includes("page=999")),
      false,
      "entry list must follow absolute links.next URLs",
    )
    for (const request of entryPageRequests) {
      const requestUrl = new URL(request.url)
      assertEquals(requestUrl.searchParams.get("user_id"), String(USER_ID))
    }

    const mutationRequests = mock.requests.filter((request) =>
      request.method === "POST" ||
      request.method === "PATCH" ||
      request.method === "DELETE"
    )
    assertEquals(mutationRequests.length, 3)
    assertEquals(
      (mutationRequests[0].body as Record<string, unknown>).hours,
      4,
    )
    assertEquals(
      (mutationRequests[1].body as Record<string, unknown>).notes,
      "Release blocker closed",
    )

    for (const request of mock.requests) {
      assertEquals(request.authHeader, `Bearer ${VALID_TOKEN}`)
      assertEquals(request.accountIdHeader, ACCOUNT_ID)
    }

    suiteLog.log("redaction_scan=ok artifacts=4")

    assertArtifactsSecretSafe([
      {
        label: "mock fixture summary",
        content: JSON.stringify(mock.fixtures),
      },
      {
        label: "mock diagnostic log",
        content: mock.logs.join("\n"),
      },
      {
        label: "combined cli output",
        content: [
          login.stdout,
          login.stderr,
          projects.stdout,
          projects.stderr,
          clients.stdout,
          clients.stderr,
          add.stdout,
          add.stderr,
          list.stdout,
          list.stderr,
          update.stdout,
          update.stderr,
          remove.stdout,
          remove.stderr,
        ].join("\n"),
      },
    ])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e mock Harvest suite: invalid credentials fail without leaking the token", async () => {
  const mock = startMockHarvest()
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_mock_invalid_" })

  try {
    const result = await runCli(
      [
        "auth",
        "login",
        "--token",
        INVALID_TOKEN,
        "--name",
        "bad-login",
      ],
      { configDir: xdgBase, env: { HARVEST_BASE_URL: mock.baseUrl } },
    )
    assertEquals(result.code, 4)
    assertStringIncludes(result.stderr, "authentication failed")
    assertSecretSafeResult(result, "invalid-credentials", [
      INVALID_TOKEN,
      VALID_TOKEN,
    ])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e mock Harvest suite: missing entry ids surface a process-level not-found failure", async () => {
  const mock = startMockHarvest()
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_mock_missing_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "mock-e2e", appDir)

    const updateResult = await runCli(
      ["entry", "update", String(MISSING_ENTRY_ID), "--hours", "1"],
      { configDir: xdgBase, env: { HARVEST_BASE_URL: mock.baseUrl } },
    )
    assertEquals(updateResult.code, 1)
    assertStringIncludes(updateResult.stderr, "resource not found")
    assertSecretSafeResult(updateResult, "missing-entry update", [VALID_TOKEN])

    const removeResult = await runCli(
      ["entry", "remove", String(MISSING_ENTRY_ID)],
      { configDir: xdgBase, env: { HARVEST_BASE_URL: mock.baseUrl } },
    )
    assertEquals(removeResult.code, 1)
    assertStringIncludes(removeResult.stderr, "resource not found")
    assertSecretSafeResult(removeResult, "missing-entry remove", [VALID_TOKEN])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e mock Harvest suite: validation failures stop before any network call", async () => {
  const addResult = await runCli(
    [
      "entry",
      "add",
      "--project-id",
      "501",
      "--task-id",
      "601",
      "--date",
      "2026-03-17",
      "--hours",
      "0",
    ],
  )
  assertEquals(addResult.code, 2)
  assertStringIncludes(addResult.stderr, "Cannot set --hours to 0")
  assertSecretSafeResult(addResult, "validation add", [VALID_TOKEN])

  const updateResult = await runCli(["entry", "update", "701"])
  assertEquals(updateResult.code, 2)
  assertStringIncludes(updateResult.stderr, "No fields to update")
  assertSecretSafeResult(updateResult, "validation update", [VALID_TOKEN])
})

Deno.test("e2e mock Harvest suite: rate-limit and provider failures stay coherent at the process boundary", async () => {
  const rateLimited = startMockHarvest({ projectAssignmentsRateLimited: true })
  const providerError = startMockHarvest({ entryAddProviderError: true })
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_mock_errors_" })
  const appDir = join(xdgBase, "timeslip")

  try {
    await saveConfig([makeFixtureAccount()], "mock-e2e", appDir)

    const rateLimitResult = await runCli(
      ["project", "list", "--page-size", "2"],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: rateLimited.baseUrl },
      },
    )
    assertEquals(rateLimitResult.code, 1)
    assertStringIncludes(rateLimitResult.stderr, "rate limit exceeded")
    assertStringIncludes(rateLimitResult.stderr, "7 seconds")
    assertSecretSafeResult(rateLimitResult, "rate-limit error", [VALID_TOKEN])

    const providerResult = await runCli(
      [
        "entry",
        "add",
        "--project-id",
        "501",
        "--task-id",
        "601",
        "--date",
        "2026-03-17",
        "--hours",
        "2",
      ],
      {
        configDir: xdgBase,
        env: { HARVEST_BASE_URL: providerError.baseUrl },
      },
    )
    assertEquals(providerResult.code, 1)
    assertStringIncludes(providerResult.stderr, "mock upstream exploded")
    assertSecretSafeResult(providerResult, "provider error", [VALID_TOKEN])
  } finally {
    rateLimited.close()
    providerError.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e mock Harvest suite: debug mode remains token-safe across login and pagination", async () => {
  const mock = startMockHarvest()
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_mock_debug_" })
  const env = {
    HARVEST_BASE_URL: mock.baseUrl,
    TIMESLIP_DEBUG: "1",
  }

  try {
    const login = await runCli(
      [
        "auth",
        "login",
        "--token",
        VALID_TOKEN,
        "--name",
        "mock-debug",
      ],
      { configDir: xdgBase, env },
    )
    assertEquals(login.code, 0, `debug login failed: ${login.stderr}`)
    assertStringIncludes(login.stderr, "[harvest]")
    assertSecretSafeResult(login, "debug login", [VALID_TOKEN])

    const list = await runCli(
      ["--json", "entry", "list", "--all", "--page-size", "2"],
      { configDir: xdgBase, env },
    )
    assertEquals(list.code, 0, `debug entry list failed: ${list.stderr}`)
    assertStringIncludes(list.stderr, "[harvest]")
    assertStringIncludes(list.stderr, "GET")
    assertSecretSafeResult(list, "debug entry list", [VALID_TOKEN])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})
