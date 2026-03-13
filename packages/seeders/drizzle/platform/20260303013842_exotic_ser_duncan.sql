CREATE TABLE "modulos" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"icono" text,
	"api_prefix" text NOT NULL,
	"mf_name" text,
	"mf_manifest_url_tpl" text,
	"requiere" text[] DEFAULT '{}',
	"activo" boolean DEFAULT true,
	"orden" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "modulos_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "municipalidades" (
	"id" serial PRIMARY KEY NOT NULL,
	"nombre" text NOT NULL,
	"slug" text NOT NULL,
	"rut" text,
	"direccion" text,
	"telefono" text,
	"email_contacto" text,
	"logo_url" text,
	"tema" jsonb DEFAULT '{}'::jsonb,
	"dominio_base" text NOT NULL,
	"dominios_custom" text[] DEFAULT '{}',
	"db_name" text NOT NULL,
	"activo" boolean DEFAULT true,
	"max_usuarios" integer DEFAULT 50,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "municipalidades_slug_unique" UNIQUE("slug"),
	CONSTRAINT "municipalidades_rut_unique" UNIQUE("rut"),
	CONSTRAINT "municipalidades_db_name_unique" UNIQUE("db_name")
);
--> statement-breakpoint
CREATE TABLE "suscripciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"municipalidad_id" integer NOT NULL,
	"modulo_id" integer NOT NULL,
	"estado" text DEFAULT 'activa' NOT NULL,
	"fecha_inicio" timestamp DEFAULT now() NOT NULL,
	"fecha_fin" timestamp,
	"precio_mensual" numeric(10, 2),
	"notas" text,
	"activado_por" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "uq_muni_modulo" UNIQUE("municipalidad_id","modulo_id")
);
--> statement-breakpoint
CREATE TABLE "suscripcion_historial" (
	"id" serial PRIMARY KEY NOT NULL,
	"suscripcion_id" integer NOT NULL,
	"accion" text NOT NULL,
	"estado_anterior" text,
	"estado_nuevo" text NOT NULL,
	"motivo" text,
	"ejecutado_por" text NOT NULL,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_municipalidad_id_municipalidades_id_fk" FOREIGN KEY ("municipalidad_id") REFERENCES "public"."municipalidades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suscripciones" ADD CONSTRAINT "suscripciones_modulo_id_modulos_id_fk" FOREIGN KEY ("modulo_id") REFERENCES "public"."modulos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "suscripcion_historial" ADD CONSTRAINT "suscripcion_historial_suscripcion_id_suscripciones_id_fk" FOREIGN KEY ("suscripcion_id") REFERENCES "public"."suscripciones"("id") ON DELETE no action ON UPDATE no action;