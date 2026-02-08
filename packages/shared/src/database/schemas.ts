/**
 * Definición de esquemas PostgreSQL para el sistema municipal
 * Usando pgSchema nativo de Drizzle (sin variables de entorno)
 */
import { pgSchema } from "drizzle-orm/pg-core";

// Esquema para el módulo de identidad (usuarios, perfiles, áreas, etc.)
export const identidadSchema = pgSchema("identidad");

// Esquema para el módulo de contabilidad (planes de cuentas, etc.)
export const contabilidadSchema = pgSchema("contabilidad");

// Esquema para el módulo de mensajería/chat
export const mensajeriaSchema = pgSchema("mensajeria");
