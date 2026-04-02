import denoConfig from "../deno.json" with { type: "json" }

/** The CLI version, read from deno.json. */
export const VERSION: string = denoConfig.version

/** User-Agent string for provider HTTP requests. */
export const USER_AGENT: string = `timeslip/${VERSION}`
