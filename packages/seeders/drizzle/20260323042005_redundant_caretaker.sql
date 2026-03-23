ALTER TABLE "identidad"."menu" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "identidad"."menu" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ADD COLUMN "deleted_at" timestamp;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ADD COLUMN "deleted_by" integer;--> statement-breakpoint
-- Índices parciales para filtrar registros activos eficientemente
-- Drizzle no genera índices WHERE nativamente — se agregan manualmente aquí
CREATE INDEX IF NOT EXISTS "idx_usuarios_active" ON "identidad"."usuarios"("id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_menu_active" ON "identidad"."menu"("id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_sistemas_active" ON "identidad"."sistemas"("id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_planes_cuentas_active" ON "contabilidad"."planes_cuentas"("id") WHERE deleted_at IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_centros_costo_active" ON "contabilidad"."centros_costo"("id") WHERE deleted_at IS NULL;