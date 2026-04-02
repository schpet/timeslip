/**
 * Shared test helpers for the timeslip test suite.
 *
 * Provides CLI invocation harness, output capture utilities, and
 * redaction scanning for secret-safe assertions.
 */

/** Result of running the CLI as a subprocess. */
export interface CliResult {
  code: number
  stdout: string
  stderr: string
}

/**
 * Run the timeslip CLI entrypoint as a subprocess.
 * Isolated from real config by setting XDG_CONFIG_HOME to a temp dir.
 */
export async function runCli(
  args: string[],
  options?: {
    env?: Record<string, string>
    configDir?: string
  },
): Promise<CliResult> {
  const configDir = options?.configDir ?? await Deno.makeTempDir()
  const env: Record<string, string> = {
    ...options?.env,
    XDG_CONFIG_HOME: configDir,
    // Disable colors for deterministic output
    NO_COLOR: "1",
  }

  const cmd = new Deno.Command(Deno.execPath(), {
    args: [
      "run",
      "--allow-all",
      "--quiet",
      new URL("./main.ts", import.meta.url).pathname,
      ...args,
    ],
    env,
    stdout: "piped",
    stderr: "piped",
  })

  const output = await cmd.output()
  const decoder = new TextDecoder()
  return {
    code: output.code,
    stdout: decoder.decode(output.stdout),
    stderr: decoder.decode(output.stderr),
  }
}

/** Token-shaped patterns that must never appear in test output. */
const TOKEN_PATTERNS = [
  // Hex-like tokens 20+ chars
  /\b[0-9a-f]{20,}\b/i,
  // Bearer tokens in headers
  /Bearer\s+[A-Za-z0-9_\-.]+/,
  // Auth-bearing header names should never appear in persisted artifacts/logs
  /authorization\s*:/i,
  // Common token prefixes
  /\b(sk|pk|pat|ghp|gho|ghs|ghr)_[A-Za-z0-9_]{10,}\b/,
  // Harvest PATs: pat-ACCOUNTID.random-suffix
  /\bpat-\d+\.[A-Za-z0-9._-]{10,}\b/,
]

/**
 * Assert that no token-shaped strings appear in the given text.
 * Used in E2E tests to verify no secrets leak into output.
 */
export function assertNoSecrets(text: string, label: string): void {
  for (const pattern of TOKEN_PATTERNS) {
    const match = pattern.exec(text)
    if (match) {
      throw new Error(
        `Secret-looking string found in ${label}: "${
          match[0].slice(0, 10)
        }..."`,
      )
    }
  }
}

/**
 * Capture stdout writes during a synchronous callback.
 * Returns the captured text and restores the original writer.
 */
export function captureStdout(fn: () => void): string {
  const chunks: string[] = []
  const original = console.log
  console.log = (...args: unknown[]) => {
    chunks.push(args.map(String).join(" "))
  }
  try {
    fn()
  } finally {
    console.log = original
  }
  return chunks.join("\n")
}

/**
 * Capture stderr writes during a synchronous callback.
 */
export function captureStderr(fn: () => void): string {
  const chunks: string[] = []
  const original = console.error
  console.error = (...args: unknown[]) => {
    chunks.push(args.map(String).join(" "))
  }
  try {
    fn()
  } finally {
    console.error = original
  }
  return chunks.join("\n")
}
