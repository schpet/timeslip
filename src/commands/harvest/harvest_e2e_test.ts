import { assertEquals, assertStringIncludes } from "@std/assert"
import { join } from "@std/path"
import { saveConfig } from "../../config/mod.ts"
import type { Account } from "../../domain/mod.ts"
import { assertNoSecrets } from "../../test_helpers.ts"

const MAIN_PATH = new URL("../../main.ts", import.meta.url).pathname
const SCHEMA_PATH = new URL(
  "../../../schemas/harvest-openapi.yaml",
  import.meta.url,
)

const ACCOUNT_ID = "900001"
const USER_ID = 42
const VALID_TOKEN = "pat-900001.harvestapi_e2e_token_1234567890"

interface CliBytesResult {
  code: number
  stdout: Uint8Array
  stderr: Uint8Array
}

interface LoggedRequest {
  method: string
  url: string
  status: number
  fixtureId: string
  authHeader: string
  accountIdHeader: string
  bodyText: string
}

function makeFixtureAccount(): Account {
  return {
    name: "harvest-e2e",
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

function createLogger(prefix: string): {
  lines: string[]
  log: (message: string) => void
} {
  const lines: string[] = []
  return {
    lines,
    log(message: string) {
      const line = `[${prefix}] ${message}`
      lines.push(line)
      console.error(line)
    },
  }
}

async function runCliBytes(
  args: string[],
  options?: {
    cwd?: string
    env?: Record<string, string>
    configDir?: string
    stdinText?: string
  },
): Promise<CliBytesResult> {
  const configDir = options?.configDir ?? await Deno.makeTempDir()
  const env: Record<string, string> = {
    ...options?.env,
    XDG_CONFIG_HOME: configDir,
    NO_COLOR: "1",
  }

  const child = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      "--quiet",
      MAIN_PATH,
      ...args,
    ],
    cwd: options?.cwd,
    env,
    stdin: options?.stdinText !== undefined ? "piped" : "null",
    stdout: "piped",
    stderr: "piped",
  }).spawn()

  if (options?.stdinText !== undefined) {
    const writer = child.stdin.getWriter()
    await writer.write(new TextEncoder().encode(options.stdinText))
    await writer.close()
  }

  const output = await child.output()
  return {
    code: output.code,
    stdout: output.stdout,
    stderr: output.stderr,
  }
}

function decodeResult(result: CliBytesResult): {
  code: number
  stdout: string
  stderr: string
} {
  const decoder = new TextDecoder()
  return {
    code: result.code,
    stdout: decoder.decode(result.stdout),
    stderr: decoder.decode(result.stderr),
  }
}

function assertSecretSafeResult(
  result: { stdout: string; stderr: string },
  label: string,
): void {
  assertEquals(
    result.stdout.includes(VALID_TOKEN),
    false,
    `raw token found in ${label} stdout`,
  )
  assertEquals(
    result.stderr.includes(VALID_TOKEN),
    false,
    `raw token found in ${label} stderr`,
  )
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

function startMockHarvest() {
  const requests: LoggedRequest[] = []
  const logger = createLogger("mock-harvest-api")

  const paginatedLinks = (
    origin: string,
    pathname: string,
    page: number | null,
    params: URLSearchParams,
  ) => {
    if (page === null) {
      return null
    }
    const nextParams = new URLSearchParams(params)
    nextParams.set("page", String(page))
    return `${origin}${pathname}?${nextParams.toString()}`
  }

  const server = Deno.serve(
    { hostname: "127.0.0.1", port: 0, onListen: () => {} },
    async (req: Request) => {
      const url = new URL(req.url)
      const authHeader = req.headers.get("authorization") ?? ""
      const accountIdHeader = req.headers.get("harvest-account-id") ?? ""
      const bodyText = req.method === "GET" || req.method === "HEAD"
        ? ""
        : await req.text()

      const finish = (
        status: number,
        payload: unknown,
        fixtureId: string,
      ) => {
        requests.push({
          method: req.method,
          url: req.url,
          status,
          fixtureId,
          authHeader,
          accountIdHeader,
          bodyText,
        })
        logger.log(
          `fixture=${fixtureId} method=${req.method} url=${url.pathname}${url.search} status=${status}`,
        )
        return new Response(JSON.stringify(payload), {
          status,
          headers: { "Content-Type": "application/json" },
        })
      }

      if (
        authHeader !== `Bearer ${VALID_TOKEN}` ||
        accountIdHeader !== ACCOUNT_ID
      ) {
        return finish(401, { error: "invalid_token" }, "invalid-credentials")
      }

      if (req.method === "GET" && url.pathname.endsWith("/users/me")) {
        return finish(
          200,
          {
            id: USER_ID,
            first_name: "Mocky",
            last_name: "McMockface",
            email: "mocky@example.com",
          },
          "users-me",
        )
      }

      if (req.method === "GET" && url.pathname.endsWith("/query_echo")) {
        return finish(
          200,
          {
            query: Object.fromEntries(url.searchParams.entries()),
          },
          "query-echo",
        )
      }

      if (req.method === "POST" && url.pathname.endsWith("/body_echo")) {
        return finish(
          200,
          {
            received: JSON.parse(bodyText),
          },
          "body-echo",
        )
      }

      if (req.method === "POST" && url.pathname.endsWith("/input_echo")) {
        return finish(
          200,
          {
            received_raw: bodyText,
          },
          bodyText.includes("stdin_payload") ? "input-stdin" : "input-file",
        )
      }

      if (req.method === "GET" && url.pathname.endsWith("/time_entries")) {
        const page = Number(url.searchParams.get("page") ?? "1")

        if (url.searchParams.get("from") === "2026-03-17") {
          return finish(
            200,
            {
              page_marker: `warning-page-${page}`,
              time_entries: [{ id: 701 + page, user_id: USER_ID }],
              per_page: 1,
              total_pages: 2,
              total_entries: 2,
              next_page: page === 1 ? 2 : null,
              previous_page: page === 1 ? null : 1,
              page,
              links: {
                first: null,
                last: null,
                next: null,
                previous: null,
              },
            },
            `time-entries-warning-page-${page}`,
          )
        }

        if (url.searchParams.get("is_running") === "true") {
          return finish(
            200,
            {
              page_marker: `next-page-${page}`,
              time_entries: [{ id: 710 + page, is_running: true }],
              per_page: 1,
              total_pages: 2,
              total_entries: 2,
              next_page: page === 1 ? 2 : null,
              previous_page: page === 1 ? null : 1,
              page,
              links: {
                first: null,
                last: null,
                next: null,
                previous: null,
              },
            },
            `time-entries-next-page-${page}`,
          )
        }
      }

      if (req.method === "GET" && url.pathname.endsWith("/projects")) {
        const page = Number(url.searchParams.get("page") ?? "1")
        const next = page === 1
          ? paginatedLinks(url.origin, url.pathname, 2, url.searchParams)
          : null
        return finish(
          200,
          {
            page_marker: `projects-page-${page}`,
            projects: [{ id: 800 + page, name: `Project ${page}` }],
            per_page: 1,
            total_pages: 2,
            total_entries: 2,
            next_page: page === 1 ? 999 : null,
            previous_page: page === 1 ? null : 1,
            page,
            links: {
              first: paginatedLinks(
                url.origin,
                url.pathname,
                1,
                url.searchParams,
              ),
              last: paginatedLinks(
                url.origin,
                url.pathname,
                2,
                url.searchParams,
              ),
              next,
              previous: page === 1
                ? null
                : paginatedLinks(url.origin, url.pathname, 1, url.searchParams),
            },
          },
          `projects-page-${page}`,
        )
      }

      if (req.method === "GET" && url.pathname.endsWith("/foreign_pages")) {
        return finish(
          200,
          {
            page_marker: "foreign-page-1",
            projects: [{ id: 901, name: "Foreign Page 1" }],
            per_page: 1,
            total_pages: 2,
            total_entries: 2,
            next_page: null,
            previous_page: null,
            page: 1,
            links: {
              first: null,
              last: null,
              next: "https://evil.example.com/api/v2/foreign_pages?page=2",
              previous: null,
            },
          },
          "foreign-pages-page-1",
        )
      }

      if (req.method === "GET" && url.pathname.endsWith("/error")) {
        return finish(
          422,
          {
            message: "upstream said no",
            code: "invalid_range",
          },
          "error-422",
        )
      }

      return finish(404, { message: "Not found" }, "fallback-404")
    },
  )

  const addr = server.addr as Deno.NetAddr
  return {
    baseUrl: `http://127.0.0.1:${addr.port}/api/v2`,
    close: () => server.shutdown(),
    requests,
    logs: logger.lines,
  }
}

Deno.test("e2e harvest api: request modes, pagination, passthrough, and redaction stay coherent", async () => {
  const mock = startMockHarvest()
  const suiteLog = createLogger("harvest-api-e2e")
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_harvest_api_" })
  const appDir = join(xdgBase, "timeslip")
  const env = {
    HARVEST_BASE_URL: mock.baseUrl,
    TIMESLIP_DEBUG: "1",
  }

  try {
    await saveConfig([makeFixtureAccount()], "harvest-e2e", appDir)

    suiteLog.log('fixture=users-me args=["harvest","api","/users/me"]')
    const usersMe = decodeResult(
      await runCliBytes(["harvest", "api", "/users/me"], {
        configDir: xdgBase,
        env,
      }),
    )
    assertEquals(usersMe.code, 0, usersMe.stderr)
    assertStringIncludes(usersMe.stdout, `"id":${USER_ID}`)
    assertStringIncludes(usersMe.stderr, "[harvest] GET")
    assertSecretSafeResult(usersMe, "users-me")

    suiteLog.log(
      'fixture=query-echo args=["harvest","api","/query_echo","-F","user_id=@me","-F","is_running=true","-f","code=007","-f","note=@me"] input_mode=field-built',
    )
    const queryEcho = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/query_echo",
          "-F",
          "user_id=@me",
          "-F",
          "is_running=true",
          "-f",
          "code=007",
          "-f",
          "note=@me",
        ],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(queryEcho.code, 0, queryEcho.stderr)
    const queryData = JSON.parse(queryEcho.stdout)
    assertEquals(queryData.query.user_id, String(USER_ID))
    assertEquals(queryData.query.is_running, "true")
    assertEquals(queryData.query.code, "007")
    assertEquals(queryData.query.note, "@me")
    assertSecretSafeResult(queryEcho, "query-echo")

    suiteLog.log(
      'fixture=time-entries-warning args=["harvest","api","/time_entries","-F","user_id=@me","-F","from=2026-03-17"] input_mode=field-built',
    )
    const warningPage = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/time_entries",
          "-F",
          "user_id=@me",
          "-F",
          "from=2026-03-17",
        ],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(warningPage.code, 0, warningPage.stderr)
    assertStringIncludes(
      warningPage.stderr,
      "use --paginate to fetch all",
    )
    assertStringIncludes(warningPage.stdout, '"page_marker":"warning-page-1"')
    assertEquals(
      warningPage.stdout.includes('"page_marker":"warning-page-2"'),
      false,
    )
    assertSecretSafeResult(warningPage, "warning-page")

    suiteLog.log(
      'fixture=time-entries-next-page args=["harvest","api","/time_entries","-F","user_id=@me","-F","is_running=true","--paginate"] input_mode=field-built pagination=next_page',
    )
    const nextPage = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/time_entries",
          "-F",
          "user_id=@me",
          "-F",
          "is_running=true",
          "--paginate",
        ],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(nextPage.code, 0, nextPage.stderr)
    assertStringIncludes(nextPage.stdout, '"page_marker":"next-page-1"')
    assertStringIncludes(nextPage.stdout, '"page_marker":"next-page-2"')
    assertStringIncludes(nextPage.stderr, "following pagination: page=2")
    assertSecretSafeResult(nextPage, "next-page")

    suiteLog.log(
      'fixture=body-echo args=["harvest","api","/body_echo","-X","POST","-F","project_id=501","-F","active=true","-f","code=007"] input_mode=field-built',
    )
    const bodyEcho = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/body_echo",
          "-X",
          "POST",
          "-F",
          "project_id=501",
          "-F",
          "active=true",
          "-f",
          "code=007",
        ],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(bodyEcho.code, 0, bodyEcho.stderr)
    const bodyData = JSON.parse(bodyEcho.stdout)
    assertEquals(bodyData.received.project_id, 501)
    assertEquals(bodyData.received.active, true)
    assertEquals(bodyData.received.code, "007")
    assertSecretSafeResult(bodyEcho, "body-echo")

    const inputFile = join(xdgBase, "request-body.json")
    const filePayload = '{"source":"file_payload","count":2}\n'
    await Deno.writeTextFile(inputFile, filePayload)
    suiteLog.log(
      'fixture=input-file args=["harvest","api","/input_echo","-X","POST","--input","<temp-request-body.json>"] input_mode=file',
    )
    const fileInput = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/input_echo",
          "-X",
          "POST",
          "--input",
          inputFile,
        ],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(fileInput.code, 0, fileInput.stderr)
    const fileData = JSON.parse(fileInput.stdout)
    assertEquals(fileData.received_raw, filePayload)
    assertSecretSafeResult(fileInput, "input-file")

    const stdinPayload = '{"source":"stdin_payload","count":3}\n'
    suiteLog.log(
      'fixture=input-stdin args=["harvest","api","/input_echo","-X","POST","--input","-"] input_mode=stdin',
    )
    const stdinInput = decodeResult(
      await runCliBytes(
        [
          "harvest",
          "api",
          "/input_echo",
          "-X",
          "POST",
          "--input",
          "-",
        ],
        { configDir: xdgBase, env, stdinText: stdinPayload },
      ),
    )
    assertEquals(stdinInput.code, 0, stdinInput.stderr)
    const stdinData = JSON.parse(stdinInput.stdout)
    assertEquals(stdinData.received_raw, stdinPayload)
    assertSecretSafeResult(stdinInput, "input-stdin")

    suiteLog.log(
      'fixture=projects-page-1 args=["harvest","api","/projects","--paginate","--include"] pagination=links.next include=true',
    )
    const includePages = decodeResult(
      await runCliBytes(
        ["harvest", "api", "/projects", "--paginate", "--include"],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(includePages.code, 0, includePages.stderr)
    assertEquals(
      [...includePages.stdout.matchAll(/^HTTP 200$/gm)].length,
      2,
    )
    assertEquals(
      includePages.stdout.indexOf('"page_marker":"projects-page-1"') <
        includePages.stdout.indexOf('"page_marker":"projects-page-2"'),
      true,
    )
    assertStringIncludes(includePages.stderr, "following pagination:")
    suiteLog.log("include_boundaries=2 markers=projects-page-1,projects-page-2")
    assertSecretSafeResult(includePages, "include-pages")

    suiteLog.log(
      'fixture=error-422 args=["harvest","api","/error"] passthrough=non-2xx',
    )
    const errorResult = decodeResult(
      await runCliBytes(["harvest", "api", "/error"], {
        configDir: xdgBase,
        env,
      }),
    )
    assertEquals(errorResult.code, 1)
    assertStringIncludes(errorResult.stdout, '"code":"invalid_range"')
    assertEquals(
      errorResult.stderr.includes("error:"),
      false,
      "non-2xx passthrough should not be rewritten as a CLI error",
    )
    assertSecretSafeResult(errorResult, "error-422")

    suiteLog.log(
      'fixture=foreign-pages-page-1 args=["harvest","api","/foreign_pages","--paginate"] pagination=foreign-links.next',
    )
    const foreignPage = decodeResult(
      await runCliBytes(
        ["harvest", "api", "/foreign_pages", "--paginate"],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(foreignPage.code, 2)
    assertStringIncludes(
      foreignPage.stderr,
      "does not match the Harvest base URL",
    )
    assertStringIncludes(foreignPage.stdout, '"page_marker":"foreign-page-1"')
    assertSecretSafeResult(foreignPage, "foreign-pages")

    const queryRequest = mock.requests.find((request) =>
      request.fixtureId === "query-echo"
    )
    assertEquals(queryRequest !== undefined, true)
    const queryUrl = new URL(queryRequest!.url)
    assertEquals(queryUrl.searchParams.get("user_id"), String(USER_ID))
    assertEquals(queryUrl.searchParams.get("is_running"), "true")
    assertEquals(queryUrl.searchParams.get("code"), "007")
    assertEquals(queryUrl.searchParams.get("note"), "@me")

    const bodyRequest = mock.requests.find((request) =>
      request.fixtureId === "body-echo"
    )
    assertEquals(bodyRequest !== undefined, true)
    assertEquals(JSON.parse(bodyRequest!.bodyText).project_id, 501)
    assertEquals(JSON.parse(bodyRequest!.bodyText).active, true)
    assertEquals(JSON.parse(bodyRequest!.bodyText).code, "007")

    const warningRequests = mock.requests.filter((request) =>
      request.fixtureId.startsWith("time-entries-warning-page-")
    )
    assertEquals(warningRequests.length, 1)

    const nextPageRequests = mock.requests.filter((request) =>
      request.fixtureId.startsWith("time-entries-next-page-")
    )
    assertEquals(nextPageRequests.length, 2)
    assertEquals(
      nextPageRequests.some((request) => request.url.includes("page=999")),
      false,
      "next_page pagination should use the advertised page number only",
    )

    const projectRequests = mock.requests.filter((request) =>
      request.fixtureId.startsWith("projects-page-")
    )
    assertEquals(projectRequests.length, 2)
    assertEquals(
      projectRequests.some((request) => request.url.includes("page=999")),
      false,
      "links.next pagination must win over bogus next_page values",
    )

    const foreignRequests = mock.requests.filter((request) =>
      request.fixtureId.startsWith("foreign-pages-page-")
    )
    assertEquals(foreignRequests.length, 1)

    for (const request of mock.requests) {
      assertEquals(request.authHeader, `Bearer ${VALID_TOKEN}`)
      assertEquals(request.accountIdHeader, ACCOUNT_ID)
    }

    suiteLog.log("redaction_scan=ok artifacts=3")
    assertArtifactsSecretSafe([
      { label: "mock harvest api logs", content: mock.logs.join("\n") },
      { label: "harvest api suite logs", content: suiteLog.lines.join("\n") },
      {
        label: "harvest api combined output",
        content: [
          usersMe.stdout,
          usersMe.stderr,
          queryEcho.stdout,
          queryEcho.stderr,
          warningPage.stdout,
          warningPage.stderr,
          nextPage.stdout,
          nextPage.stderr,
          bodyEcho.stdout,
          bodyEcho.stderr,
          fileInput.stdout,
          fileInput.stderr,
          stdinInput.stdout,
          stdinInput.stderr,
          includePages.stdout,
          includePages.stderr,
          errorResult.stdout,
          errorResult.stderr,
          foreignPage.stdout,
          foreignPage.stderr,
        ].join("\n"),
      },
    ])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e harvest api: protected auth headers are rejected before any network call", async () => {
  const mock = startMockHarvest()
  const suiteLog = createLogger("harvest-api-header-guard")
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_harvest_hdr_" })
  const appDir = join(xdgBase, "timeslip")
  const env = { HARVEST_BASE_URL: mock.baseUrl }

  try {
    await saveConfig([makeFixtureAccount()], "harvest-e2e", appDir)

    suiteLog.log(
      'fixture=protected-auth args=["harvest","api","/users/me","-H","Authorization: blocked"] header_rejection=true',
    )
    const authOverride = decodeResult(
      await runCliBytes(
        ["harvest", "api", "/users/me", "-H", "Authorization: blocked"],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(authOverride.code, 2)
    assertStringIncludes(
      authOverride.stderr,
      "Cannot override protected header",
    )
    assertSecretSafeResult(authOverride, "protected-auth")

    suiteLog.log(
      'fixture=protected-account args=["harvest","api","/users/me","-H","Harvest-Account-Id: 123"] header_rejection=true',
    )
    const accountOverride = decodeResult(
      await runCliBytes(
        ["harvest", "api", "/users/me", "-H", "Harvest-Account-Id: 123"],
        { configDir: xdgBase, env },
      ),
    )
    assertEquals(accountOverride.code, 2)
    assertStringIncludes(
      accountOverride.stderr,
      "Cannot override protected header",
    )
    assertSecretSafeResult(accountOverride, "protected-account")

    assertEquals(mock.requests.length, 0)
    suiteLog.log("redaction_scan=ok header_override_rejection=2")
    assertArtifactsSecretSafe([
      {
        label: "harvest header guard logs",
        content: suiteLog.lines.join("\n"),
      },
      {
        label: "harvest header guard output",
        content: [
          authOverride.stdout,
          authOverride.stderr,
          accountOverride.stdout,
          accountOverride.stderr,
        ].join("\n"),
      },
    ])
  } finally {
    mock.close()
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
  }
})

Deno.test("e2e harvest schema: outputs bundled bytes exactly and is cwd-independent", async () => {
  const suiteLog = createLogger("harvest-schema-e2e")
  const xdgBase = await Deno.makeTempDir({ prefix: "timeslip_harvest_schema_" })
  const cwd = await Deno.makeTempDir({ prefix: "timeslip_harvest_schema_cwd_" })

  try {
    const expected = await Deno.readFile(SCHEMA_PATH)

    suiteLog.log('fixture=schema-default args=["harvest","schema"] cwd=repo')
    const schemaDefault = await runCliBytes(["harvest", "schema"], {
      configDir: xdgBase,
    })
    assertEquals(schemaDefault.code, 0)
    assertEquals(schemaDefault.stdout, expected)
    assertEquals(new TextDecoder().decode(schemaDefault.stderr), "")

    suiteLog.log('fixture=schema-cwd args=["harvest","schema"] cwd=tempdir')
    const schemaFromCwd = await runCliBytes(["harvest", "schema"], {
      configDir: xdgBase,
      cwd,
    })
    assertEquals(schemaFromCwd.code, 0)
    assertEquals(schemaFromCwd.stdout, expected)
    assertEquals(new TextDecoder().decode(schemaFromCwd.stderr), "")

    suiteLog.log("redaction_scan=ok schema_bytes=exact cwd_independent=true")
    assertArtifactsSecretSafe([
      {
        label: "harvest schema suite logs",
        content: suiteLog.lines.join("\n"),
      },
      {
        label: "harvest schema stderr",
        content: [
          new TextDecoder().decode(schemaDefault.stderr),
          new TextDecoder().decode(schemaFromCwd.stderr),
        ].join("\n"),
      },
    ])
  } finally {
    await Deno.remove(xdgBase, { recursive: true }).catch(() => {})
    await Deno.remove(cwd, { recursive: true }).catch(() => {})
  }
})
