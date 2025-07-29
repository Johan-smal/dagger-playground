import { z } from 'zod'

// Common validation patterns
export const paginationSchema = z.object({
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).optional()
}).meta({ type: "pagination" })

export const sortBySchema = z.object({
  sortBy: z.object({}).catchall(z.enum(['asc', 'desc'])).optional()
}).meta({ type: "sortBy" })

export const paginationAndSortSchema = paginationSchema.extend(sortBySchema.shape).meta({ type: "paginationAndSort" })

export type PaginationSchema = z.infer<typeof paginationSchema>
export type SortBySchema = z.infer<typeof sortBySchema>
export type WithPagination<T> = T & PaginationSchema
export type WithSortBy<T> = T & SortBySchema
export type WithPaginationAndSort<T> = T & z.infer<typeof paginationAndSortSchema>

