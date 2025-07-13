import { Hono } from "hono";

import { app as adminRoutes } from "@/routes/pages/admin"

import { pageMiddleware } from "@/middleware/layout";
import { ContainerVariables } from "@/middleware/container";

import { Home } from "@/templates/pages/Home";
import { Login } from "@/templates/pages/Login";
import { About } from "@/templates/pages/About";

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .get("/", pageMiddleware("Home"), (c) => c.render(<Home />))
  .get("/about", pageMiddleware("About"), (c) => c.render(<About />))
  .get("/login", pageMiddleware("Login/Register"), (c) => c.render(<Login />))
  .route("/admin", adminRoutes)

export { app };
