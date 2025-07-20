import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { ContainerVariables } from "./container"
import { organizations, sessions, users, usersToOrganizations } from "@/db/schema"
import { eq, getTableColumns } from "drizzle-orm"

export type AuthMiddlewareVariables = ContainerVariables & { 
  user: typeof users.$inferSelect,
  org: typeof organizations.$inferSelect
}

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
  const { 
    users: userService,
    organizations: orgService
  } = c.get("container").get("entityServices")
  const user = await userService.getBySession(sessionId)

  if (!user) {
    if (c.req.header('Hx-Request')) {
      c.header('HX-Redirect', '/login')
      return c.text('not allowed')
    }
    return c.redirect('/login')
  }

  const org = await orgService.getByUser(user)
  
  c.set('user', user)
  c.set('org', org)

  await next()
})