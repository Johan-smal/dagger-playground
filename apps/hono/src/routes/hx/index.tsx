import { Hono } from "hono";
import { ContainerVariables } from "@/middleware/container";
import { app as authRoutes } from "./auth";
import { zValidator } from "@hono/zod-validator";
import z from "zod"
import { AppointmentsTable } from "@/templates/components/entities/appointments/AppointmentsTable";
import { jsxRenderer } from "hono/jsx-renderer";
import { authMiddleware } from "@/middleware/auth";

const appointmentRoutes = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(authMiddleware)
  .get(
    "/",
    zValidator("query", z.object({
      startDate: z.string().optional(),
      endDate: z.string().optional()
    })),
    async (c) => c.render(<AppointmentsTable filters={c.req.valid("query")} />)
  )

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(jsxRenderer())
  .route("/auth", authRoutes)
  .route("/appointments", appointmentRoutes)
  
export { app };
