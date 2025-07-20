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
import { and, desc, eq, getTableColumns, gt, lt } from "drizzle-orm";

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
      filters: {
        startDate?: string,
        endDate?: string,
        clients?: (typeof clients.$inferSelect)['id'][]
        referrals?: (typeof referrals.$inferSelect)['id'][]
      } = {}
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
        filters.startDate ? gt(appointments.datetime, new Date(filters.startDate)) : undefined,
        filters.endDate ? lt(appointments.datetime, new Date(filters.endDate)) : undefined
      ]

      qb.where(and(...where))

      console.log('query', qb.toSQL(), filters)

      return qb
    }
  }
}
