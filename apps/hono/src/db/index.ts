import { MemoryFS, PGlite } from "@electric-sql/pglite";
import { drizzle } from "drizzle-orm/pglite";
import { schema } from "@/db/schema";
import { NodeFS } from "@electric-sql/pglite/nodefs";

export const pglite = new PGlite({
	fs: Bun.env.NODE_ENV === "test"
		? new MemoryFS() 
		: new NodeFS("./.pglite/"),
})

export const db = drizzle({
	client: pglite,
	schema,
	logger: false,
});

export type DrizzleDb = typeof db;

export { schema };
