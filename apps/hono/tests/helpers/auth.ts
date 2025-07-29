// Helper to mock the @/lib/auth module for tests
import { mock } from "bun:test";

export function mockAuthLib() {
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
}
