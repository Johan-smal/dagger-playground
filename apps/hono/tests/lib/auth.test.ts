import { describe, expect, test, mock } from "bun:test";
import { hashPassword, verifyPassword } from "@/lib/auth";

describe("Password hashing", () => {
  const password = "supersecret123";

  test("hashPassword returns a hashed string", async () => {
    const hash = await hashPassword(password);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(password);
    expect(hash.length).toBeGreaterThan(0);
  });

  test("verifyPassword returns true for correct password", async () => {
    const hash = await hashPassword(password);
    const result = await verifyPassword(password, hash);
    expect(result).toBe(true);
  });

  test("verifyPassword returns false for incorrect password", async () => {
    const hash = await hashPassword(password);
    const result = await verifyPassword("wrongpassword", hash);
    expect(result).toBe(false);
  });

  test("verifyPassword handles invalid hash safely", async () => {
    expect.assertions(1);
    try {
      await verifyPassword(password, "invalidhash");
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
    }
  });
});