#!/bin/bash
# ============================================
# Crear databases adicionales en PostgreSQL
# ============================================
# Se ejecuta durante la inicializacion de PG.
# POSTGRES_DB (muni_default) ya se crea automaticamente
# por la imagen oficial. Aqui creamos las demas.
# ============================================

set -e

echo "Creando databases adicionales..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- DB para gestion SaaS (modulos, municipalidades, suscripciones)
  SELECT 'CREATE DATABASE platform'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'platform')\gexec

  -- DB para servicios transversales (mensajeria, mesa_ayuda)
  SELECT 'CREATE DATABASE transversal'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transversal')\gexec
EOSQL

echo "Databases 'platform' y 'transversal' creadas (o ya existian)."

# Crear schemas en transversal
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "transversal" <<-EOSQL
  CREATE SCHEMA IF NOT EXISTS mensajeria;
  CREATE SCHEMA IF NOT EXISTS mesa_ayuda;

  COMMENT ON SCHEMA mensajeria IS 'Schema para el modulo de chat - conversaciones, mensajes, etc.';
  COMMENT ON SCHEMA mesa_ayuda IS 'Schema para mesa de ayuda - tickets, categorias, prioridades, SLA';
EOSQL

echo "Schemas 'mensajeria' y 'mesa_ayuda' creados en DB transversal."
