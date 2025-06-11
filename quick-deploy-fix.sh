#!/bin/bash

# =============================================================================
# Quick Deployment Fix Script
# =============================================================================
# Bu script deployment sorunlarını hızlıca çözer
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Check if running as root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        error "Bu script root olarak çalıştırılmalıdır. 'sudo $0' kullanın."
    fi
}

# Fix Nginx installation and configuration
fix_nginx() {
    log "Nginx kurulumu ve konfigürasyonu düzeltiliyor..."
    
    # Update package lists
    apt-get update
    
    # Install Nginx if not installed
    if ! command -v nginx >/dev/null 2>&1; then
        log "Nginx kuruluyor..."
        apt-get install -y nginx
    fi
    
    # Stop nginx if running
    systemctl stop nginx 2>/dev/null || true
    
    # Remove any conflicting configurations
    rm -f /etc/nginx/sites-enabled/default
    rm -f /etc/nginx/sites-enabled/muhammedtarikucar.com
    rm -f /etc/nginx/sites-enabled/test.muhammedtarikucar.com
    
    # Remove any existing nginx status configurations that might conflict
    rm -f /etc/nginx/sites-enabled/nginx-status
    rm -f /etc/nginx/sites-available/nginx-status

    # Create basic nginx configuration
    cat > /etc/nginx/sites-available/muhammedtarikucar.com << 'EOF'
server {
    listen 80;
    server_name muhammedtarikucar.com www.muhammedtarikucar.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Create test environment configuration
    cat > /etc/nginx/sites-available/test.muhammedtarikucar.com << 'EOF'
server {
    listen 80;
    server_name test.muhammedtarikucar.com www.test.muhammedtarikucar.com;

    add_header X-Environment "test" always;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /api/ {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /health {
        access_log off;
        return 200 "test-healthy\n";
        add_header Content-Type text/plain;
    }

    location /test-info {
        access_log off;
        return 200 "Test Environment\nFrontend: 3001\nBackend: 5001\n";
        add_header Content-Type text/plain;
    }
}
EOF

    # Enable sites
    ln -sf /etc/nginx/sites-available/muhammedtarikucar.com /etc/nginx/sites-enabled/
    ln -sf /etc/nginx/sites-available/test.muhammedtarikucar.com /etc/nginx/sites-enabled/
    
    # Test nginx configuration
    if nginx -t; then
        success "Nginx konfigürasyonu geçerli"
    else
        error "Nginx konfigürasyonu hatalı"
    fi
    
    # Start nginx
    systemctl start nginx
    systemctl enable nginx
    
    if systemctl is-active --quiet nginx; then
        success "Nginx başarıyla başlatıldı"
    else
        error "Nginx başlatılamadı"
    fi
}

# Fix Docker installation
fix_docker() {
    log "Docker kurulumu kontrol ediliyor..."
    
    if ! command -v docker >/dev/null 2>&1; then
        log "Docker kuruluyor..."
        
        # Install prerequisites
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        
        # Add Docker's official GPG key
        curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        
        # Set up repository
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        
        # Install Docker
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
        
        # Start Docker
        systemctl start docker
        systemctl enable docker
        
        success "Docker kuruldu"
    else
        success "Docker zaten kurulu"
    fi
    
    # Check if Docker is running
    if ! systemctl is-active --quiet docker; then
        systemctl start docker
    fi
    
    success "Docker çalışıyor"
}

# Create necessary directories
create_directories() {
    log "Gerekli dizinler oluşturuluyor..."
    
    # Production directories
    mkdir -p /opt/muhammedtarikucar
    mkdir -p /var/log/muhammedtarikucar
    mkdir -p /var/backups/muhammedtarikucar
    
    # Test directories
    mkdir -p /opt/muhammedtarikucar-test
    mkdir -p /var/log/muhammedtarikucar-test
    mkdir -p /var/backups/muhammedtarikucar-test
    
    # Set permissions
    chown -R www-data:www-data /var/log/muhammedtarikucar*
    chmod -R 755 /opt/muhammedtarikucar*
    
    success "Dizinler oluşturuldu"
}

# Fix permissions
fix_permissions() {
    log "İzinler düzeltiliyor..."
    
    # Make scripts executable
    chmod +x deploy.sh deploy-test.sh 2>/dev/null || true
    chmod +x deploy-scripts/*.sh 2>/dev/null || true
    
    success "İzinler düzeltildi"
}

# Show system status
show_status() {
    log "Sistem durumu:"
    echo ""
    echo "🐳 Docker:"
    if systemctl is-active --quiet docker; then
        echo "  ✅ Çalışıyor"
    else
        echo "  ❌ Çalışmıyor"
    fi
    
    echo ""
    echo "🌐 Nginx:"
    if systemctl is-active --quiet nginx; then
        echo "  ✅ Çalışıyor"
    else
        echo "  ❌ Çalışmıyor"
    fi
    
    echo ""
    echo "📁 Dizinler:"
    for dir in "/opt/muhammedtarikucar" "/opt/muhammedtarikucar-test" "/var/log/muhammedtarikucar" "/var/log/muhammedtarikucar-test"; do
        if [ -d "$dir" ]; then
            echo "  ✅ $dir"
        else
            echo "  ❌ $dir"
        fi
    done
    
    echo ""
    echo "🔧 Nginx Sites:"
    for site in "muhammedtarikucar.com" "test.muhammedtarikucar.com"; do
        if [ -f "/etc/nginx/sites-enabled/$site" ]; then
            echo "  ✅ $site"
        else
            echo "  ❌ $site"
        fi
    done
}

# Main function
main() {
    echo "=============================================="
    echo "🔧 Quick Deployment Fix"
    echo "=============================================="
    
    check_root
    
    log "Deployment sorunları düzeltiliyor..."
    
    fix_docker
    create_directories
    fix_nginx
    fix_permissions
    
    echo ""
    show_status
    
    echo ""
    echo "=============================================="
    success "🎉 Deployment düzeltmeleri tamamlandı!"
    echo "=============================================="
    echo ""
    echo "Şimdi şunları deneyebilirsiniz:"
    echo "  Production: ./deploy.sh"
    echo "  Test: ./deploy-test.sh"
    echo ""
}

# Run main function
main "$@"
