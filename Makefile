# ============================================
# Sistema Municipal - Makefile
# ============================================
# Comandos unificados para desarrollo y producción
# Uso: make <comando>
# ============================================

.PHONY: help dev dev-infra dev-stop dev-down build build-api build-mf prod prod-stop \
        logs logs-api clean status test deploy-staging deploy-production \
        install db-migrate db-seed

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
REGISTRY       := ghcr.io/tu-usuario
VERSION        := $(shell git describe --tags --always --dirty 2>/dev/null || echo "dev")

# ============================================
# Ayuda
# ============================================
help: ## Muestra esta ayuda
	@echo ""
	@echo "$(GREEN)Sistema Municipal - Comandos disponibles$(NC)"
	@echo ""
	@echo "$(CYAN)Desarrollo:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(dev|install|db-)' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)Build:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(build)' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)Producción:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(prod|deploy)' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(CYAN)Utilidades:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(logs|clean|status|test)' | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""

# ============================================
# Desarrollo
# ============================================
install: ## Instala dependencias del proyecto
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	pnpm install

dev: dev-infra ## Inicia entorno de desarrollo (infra + apps en orden)
	@echo "$(GREEN)Iniciando aplicaciones en modo desarrollo...$(NC)"
	@echo "$(CYAN)Orden: 1) shared  2) gateway + APIs  3) MFs remotos  4) Shell$(NC)"
	@npx concurrently -k -n "shared,gateway,api-id,api-auth,api-cont,api-chat,mf-store,mf-ui,mf-cont,mf-chat,shell" \
		-c "gray,blue,blue,blue,blue,magenta,green,green,green,cyan,yellow" \
		"pnpm --filter @municipal/shared dev" \
		"sleep 2 && pnpm --filter gateway dev" \
		"sleep 2 && pnpm --filter api-identidad dev" \
		"sleep 2 && pnpm --filter api-autorizacion dev" \
		"sleep 2 && pnpm --filter api-contabilidad dev" \
		"sleep 2 && pnpm --filter api-chat dev" \
		"sleep 5 && pnpm --filter mf-store dev" \
		"sleep 5 && pnpm --filter mf-ui dev" \
		"sleep 5 && pnpm --filter mf-contabilidad dev" \
		"sleep 5 && pnpm --filter mf-chat dev" \
		"sleep 10 && pnpm --filter mf-shell dev"

dev-turbo: dev-infra ## Inicia con turbo (sin orden garantizado)
	@echo "$(GREEN)Iniciando aplicaciones con turbo...$(NC)"
	pnpm dev

dev-infra: ## Inicia solo infraestructura (postgres, redis, mailhog)
	@echo "$(GREEN)Iniciando infraestructura...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) --profile dev up -d
	@echo ""
	@make status-infra

dev-stop: ## Detiene el entorno de desarrollo
	@echo "$(YELLOW)Deteniendo infraestructura...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) --profile dev down

dev-down: dev-stop ## Alias de dev-stop

dev-logs: ## Muestra logs de infraestructura
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f

# ============================================
# Base de Datos
# ============================================
db-migrate: ## Ejecuta migraciones de base de datos
	@echo "$(GREEN)Ejecutando migraciones...$(NC)"
	pnpm --filter @municipal/shared migrate

db-generate: ## Genera migraciones desde los schemas
	@echo "$(GREEN)Generando migraciones...$(NC)"
	pnpm --filter @municipal/shared generate

db-seed: ## Ejecuta seeders de base de datos
	@echo "$(GREEN)Ejecutando seeders...$(NC)"
	pnpm --filter @municipal/shared seed

db-studio: ## Abre Drizzle Studio
	@echo "$(GREEN)Abriendo Drizzle Studio...$(NC)"
	pnpm --filter @municipal/shared drizzle-kit studio

db-reset: ## Resetea la base de datos (DROP + CREATE + MIGRATE + SEED)
	@echo "$(RED)⚠️  Esto eliminará todos los datos. ¿Continuar? [y/N]$(NC)"
	@read -r confirm && [ "$$confirm" = "y" ] || exit 1
	@echo "$(YELLOW)Reseteando base de datos...$(NC)"
	@echo "$(YELLOW)Terminando conexiones activas...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec postgres psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'municipal' AND pid <> pg_backend_pid();" || true
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS municipal;"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) exec postgres psql -U postgres -c "CREATE DATABASE municipal;"
	@make db-migrate
	@make db-seed

# ============================================
# Build
# ============================================
build: ## Build de todas las imágenes Docker
	@echo "$(GREEN)Building todas las imágenes...$(NC)"
	@make build-api
	@make build-mf
	@echo "$(GREEN)✓ Build completado$(NC)"

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

build-push: build ## Build y push al registry
	@echo "$(GREEN)Pushing imágenes a $(REGISTRY)...$(NC)"
	docker push $(REGISTRY)/municipal-api-gateway:$(VERSION)
	docker push $(REGISTRY)/municipal-api-identidad:$(VERSION)
	docker push $(REGISTRY)/municipal-api-autorizacion:$(VERSION)
	docker push $(REGISTRY)/municipal-api-contabilidad:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-shell:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-store:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-ui:$(VERSION)
	docker push $(REGISTRY)/municipal-mf-contabilidad:$(VERSION)

# ============================================
# Producción (local)
# ============================================
prod: ## Inicia stack completo dockerizado (producción local)
	@echo "$(GREEN)Iniciando stack de producción...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) up -d --build
	@echo ""
	@make status

prod-stop: ## Detiene stack de producción
	@echo "$(YELLOW)Deteniendo stack de producción...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down

prod-logs: ## Muestra logs de producción
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
status: ## Muestra estado de todos los servicios
	@echo ""
	@echo "$(GREEN)Estado de servicios:$(NC)"
	@echo ""
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || true
	@echo ""

status-infra: ## Muestra estado de infraestructura
	@echo ""
	@echo "$(GREEN)Infraestructura:$(NC)"
	@echo ""
	@docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(CYAN)URLs:$(NC)"
	@echo "  PostgreSQL:  localhost:5434"
	@echo "  Redis:       localhost:6379"
	@echo "  Mailhog UI:  http://localhost:8025"
	@echo ""

logs: ## Muestra logs de todos los servicios
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f

logs-%: ## Muestra logs de un servicio específico (ej: make logs-postgres)
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) logs -f $*

clean: ## Limpia contenedores, imágenes y volúmenes
	@echo "$(YELLOW)Limpiando...$(NC)"
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_DEV) down -v --remove-orphans 2>/dev/null || true
	docker compose -f $(COMPOSE_BASE) -f $(COMPOSE_PROD) down -v --remove-orphans 2>/dev/null || true
	docker system prune -f
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

clean-all: clean ## Limpieza profunda (incluye node_modules y dist)
	@echo "$(YELLOW)Limpiando node_modules y dist...$(NC)"
	pnpm clean
	find . -name "node_modules" -type d -prune -exec rm -rf '{}' +
	find . -name "dist" -type d -prune -exec rm -rf '{}' +
	@echo "$(GREEN)✓ Limpieza profunda completada$(NC)"

# ============================================
# Deploy
# ============================================
deploy-staging: ## Deploy a staging (Railway)
	@echo "$(GREEN)Deploying a staging...$(NC)"
	./infra/scripts/deploy.sh staging

deploy-production: ## Deploy a producción (Railway)
	@echo "$(RED)⚠️  Deploy a PRODUCCIÓN. ¿Continuar? [y/N]$(NC)"
	@read -r confirm && [ "$$confirm" = "y" ] || exit 1
	./infra/scripts/deploy.sh production

# ============================================
# Desarrollo de Módulos Específicos
# ============================================
dev-contabilidad: dev-infra ## Desarrollo solo del módulo contabilidad
	@echo "$(GREEN)Iniciando módulo contabilidad...$(NC)"
	pnpm --filter mf-contabilidad --filter api-contabilidad dev

dev-shell: dev-infra ## Desarrollo solo del shell
	@echo "$(GREEN)Iniciando shell...$(NC)"
	pnpm --filter mf-shell dev

dev-chat: dev-infra ## Desarrollo solo del módulo chat
	@echo "$(GREEN)Iniciando módulo chat...$(NC)"
	@npx concurrently -k -n "api-chat,mf-chat" \
		-c "magenta,cyan" \
		"pnpm --filter api-chat dev" \
		"pnpm --filter mf-chat dev"
