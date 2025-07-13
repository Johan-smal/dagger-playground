#! /usr/bin/env bun
import { db } from "@/db";
import { drop, reset, seeder } from "@/db/seeder";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { bunx, bun } from "@bin/helpers";

yargs()
	.command("db:studio", "Opens the database studio", async (argv) => {
		await bunx(["drizzle-kit", "studio"]);
	})
	.command("db:generate", "Generates database schema and migrations", async (argv) => {
		await bunx(["drizzle-kit", "generate"]);
	})
	.command("db:migrate", "Runs database migrations", async (argv) => {
		await bunx(["drizzle-kit", "migrate"])
	})
	.command("db:seed", "Imports draft data", async (argv) => {
		await reset(db);
		await seeder(db);
		console.log("Database seeded successfully.");
	})
	.command("db:drop", "Drops the database", async (argv) => {
		await drop(db);
		console.log("Database dropped successfully.");
	})
	.command("db:reset", "Resets the database", async (argv) => {
		await bun(['cli', 'db:drop']);
		await bun(['cli', 'db:migrate']);
		await bun(['cli', 'db:seed']);
		console.log("Database reset and seeded successfully.");
	})
	.help()
	.parse(hideBin(process.argv));
