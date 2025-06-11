#!/bin/bash

# =============================================================================
# muhammedtarikucar.com Test Environment Deployment Script
# =============================================================================
# This script deploys the application to test.muhammedtarikucar.com
# Server IP: 161.97.80.171
# Test Domain: test.muhammedtarikucar.com
# =============================================================================

set -e  # Exit on any error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPTS_DIR="$SCRIPT_DIR/deploy-scripts"

# Source configuration and utilities
source "$DEPLOY_SCRIPTS_DIR/config.sh"
source "$DEPLOY_SCRIPTS_DIR/utils.sh"

# Override configuration for test environment
export DOMAIN="test.muhammedtarikucar.com"
export WWW_DOMAIN="www.test.muhammedtarikucar.com"
export FRONTEND_PORT="3001"  # Different port for test
export BACKEND_PORT="5001"   # Different port for test
export REMOTE_DIR="/opt/muhammedtarikucar-test"
export LOG_DIR="/var/log/muhammedtarikucar-test"
export COMPOSE_PROJECT_NAME="muhammedtarikucar-test"

# Test environment specific settings
export TEST_MODE="true"
export SKIP_SSL="true"  # Skip SSL for test initially
export MONGODB_DATABASE="muhammedtarikucar_test"

# Main deployment function
main() {
    echo "=============================================="
    echo "🧪 Test Environment Deployment"
    echo "=============================================="
    echo "🌐 Domain: $DOMAIN"
    echo "🔧 Frontend Port: $FRONTEND_PORT"
    echo "🔧 Backend Port: $BACKEND_PORT"
    echo "📁 Directory: $REMOTE_DIR"
    echo "=============================================="
    echo ""

    # Check if deploy-scripts directory exists
    if [ ! -d "$DEPLOY_SCRIPTS_DIR" ]; then
        error "Deploy scripts dizini bulunamadı: $DEPLOY_SCRIPTS_DIR"
    fi

    # Execute deployment steps with enhanced safety
    log "Test ortamı deployment başlatılıyor..."

    # Step 0: Pre-deployment safety check
    "$DEPLOY_SCRIPTS_DIR/00-pre-deployment-check.sh" || {
        error "Pre-deployment kontrolleri başarısız. Deployment durduruluyor."
    }

    # Step 1: Check permissions
    "$DEPLOY_SCRIPTS_DIR/01-check-permissions.sh" || {
        error "Yetki kontrolü başarısız"
        exit 1
    }

    # Step 2: Check prerequisites
    "$DEPLOY_SCRIPTS_DIR/02-check-prerequisites.sh" || {
        error "Ön koşul kontrolü başarısız"
        exit 1
    }

    # Step 3: Setup directories
    "$DEPLOY_SCRIPTS_DIR/03-setup-directories.sh" || {
        error "Dizin kurulumu başarısız"
        exit 1
    }

    # Step 4: Backup existing deployment (if exists)
    if [ -d "$REMOTE_DIR" ]; then
        "$DEPLOY_SCRIPTS_DIR/04-backup-existing.sh" || {
            warning "Test ortamı yedekleme başarısız, devam ediliyor..."
        }
    fi

    # Step 5: Deploy files
    "$DEPLOY_SCRIPTS_DIR/05-deploy-files.sh" || {
        error "Dosya deployment başarısız"
        exit 1
    }

    # Copy test docker-compose file
    log "Test docker-compose dosyası kopyalanıyor..."
    cp "$SCRIPT_DIR/docker-compose.test.yml" "$REMOTE_DIR/docker-compose.yml"
    success "Test docker-compose dosyası kopyalandı"

    # Step 6: Setup Nginx for test domain
    setup_test_nginx || {
        error "Test Nginx kurulumu başarısız"
        exit 1
    }

    # Step 7: Stop existing test services
    stop_test_services || {
        warning "Test servis durdurma sırasında sorun oluştu, devam ediliyor..."
    }

    # Step 8: Start test services
    "$DEPLOY_SCRIPTS_DIR/08-start-services.sh" || {
        error "Test servis başlatma başarısız"
        exit 1
    }

    # Step 9: Health check
    "$DEPLOY_SCRIPTS_DIR/09-health-check.sh" || {
        error "Test sağlık kontrolü başarısız"
        exit 1
    }

    # Show test deployment info
    show_test_info

    echo ""
    echo "=============================================="
    success "🎉 Test deployment başarıyla tamamlandı!"
    echo "=============================================="
    echo "🌐 Test URL: http://$DOMAIN"
    echo "🔧 Frontend: http://$DOMAIN:$FRONTEND_PORT"
    echo "🔧 Backend: http://$DOMAIN:$BACKEND_PORT"
    echo "=============================================="
}

# Function to setup Nginx for test environment
setup_test_nginx() {
    log "Test ortamı için Nginx konfigürasyonu oluşturuluyor..."
    
    local site_config_target="$NGINX_SITES_AVAILABLE/$DOMAIN"
    
    # Create test-specific Nginx configuration
    cat > "$site_config_target" << EOF
# Test Environment HTTP Server Block
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Test environment header
    add_header X-Environment "test" always;

    # Main location - Frontend
    location / {
        proxy_pass http://localhost:$FRONTEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API routes - Backend
    location /api/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_set_header X-Forwarded-Host \$server_name;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:$BACKEND_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # WebSocket specific timeouts
        proxy_read_timeout 86400;
    }

    # Health check endpoint
    location /health {
        access_log off;
        return 200 "test-healthy\n";
        add_header Content-Type text/plain;
    }

    # Test info endpoint
    location /test-info {
        access_log off;
        return 200 "Test Environment - $DOMAIN\nFrontend: $FRONTEND_PORT\nBackend: $BACKEND_PORT\n";
        add_header Content-Type text/plain;
    }

    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Logs
    access_log $LOG_DIR/access.log;
    error_log $LOG_DIR/error.log;
}

EOF

    # Enable test site
    ln -sf "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"
    
    # Test Nginx configuration
    if nginx -t; then
        success "Test Nginx konfigürasyonu geçerli"
    else
        error "Test Nginx konfigürasyonu hatalı!"
    fi
    
    # Reload Nginx
    if systemctl is-active --quiet nginx; then
        systemctl reload nginx
        success "Nginx konfigürasyonu yeniden yüklendi"
    else
        systemctl start nginx
        success "Nginx başlatıldı"
    fi
}

# Function to stop test services
stop_test_services() {
    log "Test servisleri durduruluyor..."
    
    # Stop test containers if running
    if [ -f "$REMOTE_DIR/docker-compose.yml" ]; then
        cd "$REMOTE_DIR"
        docker-compose -p "$COMPOSE_PROJECT_NAME" down --remove-orphans || true
    fi
    
    success "Test servisleri durduruldu"
}

# Function to show test deployment info
show_test_info() {
    log "Test deployment bilgileri:"
    echo "  🧪 Environment: TEST"
    echo "  🌐 Domain: $DOMAIN"
    echo "  🌐 WWW Domain: $WWW_DOMAIN"
    echo "  📁 Directory: $REMOTE_DIR"
    echo "  📊 Frontend Port: $FRONTEND_PORT"
    echo "  🔧 Backend Port: $BACKEND_PORT"
    echo "  📝 Access Log: $LOG_DIR/access.log"
    echo "  ❌ Error Log: $LOG_DIR/error.log"
    echo "  🗄️ Database: $MONGODB_DATABASE"
    echo ""
    echo "  🔗 Test URLs:"
    echo "    Main: http://$DOMAIN"
    echo "    Health: http://$DOMAIN/health"
    echo "    Test Info: http://$DOMAIN/test-info"
}

# Show usage information
usage() {
    echo "Kullanım: $0 [OPTION]"
    echo ""
    echo "Test ortamı deployment scripti"
    echo ""
    echo "Seçenekler:"
    echo "  --help, -h          Bu yardım mesajını göster"
    echo "  --dry-run          Sadece kontrol yap, değişiklik yapma"
    echo "  --skip-backup      Yedekleme işlemini atla"
    echo ""
    echo "Örnekler:"
    echo "  $0                 Test deployment yap"
    echo "  $0 --dry-run       Sadece kontrol yap"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            usage
            exit 0
            ;;
        --dry-run)
            export DRY_RUN=true
            shift
            ;;
        --skip-backup)
            export SKIP_BACKUP=true
            shift
            ;;
        *)
            error "Bilinmeyen parametre: $1. --help kullanarak yardım alın."
            ;;
    esac
done

# Run main function
main "$@"
