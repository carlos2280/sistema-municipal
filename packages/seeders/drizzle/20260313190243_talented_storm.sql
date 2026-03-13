ALTER TABLE "identidad"."areas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."areas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."areas" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."areas" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."menu" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."menu" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."menu" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."menu" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."perfiles" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."perfiles" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."perfiles" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."perfiles" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."tokens_contrasena_temporal" ALTER COLUMN "expira_en" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."tokens_contrasena_temporal" ALTER COLUMN "creado_en" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."tokens_contrasena_temporal" ALTER COLUMN "creado_en" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."centros_costo" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."tipos_cuentas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."tipos_cuentas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."tipos_cuentas" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."tipos_cuentas" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."titulos_cuentas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."titulos_cuentas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "contabilidad"."titulos_cuentas" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "contabilidad"."titulos_cuentas" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."archivos" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."archivos" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ALTER COLUMN "iniciada_en" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ALTER COLUMN "iniciada_en" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ALTER COLUMN "finalizada_en" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."mensajes" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."mensajes" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."mensajes" ALTER COLUMN "updated_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."mensajes" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "mensajeria"."participantes" ALTER COLUMN "ultima_lectura" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."participantes" ALTER COLUMN "created_at" SET DATA TYPE timestamp with time zone;--> statement-breakpoint
ALTER TABLE "mensajeria"."participantes" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
CREATE INDEX "idx_deptos_direccion" ON "identidad"."departamentos" USING btree ("id_direccion");--> statement-breakpoint
CREATE INDEX "idx_oficinas_depto" ON "identidad"."oficinas" USING btree ("id_departamento");--> statement-breakpoint
CREATE INDEX "idx_usuarios_oficina" ON "identidad"."usuarios" USING btree ("id_oficina");--> statement-breakpoint
CREATE INDEX "idx_planes_parent" ON "contabilidad"."planes_cuentas" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_presup_det_cuenta" ON "contabilidad"."presupuestos_detalle" USING btree ("cuenta_id");--> statement-breakpoint
CREATE INDEX "idx_presup_det_centro" ON "contabilidad"."presupuestos_detalle" USING btree ("centro_costo_id");--> statement-breakpoint
CREATE INDEX "idx_archivos_mensaje" ON "mensajeria"."archivos" USING btree ("mensaje_id");--> statement-breakpoint
CREATE INDEX "idx_llamadas_conv" ON "mensajeria"."llamadas" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_conversacion" ON "mensajeria"."mensajes" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_remitente" ON "mensajeria"."mensajes" USING btree ("remitente_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_created" ON "mensajeria"."mensajes" USING btree ("conversacion_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_participantes_conv" ON "mensajeria"."participantes" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_participantes_usuario" ON "mensajeria"."participantes" USING btree ("usuario_id");