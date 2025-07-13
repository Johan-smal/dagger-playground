import { seed, reset as drizzleReset } from "drizzle-seed"
import { generateMigration, generateDrizzleJson } from "drizzle-kit/api";
import { DrizzleDb, schema, pglite } from "@/db"
import { hashPassword } from "@/lib/auth";

export const seeder = async (db: DrizzleDb) => {
  const password = await hashPassword('password123');
  await seed(db, schema, { seed: 12345 }).refine((f) => ({
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
    sessions: {
      count: 0
    }
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