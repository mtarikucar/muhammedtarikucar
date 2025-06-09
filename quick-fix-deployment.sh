#!/bin/bash

# =============================================================================
# Quick Fix for Current Deployment Issue
# =============================================================================
# Bu script mevcut deployment sorununu hızlıca çözer
# Nginx konfigürasyon hatası düzeltilir ve servisler yeniden başlatılır
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

# Configuration
DOMAIN="muhammedtarikucar.com"
REMOTE_DIR="/opt/muhammedtarikucar"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
FRONTEND_PORT="8082"
BACKEND_PORT="5000"
LOG_DIR="/var/log/muhammedtarikucar"

main() {
    log "🔧 Deployment sorunları düzeltiliyor..."
    
    # Check if running as root
    if [ "$EUID" -ne 0 ]; then
        error "Bu script root olarak çalıştırılmalıdır: sudo $0"
    fi
    
    # Create log directory if it doesn't exist
    mkdir -p "$LOG_DIR"
    
    # Fix Nginx configuration
    log "Nginx konfigürasyonu düzeltiliyor..."
    
    cat > "$NGINX_SITES_AVAILABLE/$DOMAIN" << 'EOF'
# HTTP Server Block - Main configuration
server {
    listen 80;
    server_name muhammedtarikucar.com www.muhammedtarikucar.com;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files $uri =404;
    }

    # Main location - Frontend
    location / {
        proxy_pass http://localhost:8082;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Host $server_name;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # API routes - Backend
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
        proxy_set_header X-Forwarded-Host $server_name;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # Socket.IO for real-time features
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket specific timeouts
        proxy_read_timeout 86400;
    }
    
    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        proxy_pass http://localhost:8082;
        
        # Cache headers
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";
        
        # Proxy headers
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Health check endpoint
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
    
    # Deny access to sensitive files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
    
    # Logs
    access_log /var/log/muhammedtarikucar/access.log;
    error_log /var/log/muhammedtarikucar/error.log;
}
EOF

    success "Nginx konfigürasyonu düzeltildi"
    
    # Enable site
    log "Site aktifleştiriliyor..."
    ln -sf "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"
    success "Site aktifleştirildi"
    
    # Test Nginx configuration
    log "Nginx konfigürasyonu test ediliyor..."
    if nginx -t; then
        success "Nginx konfigürasyonu geçerli"
    else
        error "Nginx konfigürasyonu hatalı!"
    fi
    
    # Reload Nginx
    log "Nginx yeniden yükleniyor..."
    systemctl reload nginx
    if systemctl is-active --quiet nginx; then
        success "Nginx başarıyla yeniden yüklendi"
    else
        error "Nginx yeniden yüklenemedi"
    fi
    
    # Check Docker services
    log "Docker servisleri kontrol ediliyor..."
    cd "$REMOTE_DIR"
    
    # Check if docker-compose.yml exists
    if [ ! -f "docker-compose.yml" ]; then
        error "docker-compose.yml bulunamadı: $REMOTE_DIR"
    fi
    
    # Check container health
    local unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null || true)
    
    if [ -n "$unhealthy_containers" ]; then
        warning "Sağlıksız container'lar tespit edildi: $unhealthy_containers"
        log "Container'lar yeniden başlatılıyor..."
        
        # Restart unhealthy containers
        echo "$unhealthy_containers" | while read container; do
            if [ -n "$container" ]; then
                log "Container yeniden başlatılıyor: $container"
                docker restart "$container"
            fi
        done
        
        # Wait for containers to be healthy
        sleep 30
        
        # Check again
        unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null || true)
        if [ -z "$unhealthy_containers" ]; then
            success "Tüm container'lar sağlıklı duruma geldi"
        else
            warning "Bazı container'lar hala sağlıksız: $unhealthy_containers"
        fi
    else
        success "Tüm container'lar sağlıklı"
    fi
    
    # Test website accessibility
    log "Website erişilebilirliği test ediliyor..."
    
    # Test frontend
    if curl -f -s --max-time 10 "http://localhost:$FRONTEND_PORT" >/dev/null; then
        success "Frontend erişilebilir (port $FRONTEND_PORT)"
    else
        warning "Frontend erişilebilir değil (port $FRONTEND_PORT)"
    fi
    
    # Test backend
    if curl -f -s --max-time 10 "http://localhost:$BACKEND_PORT/api/health" >/dev/null; then
        success "Backend API erişilebilir (port $BACKEND_PORT)"
    else
        warning "Backend API erişilebilir değil (port $BACKEND_PORT)"
    fi
    
    # Test domain
    if curl -f -s --max-time 10 "http://$DOMAIN" >/dev/null; then
        success "Domain erişilebilir: $DOMAIN"
    else
        warning "Domain erişilebilir değil: $DOMAIN"
    fi
    
    # Show final status
    log "Final durum kontrolü..."
    echo ""
    echo "🐳 Docker Containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo "🌐 Nginx Status:"
    systemctl status nginx --no-pager -l | head -5
    echo ""
    echo "🔗 Port Usage:"
    netstat -tlnp | grep -E ":($FRONTEND_PORT|$BACKEND_PORT|80|443)" | head -10
    echo ""
    
    # Create quick status report
    cat > "$REMOTE_DIR/QUICK_FIX_REPORT.md" << EOF
# Quick Fix Report

**Date:** $(date)
**Fixed Issues:**
- Nginx configuration syntax errors
- Rate limiting directives removed
- Site properly enabled
- Container health checked

## Current Status

### Docker Containers
\`\`\`
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
\`\`\`

### Nginx Status
\`\`\`
$(systemctl status nginx --no-pager -l | head -10)
\`\`\`

### Accessibility Tests
- Frontend (port $FRONTEND_PORT): $(curl -f -s --max-time 5 "http://localhost:$FRONTEND_PORT" >/dev/null && echo "✅ OK" || echo "❌ FAIL")
- Backend (port $BACKEND_PORT): $(curl -f -s --max-time 5 "http://localhost:$BACKEND_PORT/api/health" >/dev/null && echo "✅ OK" || echo "❌ FAIL")
- Domain ($DOMAIN): $(curl -f -s --max-time 5 "http://$DOMAIN" >/dev/null && echo "✅ OK" || echo "❌ FAIL")

## Next Steps

1. Monitor services: \`docker-compose logs -f\`
2. Check website: https://$DOMAIN
3. Setup SSL if needed: \`./deploy-manager.sh ssl-setup\`
4. Run full health check: \`./deploy-manager.sh health\`

---
Generated by quick-fix script
EOF
    
    success "Quick fix raporu oluşturuldu: $REMOTE_DIR/QUICK_FIX_REPORT.md"
    
    echo ""
    echo "🎉 Quick fix tamamlandı!"
    echo ""
    echo "📋 Sonraki adımlar:"
    echo "  1. Website'i test edin: http://$DOMAIN"
    echo "  2. API'yi test edin: http://$DOMAIN/api/health"
    echo "  3. Logları kontrol edin: cd $REMOTE_DIR && docker-compose logs -f"
    echo "  4. SSL kurulumu: ./deploy-manager.sh ssl-setup"
    echo "  5. Sağlık izleme: ./deploy-manager.sh monitor"
    echo ""
    echo "🔧 Deployment yönetimi için: ./deploy-manager.sh help"
    echo ""
}

# Run main function
main "$@"
