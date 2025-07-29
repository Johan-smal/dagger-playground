import { generateMigration, generateDrizzleJson } from "drizzle-kit/api";
import { schema, db } from "@/db";
import { seeder, reset } from "@/db/seeder";

let migrated = false;

export async function pushDatabase() {
  if (migrated) return;

  const migrationStatements = await generateMigration(
    generateDrizzleJson({}),
    generateDrizzleJson(schema)
  );

  for (const query of migrationStatements) {
    await db.execute(query);
  }

  await seeder(db);
  migrated = true;
}

export async function refreshDatabase() {
  await reset(db);
  await seeder(db);
}