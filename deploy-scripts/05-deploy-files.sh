#!/bin/bash

# =============================================================================
# Step 5: Deploy Files
# =============================================================================
# Bu script proje dosyalarını hedef dizine kopyalar
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 5: Dosya deployment'ı başlatılıyor..."
    
    # Get current directory (project root)
    local project_root="$(cd "$(dirname "$SCRIPT_DIR")" && pwd)"
    
    log "Proje kök dizini: $project_root"
    log "Hedef dizin: $REMOTE_DIR"
    
    # Ensure target directory exists
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Hedef dizin kontrol edilecek: $REMOTE_DIR"
    else
        mkdir -p "$REMOTE_DIR"
    fi
    
    # Define files and directories to exclude from deployment
    local exclude_patterns=(
        ".git"
        ".gitignore"
        "node_modules"
        "*.log"
        "*.tmp"
        ".env.local"
        ".env.development"
        "coverage"
        ".nyc_output"
        "dist"
        "build"
        ".DS_Store"
        "Thumbs.db"
        "*.swp"
        "*.swo"
        ".vscode"
        ".idea"
        "deploy-scripts/logs"
    )
    
    # Create rsync exclude file
    local exclude_file="/tmp/${PROJECT_NAME}_exclude.txt"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Exclude dosyası oluşturulacak: $exclude_file"
    else
        printf '%s\n' "${exclude_patterns[@]}" > "$exclude_file"
    fi
    
    # Copy project files using rsync
    log "Proje dosyaları kopyalanıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Dosyalar kopyalanacak:"
        info "  Kaynak: $project_root/"
        info "  Hedef: $REMOTE_DIR/"
        info "  Exclude patterns: ${#exclude_patterns[@]} adet"
        
        # Show what would be copied (dry run)
        rsync -av --dry-run --exclude-from="$exclude_file" "$project_root/" "$REMOTE_DIR/" | head -20
        echo "  ... (ve diğerleri)"
    else
        # Perform actual copy
        rsync -av \
            --exclude-from="$exclude_file" \
            --delete \
            --progress \
            "$project_root/" "$REMOTE_DIR/"
        
        if [ $? -eq 0 ]; then
            success "Dosyalar başarıyla kopyalandı"
        else
            error "Dosya kopyalama başarısız"
        fi
        
        # Clean up exclude file
        rm -f "$exclude_file"
    fi
    
    # Set proper ownership and permissions
    log "Dosya sahiplikleri ve izinleri ayarlanıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Sahiplik ayarlanacak: $DEPLOY_USER:$DEPLOY_USER"
        info "[DRY RUN] İzinler ayarlanacak"
    else
        # Set ownership
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR"
        
        # Set directory permissions
        find "$REMOTE_DIR" -type d -exec chmod 755 {} \;
        
        # Set file permissions
        find "$REMOTE_DIR" -type f -exec chmod 644 {} \;
        
        # Make scripts executable
        find "$REMOTE_DIR" -name "*.sh" -exec chmod +x {} \;
        
        # Make specific files executable
        local executable_files=(
            "$REMOTE_DIR/deploy.sh"
            "$REMOTE_DIR/setup-ssl.sh"
        )
        
        for file in "${executable_files[@]}"; do
            if [ -f "$file" ]; then
                chmod +x "$file"
                debug "Executable yapıldı: $file"
            fi
        done
        
        # Make deploy scripts executable
        if [ -d "$REMOTE_DIR/deploy-scripts" ]; then
            chmod +x "$REMOTE_DIR/deploy-scripts"/*.sh
            debug "Deploy scriptleri executable yapıldı"
        fi
    fi
    
    success "Dosya sahiplikleri ve izinleri ayarlandı"
    
    # Create production environment file
    log "Production environment dosyası oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] .env.production dosyası oluşturulacak"
    else
        cat > "$REMOTE_DIR/.env.production" << EOF
# Production Environment Configuration
NODE_ENV=production
TZ=$TZ

# Server Configuration
SERVER_IP=$SERVER_IP
DOMAIN=$DOMAIN
CLIENT_URL=$CLIENT_URL

# Database Configuration
MONGODB_URI=$MONGODB_URI
MONGO_URI=$MONGODB_URI

# Cache Configuration
REDIS_URL=$REDIS_URL

# Security Configuration
JWT_SECRET=$JWT_SECRET
REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET

# Port Configuration
FRONTEND_PORT=$FRONTEND_PORT
BACKEND_PORT=$BACKEND_PORT

# Feature Flags
ENABLE_REDIS_CACHE=$ENABLE_REDIS_CACHE
ENABLE_RATE_LIMITING=$ENABLE_RATE_LIMITING
ENABLE_COMPRESSION=$ENABLE_COMPRESSION
ENABLE_CORS=$ENABLE_CORS

# Logging Configuration
LOG_LEVEL=$LOG_LEVEL
DEBUG_MODE=$DEBUG_MODE

# Generated on: $(date)
EOF
        
        # Set secure permissions for environment file
        chmod 600 "$REMOTE_DIR/.env.production"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/.env.production"
        
        success "Production environment dosyası oluşturuldu"
    fi
    
    # Update Docker Compose file for production
    log "Docker Compose dosyası production için güncelleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose dosyası güncellenecek"
    else
        # Create production-specific docker-compose override
        cat > "$REMOTE_DIR/docker-compose.override.yml" << EOF
version: '3.8'

services:
  server:
    environment:
      - NODE_ENV=production
      - CLIENT_URL=https://$DOMAIN
      - MONGODB_URI=$MONGODB_URI
      - REDIS_URL=$REDIS_URL
      - JWT_SECRET=$JWT_SECRET
      - REFRESH_TOKEN_SECRET=$REFRESH_TOKEN_SECRET
    restart: unless-stopped
    
  client:
    restart: unless-stopped
    
  mongodb:
    restart: unless-stopped
    
  redis:
    restart: unless-stopped
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/docker-compose.override.yml"
        success "Docker Compose override dosyası oluşturuldu"
    fi
    
    # Create deployment info file
    log "Deployment bilgi dosyası oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Deployment bilgi dosyası oluşturulacak"
    else
        cat > "$REMOTE_DIR/DEPLOYMENT_INFO.md" << EOF
# Deployment Information

## Deployment Details
- **Date**: $(date)
- **Server**: $SERVER_IP
- **Domain**: $DOMAIN
- **Project**: $PROJECT_NAME
- **User**: $DEPLOY_USER

## Directory Structure
- **Project Root**: $REMOTE_DIR
- **Backups**: $BACKUP_DIR
- **Logs**: $LOG_DIR

## Services
- **Frontend Port**: $FRONTEND_PORT
- **Backend Port**: $BACKEND_PORT
- **MongoDB Port**: $MONGODB_PORT
- **Redis Port**: $REDIS_PORT

## Environment
- **Node Environment**: production
- **Timezone**: $TZ
- **Language**: $LANG

## Docker Volumes
- **MongoDB Data**: $MONGODB_VOLUME
- **Redis Data**: $REDIS_VOLUME
- **Uploads**: $UPLOADS_VOLUME
- **Logs**: $LOGS_VOLUME

## URLs
- **Main Site**: https://$DOMAIN
- **WWW Site**: https://$WWW_DOMAIN
- **API Base**: https://$DOMAIN/api

## Management Commands
\`\`\`bash
# View logs
cd $REMOTE_DIR && docker-compose logs -f

# Restart services
cd $REMOTE_DIR && docker-compose restart

# Stop services
cd $REMOTE_DIR && docker-compose down

# Update and restart
cd $REMOTE_DIR && docker-compose up --build -d
\`\`\`

## File Permissions
- **Directories**: 755
- **Files**: 644
- **Scripts**: 755
- **Environment**: 600

Last updated: $(date)
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/DEPLOYMENT_INFO.md"
        success "Deployment bilgi dosyası oluşturuldu"
    fi
    
    # Verify critical files exist
    log "Kritik dosyalar kontrol ediliyor..."
    
    local critical_files=(
        "docker-compose.yml"
        "muhammedtarikucar.conf"
        "server/package.json"
        "client/package.json"
        "server/app.js"
        "client/index.html"
    )
    
    for file in "${critical_files[@]}"; do
        local file_path="$REMOTE_DIR/$file"
        
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Kritik dosya kontrol edilecek: $file"
        else
            if [ ! -f "$file_path" ]; then
                error "Kritik dosya bulunamadı: $file"
            fi
            debug "Kritik dosya OK: $file"
        fi
    done
    
    success "Kritik dosyalar doğrulandı"
    
    # Calculate deployment size
    if [[ "$DRY_RUN" != "true" ]]; then
        log "Deployment boyutu hesaplanıyor..."
        
        local deployment_size=$(du -sh "$REMOTE_DIR" | cut -f1)
        local file_count=$(find "$REMOTE_DIR" -type f | wc -l)
        local dir_count=$(find "$REMOTE_DIR" -type d | wc -l)
        
        info "Deployment istatistikleri:"
        echo "  📊 Toplam boyut: $deployment_size"
        echo "  📄 Dosya sayısı: $file_count"
        echo "  📁 Dizin sayısı: $dir_count"
    fi
    
    success "Adım 5: Dosya deployment'ı tamamlandı"
    
    # Send notification
    send_notification "Proje dosyaları başarıyla deploy edildi" "success"
}

# Run main function
main "$@"
