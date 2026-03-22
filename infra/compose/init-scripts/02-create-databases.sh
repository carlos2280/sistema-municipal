#!/bin/bash
# ============================================
# Crear databases adicionales en PostgreSQL
# ============================================
# Se ejecuta durante la inicializacion de PG.
# POSTGRES_DB (muni_default) ya se crea automaticamente
# por la imagen oficial. Aqui creamos las demas.
#
# Arquitectura multi-tenant:
#   transversal              → mesa_ayuda centralizada (todos los tenants, filtra por tenantId)
#   transversal_<slug>       → mensajeria aislada por municipalidad (una DB por tenant)
#   transversal_muni_default → tenant demo para desarrollo local
# ============================================

set -e

echo "Creando databases adicionales..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  -- DB para gestion SaaS (modulos, municipalidades, suscripciones)
  SELECT 'CREATE DATABASE platform'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'platform')\gexec

  -- DB transversal centralizada: mesa_ayuda (compartida, filtra por tenantId)
  SELECT 'CREATE DATABASE transversal'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transversal')\gexec

  -- DB transversal del tenant demo: mensajeria aislada (aislamiento por DB)
  SELECT 'CREATE DATABASE transversal_muni_default'
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'transversal_muni_default')\gexec
EOSQL

echo "Databases 'platform', 'transversal' y 'transversal_muni_default' creadas (o ya existian)."

# ── DB transversal centralizada: solo mesa_ayuda ──────────────────────────────
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "transversal" <<-EOSQL
  CREATE SCHEMA IF NOT EXISTS mesa_ayuda;

  COMMENT ON SCHEMA mesa_ayuda IS 'Schema para mesa de ayuda - tickets, categorias, prioridades, SLA. Centralizado para todos los tenants (filtra por tenantId).';
EOSQL

echo "Schema 'mesa_ayuda' creado en DB transversal."

# ── DB transversal_muni_default: mensajeria aislada del tenant demo ───────────
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "transversal_muni_default" <<-EOSQL
  CREATE SCHEMA IF NOT EXISTS mensajeria;

  COMMENT ON SCHEMA mensajeria IS 'Schema para el modulo de chat - conversaciones, mensajes, etc. Aislado por tenant (una DB por municipalidad).';
EOSQL

echo "Schema 'mensajeria' creado en DB transversal_muni_default (tenant demo)."
