import { FC, PropsWithChildren } from "hono/jsx";
import { ZodObject } from "zod";
import { DataTableFilter } from "./DataTableFilter";

type DataTableProps = PropsWithChildren<{
  hxGet?: string
  filterSchema?: ZodObject
}>

export const DataTable: FC<DataTableProps> = ({ filterSchema, hxGet, children }) => {
  const hasForm = !!filterSchema && !!hxGet;
  // random unique string identifier 
  const tableIdentifier = `${Math.random().toString(36).substring(2, 15)}`;
  const formId = `dataTableForm_${tableIdentifier}`;
  const dataTableId = `data-table-${tableIdentifier}`;
  return (
    <>
      {hasForm && (
        <form
          x-data={`form("${formId}")`}
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
        <DataTableFilter formId={formId} schema={filterSchema} />
      )}
      <div id={dataTableId}>
        { children }
      </div>
    </>
  )
}