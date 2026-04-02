import { gray, red, setColorEnabled } from "@std/fmt/colors"

/** Exit codes per the timeslip contract. */
export const ExitCode = {
  Success: 0,
  Runtime: 1,
  Validation: 2,
  Auth: 4,
} as const

export type ExitCodeValue = (typeof ExitCode)[keyof typeof ExitCode]

export function isDebugMode(): boolean {
  const debug = Deno.env.get("TIMESLIP_DEBUG")
  return debug === "1" || debug === "true"
}

export class CliError extends Error {
  readonly userMessage: string
  readonly suggestion?: string
  readonly exitCode: ExitCodeValue

  constructor(
    userMessage: string,
    options?: {
      suggestion?: string
      cause?: unknown
      exitCode?: ExitCodeValue
    },
  ) {
    super(userMessage)
    this.name = "CliError"
    this.userMessage = userMessage
    this.suggestion = options?.suggestion
    this.exitCode = options?.exitCode ?? ExitCode.Runtime
    if (options?.cause) {
      this.cause = options.cause
    }
  }
}

export class ValidationError extends CliError {
  constructor(message: string, options?: { suggestion?: string }) {
    super(message, { ...options, exitCode: ExitCode.Validation })
    this.name = "ValidationError"
  }
}

export class AuthError extends CliError {
  constructor(message: string, options?: { suggestion?: string }) {
    super(message, {
      suggestion: options?.suggestion ??
        "Run `timeslip auth login` to authenticate.",
      exitCode: ExitCode.Auth,
    })
    this.name = "AuthError"
  }
}

export class NotFoundError extends CliError {
  readonly entityType: string
  readonly identifier: string

  constructor(
    entityType: string,
    identifier: string,
    options?: { suggestion?: string },
  ) {
    super(`${entityType} not found: ${identifier}`, options)
    this.name = "NotFoundError"
    this.entityType = entityType
    this.identifier = identifier
  }
}

export class ConfigError extends CliError {
  constructor(message: string, options?: { suggestion?: string }) {
    super(message, { ...options, exitCode: ExitCode.Runtime })
    this.name = "ConfigError"
  }
}

export class ProviderError extends CliError {
  readonly statusCode?: number

  constructor(
    message: string,
    options?: { suggestion?: string; cause?: unknown; statusCode?: number },
  ) {
    super(message, { ...options, exitCode: ExitCode.Runtime })
    this.name = "ProviderError"
    this.statusCode = options?.statusCode
  }
}

/**
 * Central error handler. Prints a user-friendly message to stderr and exits
 * with the appropriate code.
 */
export function handleError(error: unknown, context?: string): never {
  setColorEnabled(Deno.stderr.isTerminal())

  if (error instanceof CliError) {
    printCliError(error, context)
    Deno.exit(error.exitCode)
  } else if (error instanceof Error) {
    printGenericError(error, context)
  } else {
    printUnknownError(error, context)
  }

  Deno.exit(ExitCode.Runtime)
}

function printCliError(error: CliError, context?: string): void {
  const prefix = context ? `${context}: ` : ""
  console.error(red(`error: ${prefix}${error.userMessage}`))
  if (error.suggestion) {
    console.error(gray(`  ${error.suggestion}`))
  }
  if (isDebugMode() && error.cause instanceof Error) {
    printDebugInfo(error.cause)
  }
}

function printGenericError(error: Error, context?: string): void {
  const prefix = context ? `${context}: ` : ""
  console.error(red(`error: ${prefix}${error.message}`))
  if (isDebugMode()) {
    printDebugInfo(error)
  }
}

function printUnknownError(error: unknown, context?: string): void {
  const prefix = context ? `${context}: ` : ""
  console.error(red(`error: ${prefix}${String(error)}`))
}

function printDebugInfo(error: Error): void {
  console.error(gray("\nStack trace (TIMESLIP_DEBUG=1):"))
  if (error.stack) {
    console.error(gray(error.stack))
  }
}
