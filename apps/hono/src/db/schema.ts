import {
	pgTable,
	text,
	boolean,
	uuid,
	timestamp,
	serial,
	primaryKey
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
	id: uuid("id").primaryKey(),
	name: text("username").notNull().unique(),
	email: text("email").notNull().unique(),
	isActive: boolean("is_active").default(true),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const authKeys = pgTable("auth_keys", {
  id: serial("id").primaryKey(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
  passwordHash: text("password_hash"), // nullable if using OAuth
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
	id: serial("id").primaryKey(),
	userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" })
});

export const organizations = pgTable("organizations", {
	id: uuid("id").primaryKey(),
	name: text("name").notNull(),
	slug: text("slug").notNull(),
	createdAt: timestamp("created_at").defaultNow(),
	updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => new Date()),
});

export const usersToOrganizations = pgTable(
	"users_to_organizations", 
	{
		userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
		organizationId: uuid("organization_id").references(() => organizations.id, { onDelete: "cascade" })
	},
	(t) => [primaryKey({ columns: [t.userId, t.organizationId] })]
)

export const schema = {
	users, 
	authKeys,
	sessions,
	organizations,
	usersToOrganizations
};
