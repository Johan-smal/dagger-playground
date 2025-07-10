CREATE TABLE "users" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"is_active" boolean DEFAULT true,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
