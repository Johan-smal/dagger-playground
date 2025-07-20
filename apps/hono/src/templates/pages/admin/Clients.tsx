import { AuthMiddlewareVariables } from "@/middleware/auth";
import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";

export const Clients: FC = async () => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  const { clients: clientService } = c.get("container").get("entityServices")
  const clients = await clientService.index(c.get("org"))
  return (
    <>
      <table class="table table-zebra table-pin-cols table-pin-rows">
        <thead>
					<tr>
            <th>Email</th>
						<th>Name</th>
					</tr>
				</thead>
        <tbody>
          {clients.map(({ id, email, name }) => (
            <tr key={id}>
              <td>{ email }</td>
              <td>{ name }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}