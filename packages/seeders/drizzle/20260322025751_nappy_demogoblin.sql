CREATE SCHEMA "identidad";
--> statement-breakpoint
CREATE SCHEMA "contabilidad";
--> statement-breakpoint
CREATE TABLE "identidad"."areas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identidad"."departamentos" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_departamento" text NOT NULL,
	"responsable" text NOT NULL,
	"id_direccion" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identidad"."direcciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"responsable" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identidad"."menu" (
	"id" serial PRIMARY KEY NOT NULL,
	"id_sistema" integer,
	"id_padre" integer,
	"nombre" text NOT NULL,
	"ruta" text,
	"icono" text,
	"patch" text,
	"componente" text,
	"visible" boolean DEFAULT true NOT NULL,
	"nivel" integer NOT NULL,
	"orden" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identidad"."oficinas" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_oficina" text NOT NULL,
	"responsable" text NOT NULL,
	"id_departamento" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "identidad"."perfil_area_usuario" (
	"id" serial PRIMARY KEY NOT NULL,
	"perfil_id" integer NOT NULL,
	"area_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_perfil_area_usuario" UNIQUE("perfil_id","area_id","usuario_id")
);
--> statement-breakpoint
CREATE TABLE "identidad"."perfiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identidad"."sistema_perfil" (
	"id" serial PRIMARY KEY NOT NULL,
	"sistema_id" integer NOT NULL,
	"perfil_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_sistema_perfil" UNIQUE("sistema_id","perfil_id")
);
--> statement-breakpoint
CREATE TABLE "identidad"."sistemas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"icono" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "sistemas_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "identidad"."tokens_contrasena_temporal" (
	"id" serial PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"usuario_id" integer NOT NULL,
	"usado" boolean DEFAULT false,
	"expira_en" timestamp with time zone NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now(),
	CONSTRAINT "tokens_contrasena_temporal_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "identidad"."usuarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre_completo" text NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"id_oficina" integer NOT NULL,
	"activo" boolean DEFAULT true,
	"password_temp" boolean DEFAULT true,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	"mfa_enabled" boolean DEFAULT false NOT NULL,
	"mfa_secret" text,
	"mfa_verified" boolean DEFAULT false NOT NULL,
	"mfa_backup_codes" jsonb,
	CONSTRAINT "usuarios_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."centros_costo" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "centros_costo_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."cuentas_subgrupos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"tipo_cuenta_id" integer NOT NULL,
	"parent_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."planes_cuentas" (
	"id" serial PRIMARY KEY NOT NULL,
	"ano_contable" integer NOT NULL,
	"codigo" text NOT NULL,
	"contracuenta" text,
	"nombre" text NOT NULL,
	"tipo_cuenta_id" integer NOT NULL,
	"subgrupo_id" integer NOT NULL,
	"parent_id" integer,
	"codigo_ini" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "uq_cuenta_ano_codigo" UNIQUE("ano_contable","codigo")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."presupuestos" (
	"id" serial PRIMARY KEY NOT NULL,
	"ano_contable" integer NOT NULL,
	"numero" integer NOT NULL,
	"glosa" text NOT NULL,
	"acta_decreto" text,
	"usuario_creacion" integer NOT NULL,
	"usuario_modificacion" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_presupuesto_ano" UNIQUE("ano_contable")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."presupuestos_detalle" (
	"id" serial PRIMARY KEY NOT NULL,
	"presupuesto_id" integer NOT NULL,
	"cuenta_id" integer NOT NULL,
	"centro_costo_id" integer,
	"subprograma_id" integer,
	"monto_anual" bigint NOT NULL,
	"observacion" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_presupuesto_detalle" UNIQUE("presupuesto_id","cuenta_id","centro_costo_id","subprograma_id")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."subprogramas_presupuestarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"abreviatura" text NOT NULL,
	"color" text NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "subprogramas_presupuestarios_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."tipos_cuentas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."titulos_cuentas" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "identidad"."departamentos" ADD CONSTRAINT "departamentos_id_direccion_direcciones_id_fk" FOREIGN KEY ("id_direccion") REFERENCES "identidad"."direcciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."menu" ADD CONSTRAINT "menu_id_sistema_sistemas_id_fk" FOREIGN KEY ("id_sistema") REFERENCES "identidad"."sistemas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."menu" ADD CONSTRAINT "menu_id_padre_menu_id_fk" FOREIGN KEY ("id_padre") REFERENCES "identidad"."menu"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."oficinas" ADD CONSTRAINT "oficinas_id_departamento_departamentos_id_fk" FOREIGN KEY ("id_departamento") REFERENCES "identidad"."departamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ADD CONSTRAINT "perfil_area_usuario_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "identidad"."perfiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ADD CONSTRAINT "perfil_area_usuario_area_id_areas_id_fk" FOREIGN KEY ("area_id") REFERENCES "identidad"."areas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."perfil_area_usuario" ADD CONSTRAINT "perfil_area_usuario_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "identidad"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ADD CONSTRAINT "sistema_perfil_sistema_id_sistemas_id_fk" FOREIGN KEY ("sistema_id") REFERENCES "identidad"."sistemas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."sistema_perfil" ADD CONSTRAINT "sistema_perfil_perfil_id_perfiles_id_fk" FOREIGN KEY ("perfil_id") REFERENCES "identidad"."perfiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."tokens_contrasena_temporal" ADD CONSTRAINT "tokens_contrasena_temporal_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "identidad"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD CONSTRAINT "usuarios_id_oficina_oficinas_id_fk" FOREIGN KEY ("id_oficina") REFERENCES "identidad"."oficinas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ADD CONSTRAINT "cuentas_subgrupos_tipo_cuenta_id_tipos_cuentas_id_fk" FOREIGN KEY ("tipo_cuenta_id") REFERENCES "contabilidad"."tipos_cuentas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."cuentas_subgrupos" ADD CONSTRAINT "cuentas_subgrupos_parent_id_cuentas_subgrupos_id_fk" FOREIGN KEY ("parent_id") REFERENCES "contabilidad"."cuentas_subgrupos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ADD CONSTRAINT "planes_cuentas_tipo_cuenta_id_tipos_cuentas_id_fk" FOREIGN KEY ("tipo_cuenta_id") REFERENCES "contabilidad"."tipos_cuentas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ADD CONSTRAINT "planes_cuentas_subgrupo_id_cuentas_subgrupos_id_fk" FOREIGN KEY ("subgrupo_id") REFERENCES "contabilidad"."cuentas_subgrupos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."planes_cuentas" ADD CONSTRAINT "planes_cuentas_parent_id_planes_cuentas_id_fk" FOREIGN KEY ("parent_id") REFERENCES "contabilidad"."planes_cuentas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "contabilidad"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_cuenta_id_planes_cuentas_id_fk" FOREIGN KEY ("cuenta_id") REFERENCES "contabilidad"."planes_cuentas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_centro_costo_id_centros_costo_id_fk" FOREIGN KEY ("centro_costo_id") REFERENCES "contabilidad"."centros_costo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_subprograma_id_subprogramas_presupuestarios_id_fk" FOREIGN KEY ("subprograma_id") REFERENCES "contabilidad"."subprogramas_presupuestarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_deptos_direccion" ON "identidad"."departamentos" USING btree ("id_direccion");--> statement-breakpoint
CREATE INDEX "idx_menu_sistema" ON "identidad"."menu" USING btree ("id_sistema");--> statement-breakpoint
CREATE INDEX "idx_menu_padre" ON "identidad"."menu" USING btree ("id_padre");--> statement-breakpoint
CREATE INDEX "idx_oficinas_depto" ON "identidad"."oficinas" USING btree ("id_departamento");--> statement-breakpoint
CREATE INDEX "idx_perfil_area_usuario_uid" ON "identidad"."perfil_area_usuario" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_sistema_perfil" ON "identidad"."sistema_perfil" USING btree ("sistema_id","perfil_id");--> statement-breakpoint
CREATE INDEX "idx_usuarios_oficina" ON "identidad"."usuarios" USING btree ("id_oficina");--> statement-breakpoint
CREATE INDEX "idx_planes_codigo" ON "contabilidad"."planes_cuentas" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "idx_planes_ano" ON "contabilidad"."planes_cuentas" USING btree ("ano_contable");--> statement-breakpoint
CREATE INDEX "idx_planes_tipo_cuenta" ON "contabilidad"."planes_cuentas" USING btree ("tipo_cuenta_id");--> statement-breakpoint
CREATE INDEX "idx_planes_parent" ON "contabilidad"."planes_cuentas" USING btree ("parent_id");--> statement-breakpoint
CREATE INDEX "idx_presup_det_cuenta" ON "contabilidad"."presupuestos_detalle" USING btree ("cuenta_id");--> statement-breakpoint
CREATE INDEX "idx_presup_det_centro" ON "contabilidad"."presupuestos_detalle" USING btree ("centro_costo_id");--> statement-breakpoint
CREATE INDEX "idx_presup_det_subprog" ON "contabilidad"."presupuestos_detalle" USING btree ("subprograma_id");--> statement-breakpoint
CREATE INDEX "idx_subprog_codigo" ON "contabilidad"."subprogramas_presupuestarios" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "idx_subprog_activo" ON "contabilidad"."subprogramas_presupuestarios" USING btree ("activo");