ALTER TABLE "mensajeria"."archivos" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mensajeria"."estado_usuarios" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mensajeria"."llamadas" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "mesa_ayuda"."adjuntos" ADD COLUMN "updated_at" timestamp with time zone DEFAULT now() NOT NULL;