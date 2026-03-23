CREATE TABLE "identidad"."refresh_tokens" (
	"id" serial PRIMARY KEY NOT NULL,
	"jti" text NOT NULL,
	"usuario_id" integer NOT NULL,
	"revocado" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"creado_en" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "refresh_tokens_jti_unique" UNIQUE("jti")
);
--> statement-breakpoint
ALTER TABLE "identidad"."refresh_tokens" ADD CONSTRAINT "refresh_tokens_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "identidad"."usuarios"("id") ON DELETE cascade ON UPDATE no action;