export interface ApiError {
  message: string
  code?: string
  statusCode?: number
}

export interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface ApiResponse<T> {
  data: T | null
  loading: boolean
  error: ApiError | null
}
