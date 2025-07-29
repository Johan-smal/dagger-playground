import { FC, PropsWithChildren } from "hono/jsx";
import { ZodObject } from "zod";
import { DataTableFilter } from "./DataTableFilter";
import { WithPaginationAndSort } from "@/schemas";
import { fi } from "zod/v4/locales";

type DataTableProps = PropsWithChildren<{
  hxGet?: string
  filterSchema?: ZodObject
  filters?: WithPaginationAndSort<{}>
}>

export const DataTable: FC<DataTableProps> = ({ 
  filterSchema,
  filters,
  hxGet,
  children
}) => {
  const hasForm = !!filterSchema && !!hxGet;
  // random unique string identifier 
  const tableIdentifier = `${Math.random().toString(36).substring(2, 15)}`;
  const formId = `dataTableForm_${tableIdentifier}`;
  const dataTableId = `data-table-${tableIdentifier}`;
  const [initialFilters] = Object.entries(filters?.sortBy ?? {}).map(([key, value]) => ({ field: key, direction: value }));
  const xData = `form("${formId}"${initialFilters ? `, ${JSON.stringify(initialFilters)}` : ""})`;
  return (
    <>
      {hasForm && (
        <form
          x-data={xData}
          hx-get={hxGet}
          hx-target={`#${dataTableId}`}
          x-bind="form"
        >
          <input x-ref="submit" type="submit" class="hidden"></input>
          <template x-for="input in computedInputs">
            <input type="hidden" x-bind:name="input.name" x-bind:value="input.value" />
          </template>
        </form>
      )}
      {filterSchema && (
        <DataTableFilter formId={formId} schema={filterSchema} filters={filters} />
      )}
      <div id={dataTableId} x-data={`dataTable("${formId}")`}>
        { children }
      </div>
    </>
  )
}