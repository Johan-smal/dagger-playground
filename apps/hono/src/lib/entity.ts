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
import { AppointmentFilters, WithPaginationAndSort } from "@/schemas";
import { and, between, desc, eq, getTableColumns, gt, lt, SQL, count, asc } from "drizzle-orm";
import { PgColumn, PgSelect } from "drizzle-orm/pg-core";

const withPagination = async  <T extends PgSelect>(
  qb: T,
  orderByColumn: (PgColumn | SQL | SQL.Aliased)[],
  page = 1,
  pageSize = 25,
) =>  {
  const sq = db.$with('sq').as(qb);
  const [result, total] = await Promise.all([
    qb.orderBy(...orderByColumn).limit(pageSize).offset((page - 1) * pageSize),
    (await db.with(sq).select({ value: count() }).from(sq))[0].value
  ]);
  return {
    data: result,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize)
    }
  };
}

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
      filters: WithPaginationAndSort<AppointmentFilters> = {}
    ) => {
      
      const qb = db.select({
          ...getTableColumns(appointments),
          email: clients.email,
          referral: referrals.name
        })
        .from(appointments)
        .innerJoin(clients, eq(appointments.clientId, clients.id))
        .innerJoin(referrals, eq(clients.referralId, referrals.id))
        .$dynamic()

      const where = [
        eq(appointments.organizationId, org.id),
        filters.datetime?.gt ? gt(appointments.datetime, new Date(filters.datetime.gt)) : undefined,
        filters.datetime?.lt ? lt(appointments.datetime, new Date(filters.datetime.lt)) : undefined,
        filters.datetime?.between ? between(appointments.datetime, new Date(filters.datetime.between[0]), new Date(filters.datetime.between[1])) : undefined
      ]

      const sortBy = (filters.sortBy) ? Object.entries(filters.sortBy).map(([field, direction]) => {
        const column = ((field: string) => {
          switch (field) {
            case 'datetime':
              return appointments.datetime;
            case 'clients':
              return clients.email;
            case 'referrals':
              return referrals.name;
            default:
              throw new Error(`Invalid sort field: ${field}`);
          }
        })(field);
        if (!column) {
          throw new Error(`Invalid sort field: ${field}`);
        }
        return direction === 'asc' ? asc(column) : desc(column);
      }): [desc(appointments.datetime)];

      return withPagination(
        qb.where(and(...where)).$dynamic(),
        sortBy,
        filters.page,
        filters.pageSize
      )
    }
  }
}
