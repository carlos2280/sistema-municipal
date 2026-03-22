-- ============================================
-- Crear schemas de PostgreSQL en muni_default
-- ============================================
-- Este script se ejecuta durante la inicializacion
-- de PostgreSQL (POSTGRES_DB = muni_default) para
-- crear los schemas necesarios en la DB del tenant.
--
-- NOTA: mensajeria y mesa_ayuda viven en DB transversal
-- (ver 02-create-databases.sh)
-- ============================================

CREATE SCHEMA IF NOT EXISTS identidad;
CREATE SCHEMA IF NOT EXISTS contabilidad;

-- Comentarios descriptivos
COMMENT ON SCHEMA identidad IS 'Schema para el modulo de identidad - usuarios, perfiles, areas, etc.';
COMMENT ON SCHEMA contabilidad IS 'Schema para el modulo de contabilidad - cuentas, planes, etc.';
