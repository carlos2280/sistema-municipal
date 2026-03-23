CREATE INDEX "idx_cuentas_subgrupos_tipo_cuenta_id" ON "contabilidad"."cuentas_subgrupos" USING btree ("tipo_cuenta_id");--> statement-breakpoint
ALTER TABLE "contabilidad"."tipos_cuentas" ADD CONSTRAINT "uq_tipos_cuentas_codigo" UNIQUE("codigo");--> statement-breakpoint
ALTER TABLE "contabilidad"."titulos_cuentas" ADD CONSTRAINT "uq_titulos_cuentas_codigo" UNIQUE("codigo");