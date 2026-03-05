ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "sistema_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "perfil_id" SET NOT NULL;--> statement-breakpoint
CREATE INDEX "idx_sistema_perfil" ON "identidad"."sistema_perfil" USING btree ("sistema_id","perfil_id");--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ADD CONSTRAINT "uq_sistema_perfil" UNIQUE("sistema_id","perfil_id");