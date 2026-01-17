#!/bin/bash
# ============================================
# Configuración de pg_hba.conf para desarrollo
# ============================================
# Este script se ejecuta durante la inicialización
# de PostgreSQL para permitir conexiones desde
# cualquier host en modo desarrollo (trust)
# ============================================

set -e

# Configurar pg_hba.conf - trust para desarrollo local
cat > "$PGDATA/pg_hba.conf" << 'EOF'
# TYPE  DATABASE        USER            ADDRESS                 METHOD
# Conexiones locales (Unix socket)
local   all             all                                     trust
# Conexiones IPv4
host    all             all             0.0.0.0/0               trust
# Conexiones IPv6
host    all             all             ::/0                    trust
# Replicación
local   replication     all                                     trust
host    replication     all             0.0.0.0/0               trust
host    replication     all             ::/0                    trust
EOF

echo "pg_hba.conf configurado para desarrollo (trust mode)"
