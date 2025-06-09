#!/bin/bash

# =============================================================================
# Step 12: Emergency Rollback
# =============================================================================
# Bu script deployment hatası durumunda hızlı geri alma işlemi yapar
# Veri kaybını önlemek ve sistemi önceki çalışır duruma getirmek için tasarlanmıştır
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

# Rollback configuration
ROLLBACK_TIMEOUT=300
FORCE_ROLLBACK=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --force)
            FORCE_ROLLBACK=true
            shift
            ;;
        --timeout=*)
            ROLLBACK_TIMEOUT="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

main() {
    log "Adım 12: Emergency rollback başlatılıyor..."
    
    # Check if rollback is needed
    if [[ "$FORCE_ROLLBACK" != "true" ]]; then
        log "Rollback gereksinimini kontrol ediliyor..."
        
        # Check deployment state
        local deployment_state_file="$REMOTE_DIR/.deployment_state"
        if [ ! -f "$deployment_state_file" ]; then
            warning "Deployment state dosyası bulunamadı. Rollback gerekli olmayabilir."
            read -p "Rollback'i devam ettirmek istiyor musunuz? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                info "Rollback iptal edildi"
                exit 0
            fi
        fi
    fi
    
    # Find latest backup
    log "En son yedek bulunuyor..."
    
    local latest_backup=""
    if [ -d "$BACKUP_DIR" ]; then
        latest_backup=$(ls -1t "$BACKUP_DIR" | grep "deployment_" | head -1)
    fi
    
    if [ -z "$latest_backup" ]; then
        error "Rollback için yedek bulunamadı. Manuel müdahale gerekli."
    fi
    
    local backup_path="$BACKUP_DIR/$latest_backup"
    log "Rollback için kullanılacak yedek: $backup_path"
    
    # Stop current services gracefully
    log "Mevcut servisler durduruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servisler durdurulacak"
    else
        # Stop Docker containers
        if [ -f "$REMOTE_DIR/docker-compose.yml" ]; then
            cd "$REMOTE_DIR"
            docker-compose down --timeout 30 2>/dev/null || true
            success "Docker servisler durduruldu"
        fi
        
        # Stop Nginx if needed
        if systemctl is-active --quiet nginx; then
            systemctl stop nginx
            success "Nginx durduruldu"
        fi
    fi
    
    # Restore configuration files
    log "Konfigürasyon dosyaları geri yükleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Konfigürasyon dosyaları geri yüklenecek"
    else
        # Restore docker-compose.yml
        if [ -f "$backup_path/docker-compose.yml" ]; then
            cp "$backup_path/docker-compose.yml" "$REMOTE_DIR/"
            success "docker-compose.yml geri yüklendi"
        fi
        
        # Restore environment file
        if [ -f "$backup_path/.env.production" ]; then
            cp "$backup_path/.env.production" "$REMOTE_DIR/"
            success ".env.production geri yüklendi"
        fi
        
        # Restore Nginx configuration
        if [ -f "$backup_path/$DOMAIN" ]; then
            cp "$backup_path/$DOMAIN" "$NGINX_SITES_AVAILABLE/"
            success "Nginx konfigürasyonu geri yüklendi"
        fi
        
        # Restore uploads directory
        if [ -d "$backup_path/uploads" ]; then
            rm -rf "$REMOTE_DIR/uploads"
            cp -r "$backup_path/uploads" "$REMOTE_DIR/"
            chown -R "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/uploads"
            success "Uploads dizini geri yüklendi"
        fi
    fi
    
    # Restore database if backup exists
    log "Veritabanı yedekleri kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Veritabanı yedekleri kontrol edilecek"
    else
        # MongoDB restore
        if [ -f "$backup_path/mongodb_backup.gz" ]; then
            log "MongoDB yedek geri yükleniyor..."
            
            # Start MongoDB container if not running
            cd "$REMOTE_DIR"
            docker-compose up -d mongodb
            sleep 10
            
            # Restore MongoDB
            gunzip -c "$backup_path/mongodb_backup.gz" | docker exec -i blog_mongodb mongorestore --drop --archive
            
            if [ $? -eq 0 ]; then
                success "MongoDB yedek geri yüklendi"
            else
                warning "MongoDB yedek geri yüklenemedi"
            fi
        fi
        
        # Redis restore
        if [ -f "$backup_path/redis_backup.rdb" ]; then
            log "Redis yedek geri yükleniyor..."
            
            # Stop Redis container
            docker stop blog_redis 2>/dev/null || true
            
            # Copy backup file
            docker cp "$backup_path/redis_backup.rdb" blog_redis:/data/dump.rdb
            
            # Start Redis container
            docker start blog_redis
            
            success "Redis yedek geri yüklendi"
        fi
    fi
    
    # Start services
    log "Servisler başlatılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servisler başlatılacak"
    else
        # Start Docker services
        cd "$REMOTE_DIR"
        docker-compose up -d
        
        # Wait for services to be healthy
        local wait_time=0
        while [ $wait_time -lt $ROLLBACK_TIMEOUT ]; do
            local unhealthy_count=$(docker-compose ps | grep -c "unhealthy\|starting" || echo 0)
            
            if [ $unhealthy_count -eq 0 ]; then
                success "Tüm servisler sağlıklı duruma geldi"
                break
            fi
            
            info "Servisler başlatılıyor... ($wait_time/$ROLLBACK_TIMEOUT saniye)"
            sleep 5
            wait_time=$((wait_time + 5))
        done
        
        if [ $wait_time -ge $ROLLBACK_TIMEOUT ]; then
            warning "Bazı servisler timeout süresinde başlatılamadı"
        fi
        
        # Start Nginx
        systemctl start nginx
        
        if systemctl is-active --quiet nginx; then
            success "Nginx başlatıldı"
        else
            error "Nginx başlatılamadı"
        fi
    fi
    
    # Verify rollback success
    log "Rollback başarısı doğrulanıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Rollback başarısı doğrulanacak"
    else
        local rollback_success=true
        
        # Check Docker services
        local unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null || true)
        if [ -n "$unhealthy_containers" ]; then
            warning "Sağlıksız container'lar: $unhealthy_containers"
            rollback_success=false
        fi
        
        # Check Nginx
        if ! systemctl is-active --quiet nginx; then
            warning "Nginx çalışmıyor"
            rollback_success=false
        fi
        
        # Check website accessibility
        if command_exists curl; then
            if ! curl -f -s "http://localhost:$FRONTEND_PORT" >/dev/null; then
                warning "Frontend erişilebilir değil"
                rollback_success=false
            fi
            
            if ! curl -f -s "http://localhost:$BACKEND_PORT/api/health" >/dev/null; then
                warning "Backend API erişilebilir değil"
                rollback_success=false
            fi
        fi
        
        if [ "$rollback_success" = true ]; then
            success "Rollback başarılı! Sistem önceki duruma geri döndü"
        else
            error "Rollback tamamlandı ancak bazı sorunlar var. Manuel kontrol gerekli."
        fi
    fi
    
    # Update deployment state
    log "Deployment durumu güncelleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Deployment durumu güncellenecek"
    else
        local deployment_state_file="$REMOTE_DIR/.deployment_state"
        cat > "$deployment_state_file" << EOF
DEPLOYMENT_ID=ROLLED_BACK_$(date +%Y%m%d_%H%M%S)
DEPLOYMENT_START=$(date)
DEPLOYMENT_STATUS=ROLLED_BACK
PREVIOUS_BACKUP=$latest_backup
ROLLBACK_AVAILABLE=false
ROLLBACK_COMPLETED=$(date)
EOF
        
        # Remove deployment lock
        rm -f "$REMOTE_DIR/.deployment_lock"
        
        success "Deployment durumu güncellendi"
    fi
    
    # Create rollback report
    log "Rollback raporu oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Rollback raporu oluşturulacak"
    else
        local rollback_report="$REMOTE_DIR/ROLLBACK_REPORT_$(date +%Y%m%d_%H%M%S).md"
        
        cat > "$rollback_report" << EOF
# Rollback Report

**Date:** $(date)
**Backup Used:** $latest_backup
**Rollback Duration:** $wait_time seconds

## Services Status After Rollback

### Docker Containers
\`\`\`
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
\`\`\`

### Nginx Status
\`\`\`
$(systemctl status nginx --no-pager -l)
\`\`\`

### Port Usage
\`\`\`
$(netstat -tlnp | grep -E ":($FRONTEND_PORT|$BACKEND_PORT|80|443)")
\`\`\`

## Next Steps

1. Verify website functionality: https://$DOMAIN
2. Check application logs: \`docker-compose logs -f\`
3. Monitor system performance
4. Investigate original deployment failure
5. Plan next deployment with fixes

## Files Restored

- docker-compose.yml
- .env.production
- Nginx configuration
- Uploads directory
- Database backups (if available)

---
Generated by deployment rollback script
EOF
        
        success "Rollback raporu oluşturuldu: $rollback_report"
    fi
    
    # Final summary
    log "Rollback özeti:"
    echo "  🔄 Rollback Durumu: Tamamlandı"
    echo "  📦 Kullanılan Yedek: $latest_backup"
    echo "  ⏱️  Süre: $wait_time saniye"
    echo "  🌐 Domain: $DOMAIN"
    echo "  📊 Frontend Port: $FRONTEND_PORT"
    echo "  🔧 Backend Port: $BACKEND_PORT"
    
    success "Adım 12: Emergency rollback tamamlandı"
    
    # Send notification
    send_notification "Emergency rollback tamamlandı" "warning"
}

# Run main function
main "$@"
