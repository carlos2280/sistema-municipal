CREATE TABLE "contabilidad"."centros_costo" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "centros_costo_codigo_unique" UNIQUE("codigo")
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
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_presupuesto_ano" UNIQUE("ano_contable")
);
--> statement-breakpoint
CREATE TABLE "contabilidad"."presupuestos_detalle" (
	"id" serial PRIMARY KEY NOT NULL,
	"presupuesto_id" integer NOT NULL,
	"cuenta_id" integer NOT NULL,
	"centro_costo_id" integer,
	"monto_anual" bigint NOT NULL,
	"observacion" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "uq_presupuesto_detalle" UNIQUE("presupuesto_id","cuenta_id","centro_costo_id")
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."invitaciones_reunion" (
	"id" serial PRIMARY KEY NOT NULL,
	"reunion_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
	"respondido_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."llamadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversacion_id" integer NOT NULL,
	"iniciado_por" integer NOT NULL,
	"tipo" text NOT NULL,
	"estado" text NOT NULL,
	"livekit_room" text NOT NULL,
	"duracion_segundos" integer,
	"participantes_ids" text,
	"iniciada_en" timestamp DEFAULT now(),
	"finalizada_en" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."recordatorios_reunion" (
	"id" serial PRIMARY KEY NOT NULL,
	"reunion_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"minutos_antes" integer DEFAULT 15 NOT NULL,
	"estado" varchar(20) DEFAULT 'pendiente' NOT NULL,
	"enviar_en" timestamp with time zone NOT NULL,
	"enviado_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."reuniones" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversacion_id" integer NOT NULL,
	"organizador_id" integer NOT NULL,
	"titulo" varchar(200) NOT NULL,
	"descripcion" text,
	"tipo" varchar(20) DEFAULT 'video' NOT NULL,
	"estado" varchar(20) DEFAULT 'programada' NOT NULL,
	"fecha_inicio" timestamp with time zone NOT NULL,
	"fecha_fin" timestamp with time zone NOT NULL,
	"llamada_id" integer,
	"mensaje_id" integer,
	"ubicacion" varchar(500),
	"notas" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "mfa_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "mfa_secret" text;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "mfa_verified" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "identidad"."usuarios" ADD COLUMN "mfa_backup_codes" jsonb;--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ADD COLUMN "sistema" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "mensajeria"."conversaciones" ADD COLUMN "departamento_id" integer;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_presupuesto_id_presupuestos_id_fk" FOREIGN KEY ("presupuesto_id") REFERENCES "contabilidad"."presupuestos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_cuenta_id_planes_cuentas_id_fk" FOREIGN KEY ("cuenta_id") REFERENCES "contabilidad"."planes_cuentas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_centro_costo_id_centros_costo_id_fk" FOREIGN KEY ("centro_costo_id") REFERENCES "contabilidad"."centros_costo"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."invitaciones_reunion" ADD CONSTRAINT "invitaciones_reunion_reunion_id_reuniones_id_fk" FOREIGN KEY ("reunion_id") REFERENCES "mensajeria"."reuniones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ADD CONSTRAINT "llamadas_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."recordatorios_reunion" ADD CONSTRAINT "recordatorios_reunion_reunion_id_reuniones_id_fk" FOREIGN KEY ("reunion_id") REFERENCES "mensajeria"."reuniones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_llamada_id_llamadas_id_fk" FOREIGN KEY ("llamada_id") REFERENCES "mensajeria"."llamadas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_mensaje_id_mensajes_id_fk" FOREIGN KEY ("mensaje_id") REFERENCES "mensajeria"."mensajes"("id") ON DELETE no action ON UPDATE no action;
