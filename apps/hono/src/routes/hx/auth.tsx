import { Hono } from "hono";
import { ContainerVariables } from "@/middleware/container";
import { SignUpForm } from "@/templates/components/auth/SignUpForm";
import { setCookie, deleteCookie } from 'hono/cookie'
import { zValidator } from '@hono/zod-validator'
import { authKeys, users, sessions } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/schemas"

const app = new Hono<{
    Variables: ContainerVariables;
  }>()
  .get("/signup", async (c) => c.render(<SignUpForm />))
  .post("/signup", async (c) => {
    c.header('HX-Location', '/login');
    return c.render(<></>)
  })
  .post(
    "/login", 
    zValidator("form", loginSchema),
    async (c) => {
      const { email, password } = c.req.valid('form')
      const db = c.get("container").get("db")
      const [firstPassword] = await db.select({ passwordHash: authKeys.passwordHash, userId: users.id })
        .from(authKeys)
        .innerJoin(users, and(eq(users.id, authKeys.userId), eq(users.email, email)))
      if (!firstPassword || !firstPassword.passwordHash) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const { passwordHash, userId } = firstPassword
      const valid = await verifyPassword(password, passwordHash);
      if (!valid) {
        return c.json({ error: "Unauthorized" }, 401)
      }
      const [session] = await db.insert(sessions).values({ userId }).returning()
      setCookie(c, "test", `${session.id}`, {
        secure: true,
        httpOnly: true,
        maxAge: 10000,
        expires: new Date(Date.UTC(2000, 11, 24, 10, 30, 59, 900)),
        sameSite: 'Strict',
      })
      c.header('HX-Redirect', "/admin")
      return c.render(<></>)
    }
  )
  .post("/logout", async (c) => {
    deleteCookie(c, 'test')
    c.header('HX-Redirect', '/')
    return c.render(<></>)
  })
  
export { app };
