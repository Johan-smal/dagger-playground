import { AuthMiddlewareVariables } from "@/middleware/auth";
import { DatePicker } from "@/templates/components/common/DatePicket";
import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Appointments: FC = async () => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  const { appointments: appointmentService } = c.get("container").get("entityServices")
  const appointments = await appointmentService.index(c.get("org"), {
    startDate: "2025-01-01",
    endDate: "2025-12-31"
  })
  return (
    <>
      <form
        hx-get="/hx/appointments"
        class="flex"
        hx-target="#appointments-table"
      >
        <DatePicker label="Start Date" name="startDate" />
        <DatePicker label="End Date" name="endDate" />
        <input type="submit" value="Filter" class="btn primary"></input>
      </form>
      <div id="appointments-table">
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
      </div>
    </>
  )
}