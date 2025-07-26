import { db } from "@/db";
import { 
  organizations,
  usersToOrganizations,
  users,
  clients,
  sessions,
  referrals,
  appointments
} from "@/db/schema";
import { AppointmentFilters } from "@/schemas";
import { and, between, desc, eq, getTableColumns, gt, lt } from "drizzle-orm";

export const entityServices =  {
  users: {
    getBySession: async (sessionId: number | string) => {
      const [user] = await db.select({...getTableColumns(users)})
          .from(sessions)
          .innerJoin(users, eq(sessions.userId, users.id))
          .where(eq(sessions.id, Number(sessionId)))
      return user
    }
  },
  organizations: {
    getByUser: async ({ id: userId }: typeof users.$inferSelect) => {
      const [org] = await db.select({...getTableColumns(organizations)})
          .from(usersToOrganizations)
          .innerJoin(organizations, eq(organizations.id, usersToOrganizations.organizationId))
          .where(eq(usersToOrganizations.userId, userId))
      return org
    }
  },
  clients: {
    index: async (
      org: typeof organizations.$inferSelect,
      _filters: {} = {}
    ) => {
      return await db.select()
        .from(clients)
        .where(eq(clients.organizationId, org.id))
    }
  },
  referrals: {
    index: async (
      org: typeof organizations.$inferSelect,
      _filters: {} = {}
    ) => {
      return await db.select()
          .from(referrals)
          .where(eq(referrals.organizationId, org.id))
    }
  },
  appointments: {
    index: async (
      org: typeof organizations.$inferSelect,
      filters: AppointmentFilters = {}
    ) => {
      const qb = db.select({
          ...getTableColumns(appointments),
          email: clients.email,
          referral: referrals.name
        })
        .from(appointments)
        .innerJoin(clients, eq(appointments.clientId, clients.id))
        .innerJoin(referrals, eq(clients.referralId, referrals.id))
        .orderBy(desc(appointments.datetime))
        .$dynamic()

      const where = [
        eq(appointments.organizationId, org.id),
        filters.datetime?.gt ? gt(appointments.datetime, new Date(filters.datetime.gt)) : undefined,
        filters.datetime?.lt ? lt(appointments.datetime, new Date(filters.datetime.lt)) : undefined,
        filters.datetime?.between ? between(appointments.datetime, new Date(filters.datetime.between[0]), new Date(filters.datetime.between[1])) : undefined
      ]

      return qb.where(and(...where))
    }
  }
}
