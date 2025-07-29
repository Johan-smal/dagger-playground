import { Hono } from "hono";
import { ContainerVariables } from "@/middleware/container";
import { app as authRoutes } from "./auth";
import { AppointmentsTable } from "@/templates/components/entities/appointments/AppointmentsTable";
import { jsxRenderer } from "hono/jsx-renderer";
import { authMiddleware } from "@/middleware/auth";
import { appointmentFiltersSchema, paginationAndSortSchema } from "@/schemas";
import { validator } from 'hono/validator'
import { normalizeFilters } from "@/lib/utils";

const appointmentRoutes = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(authMiddleware)
  .get(
    "/",
    validator("query", async (value, _c) => {
      return await appointmentFiltersSchema
        .extend(paginationAndSortSchema.shape)
        .parseAsync(normalizeFilters(value))
    }),
    async (c) => {
      const hxPushUrl = new URLSearchParams(
        Object.entries(c.req.queries()).flatMap(([key, value]) =>
          Array.isArray(value)
            ? value.map(v => [key, v])
            : [[key, value]]
        )
      ).toString();
      c.header(
        "HX-Push-Url",
        `?${hxPushUrl}`
      );
      return c.render(<AppointmentsTable filters={c.req.valid("query")} />)
    }
  )

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(jsxRenderer())
  .route("/auth", authRoutes)
  .route("/appointments", appointmentRoutes)
  
export { app };
