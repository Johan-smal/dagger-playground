import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { AuthMiddlewareVariables } from "@/middleware/auth";
import { AppointmentFilters } from "@/schemas";

export const AppointmentsTable: FC<{
  filters: AppointmentFilters
}> = async ({ filters }) => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  const { appointments: appointmentService } = c.get("container").get("entityServices")
  const appointments = await appointmentService.index(c.get("org"), filters)
  return (<>
    <table class="table table-zebra table-pin-cols table-pin-rows">
      <thead>
        <tr>
          <th>date</th>
          <th>client</th>
          <th>referral</th>
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
    </table>
  </>)
}