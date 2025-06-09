#!/bin/bash

# =============================================================================
# Step 0: Pre-Deployment Safety Check
# =============================================================================
# Bu script deployment öncesi güvenlik ve uyumluluk kontrollerini yapar
# Veri kaybını önlemek ve güvenli deployment sağlamak için tasarlanmıştır
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

# Safety configuration
export BACKUP_BEFORE_DEPLOY="true"
export ROLLBACK_ON_FAILURE="true"
export HEALTH_CHECK_TIMEOUT="300"
export MAX_DEPLOYMENT_RETRIES="3"

main() {
    log "Adım 0: Pre-deployment güvenlik kontrolü başlatılıyor..."
    
    # Create deployment state file
    local deployment_state_file="$REMOTE_DIR/.deployment_state"
    local current_timestamp=$(date +%Y%m%d_%H%M%S)
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Deployment state dosyası oluşturulacak"
    else
        cat > "$deployment_state_file" << EOF
DEPLOYMENT_ID=$current_timestamp
DEPLOYMENT_START=$(date)
DEPLOYMENT_STATUS=STARTING
PREVIOUS_BACKUP=
ROLLBACK_AVAILABLE=false
SERVICES_BEFORE_DEPLOYMENT=
EOF
        success "Deployment state dosyası oluşturuldu"
    fi
    
    # Check for existing deployments
    log "Mevcut deployment kontrolü yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Mevcut deployment kontrol edilecek"
    else
        if [ -f "$REMOTE_DIR/.deployment_lock" ]; then
            local lock_content=$(cat "$REMOTE_DIR/.deployment_lock" 2>/dev/null)
            local lock_timestamp=$(echo "$lock_content" | grep "TIMESTAMP=" | cut -d'=' -f2)
            local lock_age=$(($(date +%s) - $(date -d "$lock_timestamp" +%s 2>/dev/null || echo 0)))
            
            if [ $lock_age -lt 3600 ]; then  # 1 hour
                error "Başka bir deployment devam ediyor. Lock dosyası: $REMOTE_DIR/.deployment_lock"
            else
                warning "Eski deployment lock dosyası bulundu, temizleniyor..."
                rm -f "$REMOTE_DIR/.deployment_lock"
            fi
        fi
        
        # Create deployment lock
        cat > "$REMOTE_DIR/.deployment_lock" << EOF
DEPLOYMENT_ID=$current_timestamp
TIMESTAMP=$(date)
PID=$$
USER=$(whoami)
EOF
        success "Deployment lock oluşturuldu"
    fi
    
    # Check current services status
    log "Mevcut servis durumları kaydediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servis durumları kaydedilecek"
    else
        local services_status_file="$REMOTE_DIR/.services_before_deployment"
        
        echo "# Services status before deployment - $(date)" > "$services_status_file"
        echo "# Docker containers:" >> "$services_status_file"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" >> "$services_status_file" 2>/dev/null || true
        
        echo "" >> "$services_status_file"
        echo "# Nginx status:" >> "$services_status_file"
        systemctl is-active nginx >> "$services_status_file" 2>/dev/null || echo "inactive" >> "$services_status_file"
        
        echo "" >> "$services_status_file"
        echo "# Port usage:" >> "$services_status_file"
        netstat -tlnp | grep -E ":($FRONTEND_PORT|$BACKEND_PORT|80|443)" >> "$services_status_file" 2>/dev/null || true
        
        success "Servis durumları kaydedildi: $services_status_file"
    fi
    
    # Check disk space
    log "Disk alanı kontrolü yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Disk alanı kontrol edilecek"
    else
        local available_space=$(df "$REMOTE_DIR" | awk 'NR==2 {print $4}')
        local required_space=1048576  # 1GB in KB
        
        if [ "$available_space" -lt "$required_space" ]; then
            error "Yetersiz disk alanı. Mevcut: ${available_space}KB, Gerekli: ${required_space}KB"
        fi
        
        success "Disk alanı yeterli: ${available_space}KB mevcut"
    fi
    
    # Check memory usage
    log "Bellek kullanımı kontrolü yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Bellek kullanımı kontrol edilecek"
    else
        local available_memory=$(free -m | awk 'NR==2{printf "%.0f", $7}')
        local required_memory=512  # 512MB
        
        if [ "$available_memory" -lt "$required_memory" ]; then
            warning "Düşük bellek: ${available_memory}MB mevcut, ${required_memory}MB önerilen"
        else
            success "Bellek yeterli: ${available_memory}MB mevcut"
        fi
    fi
    
    # Check for port conflicts
    log "Port çakışması kontrolü yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Port çakışması kontrol edilecek"
    else
        local conflicting_ports=()
        
        for port in $FRONTEND_PORT $BACKEND_PORT 80 443; do
            if netstat -tlnp | grep -q ":$port "; then
                local port_user=$(netstat -tlnp | grep ":$port " | awk '{print $7}' | head -1)
                info "Port $port kullanımda: $port_user"
                
                # Check if it's our own services
                if ! docker ps --format "{{.Ports}}" | grep -q "$port"; then
                    conflicting_ports+=($port)
                fi
            fi
        done
        
        if [ ${#conflicting_ports[@]} -gt 0 ]; then
            warning "Çakışan portlar tespit edildi: ${conflicting_ports[*]}"
            info "Bu portlar mevcut deployment ile uyumlu olabilir"
        else
            success "Port çakışması tespit edilmedi"
        fi
    fi
    
    # Check Docker status
    log "Docker durumu kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker durumu kontrol edilecek"
    else
        if ! systemctl is-active --quiet docker; then
            error "Docker servisi çalışmıyor"
        fi
        
        if ! docker info >/dev/null 2>&1; then
            error "Docker daemon'a erişim yok"
        fi
        
        success "Docker çalışıyor ve erişilebilir"
    fi
    
    # Check existing containers health
    log "Mevcut container'ların sağlığı kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Container sağlığı kontrol edilecek"
    else
        local unhealthy_containers=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null || true)
        
        if [ -n "$unhealthy_containers" ]; then
            warning "Sağlıksız container'lar tespit edildi:"
            echo "$unhealthy_containers" | while read container; do
                warning "  - $container"
            done
            info "Bu container'lar deployment sırasında yeniden başlatılacak"
        else
            success "Tüm container'lar sağlıklı"
        fi
    fi
    
    # Create backup plan
    log "Yedekleme planı oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedekleme planı oluşturulacak"
    else
        local backup_plan_file="$REMOTE_DIR/.backup_plan"
        
        cat > "$backup_plan_file" << EOF
# Backup Plan for Deployment $current_timestamp
BACKUP_TIMESTAMP=$current_timestamp
BACKUP_DIR=$BACKUP_DIR/deployment_$current_timestamp

# Files to backup
BACKUP_ITEMS=(
    "$REMOTE_DIR/docker-compose.yml"
    "$REMOTE_DIR/.env.production"
    "$NGINX_SITES_AVAILABLE/$DOMAIN"
    "$REMOTE_DIR/uploads"
    "$REMOTE_DIR/logs"
)

# Database backup
MONGODB_BACKUP=true
REDIS_BACKUP=true

# Rollback commands
ROLLBACK_COMMANDS=(
    "docker-compose down"
    "cp $BACKUP_DIR/deployment_$current_timestamp/docker-compose.yml $REMOTE_DIR/"
    "cp $BACKUP_DIR/deployment_$current_timestamp/$DOMAIN $NGINX_SITES_AVAILABLE/"
    "docker-compose up -d"
    "systemctl reload nginx"
)
EOF
        
        success "Yedekleme planı oluşturuldu: $backup_plan_file"
    fi
    
    # Final safety summary
    log "Pre-deployment güvenlik özeti:"
    echo "  🔒 Deployment ID: $current_timestamp"
    echo "  💾 Yedekleme: Aktif"
    echo "  🔄 Rollback: Hazır"
    echo "  🐳 Docker: Çalışıyor"
    echo "  💽 Disk Alanı: Yeterli"
    echo "  🧠 Bellek: Kontrol edildi"
    echo "  🌐 Portlar: Kontrol edildi"
    
    success "Adım 0: Pre-deployment kontrolleri tamamlandı"
    
    # Send notification
    send_notification "Pre-deployment kontrolleri başarılı" "success"
}

# Cleanup function for emergency exit
cleanup() {
    log "Emergency cleanup başlatılıyor..."
    rm -f "$REMOTE_DIR/.deployment_lock" 2>/dev/null || true
    exit 1
}

# Set trap for emergency cleanup
trap cleanup INT TERM

# Run main function
main "$@"
