-- ============================================
-- Crear schemas de PostgreSQL
-- ============================================
-- Este script se ejecuta durante la inicialización
-- de PostgreSQL (POSTGRES_DB = muni_default) para
-- crear los schemas necesarios en la DB del tenant.
-- ============================================

CREATE SCHEMA IF NOT EXISTS identidad;
CREATE SCHEMA IF NOT EXISTS contabilidad;
CREATE SCHEMA IF NOT EXISTS mensajeria;

-- Comentarios descriptivos
COMMENT ON SCHEMA identidad IS 'Schema para el módulo de identidad - usuarios, perfiles, áreas, etc.';
COMMENT ON SCHEMA contabilidad IS 'Schema para el módulo de contabilidad - cuentas, planes, etc.';
COMMENT ON SCHEMA mensajeria IS 'Schema para el módulo de chat - conversaciones, mensajes, etc.';
