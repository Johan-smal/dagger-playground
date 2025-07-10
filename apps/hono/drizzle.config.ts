import { defineConfig } from "drizzle-kit";

export default defineConfig({
	dialect: "postgresql",
	schema: "./src/db/schema.ts",
	driver: "pglite",
	out: "./src/db/migrations",
	dbCredentials: {
		url: "./.pglite/",
	},
});
