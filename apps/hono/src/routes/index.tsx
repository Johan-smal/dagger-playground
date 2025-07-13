import { Hono } from "hono";

import { containerMiddleware, ContainerVariables } from "@/middleware/container";

import { app as publicRoute } from "@/routes/public";
import { app as hxRoutes } from "@/routes/hx"
import { app as pageRoutes } from "@/routes/pages"

import { NotFound } from "@/templates/pages/NotFound";

const app = new Hono<{
		Variables: ContainerVariables;
	}>()
	.route("/public", publicRoute)
	.use(containerMiddleware)
	.route("/", pageRoutes)
	.route("/hx", hxRoutes)
	.get('/health', async (c) => c.json({ status: 'ok' }))
	.notFound((c) => {
		c.status(404);
		return c.render(<NotFound />);
	})
	.onError((err, c) => {
		c.status(500);
		return c.render(<div>Error: {err.message}</div>);
	});

export type HonoAppType = typeof app;
export { app };
