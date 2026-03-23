-- Migración D2: Función y triggers automáticos de updated_at
-- Aplica a las tablas del schema public en la DB platform

-- Función genérica reutilizable por todos los triggers
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint

-- =============================================
-- Schema: public (platform)
-- =============================================

CREATE TRIGGER trg_municipalidades_updated_at
  BEFORE UPDATE ON municipalidades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_modulos_updated_at
  BEFORE UPDATE ON modulos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_suscripciones_updated_at
  BEFORE UPDATE ON suscripciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
