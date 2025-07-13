import { Hono } from "hono";
import { dashboardMiddleware } from "@/middleware/layout";
import { ContainerVariables } from "@/middleware/container";
import { Dashboard } from "@/templates/pages/admin/Dashboard";
import { authMiddleware } from "@/middleware/auth";

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .use(authMiddleware)
  .get("/", dashboardMiddleware("Dashboard"), (c) => c.render(<Dashboard />))

export { app };
