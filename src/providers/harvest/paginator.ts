/**
 * Harvest pagination helpers.
 *
 * Supports two cursor styles:
 * 1. `links.next` — absolute URL for the next page (preferred).
 * 2. `next_page` — numeric page number (legacy fallback).
 *
 * Callers can set `perPage` and `limit` to control page size and total
 * item count. Pagination metadata tracks pages fetched and whether
 * results were truncated by the caller's limit.
 */

import type { HarvestClient } from "./client.ts"
import type { PaginationMeta } from "../../domain/mod.ts"
import type { components } from "./generated/harvest.openapi.ts"

/** Shape shared by all Harvest paginated responses. */
export interface HarvestPaginatedResponse<K extends string> {
  readonly [key: string]: unknown
  readonly per_page: number
  readonly total_pages: number
  readonly total_entries: number
  readonly next_page: number | null
  readonly previous_page: number | null
  readonly page: number
  readonly links: components["schemas"]["PaginationLinks"]
}

export interface PaginateOptions {
  /** Number of records per page (Harvest max: 2000). */
  perPage?: number
  /** Maximum total items to return. Undefined = fetch all. */
  limit?: number
}

export interface PaginatedResult<T> {
  items: T[]
  meta: PaginationMeta
}

/**
 * Paginate through a Harvest list endpoint.
 *
 * @param client   - The HarvestClient to use for requests.
 * @param path     - Relative API path for the first page (e.g. "/time_entries").
 * @param itemsKey - The response key containing the array (e.g. "time_entries").
 * @param params   - Extra query parameters for the first request.
 * @param options  - Pagination control options.
 */
export async function paginate<T>(
  client: HarvestClient,
  path: string,
  itemsKey: string,
  params?: Record<string, string | number | boolean | undefined>,
  options?: PaginateOptions,
): Promise<PaginatedResult<T>> {
  const perPage = options?.perPage
  const limit = options?.limit
  const allItems: T[] = []
  let pagesFetched = 0
  let totalEntries = 0

  // Build first-page params
  const firstParams = { ...params }
  if (perPage !== undefined) {
    firstParams["per_page"] = perPage
  }

  // Fetch first page
  const firstPage = await client.request<Record<string, unknown>>(
    path,
    { params: firstParams },
  )
  pagesFetched++

  const page = firstPage as unknown as HarvestPaginatedResponse<string>
  totalEntries = page.total_entries
  const items = (firstPage[itemsKey] ?? []) as T[]
  allItems.push(...items)

  // Check if we've hit the caller's limit
  if (limit !== undefined && allItems.length >= limit) {
    return {
      items: allItems.slice(0, limit),
      meta: { totalEntries, pagesFetched, truncated: true },
    }
  }

  // Traverse subsequent pages
  let nextUrl = page.links?.next ?? null
  let nextPageNum = page.next_page

  while (nextUrl || nextPageNum !== null) {
    let nextPage: Record<string, unknown>

    if (nextUrl) {
      // Prefer links.next (absolute URL)
      nextPage = await client.requestAbsolute<Record<string, unknown>>(nextUrl)
    } else if (nextPageNum !== null) {
      // Fallback to next_page number
      nextPage = await client.request<Record<string, unknown>>(path, {
        params: { ...firstParams, page: nextPageNum },
      })
    } else {
      break
    }

    pagesFetched++
    const pageData = nextPage as unknown as HarvestPaginatedResponse<string>
    const pageItems = (nextPage[itemsKey] ?? []) as T[]
    allItems.push(...pageItems)

    if (limit !== undefined && allItems.length >= limit) {
      return {
        items: allItems.slice(0, limit),
        meta: { totalEntries, pagesFetched, truncated: true },
      }
    }

    // Advance cursors
    nextUrl = pageData.links?.next ?? null
    nextPageNum = pageData.next_page
  }

  return {
    items: allItems,
    meta: { totalEntries, pagesFetched, truncated: false },
  }
}

/**
 * Fetch a single page from a Harvest list endpoint.
 * Used when the caller wants explicit page-based access.
 */
export async function fetchPage<T>(
  client: HarvestClient,
  path: string,
  itemsKey: string,
  params?: Record<string, string | number | boolean | undefined>,
): Promise<{
  items: T[]
  page: number
  totalPages: number
  totalEntries: number
  nextPage: number | null
  previousPage: number | null
}> {
  const data = await client.request<Record<string, unknown>>(path, { params })
  const page = data as unknown as HarvestPaginatedResponse<string>

  return {
    items: (data[itemsKey] ?? []) as T[],
    page: page.page,
    totalPages: page.total_pages,
    totalEntries: page.total_entries,
    nextPage: page.next_page,
    previousPage: page.previous_page,
  }
}
