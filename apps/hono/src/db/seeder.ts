import { seed, reset as drizzleReset } from "drizzle-seed"
import { DrizzleDb, schema } from "."

export const seeder = async (db: DrizzleDb) => {
  await seed(db, schema, { seed: 12345 }).refine((f) => ({
    users: {
      count: 10
    }
  }))
}

export const reset = async (db: DrizzleDb) => {
  await drizzleReset(db, schema)
}