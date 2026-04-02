/** Account name resolved from --account or TIMESLIP_ACCOUNT. */
let resolvedAccount: string | undefined

/** Whether --json was passed globally. */
let globalJson = false

/** Whether --robot was passed globally. */
let globalRobot = false

/** Read the resolved account name set by global flag handling. */
export function getGlobalAccount(): string | undefined {
  return resolvedAccount
}

/** Set the resolved account name (called from global action). */
export function setGlobalAccount(name: string | undefined): void {
  resolvedAccount = name
}

/** Read whether --json was passed globally. */
export function isJsonMode(): boolean {
  return globalJson
}

/** Set the --json mode flag (called from global action). */
export function setJsonMode(value: boolean): void {
  globalJson = value
}

/** Read whether --robot was passed globally. */
export function isRobotMode(): boolean {
  return globalRobot
}

/** Set the --robot mode flag (called from global action). */
export function setRobotMode(value: boolean): void {
  globalRobot = value
}
