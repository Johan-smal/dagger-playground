import { Dashboard } from "@/templates/layouts/Dashboard";
import { Public } from "@/templates/layouts/Public";
import { createMiddleware } from "hono/factory";
import { FC, PropsWithChildren } from "hono/jsx";
import { jsxRenderer } from "hono/jsx-renderer";

const createLayoutMiddleware = (
	Layout: FC<PropsWithChildren<{ title: string }>>
) => (title: string) => 
	createMiddleware(jsxRenderer(({ children }, c) => {
		if (!c.req.header('HX-Request')) {
			return <Layout title={title}>{ children }</Layout> 
		}
		c.header('HX-Retarget', '#main-container')
		return <>
			<head><title>{title}</title></head>
			{children}
		</>
	}))
export const pageMiddleware = createLayoutMiddleware(Public)
export const dashboardMiddleware = createLayoutMiddleware(Dashboard)
