import { Hono } from "hono";
import { pageMiddleware } from "@/middleware/layout";
import { containerMiddleware } from "@/middleware/container";
import { Home } from "@/templates/pages/Home";
import { NotFound } from "@/templates/pages/NotFound";

const app = new Hono()
	.use(containerMiddleware)
	.get("/", pageMiddleware("Home"), (c) => c.render(<Home />))
	.get('/health', (c) => {
    return c.json({ status: 'ok' });
  })
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
