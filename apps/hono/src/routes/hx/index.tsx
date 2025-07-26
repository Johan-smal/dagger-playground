import { Hono } from "hono";
import { ContainerVariables } from "@/middleware/container";
import { app as authRoutes } from "./auth";
import { zValidator } from "@hono/zod-validator";
import { AppointmentsTable } from "@/templates/components/entities/appointments/AppointmentsTable";
import { jsxRenderer } from "hono/jsx-renderer";
import { authMiddleware } from "@/middleware/auth";
import { appointmentFiltersSchema } from "@/schemas";
import { validator } from 'hono/validator'
import { normalizeFilters } from "@/lib/utils";

const appointmentRoutes = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(authMiddleware)
  .get(
    "/",
    validator("query", async (value, _c) => {
      console.log('value', value)
      console.log(normalizeFilters(value))
      return await appointmentFiltersSchema.parseAsync(normalizeFilters(value))
    }),
    async (c) => {
      console.log('two', c.req.valid("query"))
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
