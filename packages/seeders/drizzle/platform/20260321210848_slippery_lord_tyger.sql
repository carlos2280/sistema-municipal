CREATE SCHEMA "mesa_ayuda";
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."adjuntos" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"comentario_id" integer,
	"nombre_archivo" text NOT NULL,
	"tipo_mime" text NOT NULL,
	"tamano_bytes" integer NOT NULL,
	"ruta_storage" text NOT NULL,
	"subido_por" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."categorias" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"descripcion" text,
	"icono" text DEFAULT 'tag' NOT NULL,
	"color" text DEFAULT 'primary' NOT NULL,
	"orden" integer DEFAULT 0 NOT NULL,
	"activo" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categorias_codigo_unique" UNIQUE("codigo")
);
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."comentarios" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"autor_id" integer NOT NULL,
	"autor_nombre" text NOT NULL,
	"contenido" text NOT NULL,
	"es_interno" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."historial_estados" (
	"id" serial PRIMARY KEY NOT NULL,
	"ticket_id" integer NOT NULL,
	"estado_anterior" text,
	"estado_nuevo" text NOT NULL,
	"motivo" text,
	"ejecutado_por" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."prioridades" (
	"id" serial PRIMARY KEY NOT NULL,
	"codigo" text NOT NULL,
	"nombre" text NOT NULL,
	"color" text NOT NULL,
	"nivel" integer NOT NULL,
	"sla_horas" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "prioridades_codigo_unique" UNIQUE("codigo"),
	CONSTRAINT "prioridades_nivel_unique" UNIQUE("nivel")
);
--> statement-breakpoint
CREATE TABLE "mesa_ayuda"."tickets" (
	"id" serial PRIMARY KEY NOT NULL,
	"tenant_id" integer NOT NULL,
	"numero" text NOT NULL,
	"titulo" text NOT NULL,
	"descripcion" text NOT NULL,
	"estado" text DEFAULT 'abierto' NOT NULL,
	"categoria_id" integer NOT NULL,
	"prioridad_id" integer NOT NULL,
	"solicitante_id" integer NOT NULL,
	"solicitante_nombre" text NOT NULL,
	"solicitante_email" text,
	"asignado_id" integer,
	"asignado_nombre" text,
	"departamento" text,
	"fecha_limite" timestamp with time zone,
	"fecha_resolucion" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "uq_tickets_tenant_numero" UNIQUE("tenant_id","numero")
);
--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."adjuntos" ADD CONSTRAINT "adjuntos_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "mesa_ayuda"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."adjuntos" ADD CONSTRAINT "adjuntos_comentario_id_comentarios_id_fk" FOREIGN KEY ("comentario_id") REFERENCES "mesa_ayuda"."comentarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."comentarios" ADD CONSTRAINT "comentarios_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "mesa_ayuda"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."historial_estados" ADD CONSTRAINT "historial_estados_ticket_id_tickets_id_fk" FOREIGN KEY ("ticket_id") REFERENCES "mesa_ayuda"."tickets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."tickets" ADD CONSTRAINT "tickets_categoria_id_categorias_id_fk" FOREIGN KEY ("categoria_id") REFERENCES "mesa_ayuda"."categorias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."tickets" ADD CONSTRAINT "tickets_prioridad_id_prioridades_id_fk" FOREIGN KEY ("prioridad_id") REFERENCES "mesa_ayuda"."prioridades"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_adjuntos_ticket" ON "mesa_ayuda"."adjuntos" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_comentarios_ticket" ON "mesa_ayuda"."comentarios" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_historial_ticket" ON "mesa_ayuda"."historial_estados" USING btree ("ticket_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_tenant" ON "mesa_ayuda"."tickets" USING btree ("tenant_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_tenant_estado" ON "mesa_ayuda"."tickets" USING btree ("tenant_id","estado");--> statement-breakpoint
CREATE INDEX "idx_tickets_categoria" ON "mesa_ayuda"."tickets" USING btree ("categoria_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_prioridad" ON "mesa_ayuda"."tickets" USING btree ("prioridad_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_solicitante" ON "mesa_ayuda"."tickets" USING btree ("tenant_id","solicitante_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_asignado" ON "mesa_ayuda"."tickets" USING btree ("tenant_id","asignado_id");--> statement-breakpoint
CREATE INDEX "idx_tickets_created" ON "mesa_ayuda"."tickets" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_tickets_fecha_limite" ON "mesa_ayuda"."tickets" USING btree ("fecha_limite") WHERE "mesa_ayuda"."tickets"."estado" NOT IN ('resuelto', 'cerrado');