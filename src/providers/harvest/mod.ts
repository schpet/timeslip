/**
 * Harvest provider barrel.
 *
 * Re-exports the Harvest client, paginator, mappers, and provider adapter.
 * Command code should never import from here — use domain types instead.
 */

export type {
  components as HarvestComponents,
  operations as HarvestOperations,
  paths as HarvestPaths,
} from "./generated/harvest.openapi.ts"

export {
  HarvestClient,
  type HarvestClientOptions,
  type RawResponse,
} from "./client.ts"
export {
  fetchPage,
  paginate,
  type PaginatedResult,
  type PaginateOptions,
} from "./paginator.ts"
export { mapProjectAssignment, mapTimeEntry, mapUser } from "./mappers.ts"
export { HarvestProvider, type HarvestProviderOptions } from "./provider.ts"
