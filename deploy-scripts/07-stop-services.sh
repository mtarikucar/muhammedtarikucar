#!/bin/bash

# =============================================================================
# Step 7: Stop Services
# =============================================================================
# Bu script mevcut servisleri güvenli bir şekilde durdurur
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 7: Servis durdurma işlemi başlatılıyor..."
    
    # Change to project directory
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Proje dizinine geçilecek: $REMOTE_DIR"
    else
        cd "$REMOTE_DIR" || {
            warning "Proje dizini bulunamadı: $REMOTE_DIR"
            log "İlk deployment olabilir, devam ediliyor..."
            success "Adım 7: Servis durdurma işlemi tamamlandı (durdurulacak servis yok)"
            return 0
        }
    fi
    
    # Check if Docker Compose file exists
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose dosyası kontrol edilecek"
    else
        if [ ! -f "docker-compose.yml" ]; then
            warning "Docker Compose dosyası bulunamadı"
            log "İlk deployment olabilir, devam ediliyor..."
            success "Adım 7: Servis durdurma işlemi tamamlandı (docker-compose.yml yok)"
            return 0
        fi
    fi
    
    # Show current running services
    log "Mevcut çalışan servisler kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Çalışan servisler listelenecek"
    else
        if command_exists docker && docker ps &>/dev/null; then
            local running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(blog_|${PROJECT_NAME}_)")
            
            if [ -n "$running_containers" ]; then
                log "Çalışan ${PROJECT_NAME} servisleri:"
                echo "$running_containers"
            else
                info "Çalışan ${PROJECT_NAME} servisi bulunamadı"
            fi
        else
            warning "Docker erişimi yok veya Docker çalışmıyor"
        fi
    fi
    
    # Stop Docker Compose services gracefully
    log "Docker Compose servisleri durduruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose servisleri durdurulacak"
    else
        # Try to stop services gracefully
        if docker-compose ps | grep -q "Up"; then
            log "Servisler graceful olarak durduruluyor..."
            
            # Stop services with timeout
            timeout 60 docker-compose stop
            
            if [ $? -eq 0 ]; then
                success "Servisler graceful olarak durduruldu"
            else
                warning "Graceful durdurma zaman aşımına uğradı, force durdurma yapılıyor..."
                docker-compose kill
                success "Servisler force olarak durduruldu"
            fi
        else
            info "Durdurulacak aktif servis bulunamadı"
        fi
    fi
    
    # Remove containers
    log "Konteynerler kaldırılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Konteynerler kaldırılacak"
    else
        docker-compose down --remove-orphans
        
        if [ $? -eq 0 ]; then
            success "Konteynerler kaldırıldı"
        else
            warning "Konteyner kaldırma işleminde sorun oluştu"
        fi
    fi
    
    # Stop specific project containers if they're still running
    log "Proje konteynerları kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Proje konteynerları kontrol edilecek"
    else
        local project_containers=(
            "blog_mongodb"
            "blog_redis"
            "blog_server"
            "blog_client"
            "blog_nginx"
            "${PROJECT_NAME}_mongodb"
            "${PROJECT_NAME}_redis"
            "${PROJECT_NAME}_server"
            "${PROJECT_NAME}_client"
            "${PROJECT_NAME}_nginx"
        )
        
        for container in "${project_containers[@]}"; do
            if docker ps -q -f name="$container" | grep -q .; then
                log "Konteyner durduruluyor: $container"
                docker stop "$container" || true
                docker rm "$container" || true
                debug "Konteyner durduruldu: $container"
            fi
        done
    fi
    
    # Clean up unused Docker resources
    log "Kullanılmayan Docker kaynakları temizleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker kaynakları temizlenecek"
    else
        # Remove stopped containers
        docker container prune -f
        
        # Remove unused networks (but keep volumes for data safety)
        docker network prune -f
        
        # Remove dangling images
        docker image prune -f
        
        success "Kullanılmayan Docker kaynakları temizlendi"
    fi
    
    # Check for any remaining processes on application ports
    log "Uygulama portları kontrol ediliyor..."
    
    local ports_to_check=("$FRONTEND_PORT" "$BACKEND_PORT" "$MONGODB_PORT" "$REDIS_PORT")
    
    for port in "${ports_to_check[@]}"; do
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Port kontrol edilecek: $port"
        else
            if port_open "$port"; then
                warning "Port $port hala kullanımda"
                
                # Show what's using the port
                local process=$(lsof -ti:$port 2>/dev/null)
                if [ -n "$process" ]; then
                    local process_info=$(ps -p $process -o pid,ppid,cmd --no-headers 2>/dev/null)
                    warning "Port $port kullanıcısı: $process_info"
                    
                    # Ask if we should kill the process
                    if [[ "$FORCE_REBUILD" == "true" ]]; then
                        log "Force mode aktif, process sonlandırılıyor: $process"
                        kill -TERM "$process" 2>/dev/null || true
                        sleep 2
                        kill -KILL "$process" 2>/dev/null || true
                        success "Process sonlandırıldı: $process"
                    else
                        warning "Port $port kullanımda kalacak. --force-rebuild kullanarak zorla sonlandırabilirsiniz."
                    fi
                fi
            else
                debug "Port $port kullanılabilir"
            fi
        fi
    done
    
    # Stop any systemd services related to the project
    log "Proje systemd servisleri kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Systemd servisleri kontrol edilecek"
    else
        local systemd_services=(
            "${PROJECT_NAME}"
            "${PROJECT_NAME}-server"
            "${PROJECT_NAME}-client"
        )
        
        for service in "${systemd_services[@]}"; do
            if systemctl is-active --quiet "$service" 2>/dev/null; then
                log "Systemd servisi durduruluyor: $service"
                systemctl stop "$service"
                systemctl disable "$service" 2>/dev/null || true
                success "Systemd servisi durduruldu: $service"
            fi
        done
    fi
    
    # Wait for ports to be released
    log "Portların serbest kalması bekleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Port serbest kalması beklenecek"
    else
        local max_wait=30
        local wait_time=0
        
        while [ $wait_time -lt $max_wait ]; do
            local ports_in_use=0
            
            for port in "${ports_to_check[@]}"; do
                if port_open "$port"; then
                    ports_in_use=$((ports_in_use + 1))
                fi
            done
            
            if [ $ports_in_use -eq 0 ]; then
                success "Tüm portlar serbest kaldı"
                break
            fi
            
            debug "Bekleniyor... ($wait_time/$max_wait saniye) - $ports_in_use port hala kullanımda"
            sleep 2
            wait_time=$((wait_time + 2))
        done
        
        if [ $wait_time -ge $max_wait ]; then
            warning "Bazı portlar hala kullanımda olabilir"
        fi
    fi
    
    # Verify services are stopped
    log "Servis durumları doğrulanıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servis durumları kontrol edilecek"
    else
        local running_containers=$(docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(blog_|${PROJECT_NAME}_)" | wc -l)
        
        if [ "$running_containers" -eq 0 ]; then
            success "Tüm proje konteynerları durduruldu"
        else
            warning "$running_containers proje konteyneri hala çalışıyor"
            docker ps --format "table {{.Names}}\t{{.Status}}" | grep -E "(blog_|${PROJECT_NAME}_)"
        fi
    fi
    
    # Display stop summary
    log "Durdurma işlemi özeti:"
    echo "  🛑 Docker Compose servisleri: Durduruldu"
    echo "  📦 Konteynerler: Kaldırıldı"
    echo "  🧹 Kullanılmayan kaynaklar: Temizlendi"
    echo "  🔌 Portlar: Kontrol edildi"
    echo "  ⚙️  Systemd servisleri: Kontrol edildi"
    
    success "Adım 7: Servis durdurma işlemi tamamlandı"
    
    # Send notification
    send_notification "Mevcut servisler başarıyla durduruldu" "success"
}

# Run main function
main "$@"
