-- Migración D2: Función y triggers automáticos de updated_at
-- Aplica al schema mensajeria en la DB transversal

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
-- Schema: mensajeria
-- =============================================

CREATE TRIGGER trg_conversaciones_updated_at
  BEFORE UPDATE ON mensajeria.conversaciones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_mensajes_updated_at
  BEFORE UPDATE ON mensajeria.mensajes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_reuniones_updated_at
  BEFORE UPDATE ON mensajeria.reuniones
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_estado_usuarios_updated_at
  BEFORE UPDATE ON mensajeria.estado_usuarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_llamadas_updated_at
  BEFORE UPDATE ON mensajeria.llamadas
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_archivos_updated_at
  BEFORE UPDATE ON mensajeria.archivos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

-- =============================================
-- Schema: mesa_ayuda (misma DB transversal)
-- =============================================

CREATE TRIGGER trg_tickets_updated_at
  BEFORE UPDATE ON mesa_ayuda.tickets
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_comentarios_updated_at
  BEFORE UPDATE ON mesa_ayuda.comentarios
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_categorias_updated_at
  BEFORE UPDATE ON mesa_ayuda.categorias
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_prioridades_updated_at
  BEFORE UPDATE ON mesa_ayuda.prioridades
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
--> statement-breakpoint

CREATE TRIGGER trg_adjuntos_updated_at
  BEFORE UPDATE ON mesa_ayuda.adjuntos
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
