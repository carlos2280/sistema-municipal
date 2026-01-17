-- ============================================
-- Crear schemas de PostgreSQL
-- ============================================
-- Este script se ejecuta durante la inicialización
-- de PostgreSQL para crear los schemas necesarios
-- ============================================

CREATE SCHEMA IF NOT EXISTS identidad;
CREATE SCHEMA IF NOT EXISTS contabilidad;

-- Comentarios descriptivos
COMMENT ON SCHEMA identidad IS 'Schema para el módulo de identidad - usuarios, perfiles, áreas, etc.';
COMMENT ON SCHEMA contabilidad IS 'Schema para el módulo de contabilidad - cuentas, planes, etc.';
