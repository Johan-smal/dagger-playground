import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { ContainerVariables } from "./container"
import { sessions, users } from "@/db/schema"
import { eq, getTableColumns } from "drizzle-orm"

export type AuthMiddlewareVariables = ContainerVariables & { user: typeof users.$inferSelect }

export const authMiddleware = createMiddleware<{ Variables: AuthMiddlewareVariables}>(async (c, next) => {
  const sessionId = getCookie(c, "test")
  if (!sessionId) {
    if (c.req.header('Hx-Request')) {
      c.header('HX-Redirect', '/login')
      return c.text('not allowed')
    }
    return c.redirect('/login')
  }
  const db = c.get("container").get("db")
  const [user] = await db.select({...getTableColumns(users)})
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(eq(sessions.id, Number(sessionId)))

  if (!user) {
    if (c.req.header('Hx-Request')) {
      c.header('HX-Redirect', '/login')
      return c.text('not allowed')
    }
    return c.redirect('/login')
  }
  
  c.set('user', user)
  await next()
})