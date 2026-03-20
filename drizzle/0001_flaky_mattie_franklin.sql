CREATE TYPE "public"."visibility" AS ENUM('public', 'private', 'password');--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "visibility" "visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "password" text;