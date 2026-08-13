# Habit Tracker — every target runs inside Docker. No host toolchain required.
SHELL := /bin/bash
.DEFAULT_GOAL := help

# Containers run as the developer, so files they write into the bind-mounted
# repo (package-lock.json, .husky/_, git objects) stay owned by the host user.
export HOST_UID := $(shell id -u)
export HOST_GID := $(shell id -g)

DC        := docker compose
DC_PROD   := docker compose -f docker-compose.prod.yml
SERVICE   := app
RUN       := $(DC) run --rm --no-deps $(SERVICE)
IN        := ./scripts/in-container.sh

.PHONY: help env secret install add build dev up down stop restart logs ps shell \
        lint lint-fix format format-check typecheck test test-watch test-ci ci \
        hooks doctor fix-perms prod prod-down prod-logs clean reset

## ---------------------------------------------------------------- meta ----

help: ## Show this help
	@echo "Habit Tracker — make targets"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
		| awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'
	@echo ""

env: ## Create .env.local from .env-example (no-op if it exists)
	@test -f .env.local && echo ".env.local already exists" || \
		(cp .env-example .env.local && echo "created .env.local — run 'make secret' next")

secret: ## Print a fresh AUTH_SECRET (generated in the container)
	@$(RUN) node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

## ------------------------------------------------------------ lifecycle ---

install: ## Install npm dependencies inside the container (writes package-lock.json)
	$(RUN) npm install

add: ## Add a dependency: make add PKG="zustand" [DEV=1]
	@test -n "$(PKG)" || (echo "usage: make add PKG=\"<package>\" [DEV=1]" && exit 1)
	$(RUN) npm install $(if $(DEV),--save-dev,) $(PKG)

build: ## Build the Docker images
	$(DC) build

dev: ## Start the dev server with hot reload (http://localhost:3000)
	$(DC) up --build

up: dev ## Alias for `make dev`

down: ## Stop and remove the dev containers
	$(DC) down

stop: ## Stop containers without removing them
	$(DC) stop

restart: down up ## Recreate the dev stack

logs: ## Tail dev container logs
	$(DC) logs -f $(SERVICE)

ps: ## Show container status
	$(DC) ps

shell: ## Open a shell inside the app container
	$(IN) sh

## ---------------------------------------------------------------- quality --

lint: ## Run ESLint
	$(IN) npm run lint

lint-fix: ## Run ESLint with --fix
	$(IN) npm run lint:fix

format: ## Format the codebase with Prettier
	$(IN) npm run format

format-check: ## Verify formatting without writing
	$(IN) npm run format:check

typecheck: ## Run the TypeScript compiler
	$(IN) npm run typecheck

test: ## Run the Jest suite
	$(IN) npm test

test-watch: ## Run Jest in watch mode
	$(DC) run --rm $(SERVICE) npm run test:watch

test-ci: ## Run Jest with coverage
	$(IN) npm run test:ci

ci: ## Full gate: lint + typecheck + tests, in a clean container
	$(DC) build --progress=plain $(SERVICE)
	$(RUN) sh -c "npm run lint && npm run typecheck && npm run test:ci"

hooks: ## Install the Husky git hooks
	$(RUN) npm run prepare
	@chmod +x .husky/pre-commit .husky/commit-msg .husky/pre-push scripts/in-container.sh
	@$(MAKE) --no-print-directory doctor

doctor: ## Check that the hooks and file ownership are healthy
	@fail=0; \
	printf 'git hooks path ....... '; \
	if [ "$$(git config core.hooksPath)" = ".husky/_" ] && [ -x .husky/_/pre-commit ]; then \
		echo "ok"; else echo "NOT INSTALLED — run: make hooks"; fail=1; fi; \
	printf 'hook scripts ......... '; \
	if [ -x .husky/pre-commit ] && [ -x .husky/commit-msg ] && [ -x .husky/pre-push ] \
		&& [ -x scripts/in-container.sh ]; then echo "ok"; \
	else echo "NOT EXECUTABLE — run: make hooks"; fail=1; fi; \
	printf 'docker daemon ........ '; \
	if docker info >/dev/null 2>&1; then echo "ok"; else echo "UNREACHABLE — start Docker"; fail=1; fi; \
	printf 'file ownership ....... '; \
	foreign=$$(find . .git -maxdepth 2 -not -user $(HOST_UID) -not -path './node_modules/*' 2>/dev/null | head -1); \
	if [ -z "$$foreign" ]; then echo "ok"; \
	else echo "FOREIGN OWNER ($$foreign) — run: make fix-perms"; fail=1; fi; \
	exit $$fail

fix-perms: ## Give the repo (including .git) back to the host user
	@echo "chown -R $(HOST_UID):$(HOST_GID) — repairing files written by an earlier root container"
	@$(DC) run --rm --no-deps --user 0:0 -v $(CURDIR):/repo $(SERVICE) \
		chown -R $(HOST_UID):$(HOST_GID) /repo
	@$(MAKE) --no-print-directory doctor

## -------------------------------------------------------------- production -

prod: ## Build and run the production image
	$(DC_PROD) up --build -d
	@echo "running on http://localhost:$${APP_PORT:-3000}"

prod-down: ## Stop the production stack
	$(DC_PROD) down

prod-logs: ## Tail production logs
	$(DC_PROD) logs -f $(SERVICE)

## ------------------------------------------------------------------ clean --

clean: ## Remove containers and build caches
	$(DC) down --remove-orphans
	$(DC_PROD) down --remove-orphans 2>/dev/null || true

reset: ## Remove containers, named volumes and images (full rebuild next time)
	$(DC) down -v --remove-orphans --rmi local
	$(DC_PROD) down -v --remove-orphans --rmi local 2>/dev/null || true
