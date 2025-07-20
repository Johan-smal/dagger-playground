import { seed, reset as drizzleReset } from "drizzle-seed"
import { generateMigration, generateDrizzleJson } from "drizzle-kit/api";
import { DrizzleDb, pglite, schema } from "@/db"

import { hashPassword } from "@/lib/auth";
import { 
  authKeys,
  clients,
  organizations,
  referrals,
  users,
  usersToOrganizations,
  appointments
} from "./schema";

export const seeder = async (db: DrizzleDb) => {
  const password = await hashPassword('qwerty');
  await seed(db, {
    users,
    authKeys,
    organizations,
    usersToOrganizations
  }, { seed: 12345 }).refine((f) => ({
    users: {
      count: 10,
      with: {
        authKeys: 1,
        usersToOrganizations: 1
      }
    },
    authKeys: {
      columns: {
        passwordHash: f.valuesFromArray({ values: [password] })
      }
    },
    organizations: {
      count: 3
    },
  }))

  const organizationIds = (await db.select({ id: organizations.id }).from(organizations)).map((o) => (o.id))

  await Promise.all(organizationIds.map((org, index) => {
    return seed(db, {
      clients,
      referrals,
      appointments
    }, { seed: index }).refine((f) => ({
      clients: {
        count: 20,
        columns: {
          organizationId: f.valuesFromArray({ values: [org] })
        },
        with: {
          appointments: [{ weight: 1, count: [5, 8, 10] }]
        }
      },
      referrals: {
        count: 4,
        columns: {
          organizationId: f.valuesFromArray({ values: [org] })
        }
      },
      appointments: {
        columns: {
          organizationId: f.valuesFromArray({ values: [org] })
        }
      }
    }))
  }))

}

export const reset = async (db: DrizzleDb) => {
  await drizzleReset(db, schema)
}

export const drop = async (db: DrizzleDb) => {
  const migrationStatements = await generateMigration(
    generateDrizzleJson(schema),
    generateDrizzleJson({})
  );
  console.log("Dropping database with statements:\n", migrationStatements.join('\n'));;
  await Promise.all(migrationStatements.map(async (dropQuery) => {
    await db.execute(dropQuery.replace(/DROP TABLE /g, 'DROP TABLE IF EXISTS '))
  }));

  console.log("Dropping migrations table");
  await pglite.exec('DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE'); 
}