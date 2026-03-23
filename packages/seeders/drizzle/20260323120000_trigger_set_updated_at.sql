-- Migración D2: Función y triggers automáticos de updated_at
-- Aplica a todos los schemas en la DB muni_default (identidad + contabilidad)

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
-- Schema: identidad
-- =============================================

CREATE TRIGGER trg_usuarios_updated_at
  BEFORE UPDATE ON identidad.usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_areas_updated_at
  BEFORE UPDATE ON identidad.areas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_perfiles_updated_at
  BEFORE UPDATE ON identidad.perfiles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_sistemas_updated_at
  BEFORE UPDATE ON identidad.sistemas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_menu_updated_at
  BEFORE UPDATE ON identidad.menu
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_oficinas_updated_at
  BEFORE UPDATE ON identidad.oficinas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_departamentos_updated_at
  BEFORE UPDATE ON identidad.departamentos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_direcciones_updated_at
  BEFORE UPDATE ON identidad.direcciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_perfil_area_usuario_updated_at
  BEFORE UPDATE ON identidad.perfil_area_usuario
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_sistema_perfil_updated_at
  BEFORE UPDATE ON identidad.sistema_perfil
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

-- =============================================
-- Schema: contabilidad
-- =============================================

CREATE TRIGGER trg_tipos_cuentas_updated_at
  BEFORE UPDATE ON contabilidad.tipos_cuentas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_titulos_cuentas_updated_at
  BEFORE UPDATE ON contabilidad.titulos_cuentas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_cuentas_subgrupos_updated_at
  BEFORE UPDATE ON contabilidad.cuentas_subgrupos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_planes_cuentas_updated_at
  BEFORE UPDATE ON contabilidad.planes_cuentas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_centros_costo_updated_at
  BEFORE UPDATE ON contabilidad.centros_costo
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_subprogramas_presupuestarios_updated_at
  BEFORE UPDATE ON contabilidad.subprogramas_presupuestarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_presupuestos_updated_at
  BEFORE UPDATE ON contabilidad.presupuestos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_presupuestos_detalle_updated_at
  BEFORE UPDATE ON contabilidad.presupuestos_detalle
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
