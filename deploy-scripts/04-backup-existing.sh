#!/bin/bash

# =============================================================================
# Step 4: Backup Existing Deployment
# =============================================================================
# Bu script mevcut deployment'ı yedekler
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 4: Mevcut deployment yedekleme başlatılıyor..."
    
    # Check if backup should be skipped
    if [[ "$SKIP_BACKUP" == "true" ]]; then
        warning "Yedekleme atlandı (--skip-backup parametresi)"
        return 0
    fi
    
    # Check if there's an existing deployment to backup
    if [ ! -d "$REMOTE_DIR" ] || [ ! "$(ls -A $REMOTE_DIR 2>/dev/null)" ]; then
        info "Yedeklenecek mevcut deployment bulunamadı"
        success "Adım 4: Yedekleme işlemi tamamlandı (yedeklenecek dosya yok)"
        return 0
    fi
    
    log "Mevcut deployment bulundu, yedekleme başlatılıyor..."
    
    # Create backup directory if it doesn't exist
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedek dizini oluşturulacak: $BACKUP_DIR"
    else
        mkdir -p "$BACKUP_DIR"
    fi
    
    # Generate backup name with timestamp
    local backup_timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="backup_${backup_timestamp}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log "Yedek oluşturuluyor: $backup_name"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedek oluşturulacak: $backup_path"
        info "[DRY RUN] Kaynak: $REMOTE_DIR"
        info "[DRY RUN] Hedef: $backup_path"
    else
        # Create backup
        cp -r "$REMOTE_DIR" "$backup_path"
        
        if [ $? -eq 0 ]; then
            success "Dizin kopyalandı: $backup_path"
        else
            error "Dizin kopyalama başarısız"
        fi
        
        # Set proper ownership
        chown -R "$DEPLOY_USER:$DEPLOY_USER" "$backup_path"
    fi
    
    # Backup Docker volumes if they exist
    log "Docker volume'ları yedekleniyor..."
    
    local docker_volumes=(
        "$MONGODB_VOLUME"
        "$REDIS_VOLUME"
        "$UPLOADS_VOLUME"
        "$LOGS_VOLUME"
    )
    
    for volume in "${docker_volumes[@]}"; do
        if docker volume inspect "$volume" &>/dev/null; then
            log "Volume yedekleniyor: $volume"
            
            if [[ "$DRY_RUN" == "true" ]]; then
                info "[DRY RUN] Volume yedeklenecek: $volume"
            else
                # Create volume backup using docker
                docker run --rm \
                    -v "$volume":/source:ro \
                    -v "$backup_path/volumes":/backup \
                    alpine:latest \
                    tar czf "/backup/${volume}.tar.gz" -C /source .
                
                if [ $? -eq 0 ]; then
                    success "Volume yedeklendi: $volume"
                else
                    warning "Volume yedekleme başarısız: $volume"
                fi
            fi
        else
            debug "Volume bulunamadı: $volume"
        fi
    done
    
    # Backup database if running
    log "Veritabanı yedekleniyor..."
    
    if docker ps --format "table {{.Names}}" | grep -q "blog_mongodb"; then
        log "MongoDB yedekleniyor..."
        
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] MongoDB yedeklenecek"
        else
            # Create database backup
            docker exec blog_mongodb mongodump \
                --db "$MONGODB_DATABASE" \
                --out "/data/backup_${backup_timestamp}" \
                --username "$MONGODB_ROOT_USERNAME" \
                --password "$MONGODB_ROOT_PASSWORD" \
                --authenticationDatabase admin
            
            # Copy backup from container
            docker cp "blog_mongodb:/data/backup_${backup_timestamp}" "$backup_path/mongodb_backup"
            
            if [ $? -eq 0 ]; then
                success "MongoDB yedeklendi"
            else
                warning "MongoDB yedekleme başarısız"
            fi
        fi
    else
        debug "MongoDB container çalışmıyor, veritabanı yedeklenmedi"
    fi
    
    # Backup Nginx configuration
    log "Nginx konfigürasyonu yedekleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx konfigürasyonu yedeklenecek"
    else
        mkdir -p "$backup_path/nginx"
        
        # Backup site configuration
        if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
            cp "/etc/nginx/sites-available/$DOMAIN" "$backup_path/nginx/"
            success "Nginx site konfigürasyonu yedeklendi"
        fi
        
        # Backup main nginx configuration
        cp /etc/nginx/nginx.conf "$backup_path/nginx/" 2>/dev/null || true
        
        # Backup SSL certificates if they exist
        if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
            cp -r "/etc/letsencrypt/live/$DOMAIN" "$backup_path/nginx/ssl_certs" 2>/dev/null || true
            success "SSL sertifikaları yedeklendi"
        fi
    fi
    
    # Create backup metadata
    log "Yedek metadata'sı oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedek metadata'sı oluşturulacak"
    else
        cat > "$backup_path/BACKUP_INFO.txt" << EOF
# Backup Information
Backup Name: $backup_name
Backup Date: $(date)
Backup Path: $backup_path
Source Path: $REMOTE_DIR
Server IP: $SERVER_IP
Domain: $DOMAIN
Project: $PROJECT_NAME

# System Information
OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)
Kernel: $(uname -r)
Docker Version: $(docker --version 2>/dev/null || echo 'Not available')
Nginx Version: $(nginx -v 2>&1 | cut -d' ' -f3 2>/dev/null || echo 'Not available')

# Services Status at Backup Time
$(docker ps --format "table {{.Names}}\t{{.Status}}" 2>/dev/null || echo 'Docker not available')

# Disk Usage
$(df -h $REMOTE_DIR 2>/dev/null || echo 'Disk info not available')

# File Count
Total Files: $(find $REMOTE_DIR -type f | wc -l 2>/dev/null || echo 'Unknown')
Total Size: $(du -sh $REMOTE_DIR 2>/dev/null | cut -f1 || echo 'Unknown')
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$backup_path/BACKUP_INFO.txt"
        success "Yedek metadata'sı oluşturuldu"
    fi
    
    # Compress backup
    log "Yedek sıkıştırılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedek sıkıştırılacak: ${backup_path}.tar.gz"
    else
        cd "$BACKUP_DIR"
        tar -czf "${backup_name}.tar.gz" "$backup_name"
        
        if [ $? -eq 0 ]; then
            # Remove uncompressed backup
            rm -rf "$backup_path"
            success "Yedek sıkıştırıldı: ${backup_name}.tar.gz"
            
            # Calculate backup size
            local backup_size=$(du -sh "${backup_name}.tar.gz" | cut -f1)
            info "Yedek boyutu: $backup_size"
        else
            error "Yedek sıkıştırma başarısız"
        fi
    fi
    
    # Cleanup old backups
    log "Eski yedekler temizleniyor..."
    cleanup_old_backups
    
    # Verify backup integrity
    if [[ "$DRY_RUN" != "true" ]]; then
        log "Yedek bütünlüğü kontrol ediliyor..."
        
        if tar -tzf "$BACKUP_DIR/${backup_name}.tar.gz" >/dev/null 2>&1; then
            success "Yedek bütünlüğü doğrulandı"
        else
            error "Yedek dosyası bozuk!"
        fi
    fi
    
    # Display backup summary
    log "Yedekleme özeti:"
    echo "  📦 Yedek adı: $backup_name"
    echo "  📁 Yedek yolu: $BACKUP_DIR/${backup_name}.tar.gz"
    echo "  📅 Yedek tarihi: $(date)"
    echo "  🗂️  Kaynak: $REMOTE_DIR"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        echo "  📊 Boyut: $(du -sh "$BACKUP_DIR/${backup_name}.tar.gz" | cut -f1)"
        echo "  📈 Toplam yedek sayısı: $(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)"
    fi
    
    success "Adım 4: Yedekleme işlemi tamamlandı"
    
    # Send notification
    send_notification "Mevcut deployment başarıyla yedeklendi: $backup_name" "success"
}

# Run main function
main "$@"
