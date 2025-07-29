import { expect, describe, it, beforeAll, beforeEach, mock } from "bun:test";
import { app } from '@/routes'
import { pushDatabase } from "@tests/helpers/db";
import { mockAuthLib } from "@tests/helpers/auth";
import { db } from "@/db";
import { users, authKeys } from "@/db/schema";
import { reset } from "@/db/seeder";

beforeAll(async () => {
  mockAuthLib();
  await pushDatabase();
})

beforeEach(async () => {
  await reset(db);
});

describe('auth endpoints', () => {
  it('should return 400 if missing credentials on POST /hx/auth/login', async () => {
    const form = new URLSearchParams();
    const res = await app.request('/hx/auth/login', { method: 'POST', body: form });
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it('should return 401 for invalid credentials on POST /hx/auth/login', async () => {
    const form = new URLSearchParams({ email: 'foo@example.com', password: 'bar' });
    const res = await app.request('/hx/auth/login', { method: 'POST', body: form });
    let json;
    try {
      json = await res.json();
    } catch (e) {
      json = { error: 'Non-JSON error response' };
    }
    expect(res.status).toBe(401);
    expect(json.error).toBeDefined();
  });

  it('should return 400 for invalid email format on POST /hx/auth/login', async () => {
    const form = new URLSearchParams({ email: 'not-an-email', password: 'bar' });
    const res = await app.request('/hx/auth/login', { method: 'POST', body: form });
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toBeDefined();
    if (typeof json.error === 'string') {
      expect(json.error).toMatch(/email/i);
    } else if (Array.isArray(json.error) && json.error.length > 0 && json.error[0].message) {
      expect(json.error[0].message).toMatch(/email/i);
    } else if (json.error && typeof json.error.message === 'string') {
      expect(json.error.message).toMatch(/email/i);
    } else if (json.message) {
      expect(json.message).toMatch(/email/i);
    } else if (json.name === 'ZodError' && json.message) {
      expect(json.message).toMatch(/email/i);
    } else {
      throw new Error('No email validation error found in response');
    }
  });

  it('should login successfully with valid credentials', async () => {
    // Insert a user and password hash into the test db
    const email = 'testuser@example.com';
    const password = 'testpass';
    const passwordHash = await (await import('@/lib/auth')).hashPassword(password);
    // Insert user and authKey
    const userId = '2301743e-c5c2-4a8c-ab58-476773410245';
    const userResult = await db.insert(users).values({ id: userId, email, name: 'Test User' }).returning();
    await db.insert(authKeys).values({ userId, passwordHash }).returning();

    const form = new URLSearchParams({ email, password });
    const res = await app.request('/hx/auth/login', { method: 'POST', body: form });
    expect(res.status).toBe(200);
    // Should set a cookie and redirect
    expect(res.headers.get('set-cookie')).toBeTruthy();
    expect(res.headers.get('hx-redirect')).toBe('/admin');
  });

  it('should logout and clear the cookie', async () => {
    // Simulate a session cookie
    const res = await app.request('/hx/auth/logout', { method: 'POST', headers: { cookie: 'test=some-session-id' } });
    expect(res.status).toBe(200);
    expect(res.headers.get('set-cookie')).toMatch(/test=;/);
    expect(res.headers.get('hx-redirect')).toBe('/');
  });

  // Add more tests as needed for register, logout, etc.
});
