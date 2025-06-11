#!/bin/bash

# =============================================================================
# Step 6: Setup Nginx
# =============================================================================
# Bu script Nginx konfigürasyonunu kurar ve aktifleştirir
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 6: Nginx kurulumu başlatılıyor..."
    
    # Check if Nginx is installed and running
    if ! command_exists nginx; then
        error "Nginx kurulu değil. Önce 02-check-prerequisites.sh çalıştırın."
    fi
    
    # Backup existing Nginx configuration
    log "Mevcut Nginx konfigürasyonu yedekleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx konfigürasyonu yedeklenecek"
    else
        local backup_dir="/etc/nginx/backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        # Backup main configuration
        cp /etc/nginx/nginx.conf "$backup_dir/" 2>/dev/null || true
        
        # Backup sites-available
        cp -r /etc/nginx/sites-available "$backup_dir/" 2>/dev/null || true
        
        # Backup sites-enabled
        cp -r /etc/nginx/sites-enabled "$backup_dir/" 2>/dev/null || true
        
        success "Nginx konfigürasyonu yedeklendi: $backup_dir"
    fi
    
    # Copy site configuration
    log "Site konfigürasyonu kopyalanıyor..."
    
    local site_config_source="$REMOTE_DIR/muhammedtarikucar.conf"
    local site_config_target="$NGINX_SITES_AVAILABLE/$DOMAIN"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Site konfigürasyonu kopyalanacak:"
        info "  Kaynak: $site_config_source"
        info "  Hedef: $site_config_target"
    else
        if [ ! -f "$site_config_source" ]; then
            error "Site konfigürasyon dosyası bulunamadı: $site_config_source"
        fi
        
        cp "$site_config_source" "$site_config_target"
        
        if [ $? -eq 0 ]; then
            success "Site konfigürasyonu kopyalandı"
        else
            error "Site konfigürasyonu kopyalanamadı"
        fi
        
        # Set proper permissions
        chown root:root "$site_config_target"
        chmod 644 "$site_config_target"
    fi

    # Create safe Nginx configuration without problematic directives
    log "Güvenli Nginx konfigürasyonu oluşturuluyor..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Güvenli Nginx konfigürasyonu oluşturulacak"
    else
        cat > "$site_config_target" << EOF
# HTTP Server Block - Main configuration
server {
    listen 80;
    server_name $DOMAIN $WWW_DOMAIN;

    # Security Headers
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Let's Encrypt challenge location
    location /.well-known/acme-challenge/ {
        root /var/www/html;
        try_files \$uri =404;
    }

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

    # Static files with caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp|avif)$ {
        proxy_pass http://localhost:$FRONTEND_PORT;

        # Cache headers
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary "Accept-Encoding";

        # Proxy headers
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
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
    access_log $LOG_DIR/access.log;
    error_log $LOG_DIR/error.log;
}

EOF

        success "Güvenli Nginx konfigürasyonu oluşturuldu"
    fi
    
    # Enable site
    log "Site aktifleştiriliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Site aktifleştirilecek: $DOMAIN"
    else
        # Create symlink to enable site
        ln -sf "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN"
        
        if [ $? -eq 0 ]; then
            success "Site aktifleştirildi: $DOMAIN"
        else
            error "Site aktifleştirilemedi"
        fi
    fi
    
    # Remove default Nginx site
    log "Varsayılan Nginx sitesi kaldırılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Varsayılan site kaldırılacak"
    else
        rm -f "$NGINX_SITES_ENABLED/default"
        success "Varsayılan site kaldırıldı"
    fi
    
    # Test Nginx configuration
    log "Nginx konfigürasyonu test ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx konfigürasyonu test edilecek"
    else
        if nginx -t; then
            success "Nginx konfigürasyonu geçerli"
        else
            error "Nginx konfigürasyonu hatalı! Test başarısız."
        fi
    fi
    
    # Create nginx status page configuration
    log "Nginx status sayfası konfigürasyonu oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx status konfigürasyonu oluşturulacak"
    else
        cat > "$NGINX_SITES_AVAILABLE/nginx-status" << EOF
server {
    listen 127.0.0.1:8080;
    server_name localhost;
    
    location /nginx_status {
        stub_status on;
        access_log off;
        allow 127.0.0.1;
        deny all;
    }
}
EOF
        
        ln -sf "$NGINX_SITES_AVAILABLE/nginx-status" "$NGINX_SITES_ENABLED/nginx-status"
        success "Nginx status sayfası konfigürasyonu oluşturuldu"
    fi
    
    # Ensure Nginx is running before reload
    log "Nginx servis durumu kontrol ediliyor..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx servis durumu kontrol edilecek"
    else
        if ! service_running nginx; then
            warning "Nginx çalışmıyor, başlatılıyor..."
            systemctl start nginx
            sleep 2  # Wait for service to start

            if ! service_running nginx; then
                error "Nginx başlatılamadı"
            fi
            success "Nginx başlatıldı"
        else
            success "Nginx zaten çalışıyor"
        fi
    fi

    # Reload Nginx configuration
    log "Nginx konfigürasyonu yeniden yükleniyor..."

    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx yeniden yüklenecek"
    else
        # Check if nginx is active before reload
        if systemctl is-active --quiet nginx; then
            systemctl reload nginx

            if [ $? -eq 0 ]; then
                success "Nginx konfigürasyonu yeniden yüklendi"
            else
                warning "Nginx reload başarısız, restart deneniyor..."
                systemctl restart nginx

                if [ $? -eq 0 ]; then
                    success "Nginx restart edildi"
                else
                    error "Nginx restart başarısız"
                fi
            fi
        else
            warning "Nginx aktif değil, başlatılıyor..."
            systemctl start nginx

            if [ $? -eq 0 ]; then
                success "Nginx başlatıldı"
            else
                error "Nginx başlatılamadı"
            fi
        fi
    fi
    
    # Display Nginx configuration summary
    log "Nginx konfigürasyon özeti:"
    echo "  🌐 Domain: $DOMAIN"
    echo "  🌐 WWW Domain: $WWW_DOMAIN"
    echo "  🔒 HTTPS: Aktif (Certbot ile kurulacak)"
    echo "  📁 Config: $site_config_target"
    echo "  📊 Frontend Port: $FRONTEND_PORT"
    echo "  🔧 Backend Port: $BACKEND_PORT"
    echo "  📝 Access Log: $LOG_DIR/access.log"
    echo "  ❌ Error Log: $LOG_DIR/error.log"
    
    success "Adım 6: Nginx kurulumu tamamlandı"
    
    # Send notification
    send_notification "Nginx başarıyla konfigüre edildi" "success"
}

# Run main function
main "$@"
