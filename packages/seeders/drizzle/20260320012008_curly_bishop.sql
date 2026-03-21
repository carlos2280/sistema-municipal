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
ALTER TABLE "contabilidad"."presupuestos_detalle" DROP CONSTRAINT "uq_presupuesto_detalle";--> statement-breakpoint
ALTER TABLE "identidad"."areas" ADD COLUMN "descripcion" text;--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ADD COLUMN "codigo" text NOT NULL;--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD COLUMN "subprograma_id" integer;--> statement-breakpoint
CREATE INDEX "idx_subprog_codigo" ON "contabilidad"."subprogramas_presupuestarios" USING btree ("codigo");--> statement-breakpoint
CREATE INDEX "idx_subprog_activo" ON "contabilidad"."subprogramas_presupuestarios" USING btree ("activo");--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "presupuestos_detalle_subprograma_id_subprogramas_presupuestarios_id_fk" FOREIGN KEY ("subprograma_id") REFERENCES "contabilidad"."subprogramas_presupuestarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_presup_det_subprog" ON "contabilidad"."presupuestos_detalle" USING btree ("subprograma_id");--> statement-breakpoint
ALTER TABLE "identidad"."sistemas" ADD CONSTRAINT "sistemas_codigo_unique" UNIQUE("codigo");--> statement-breakpoint
ALTER TABLE "contabilidad"."presupuestos_detalle" ADD CONSTRAINT "uq_presupuesto_detalle" UNIQUE("presupuesto_id","cuenta_id","centro_costo_id","subprograma_id");