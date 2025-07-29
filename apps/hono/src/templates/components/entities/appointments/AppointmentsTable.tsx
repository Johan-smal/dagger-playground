import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { AuthMiddlewareVariables } from "@/middleware/auth";
import { AppointmentFilters, WithPaginationAndSort } from "@/schemas";
import { DataTablePagination } from "@/templates/components/common/DataTable/DataTablePagination";
import { DataTableSortable } from "@/templates/components/common/DataTable/DataTableSortable";

export const AppointmentsTable: FC<{
  filters?: WithPaginationAndSort<AppointmentFilters>
}> = async ({ filters }) => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  const { appointments: appointmentService } = c.get("container").get("entityServices")
  const { data: appointments, pagination } = await appointmentService.index(c.get("org"), filters)
  return (<>
    <table class="table table-zebra table-pin-cols table-pin-rows">
      <thead>
        <tr>
          <th><div class="flex items-center">date<DataTableSortable currentSort={filters?.sortBy} field="datetime" /></div></th>
          <th><div class="flex items-center">client<DataTableSortable currentSort={filters?.sortBy} field="clients" /></div></th>
          <th><div class="flex items-center">referral<DataTableSortable currentSort={filters?.sortBy} field="referrals" /></div></th>
        </tr>
      </thead>
      <tbody>
        {appointments.map(({ id, datetime, email, referral }) => (
          <tr key={id}>
            <td>{ datetime.toDateString() }</td>
            <td>{ email }</td>
            <td>{ referral }</td>
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr>
          <td colSpan={3}><DataTablePagination pagination={pagination}/></td>
        </tr>
      </tfoot>
    </table>
  </>)
}