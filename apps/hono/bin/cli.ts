#! /usr/bin/env bun
import { db } from "@/db";
import { reset, seeder } from "@/db/seeder";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";

yargs()
	.command("db:seed", "Imports draft data", async (argv) => {
		await reset(db);
		await seeder(db);
		console.log("Database seeded successfully.");
	})
	.help()
	.parse(hideBin(process.argv));
