.PHONY: up down destroy reset logs format asdf-install

# Default environment (can be overridden: make ENV=sandbox up)
ENV ?= dev
DAEMON ?= false

COMPOSE_FILES = -f ./sandbox/docker-compose.yml
ifeq ($(ENV),dev)
    ENV_FILE = ./sandbox/.env.dev
else ifeq ($(ENV),sandbox)
    ENV_FILE = ./sandbox/.env.sandbox
endif

# Common flags
UP_FLAGS = up --build --remove-orphans
ifeq ($(DAEMON),true)
    UP_FLAGS += -d
endif

DOWN_FLAGS = down
DESTROY_FLAGS = down --volumes --rmi all --remove-orphans
LOGS_FALGS = logs --tail=5

# Cleanup helpers
VOLUME_CLEAN = docker volume rm sandbox_kc_fluent_postgres_data || true
IMAGE_PRUNE = docker image prune -f

up:
	docker-compose $(COMPOSE_FILES) --env-file $(ENV_FILE) $(UP_FLAGS)

down:
	docker-compose $(COMPOSE_FILES) --env-file $(ENV_FILE) $(DOWN_FLAGS)

destroy:
	docker-compose $(COMPOSE_FILES) --env-file $(ENV_FILE) $(DESTROY_FLAGS)
	$(VOLUME_CLEAN)
	$(IMAGE_PRUNE)

reset: destroy up

logs:
	docker-compose $(COMPOSE_FILES) --env-file $(ENV_FILE) $(LOGS_FALGS)

format:
	black .
