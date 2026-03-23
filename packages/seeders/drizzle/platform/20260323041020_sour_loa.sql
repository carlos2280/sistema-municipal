CREATE TYPE "public"."mfa_policy" AS ENUM('disabled', 'optional', 'required');--> statement-breakpoint
CREATE TYPE "public"."suscripcion_estado" AS ENUM('activa', 'suspendida', 'cancelada', 'trial');--> statement-breakpoint
ALTER TABLE "municipalidades" ALTER COLUMN "mfa_policy" SET DEFAULT 'optional'::"public"."mfa_policy";--> statement-breakpoint
ALTER TABLE "municipalidades" ALTER COLUMN "mfa_policy" SET DATA TYPE "public"."mfa_policy" USING "mfa_policy"::"public"."mfa_policy";--> statement-breakpoint
ALTER TABLE "suscripciones" ALTER COLUMN "estado" SET DEFAULT 'activa'::"public"."suscripcion_estado";--> statement-breakpoint
ALTER TABLE "suscripciones" ALTER COLUMN "estado" SET DATA TYPE "public"."suscripcion_estado" USING "estado"::"public"."suscripcion_estado";