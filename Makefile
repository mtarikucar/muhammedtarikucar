# Blog Application Makefile

.PHONY: help build up down logs clean dev prod install test lint

# Default target
help:
	@echo "Available commands:"
	@echo "  make dev      - Start development environment"
	@echo "  make prod     - Start production environment"
	@echo "  make build    - Build all Docker images"
	@echo "  make up       - Start all services"
	@echo "  make down     - Stop all services"
	@echo "  make logs     - Show logs from all services"
	@echo "  make clean    - Clean up containers and volumes"
	@echo "  make install  - Install dependencies"
	@echo "  make test     - Run tests"
	@echo "  make lint     - Run linting"

# Development environment
dev:
	@echo "Starting development environment..."
	docker compose -f docker-compose.dev.yml up --build

dev-detached:
	@echo "Starting development environment in background..."
	docker compose -f docker-compose.dev.yml up --build -d

# Production environment
prod:
	@echo "Starting production environment..."
	docker compose up --build

prod-detached:
	@echo "Starting production environment in background..."
	docker compose up --build -d

# Build all images
build:
	@echo "Building all Docker images..."
	docker compose build
	docker compose -f docker-compose.dev.yml build

# Start services
up:
	docker compose up -d

up-dev:
	docker compose -f docker-compose.dev.yml up -d

# Stop services
down:
	docker compose down
	docker compose -f docker-compose.dev.yml down

# Show logs
logs:
	docker compose logs -f

logs-dev:
	docker compose -f docker-compose.dev.yml logs -f

logs-server:
	docker compose logs -f server

logs-client:
	docker compose logs -f client

logs-db:
	docker compose logs -f mongodb

# Clean up
clean:
	@echo "Cleaning up containers and volumes..."
	docker compose down -v --remove-orphans
	docker compose -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all:
	@echo "Cleaning up everything..."
	docker compose down -v --remove-orphans --rmi all
	docker compose -f docker-compose.dev.yml down -v --remove-orphans --rmi all
	docker system prune -af

# Install dependencies
install:
	@echo "Installing server dependencies..."
	cd server && npm install
	@echo "Installing client dependencies..."
	cd client && npm install

# Run tests
test:
	@echo "Running server tests..."
	cd server && npm test
	@echo "Running client tests..."
	cd client && npm test

# Run linting
lint:
	@echo "Running server linting..."
	cd server && npm run lint
	@echo "Running client linting..."
	cd client && npm run lint

lint-fix:
	@echo "Fixing server linting issues..."
	cd server && npm run lint:fix
	@echo "Fixing client linting issues..."
	cd client && npm run lint:fix

# Database operations
db-seed:
	@echo "Seeding database..."
	docker compose exec mongodb mongosh blog_db --eval "load('/docker-entrypoint-initdb.d/mongo-init.js')"

db-backup:
	@echo "Backing up database..."
	docker compose exec mongodb mongodump --db blog_db --out /data/backup

db-restore:
	@echo "Restoring database..."
	docker compose exec mongodb mongorestore --db blog_db /data/backup/blog_db

# Monitoring
status:
	@echo "Service status:"
	docker compose ps

health:
	@echo "Health check:"
	curl -f http://localhost:5000/api/health || echo "Server not responding"
	curl -f http://localhost/ || echo "Client not responding"

# Development helpers
shell-server:
	docker compose exec server sh

shell-client:
	docker compose exec client sh

shell-db:
	docker compose exec mongodb mongosh blog_db
