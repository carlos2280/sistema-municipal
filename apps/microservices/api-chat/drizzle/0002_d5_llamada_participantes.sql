-- D5: Reemplazar llamadas.participantes_ids (text) por tabla relacional llamada_participantes
-- Seguro: crea tabla nueva, migra datos existentes, NO elimina la columna aún

-- Paso 1: Crear tabla relacional
CREATE TABLE IF NOT EXISTS mensajeria.llamada_participantes (
  id          serial PRIMARY KEY,
  llamada_id  integer NOT NULL REFERENCES mensajeria.llamadas(id) ON DELETE CASCADE,
  usuario_id  integer NOT NULL,
  joined_at   timestamptz DEFAULT now(),
  left_at     timestamptz,
  CONSTRAINT uq_llamada_participante UNIQUE (llamada_id, usuario_id)
);

CREATE INDEX IF NOT EXISTS idx_llamada_part_llamada ON mensajeria.llamada_participantes(llamada_id);
CREATE INDEX IF NOT EXISTS idx_llamada_part_usuario ON mensajeria.llamada_participantes(usuario_id);

-- Paso 2: Migrar datos existentes desde participantes_ids (JSON array de enteros)
-- Ejemplo de valor en participantes_ids: '[1,2,3]'
-- Solo migrar filas donde participantes_ids no sea nulo y sea JSON válido
INSERT INTO mensajeria.llamada_participantes (llamada_id, usuario_id)
SELECT
  l.id AS llamada_id,
  (elem.value)::integer AS usuario_id
FROM mensajeria.llamadas l
CROSS JOIN LATERAL jsonb_array_elements_text(l.participantes_ids::jsonb) AS elem(value)
WHERE l.participantes_ids IS NOT NULL
  AND l.participantes_ids <> ''
ON CONFLICT (llamada_id, usuario_id) DO NOTHING;

-- Paso 3: La columna participantes_ids se mantiene por compatibilidad durante la transición.
-- Eliminarla en una migración posterior (0003) una vez validado en staging:
--   ALTER TABLE mensajeria.llamadas DROP COLUMN participantes_ids;
