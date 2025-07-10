import {
	pgTable,
	integer,
	text,
	boolean,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: integer("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	isActive: boolean("is_active").default(true),
});

export const schema = {
	users
};
