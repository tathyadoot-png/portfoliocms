export type ID = string

export type SortOrder = 'asc' | 'desc'

/** Normalized error shape surfaced to the UI from the service layer. */
export interface ApiError {
  message: string
  code?: string
  details?: string
}

/** Generic paginated result envelope for list queries. */
export interface PaginatedResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

/** Common list-query params shared across features. */
export interface ListParams {
  page?: number
  pageSize?: number
  search?: string
}
