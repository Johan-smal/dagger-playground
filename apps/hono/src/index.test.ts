import { expect, describe, it } from "bun:test";
import { testClient } from 'hono/testing'
import { app } from './index'

describe('Hono App Tests', () => {
  const client = testClient(app)
  it('should respond with "Hello change!" on GET /', async () => {
    const res = await client.index.$get()
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('Hello change!')
  })
})