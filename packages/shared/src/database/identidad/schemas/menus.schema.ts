import { identidadSchema } from "../../schemas";
import { sistemas } from "@municipalidad/shared/database/identidad/schemas/sistemas.schema";
import {
	type AnyPgColumn,
	boolean,
	index,
	integer,
	serial,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const menus = identidadSchema.table(
	"menu",
	{
		id: serial("id").primaryKey(),
		idSistema: integer("id_sistema").references(() => sistemas.id),
		idPadre: integer("id_padre").references((): AnyPgColumn => menus.id),
		nombre: text("nombre").notNull(),
		ruta: text("ruta"),
		icono: text("icono"),
		patch: text("patch"),
		componente: text("componente"),
		visible: boolean("visible").notNull().default(true),
		nivel: integer("nivel").notNull(),
		orden: integer("orden").notNull(),
		createdAt: timestamp("created_at").defaultNow(),
		updatedAt: timestamp("updated_at").defaultNow(),
	},
	(table) => ({
		// Índice para consultas por sistema
		sistemaIdx: index("idx_menu_sistema").on(table.idSistema),
		// Índice para consultas jerárquicas
		padreIdx: index("idx_menu_padre").on(table.idPadre),
	}),
);

// Tipos
export type Menu = typeof menus.$inferSelect;
export type NewMenu = typeof menus.$inferInsert;
export type MenuUpdate = Partial<NewMenu>;
