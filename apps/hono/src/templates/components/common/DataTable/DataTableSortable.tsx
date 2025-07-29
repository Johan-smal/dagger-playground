import { FC } from "hono/jsx";
import { Icon } from "@/templates/components/common/Icon";

export const DataTableSortable: FC<{
  field: string;
  currentSort?: { [x: string]: 'asc' | 'desc' };
}> = ({ field, currentSort }) => {
  const switchDirection = (dir: 'asc' | 'desc') => {
    return dir === 'asc' ? 'desc' : 'asc'
  };
  const direction = currentSort?.[field] ? switchDirection(currentSort[field]) : 'asc';
  return (
    <a
      x-bind="sortable"
      data-field={field}
      data-direction={direction}
      class="cursor-pointer px-2"
    >
      <Icon className="size-3" name="arrows-up-down" />
    </a>
  );
}