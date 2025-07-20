import { referrals } from "@/db/schema";
import { AuthMiddlewareVariables } from "@/middleware/auth";
import { FC } from "hono/jsx";
import { useRequestContext } from "hono/jsx-renderer";
import { eq } from "drizzle-orm";

export const Referrals: FC = async () => {
  const c = useRequestContext<{
    Variables: AuthMiddlewareVariables;
  }>();
  const db = c.get("container").get("db")
  const org = c.get("org")
  const referralList = await db.select()
    .from(referrals)
    .where(eq(referrals.organizationId, org.id))
  return (
    <>
      <table class="table table-zebra table-pin-cols table-pin-rows">
        <thead>
          <tr>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {referralList.map(({ id, name }) => (
            <tr key={id}>
              <td>{ name }</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}