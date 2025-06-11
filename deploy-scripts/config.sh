#!/bin/bash

# =============================================================================
# Deployment Configuration
# =============================================================================
# Bu dosya tüm deployment scriptleri tarafından kullanılan
# konfigürasyon değişkenlerini içerir
# =============================================================================

# Server Configuration
export SERVER_IP="161.97.80.171"
export DOMAIN="muhammedtarikucar.com"
export WWW_DOMAIN="www.muhammedtarikucar.com"
export PROJECT_NAME="muhammedtarikucar"
export DEPLOY_USER="root"

# Directory Configuration
export REMOTE_DIR="/opt/${PROJECT_NAME}"
export BACKUP_DIR="/opt/backups/${PROJECT_NAME}"
export LOG_DIR="/var/log/${PROJECT_NAME}"
export NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
export NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# Service Configuration
export FRONTEND_PORT="3000"
export BACKEND_PORT="5000"
export MONGODB_PORT="27018"
export REDIS_PORT="6380"

# SSL Configuration
export SSL_EMAIL="admin@${DOMAIN}"
export CERTBOT_WEBROOT="/var/www/html"

# Docker Configuration
export COMPOSE_FILE="docker-compose.yml"
export COMPOSE_PROJECT_NAME="${PROJECT_NAME}"

# Backup Configuration
export MAX_BACKUPS="5"
export BACKUP_RETENTION_DAYS="30"

# Health Check Configuration
export HEALTH_CHECK_TIMEOUT="60"
export HEALTH_CHECK_RETRIES="5"
export HEALTH_CHECK_INTERVAL="10"

# Environment Variables for Production
export NODE_ENV="production"
export JWT_SECRET="${JWT_SECRET:-your-super-secret-jwt-key-here-change-in-production}"
export REFRESH_TOKEN_SECRET="${REFRESH_TOKEN_SECRET:-your-super-secret-refresh-token-key-here-change-in-production}"

# MongoDB Configuration
export MONGODB_ROOT_USERNAME="admin"
export MONGODB_ROOT_PASSWORD="password123"
export MONGODB_DATABASE="blog_db"
export MONGODB_URI="mongodb://${MONGODB_ROOT_USERNAME}:${MONGODB_ROOT_PASSWORD}@mongodb:27017/${MONGODB_DATABASE}?authSource=admin"

# Redis Configuration
export REDIS_URL="redis://redis:6379"

# Client Configuration
export CLIENT_URL="https://${DOMAIN}"

# Logging Configuration
export LOG_LEVEL="info"
export LOG_FORMAT="combined"

# Security Configuration
export FAIL2BAN_ENABLED="true"
export UFW_ENABLED="true"

# Monitoring Configuration
export MONITORING_ENABLED="false"
export PROMETHEUS_PORT="9090"
export GRAFANA_PORT="3000"

# Notification Configuration
export SLACK_WEBHOOK_URL="${SLACK_WEBHOOK_URL:-}"
export EMAIL_NOTIFICATIONS="${EMAIL_NOTIFICATIONS:-false}"

# Feature Flags
export ENABLE_REDIS_CACHE="true"
export ENABLE_RATE_LIMITING="true"
export ENABLE_COMPRESSION="true"
export ENABLE_CORS="true"

# Development/Debug Configuration
export DEBUG_MODE="${DEBUG_MODE:-false}"
export VERBOSE_LOGGING="${VERBOSE_LOGGING:-false}"

# Deployment Options (can be overridden by command line)
export DRY_RUN="${DRY_RUN:-false}"
export SKIP_SSL="${SKIP_SSL:-false}"
export SKIP_BACKUP="${SKIP_BACKUP:-false}"
export FORCE_REBUILD="${FORCE_REBUILD:-false}"
export SKIP_HEALTH_CHECK="${SKIP_HEALTH_CHECK:-false}"

# System Requirements
export MIN_DOCKER_VERSION="20.10.0"
export MIN_COMPOSE_VERSION="2.0.0"
export MIN_NGINX_VERSION="1.18.0"
export MIN_DISK_SPACE_GB="10"
export MIN_RAM_MB="2048"

# Network Configuration
export DOCKER_NETWORK_NAME="${PROJECT_NAME}_network"
export DOCKER_NETWORK_SUBNET="172.20.0.0/16"

# Volume Configuration
export MONGODB_VOLUME="${PROJECT_NAME}_mongodb_data"
export REDIS_VOLUME="${PROJECT_NAME}_redis_data"
export UPLOADS_VOLUME="${PROJECT_NAME}_uploads"
export LOGS_VOLUME="${PROJECT_NAME}_logs"

# Timezone Configuration
export TZ="Europe/Istanbul"

# Locale Configuration
export LANG="tr_TR.UTF-8"
export LC_ALL="tr_TR.UTF-8"

echo "✅ Konfigürasyon yüklendi: ${PROJECT_NAME} deployment"
