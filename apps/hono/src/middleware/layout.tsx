import { Layout } from "@/templates/Layout";
import { createMiddleware } from "hono/factory";
import { jsxRenderer } from "hono/jsx-renderer";

export const pageMiddleware = (title: string) => {
	return createMiddleware(
		jsxRenderer(({ children }, c) => {
			return <Layout title={title}>{children}</Layout>;
		}),
	);
};
