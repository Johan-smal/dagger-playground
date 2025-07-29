import { expect, describe, it, beforeAll, mock } from "bun:test";
import { app } from '@/routes'
import { pushDatabase } from "@tests/helpers/db";
import { mockAuthLib } from "@tests/helpers/auth";

beforeAll(async () => {
  mockAuthLib();
  await pushDatabase();
})

describe('routes', () => {
  it('should respond with "Hello change!" on GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Welcome to Hono!')
  })

  it('should respond with 404 on unknown route', async () => {
    const res = await app.request('/unknown')
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain('Page not found')
  })
})