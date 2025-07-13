import { expect, describe, it, beforeAll, mock } from "bun:test";
import { app } from '@/routes'
import { generateMigration, generateDrizzleJson } from "drizzle-kit/api";
import { schema, db } from "@/db";
import { seeder } from "@/db/seeder";

beforeAll(async () => {
  mock.module("@/lib/auth", () => {
    return {
      hashPassword: async (password: string) => {
        return `hashed-${password}`;
      },
      verifyPassword: async (password: string, hash: string) => {
        return hash === `hashed-${password}`;
      },
    };
  });
  const migrationStatements = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson(schema)
  );
  for (const query of migrationStatements) {
    await db.execute(query);
  }
  await seeder(db);
})

describe('routes', () => {
  it('should respond with "Hello change!" on GET /', async () => {
    const res = await app.request('/')
    expect(res.status).toBe(200)
    const html = await res.text()
    expect(html).toContain('Welcome to Hono!')
  })

  it('should respond with Ok status on GET /health', async () => {
    const res = await app.request('/health')
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json).toEqual({ status: 'ok' })
  })

  it('should respond with 404 on unknown route', async () => {
    const res = await app.request('/unknown')
    expect(res.status).toBe(404)
    const html = await res.text()
    expect(html).toContain('Page not found')
  })
})