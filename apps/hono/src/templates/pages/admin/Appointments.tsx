import { FC } from "hono/jsx";
import { appointmentFiltersSchema, type AppointmentFilters, type WithPaginationAndSort } from "@/schemas";
import { AppointmentsTable } from "@/templates/components/entities/appointments/AppointmentsTable";
import { DataTable } from "@/templates/components/common/DataTable/DataTable";

export const Appointments: FC<{
  filters?: WithPaginationAndSort<AppointmentFilters>
}> = async ({ filters }) => {
  return (
    <>
      <DataTable 
        filterSchema={appointmentFiltersSchema}
        filters={filters}
        hxGet="/hx/appointments"
      >
        <AppointmentsTable filters={filters} />
      </DataTable>
    </>
  )
}