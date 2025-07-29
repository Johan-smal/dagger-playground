import { Hono } from "hono";
import { dashboardMiddleware } from "@/middleware/layout";
import { ContainerVariables } from "@/middleware/container";
import { Dashboard } from "@/templates/pages/admin/Dashboard";
import { authMiddleware } from "@/middleware/auth";
import { Clients } from "@/templates/pages/admin/Clients";
import { Referrals } from "@/templates/pages/admin/Referrals";
import { Appointments } from "@/templates/pages/admin/Appointments";
import { validator } from "hono/validator";
import { appointmentFiltersSchema, paginationAndSortSchema } from "@/schemas";
import { normalizeFilters } from "@/lib/utils";

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(authMiddleware)
  .get("/", dashboardMiddleware("Dashboard"), (c) => c.render(<Dashboard />))
  .get("/clients", dashboardMiddleware("Clients"), (c) => c.render(<Clients />))
  .get("/referrals", dashboardMiddleware("Referrals"), (c) => c.render(<Referrals />))
  .get(
    "/appointments",
    dashboardMiddleware("Appointments"),
    validator("query", async (value, _c) => {
      return await appointmentFiltersSchema
        .extend(paginationAndSortSchema.shape)
        .parseAsync(normalizeFilters(value))
    }),
    (c) => c.render(<Appointments filters={c.req.valid("query")} />)
  )
  
export { app };
