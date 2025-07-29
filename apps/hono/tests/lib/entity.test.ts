import { describe, it, expect, beforeAll } from "bun:test";
import { entityServices } from "@/lib/entity";
import { pushDatabase } from "@tests/helpers/db";
import { db } from "@/db";
import { users, organizations, sessions, usersToOrganizations } from "@/db/schema";
import { eq } from "drizzle-orm";

let seededUser: any;
let seededOrg: any;
let seededSession: any;

beforeAll(async () => {
  await pushDatabase();
  // Get a seeded user for tests
  seededUser = (await db.select().from(users).limit(1))[0];
  // Find an org the user actually belongs to
  const userOrg = (await db.select().from(usersToOrganizations).where(eq(usersToOrganizations.userId, seededUser.id)).limit(1))[0];
  if (userOrg && userOrg.organizationId) {
    seededOrg = (await db.select().from(organizations).where(eq(organizations.id, userOrg.organizationId)).limit(1))[0];
  } else {
    seededOrg = undefined;
  }
  // Ensure a session exists for the seeded user
  seededSession = (await db.select().from(sessions).where(eq(sessions.userId, seededUser.id)).limit(1))[0];
  if (!seededSession) {
    // Insert a session if none exists
    const [inserted] = await db.insert(sessions).values({ userId: seededUser.id }).returning();
    seededSession = inserted;
  }
});

describe("entityServices.users.getBySession", () => {
  it("returns user for valid session", async () => {
    const user = await entityServices.users.getBySession(seededSession.id);
    expect(user).toBeTruthy();
    expect(user.id).toBe(seededUser.id);
  });

  it("returns undefined for invalid session", async () => {
    const user = await entityServices.users.getBySession(-1);
    expect(user).toBeUndefined();
  });
});

describe("entityServices.organizations.getByUser", () => {
  it("returns org for valid user", async () => {
    const org = await entityServices.organizations.getByUser(seededUser);
    expect(org).toBeTruthy();
    expect(org.id).toBe(seededOrg.id);
  });
});

describe("entityServices.clients.index", () => {
  it("returns clients for org", async () => {
    const clientsList = await entityServices.clients.index(seededOrg);
    expect(Array.isArray(clientsList)).toBe(true);
  });
});

describe("entityServices.referrals.index", () => {
  it("returns referrals for org", async () => {
    const referralsList = await entityServices.referrals.index(seededOrg);
    expect(Array.isArray(referralsList)).toBe(true);
  });
});

describe("entityServices.appointments.index", () => {
  it("returns paginated appointments for org", async () => {
    const result = await entityServices.appointments.index(seededOrg, { page: 1, pageSize: 10 });
    expect(result).toHaveProperty("data");
    expect(result).toHaveProperty("pagination");
    expect(Array.isArray(result.data)).toBe(true);
  });
});
