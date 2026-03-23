CREATE TYPE "public"."conversacion_tipo" AS ENUM('directa', 'grupo', 'departamento', 'canal');--> statement-breakpoint
CREATE TYPE "public"."participante_rol" AS ENUM('admin', 'miembro', 'observador');--> statement-breakpoint
CREATE TYPE "public"."mensaje_tipo" AS ENUM('texto', 'archivo', 'imagen', 'sistema', 'llamada', 'reunion');--> statement-breakpoint
CREATE TYPE "public"."estado_usuario" AS ENUM('online', 'offline', 'away', 'busy');--> statement-breakpoint
CREATE TYPE "public"."llamada_estado" AS ENUM('sonando', 'activa', 'finalizada', 'rechazada', 'sin_respuesta');--> statement-breakpoint
CREATE TYPE "public"."invitacion_estado" AS ENUM('pendiente', 'aceptada', 'rechazada', 'tentativa');--> statement-breakpoint
CREATE TABLE "mensajeria"."conversaciones" (
	"id" serial PRIMARY KEY NOT NULL,
	"tipo" "conversacion_tipo" NOT NULL,
	"nombre" text,
	"descripcion" text,
	"avatar_url" text,
	"creador_id" integer NOT NULL,
	"activo" boolean DEFAULT true,
	"sistema" boolean DEFAULT false,
	"departamento_id" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."participantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversacion_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"rol" "participante_rol" DEFAULT 'miembro',
	"silenciado" boolean DEFAULT false,
	"ultima_lectura" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."mensajes" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversacion_id" integer NOT NULL,
	"remitente_id" integer NOT NULL,
	"contenido" text,
	"tipo" "mensaje_tipo" DEFAULT 'texto',
	"reply_to_id" integer,
	"editado" boolean DEFAULT false,
	"eliminado" boolean DEFAULT false,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."archivos" (
	"id" serial PRIMARY KEY NOT NULL,
	"mensaje_id" integer NOT NULL,
	"nombre" text NOT NULL,
	"tipo" text NOT NULL,
	"tamanio" integer NOT NULL,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."estado_usuarios" (
	"usuario_id" integer PRIMARY KEY NOT NULL,
	"estado" "estado_usuario" DEFAULT 'offline',
	"ultima_conexion" timestamp with time zone,
	"socket_id" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."llamadas" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversacion_id" integer NOT NULL,
	"iniciado_por" integer NOT NULL,
	"tipo" text NOT NULL,
	"estado" "llamada_estado" NOT NULL,
	"livekit_room" text NOT NULL,
	"duracion_segundos" integer,
	"participantes_ids" text,
	"iniciada_en" timestamp with time zone DEFAULT now(),
	"finalizada_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mensajeria"."llamada_participantes" (
	"id" serial PRIMARY KEY NOT NULL,
	"llamada_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now(),
	"left_at" timestamp with time zone,
	CONSTRAINT "uq_llamada_participante" UNIQUE("llamada_id","usuario_id")
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
CREATE TABLE "mensajeria"."invitaciones_reunion" (
	"id" serial PRIMARY KEY NOT NULL,
	"reunion_id" integer NOT NULL,
	"usuario_id" integer NOT NULL,
	"estado" "invitacion_estado" DEFAULT 'pendiente' NOT NULL,
	"respondido_en" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
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
ALTER TABLE "mensajeria"."participantes" ADD CONSTRAINT "participantes_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."mensajes" ADD CONSTRAINT "mensajes_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."archivos" ADD CONSTRAINT "archivos_mensaje_id_mensajes_id_fk" FOREIGN KEY ("mensaje_id") REFERENCES "mensajeria"."mensajes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ADD CONSTRAINT "llamadas_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamada_participantes" ADD CONSTRAINT "llamada_participantes_llamada_id_llamadas_id_fk" FOREIGN KEY ("llamada_id") REFERENCES "mensajeria"."llamadas"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_conversacion_id_conversaciones_id_fk" FOREIGN KEY ("conversacion_id") REFERENCES "mensajeria"."conversaciones"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_llamada_id_llamadas_id_fk" FOREIGN KEY ("llamada_id") REFERENCES "mensajeria"."llamadas"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."reuniones" ADD CONSTRAINT "reuniones_mensaje_id_mensajes_id_fk" FOREIGN KEY ("mensaje_id") REFERENCES "mensajeria"."mensajes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."invitaciones_reunion" ADD CONSTRAINT "invitaciones_reunion_reunion_id_reuniones_id_fk" FOREIGN KEY ("reunion_id") REFERENCES "mensajeria"."reuniones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensajeria"."recordatorios_reunion" ADD CONSTRAINT "recordatorios_reunion_reunion_id_reuniones_id_fk" FOREIGN KEY ("reunion_id") REFERENCES "mensajeria"."reuniones"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_conversaciones_departamento_id" ON "mensajeria"."conversaciones" USING btree ("departamento_id");--> statement-breakpoint
CREATE INDEX "idx_participantes_conv" ON "mensajeria"."participantes" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_participantes_usuario" ON "mensajeria"."participantes" USING btree ("usuario_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_conversacion" ON "mensajeria"."mensajes" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_remitente" ON "mensajeria"."mensajes" USING btree ("remitente_id");--> statement-breakpoint
CREATE INDEX "idx_mensajes_created" ON "mensajeria"."mensajes" USING btree ("conversacion_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_mensajes_reply_to_id" ON "mensajeria"."mensajes" USING btree ("reply_to_id");--> statement-breakpoint
CREATE INDEX "idx_archivos_mensaje" ON "mensajeria"."archivos" USING btree ("mensaje_id");--> statement-breakpoint
CREATE INDEX "idx_llamadas_conv" ON "mensajeria"."llamadas" USING btree ("conversacion_id");--> statement-breakpoint
CREATE INDEX "idx_llamada_part_llamada" ON "mensajeria"."llamada_participantes" USING btree ("llamada_id");--> statement-breakpoint
CREATE INDEX "idx_llamada_part_usuario" ON "mensajeria"."llamada_participantes" USING btree ("usuario_id");