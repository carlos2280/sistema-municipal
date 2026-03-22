# ============================================
# Sistema Municipal - Makefile
# ============================================
# Comandos unificados para desarrollo y producción
#
# Flujo normal:     make dev          (infra + db + APIs + MFs)
# Desde cero:       make dev-fresh    (clean + dev)
# Reset DB:         make db-reset     (DROP + CREATE + MIGRATE + SEED)
#
# Arquitectura de DBs:
#   muni_default  → identidad + contabilidad (core municipal)
#   platform      → modulos, municipalidades, suscripciones (SaaS)
#   transversal   → mensajeria + mesa_ayuda (servicios de valor agregado)
# ============================================

.PHONY: help install dev dev-fresh dev-infra dev-apis dev-mfs dev-apps dev-kill-ports \
        dev-stop dev-down dev-logs dev-turbo \
        db-setup db-migrate-all db-seed-all db-migrate db-seed db-generate db-reset \
        db-studio db-studio-platform db-studio-transversal \
        build build-api build-mf build-push \
        prod prod-stop prod-logs \
        test test-ci \
        status status-infra logs clean clean-all \
        deploy-staging deploy-production \
        dev-contabilidad dev-shell dev-configuracion dev-chat dev-mesa-ayuda dev-admin

# Colores
GREEN  := \033[0;32m
YELLOW := \033[1;33m
CYAN   := \033[0;36m
RED    := \033[0;31m
NC     := \033[0m

# Variables
COMPOSE_BASE   := infra/compose/docker-compose.yml
COMPOSE_DEV    := infra/compose/docker-compose.dev.yml
COMPOSE_PROD   := infra/compose/docker-compose.prod.yml
COMPOSE_TEST   := infra/compose/docker-compose.test.yml
COMPOSE_CMD    := docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV)
REGISTRY       := ghcr.io/tu-usuario
VERSION        := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")

# Puertos
API_PORTS      := 3000 3001 3002 3003 3004 3006 4050
MF_PORTS       := 5010 5011 5020 5021 5030 5041 5050 5055

# ============================================
# Ayuda
# ============================================
help: ## Muestra esta ayuda
	@echo ""
	@echo "$(GREEN)Sistema Municipal - Comandos disponibles$(NC)"
	@echo ""
	@echo "$(CYAN)Desarrollo:$(NC)"
	@echo "  $(YELLOW)make dev                  $(NC) Entorno completo (infra + DB + APIs + MFs)"
	@echo "  $(YELLOW)make dev-fresh            $(NC) Desde cero (clean + dev)"
	@echo "  $(YELLOW)make dev-infra            $(NC) Solo infraestructura (Docker)"
	@echo "  $(YELLOW)make dev-apis             $(NC) Solo APIs (requiere infra)"
	@echo "  $(YELLOW)make dev-mfs              $(NC) Solo microfrontends"
	@echo "  $(YELLOW)make dev-stop             $(NC) Detiene infraestructura"
	@echo ""
	@echo "$(CYAN)Base de datos:$(NC)"
	@echo "  $(YELLOW)make db-setup             $(NC) Migra + seedea las 3 DBs"
	@echo "  $(YELLOW)make db-reset             $(NC) DROP + CREATE + setup (las 3 DBs)"
	@echo "  $(YELLOW)make db-migrate-all       $(NC) Migraciones de las 3 DBs"
	@echo "  $(YELLOW)make db-seed-all          $(NC) Seeders de las 3 DBs"
	@echo "  $(YELLOW)make db-generate          $(NC) Genera migraciones desde schemas"
	@echo "  $(YELLOW)make db-studio            $(NC) Drizzle Studio (muni_default)"
	@echo ""
	@echo "$(CYAN)Modulos individuales:$(NC)"
	@echo "  $(YELLOW)make dev-contabilidad     $(NC) Solo contabilidad (API + MF)"
	@echo "  $(YELLOW)make dev-chat             $(NC) Solo chat (API + MF)"
	@echo "  $(YELLOW)make dev-mesa-ayuda       $(NC) Solo mesa de ayuda (API + MF)"
	@echo "  $(YELLOW)make dev-configuracion    $(NC) Solo configuracion (MF)"
	@echo "  $(YELLOW)make dev-admin            $(NC) Solo admin panel"
	@echo ""
	@echo "$(CYAN)Utilidades:$(NC)"
	@echo "  $(YELLOW)make status               $(NC) Estado de servicios"
	@echo "  $(YELLOW)make logs                 $(NC) Logs de infraestructura"
	@echo "  $(YELLOW)make clean                $(NC) Limpia contenedores y volumenes"
	@echo "  $(YELLOW)make clean-all            $(NC) Limpieza profunda (+node_modules)"
	@echo ""

# ============================================
# Desarrollo — Flujo principal
# ============================================
# make dev ejecuta en orden:
#   1) Infraestructura (Docker: PG, Redis, Mailhog)
#   2) DB setup si faltan tablas (migraciones + seeders)
#   3) APIs (esperan PG, arrancan en paralelo)
#   4) MFs (store+ui primero, luego dominio, shell al final)

dev: dev-infra dev-kill-ports ## Entorno completo (infra + DB + APIs + MFs)
	@echo "$(GREEN)Verificando base de datos...$(NC)"
	@$(COMPOSE_CMD) exec -T postgres psql -U postgres -d muni_default -c "SELECT 1 FROM identidad.usuarios LIMIT 1" >/dev/null 2>&1 \
		&& echo "$(GREEN)  DB ya tiene datos, saltando setup$(NC)" \
		|| (echo "$(YELLOW)  DB vacia, ejecutando setup...$(NC)" && pnpm --filter @municipal/seeders db:setup)
	@echo ""
	@echo "$(GREEN)Iniciando aplicaciones...$(NC)"
	@echo "$(CYAN)Fase 1: APIs (esperan postgres:5434)$(NC)"
	@echo "$(CYAN)Fase 2: MFs (store+ui → dominio → shell)$(NC)"
	@echo ""
	@npx concurrently -k \
		-n "gateway,api-id,api-auth,api-cont,api-chat,api-plat,api-mesa,mf-store,mf-ui,mf-cont,mf-chat,mf-conf,mf-mesa,shell" \
		-c "blue,blue,blue,blue,magenta,blue,blue,green,green,green,cyan,magenta,green,yellow" \
		"npx wait-on tcp:5434 && pnpm --filter gateway dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-identidad dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-autorizacion dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-contabilidad dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-chat dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-platform dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-mesa-ayuda dev" \
		"npx wait-on tcp:3000 && pnpm --filter mf-store dev" \
		"npx wait-on tcp:3000 && pnpm --filter mf-ui dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-contabilidad dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-chat dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-configuracion dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-mesa-ayuda dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json http-get://localhost:5020/mf-manifest.json http-get://localhost:5021/mf-manifest.json http-get://localhost:5041/mf-manifest.json http-get://localhost:5050/mf-manifest.json && pnpm --filter mf-shell dev"

dev-fresh: clean ## Desde cero (clean + dev)
	@make dev

dev-infra: ## Solo infraestructura (Docker: PG, Redis, Mailhog)
	@echo "$(GREEN)Iniciando infraestructura...$(NC)"
	$(COMPOSE_CMD) --profile dev up -d
	@echo ""
	@make status-infra

dev-apis: dev-infra dev-kill-ports ## Solo APIs (requiere infra)
	@echo "$(GREEN)Iniciando APIs...$(NC)"
	@npx concurrently -k \
		-n "gateway,api-id,api-auth,api-cont,api-chat,api-plat,api-mesa" \
		-c "blue,blue,blue,blue,magenta,blue,blue" \
		"npx wait-on tcp:5434 && pnpm --filter gateway dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-identidad dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-autorizacion dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-contabilidad dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-chat dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-platform dev" \
		"npx wait-on tcp:5434 && pnpm --filter api-mesa-ayuda dev"

dev-mfs: ## Solo microfrontends
	@echo "$(GREEN)Iniciando microfrontends...$(NC)"
	@npx concurrently -k \
		-n "mf-store,mf-ui,mf-cont,mf-chat,mf-conf,mf-mesa,shell" \
		-c "green,green,green,cyan,magenta,green,yellow" \
		"pnpm --filter mf-store dev" \
		"pnpm --filter mf-ui dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-contabilidad dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-chat dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-configuracion dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json && pnpm --filter mf-mesa-ayuda dev" \
		"npx wait-on http-get://localhost:5010/mf-manifest.json http-get://localhost:5011/mf-manifest.json http-get://localhost:5020/mf-manifest.json http-get://localhost:5021/mf-manifest.json http-get://localhost:5041/mf-manifest.json http-get://localhost:5050/mf-manifest.json && pnpm --filter mf-shell dev"

dev-kill-ports: ## Mata procesos residuales en puertos de desarrollo
	@for port in $(API_PORTS) $(MF_PORTS); do \
		pid=$$(lsof -ti :$$port 2>/dev/null); \
		if [ -n "$$pid" ]; then \
			echo "$(YELLOW)Matando proceso en puerto $$port (PID $$pid)$(NC)"; \
			kill -9 $$pid 2>/dev/null || true; \
		fi; \
	done
	@sleep 1

dev-turbo: dev-infra ## Inicia con turbo (sin orden garantizado)
	@echo "$(GREEN)Iniciando aplicaciones con turbo...$(NC)"
	pnpm dev

dev-stop: ## Detiene infraestructura Docker
	@echo "$(YELLOW)Deteniendo infraestructura...$(NC)"
	$(COMPOSE_CMD) --profile dev down

dev-down: dev-stop ## Alias de dev-stop

dev-logs: ## Muestra logs de infraestructura
	$(COMPOSE_CMD) logs -f

install: ## Instala dependencias del proyecto
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	pnpm install

# ============================================
# Base de Datos
# ============================================

db-setup: ## Migra + seedea las 3 DBs (setup completo)
	@echo "$(GREEN)Setup completo de base de datos (3 DBs)...$(NC)"
	pnpm --filter @municipal/seeders db:setup

db-migrate-all: ## Migraciones de las 3 DBs
	@echo "$(GREEN)Ejecutando migraciones (muni_default + platform + transversal)...$(NC)"
	pnpm --filter @municipal/seeders db:migrate:all

db-seed-all: ## Seeders de las 3 DBs
	@echo "$(GREEN)Ejecutando seeders (muni_default + platform + transversal)...$(NC)"
	pnpm --filter @municipal/seeders seed:all

db-migrate: ## Migraciones solo de muni_default
	@echo "$(GREEN)Ejecutando migraciones (muni_default)...$(NC)"
	pnpm --filter @municipal/seeders migrate

db-seed: ## Seeders solo de muni_default
	@echo "$(GREEN)Ejecutando seeders (muni_default)...$(NC)"
	pnpm --filter @municipal/seeders seed

db-generate: ## Genera migraciones desde schemas (las 3 DBs)
	@echo "$(GREEN)Generando migraciones...$(NC)"
	pnpm --filter @municipal/seeders generate
	pnpm --filter @municipal/seeders platform:generate
	pnpm --filter @municipal/seeders transversal:generate

db-reset: ## Resetea las 3 DBs (DROP + CREATE + MIGRATE + SEED)
	@echo "$(RED)Esto eliminara TODOS los datos de las 3 DBs. Continuar? [y/N]$(NC)"
	@read -r confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(YELLOW)Reseteando bases de datos...$(NC)"
	@for db in muni_default platform transversal; do \
		echo "$(YELLOW)Reseteando $$db...$(NC)"; \
		$(COMPOSE_CMD) exec -T postgres psql -U postgres -c \
			"SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = '$$db' AND pid <> pg_backend_pid();" 2>/dev/null || true; \
		$(COMPOSE_CMD) exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS $$db;" || true; \
		$(COMPOSE_CMD) exec -T postgres psql -U postgres -c "CREATE DATABASE $$db;" || true; \
		echo "$(GREEN)  $$db recreada$(NC)"; \
	done
	@echo "$(YELLOW)Creando schemas...$(NC)"
	$(COMPOSE_CMD) exec -T postgres psql -U postgres -d muni_default -c "CREATE SCHEMA IF NOT EXISTS identidad; CREATE SCHEMA IF NOT EXISTS contabilidad;"
	$(COMPOSE_CMD) exec -T postgres psql -U postgres -d transversal -c "CREATE SCHEMA IF NOT EXISTS mensajeria; CREATE SCHEMA IF NOT EXISTS mesa_ayuda;"
	@make db-setup

db-studio: ## Drizzle Studio (muni_default)
	pnpm --filter @municipal/seeders db:studio

db-studio-platform: ## Drizzle Studio (platform)
	pnpm --filter @municipal/seeders platform:studio

db-studio-transversal: ## Drizzle Studio (transversal)
	pnpm --filter @municipal/seeders transversal:studio

# ============================================
# Modulos Individuales
# ============================================

dev-contabilidad: dev-infra ## Solo contabilidad (API + MF)
	@echo "$(GREEN)Iniciando modulo contabilidad...$(NC)"
	@npx concurrently -k -n "api-cont,mf-cont" -c "blue,green" \
		"npx wait-on tcp:5434 && pnpm --filter api-contabilidad dev" \
		"pnpm --filter mf-contabilidad dev"

dev-chat: dev-infra ## Solo chat (API + MF)
	@echo "$(GREEN)Iniciando modulo chat...$(NC)"
	@npx concurrently -k -n "api-chat,mf-chat" -c "magenta,cyan" \
		"npx wait-on tcp:5434 && pnpm --filter api-chat dev" \
		"pnpm --filter mf-chat dev"

dev-mesa-ayuda: dev-infra ## Solo mesa de ayuda (API + MF)
	@echo "$(GREEN)Iniciando modulo mesa de ayuda...$(NC)"
	@npx concurrently -k -n "api-mesa,mf-mesa" -c "blue,green" \
		"npx wait-on tcp:5434 && pnpm --filter api-mesa-ayuda dev" \
		"pnpm --filter mf-mesa-ayuda dev"

dev-configuracion: dev-infra ## Solo configuracion (MF)
	@echo "$(GREEN)Iniciando modulo configuracion...$(NC)"
	pnpm --filter mf-configuracion dev

dev-shell: dev-infra ## Solo shell
	@echo "$(GREEN)Iniciando shell...$(NC)"
	pnpm --filter mf-shell dev

dev-admin: dev-infra ## Solo admin panel
	@echo "$(GREEN)Iniciando panel de administracion...$(NC)"
	pnpm --filter admin-panel dev

# ============================================
# Build
# ============================================

build: ## Build de todas las imagenes Docker
	@echo "$(GREEN)Building todas las imagenes...$(NC)"
	@make build-api
	@make build-mf
	@echo "$(GREEN)Build completado$(NC)"

build-api: ## Build solo de APIs
	@echo "$(GREEN)Building APIs...$(NC)"
	docker build -t $(REGISTRY)/municipal-api-gateway:$(VERSION) ./apps/microservices/api-gateway
	docker build -t $(REGISTRY)/municipal-api-identidad:$(VERSION) ./apps/microservices/api-identidad
	docker build -t $(REGISTRY)/municipal-api-autorizacion:$(VERSION) ./apps/microservices/api-autorizacion
	docker build -t $(REGISTRY)/municipal-api-contabilidad:$(VERSION) ./apps/microservices/api-contabilidad

build-mf: ## Build solo de Microfrontends
	@echo "$(GREEN)Building Microfrontends...$(NC)"
	docker build -t $(REGISTRY)/municipal-mf-shell:$(VERSION) ./apps/microfrontends/mf_shell
	docker build -t $(REGISTRY)/municipal-mf-store:$(VERSION) ./apps/microfrontends/mf_store
	docker build -t $(REGISTRY)/municipal-mf-ui:$(VERSION) ./apps/microfrontends/mf_ui
	docker build -t $(REGISTRY)/municipal-mf-contabilidad:$(VERSION) ./apps/microfrontends/mf_contabilidad
	docker build -t $(REGISTRY)/municipal-mf-configuracion:$(VERSION) ./apps/microfrontends/mf_configuracion

build-push: build ## Build y push al registry
	@echo "$(GREEN)Pushing imagenes a $(REGISTRY)...$(NC)"
	docker push $(REGISTRY)/municipal-api-gateway:$(VERSION)
	docker push $(REGISTRY)/municipal-api-identidad:$(VERSION)
	docker push $(REGISTRY)/municipal-api-autorizacion:$(VERSION)
	docker push $(REGISTRY)/municipal-api-contabilidad:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-shell:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-store:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-ui:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-contabilidad:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-configuracion:$(VERSION)

# ============================================
# Produccion (local)
# ============================================

prod: ## Inicia stack completo dockerizado (produccion local)
	@echo "$(GREEN)Iniciando stack de produccion...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) up -d --build
	@echo ""
	@make status

prod-stop: ## Detiene stack de produccion
	@echo "$(YELLOW)Deteniendo stack de produccion...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down

prod-logs: ## Muestra logs de produccion
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) logs -f

# ============================================
# Testing
# ============================================

test: ## Ejecuta tests
	@echo "$(GREEN)Ejecutando tests...$(NC)"
	pnpm test

test-ci: ## Inicia infra de test y ejecuta tests (para CI)
	@echo "$(GREEN)Iniciando entorno de test...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_TEST) up -d
	@sleep 5
	pnpm test
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_TEST) down

# ============================================
# Utilidades
# ============================================

status: ## Estado de todos los servicios
	@echo ""
	@echo "$(GREEN)Estado de servicios:$(NC)"
	@echo ""
	@$(COMPOSE_CMD) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
	@echo ""

status-infra: ## Estado de infraestructura
	@echo ""
	@echo "$(GREEN)Infraestructura:$(NC)"
	@echo ""
	@$(COMPOSE_CMD) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(CYAN)URLs:$(NC)"
	@echo "  PostgreSQL:  localhost:5434  (muni_default, platform, transversal)"
	@echo "  Redis:       localhost:6380"
	@echo "  Mailhog UI:  http://localhost:8026"
	@echo ""

logs: ## Logs de infraestructura
	$(COMPOSE_CMD) logs -f

logs-%: ## Logs de un servicio (ej: make logs-postgres)
	$(COMPOSE_CMD) logs -f $*

clean: ## Limpia contenedores, imagenes y volumenes
	@echo "$(YELLOW)Limpiando...$(NC)"
	$(COMPOSE_CMD) down -v --remove-orphans 2>/dev/null || true
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down -v --remove-orphans 2>/dev/null || true
	docker system prune -f
	@echo "$(GREEN)Limpieza completada$(NC)"

clean-all: clean ## Limpieza profunda (incluye node_modules y dist)
	@echo "$(YELLOW)Limpiando node_modules y dist...$(NC)"
	pnpm clean
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	@echo "$(GREEN)Limpieza profunda completada$(NC)"

# ============================================
# Deploy
# ============================================

deploy-staging: ## Deploy a staging (Railway)
	@echo "$(GREEN)Deploying a staging...$(NC)"
	./infra/scripts/deploy.sh staging

deploy-production: ## Deploy a produccion (Railway)
	@echo "$(RED)Deploy a PRODUCCION. Continuar? [y/N]$(NC)"
	@read -r confirm && [ "$$confirm" = "y" ] || exit 1
	./infra/scripts/deploy.sh production
