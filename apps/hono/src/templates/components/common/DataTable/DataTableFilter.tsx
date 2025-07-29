import { FC } from "hono/jsx"
import { toJSONSchema, ZodObject } from "zod"
import { Icon } from "@/templates/components/common/Icon"
import { WithPagination, WithPaginationAndSort } from "@/schemas"

type FilterInputType = {
  label?: string
  type?: "date" | "between"
}

type FilterSchemaJson = {
  properties: {
    [x: string]: {
      label?: string
      properties: {
        [x: string]: FilterInputType
      }
    }
  }
}

export const DataTableFilter: FC<{
  formId: string,
  schema: ZodObject,
  filters?: WithPaginationAndSort<{}>
}> = ({ schema, formId, filters }) => {
  const initialFilters = schema.parse(filters ?? {});
  const json = toJSONSchema(schema, { unrepresentable: "any" }) as unknown as FilterSchemaJson
  const xData = `filters("${formId}"${initialFilters ? `, ${JSON.stringify(initialFilters)}` : ""})`;
  return (<>
    <div
      class="relative w-fit"
      x-data={xData}
    >
      <div x-bind="main">
        <button 
          type="button" 
          class="btn"
          x-bind="main_button"
        >
          Filters
        </button>
        <ul 
          class="menu absolute top-full left-0 bg-white border z-10"
          x-bind="primary_dropdown"
        >
          {Object.entries(json.properties).map(([primary, inputs]) => (<>
            <li style="position: initial">
              <button x-bind="primary_item" data-primary={primary}>
                { inputs.label || primary }
              </button>
              <ul
                class="menu m-0 absolute bg-white border top-0 left-full"
                x-bind="secondary_dropdown"
                data-primary={primary}
              >
                {Object.entries(inputs.properties).map(([secondary, input]) => {
                  const ref = `${primary}_${secondary}`
                  return (<>
                    <li style="position: initial" x-ref={ref}>
                      <button
                        x-bind="secondary_item"
                        data-secondary={secondary}
                      >{ input.label ?? secondary }</button>
                      <template x-if={`secondary === '${secondary}'`} style="display: none">
                        <div 
                          class="bg-white border"
                          x-bind="input_container"
                          data-ref={ref}
                        > 
                          {(({ ref, type }: { ref: string, type: FilterInputType['type'] }) => {
                            const model = `values.${ref}`
                            switch (type) {
                              case "between":
                                return <>
                                  <span 
                                  x-data={`{
                                    start: null,
                                    end: null,
                                    updateVal: function() {
                                      this.values.${ref} = [this.start, this.end]
                                    }
                                  }`}>
                                    <input x-bind="input" x-on:change="updateVal" type="date" x-model="start" /> - 
                                    <input x-bind="input" x-on:change="updateVal" type="date" x-model="end" />
                                  </span>
                                </>
                              default:
                                return <input x-bind="input" type={type} x-model={model} />
                            } 
                          })({ ref, type: input.type })}  
                          <button 
                            class="btn btn-circle"
                            x-bind="add_input"
                            data-primary={primary}
                            data-secondary={secondary}
                            data-ref={ref}
                          ><Icon name="plus" /></button>
                        </div>
                      </template>
                    </li>
                  </>)
                })}
              </ul>
            </li>
          </>))}
        </ul>
      </div>
      <div class="flex flex-wrap gap-2 my-2" x-show="computedChips.length > 0">
        <template x-for="chip in computedChips">
          <div class="badge badge-outline gap-2 items-center">
            <span x-text="chip.label"></span>
            <button 
              type="button" 
              class="btn btn-xs btn-circle btn-ghost"
              x-bind="remove_chip"
              x-bind:data-primary="chip.name"
              x-bind:data-secondary="chip.key"
            >✕</button>
          </div>
        </template>
        <button type="button" class="btn btn-sm btn-outline btn-error" x-on:click="clearAllFilters">
          Clear All
        </button>
      </div>
    </div>
  </>)
}