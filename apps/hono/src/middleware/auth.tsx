import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"
import { ContainerVariables } from "./container"
import { organizations, users } from "@/db/schema"

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