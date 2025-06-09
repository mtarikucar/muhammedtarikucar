#!/bin/bash

# =============================================================================
# Step 3: Setup Directories
# =============================================================================
# Bu script deployment için gerekli dizinleri oluşturur
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 3: Dizin kurulumu başlatılıyor..."
    
    # Create main project directory
    log "Ana proje dizini oluşturuluyor: $REMOTE_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Dizin oluşturulacak: $REMOTE_DIR"
    else
        mkdir -p "$REMOTE_DIR"
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR"
        chmod 755 "$REMOTE_DIR"
    fi
    
    success "Ana proje dizini hazır: $REMOTE_DIR"
    
    # Create backup directory
    log "Yedek dizini oluşturuluyor: $BACKUP_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Dizin oluşturulacak: $BACKUP_DIR"
    else
        mkdir -p "$BACKUP_DIR"
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$BACKUP_DIR"
        chmod 755 "$BACKUP_DIR"
    fi
    
    success "Yedek dizini hazır: $BACKUP_DIR"
    
    # Create log directory
    log "Log dizini oluşturuluyor: $LOG_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Dizin oluşturulacak: $LOG_DIR"
    else
        mkdir -p "$LOG_DIR"
        chown -R www-data:www-data "$LOG_DIR"
        chmod 755 "$LOG_DIR"
    fi
    
    success "Log dizini hazır: $LOG_DIR"
    
    # Create Nginx directories
    log "Nginx dizinleri kontrol ediliyor..."
    
    local nginx_dirs=(
        "/etc/nginx/sites-available"
        "/etc/nginx/sites-enabled"
        "/var/log/nginx"
        "/etc/nginx/ssl"
    )
    
    for dir in "${nginx_dirs[@]}"; do
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Nginx dizini kontrol edilecek: $dir"
        else
            if [ ! -d "$dir" ]; then
                mkdir -p "$dir"
                chown -R root:root "$dir"
                chmod 755 "$dir"
                success "Nginx dizini oluşturuldu: $dir"
            else
                debug "Nginx dizini mevcut: $dir"
            fi
        fi
    done
    
    success "Nginx dizinleri hazır"
    
    # Create Docker volumes directory
    log "Docker volumes dizini oluşturuluyor..."
    
    local docker_volumes_dir="/var/lib/docker/volumes"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker volumes dizini kontrol edilecek: $docker_volumes_dir"
    else
        if [ ! -d "$docker_volumes_dir" ]; then
            mkdir -p "$docker_volumes_dir"
            chown -R root:root "$docker_volumes_dir"
            chmod 755 "$docker_volumes_dir"
        fi
    fi
    
    success "Docker volumes dizini hazır"
    
    # Create application-specific directories
    log "Uygulama dizinleri oluşturuluyor..."
    
    local app_dirs=(
        "$REMOTE_DIR/uploads"
        "$REMOTE_DIR/logs"
        "$REMOTE_DIR/ssl"
        "$REMOTE_DIR/backups"
        "$REMOTE_DIR/scripts"
        "$REMOTE_DIR/config"
    )
    
    for dir in "${app_dirs[@]}"; do
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Uygulama dizini oluşturulacak: $dir"
        else
            mkdir -p "$dir"
            chown -R "$DEPLOY_USER:$DEPLOY_USER" "$dir"
            chmod 755 "$dir"
            debug "Uygulama dizini oluşturuldu: $dir"
        fi
    done
    
    success "Uygulama dizinleri hazır"
    
    # Create systemd service directory
    log "Systemd servis dizini kontrol ediliyor..."
    
    local systemd_dir="/etc/systemd/system"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Systemd dizini kontrol edilecek: $systemd_dir"
    else
        if [ ! -d "$systemd_dir" ]; then
            mkdir -p "$systemd_dir"
            chown -R root:root "$systemd_dir"
            chmod 755 "$systemd_dir"
        fi
    fi
    
    success "Systemd servis dizini hazır"
    
    # Create temporary directory for deployment
    log "Geçici deployment dizini oluşturuluyor..."
    
    local temp_dir="/tmp/${PROJECT_NAME}_deploy"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Geçici dizin oluşturulacak: $temp_dir"
    else
        mkdir -p "$temp_dir"
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$temp_dir"
        chmod 755 "$temp_dir"
    fi
    
    success "Geçici deployment dizini hazır: $temp_dir"
    
    # Set up logrotate configuration
    log "Logrotate konfigürasyonu oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Logrotate konfigürasyonu oluşturulacak"
    else
        cat > "/etc/logrotate.d/${PROJECT_NAME}" << EOF
$LOG_DIR/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}

$REMOTE_DIR/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 $DEPLOY_USER $DEPLOY_USER
    postrotate
        docker-compose -f $REMOTE_DIR/docker-compose.yml restart > /dev/null 2>&1 || true
    endscript
}
EOF
        
        chmod 644 "/etc/logrotate.d/${PROJECT_NAME}"
    fi
    
    success "Logrotate konfigürasyonu oluşturuldu"
    
    # Create directory structure info file
    log "Dizin yapısı bilgi dosyası oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Dizin yapısı bilgi dosyası oluşturulacak"
    else
        cat > "$REMOTE_DIR/DIRECTORY_STRUCTURE.md" << EOF
# ${PROJECT_NAME} Directory Structure

## Main Directories

- \`$REMOTE_DIR\` - Ana proje dizini
- \`$BACKUP_DIR\` - Yedek dosyaları
- \`$LOG_DIR\` - Nginx log dosyaları
- \`$REMOTE_DIR/logs\` - Uygulama log dosyaları
- \`$REMOTE_DIR/uploads\` - Yüklenen dosyalar
- \`$REMOTE_DIR/ssl\` - SSL sertifikaları
- \`$REMOTE_DIR/config\` - Konfigürasyon dosyaları

## Nginx Directories

- \`/etc/nginx/sites-available\` - Mevcut site konfigürasyonları
- \`/etc/nginx/sites-enabled\` - Aktif site konfigürasyonları
- \`/var/log/nginx\` - Nginx log dosyaları

## Docker Directories

- \`/var/lib/docker/volumes\` - Docker volume'ları
- \`$REMOTE_DIR\` - Docker Compose dosyaları

## Permissions

- Project files: \`$DEPLOY_USER:$DEPLOY_USER\`
- Nginx logs: \`www-data:www-data\`
- System configs: \`root:root\`

## Created: $(date)
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/DIRECTORY_STRUCTURE.md"
    fi
    
    success "Dizin yapısı bilgi dosyası oluşturuldu"
    
    # Verify directory permissions
    log "Dizin izinleri doğrulanıyor..."
    
    if [[ "$DRY_RUN" != "true" ]]; then
        # Check if directories are writable
        local dirs_to_check=(
            "$REMOTE_DIR"
            "$BACKUP_DIR"
            "$LOG_DIR"
        )
        
        for dir in "${dirs_to_check[@]}"; do
            if [ ! -w "$dir" ]; then
                error "Dizin yazılabilir değil: $dir"
            fi
            debug "Dizin yazılabilir: $dir"
        done
        
        # Check ownership
        local owner=$(stat -c '%U:%G' "$REMOTE_DIR")
        if [ "$owner" != "$DEPLOY_USER:$DEPLOY_USER" ]; then
            warning "Dizin sahipliği beklenen değil: $owner (beklenen: $DEPLOY_USER:$DEPLOY_USER)"
        fi
    fi
    
    success "Dizin izinleri doğrulandı"
    
    # Display directory summary
    log "Oluşturulan dizinler:"
    echo "  📁 $REMOTE_DIR (Ana proje)"
    echo "  📁 $BACKUP_DIR (Yedekler)"
    echo "  📁 $LOG_DIR (Nginx logları)"
    echo "  📁 $REMOTE_DIR/uploads (Yüklenen dosyalar)"
    echo "  📁 $REMOTE_DIR/logs (Uygulama logları)"
    echo "  📁 $REMOTE_DIR/ssl (SSL sertifikaları)"
    echo "  📁 $REMOTE_DIR/config (Konfigürasyonlar)"
    
    success "Adım 3: Dizin kurulumu tamamlandı"
    
    # Send notification
    send_notification "Dizin yapısı başarıyla oluşturuldu" "success"
}

# Run main function
main "$@"
