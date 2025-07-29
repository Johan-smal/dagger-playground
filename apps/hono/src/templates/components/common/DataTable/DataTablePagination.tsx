import { FC } from "hono/jsx"

export const DataTablePagination: FC<{ 
  pagination: { 
    page: number,
    pageSize: number, 
    total: number, 
    totalPages: number
  } 
}> = ({ pagination }) => {
  const { page, pageSize, total, totalPages } = pagination;
  return (
    <>
    <div class="flex items-center justify-between">
      <span class="text-sm text-gray-500">
        Page {page} of {totalPages} ({total} total items)
      </span>
      <div class="join">
        {page > 2 && (
          <button 
            x-bind="pagination"
            data-page="1"
            class="join-item btn btn-sm"
          >{"<<"}</button>
        )}
        {page > 1 && (
          <button
            x-bind="pagination"
            data-page={page - 1}
            class="join-item btn btn-sm"
          >{"<"}</button>
        )}
        <button 
          x-bind="pagination"
          data-page={page}
          disabled
          class="join-item btn btn-sm"
        >{page}</button>
        {page < totalPages && (
          <button
            x-bind="pagination"
            data-page={page + 1}
            class="join-item btn btn-sm"
          >{">"}</button>
        )}
        {page < totalPages - 1 && (
          <button
            x-bind="pagination"
            data-page={totalPages}
            class="join-item btn btn-sm"
          >{">>"}</button>
        )}
      </div>
    </div>
    </>
  )
}