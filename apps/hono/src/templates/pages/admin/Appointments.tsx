import { FC } from "hono/jsx";
import { appointmentFiltersSchema } from "@/schemas";
import { AppointmentsTable } from "@/templates/components/entities/appointments/AppointmentsTable";
import { DataTable } from "@/templates/components/common/DataTable/DataTable";

export const Appointments: FC = async () => {
  return (
    <>
      <DataTable 
        filterSchema={appointmentFiltersSchema}
        hxGet="/hx/appointments"
      >
        <AppointmentsTable filters={{}} />
      </DataTable>
    </>
  )
}