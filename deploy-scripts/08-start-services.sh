#!/bin/bash

# =============================================================================
# Step 8: Start Services
# =============================================================================
# Bu script Docker servisleri başlatır ve hazır olmasını bekler
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 8: Servis başlatma işlemi başlatılıyor..."
    
    # Change to project directory
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Proje dizinine geçilecek: $REMOTE_DIR"
    else
        cd "$REMOTE_DIR" || error "Proje dizini bulunamadı: $REMOTE_DIR"
    fi
    
    # Verify Docker Compose file exists
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose dosyası kontrol edilecek"
    else
        if [ ! -f "docker-compose.yml" ]; then
            error "Docker Compose dosyası bulunamadı: $REMOTE_DIR/docker-compose.yml"
        fi
        success "Docker Compose dosyası bulundu"
    fi
    
    # Check Docker daemon status
    log "Docker daemon durumu kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker daemon kontrol edilecek"
    else
        if ! docker ps &>/dev/null; then
            error "Docker daemon çalışmıyor veya erişim yok"
        fi
        success "Docker daemon çalışıyor"
    fi
    
    # Pull latest images if needed
    log "Docker imajları kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker imajları çekilecek"
    else
        # Pull base images
        docker-compose pull --ignore-pull-failures
        success "Docker imajları güncellendi"
    fi
    
    # Build application images
    log "Uygulama imajları oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Uygulama imajları oluşturulacak"
    else
        if [[ "$FORCE_REBUILD" == "true" ]]; then
            log "Force rebuild aktif, imajlar yeniden oluşturuluyor..."
            docker-compose build --no-cache
        else
            docker-compose build
        fi
        
        if [ $? -eq 0 ]; then
            success "Uygulama imajları oluşturuldu"
        else
            error "Uygulama imajları oluşturulamadı"
        fi
    fi
    
    # Start services in correct order
    log "Servisler başlatılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servisler başlatılacak"
    else
        # Start database services first
        log "Veritabanı servisleri başlatılıyor..."
        docker-compose up -d mongodb redis
        
        if [ $? -eq 0 ]; then
            success "Veritabanı servisleri başlatıldı"
        else
            error "Veritabanı servisleri başlatılamadı"
        fi
    fi
    
    # Wait for database services to be ready
    log "Veritabanı servislerinin hazır olması bekleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Veritabanı servisleri beklenecek"
    else
        # Wait for MongoDB
        wait_for_service "MongoDB" "$MONGODB_PORT" "localhost" 60 5
        
        # Wait for Redis
        wait_for_service "Redis" "$REDIS_PORT" "localhost" 30 3
    fi
    
    # Start application services
    log "Uygulama servisleri başlatılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Uygulama servisleri başlatılacak"
    else
        # Start backend server
        log "Backend servisi başlatılıyor..."
        docker-compose up -d server
        
        if [ $? -eq 0 ]; then
            success "Backend servisi başlatıldı"
        else
            error "Backend servisi başlatılamadı"
        fi
        
        # Wait for backend to be ready
        wait_for_service "Backend" "$BACKEND_PORT" "localhost" 60 5
        
        # Start frontend client
        log "Frontend servisi başlatılıyor..."
        docker-compose up -d client
        
        if [ $? -eq 0 ]; then
            success "Frontend servisi başlatıldı"
        else
            error "Frontend servisi başlatılamadı"
        fi
        
        # Wait for frontend to be ready
        wait_for_service "Frontend" "$FRONTEND_PORT" "localhost" 60 5
    fi
    
    # Verify all services are running
    log "Servis durumları kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servis durumları kontrol edilecek"
    else
        local services_status=$(docker-compose ps)
        echo "$services_status"
        
        # Check if all services are up
        if echo "$services_status" | grep -q "Exit\|Restarting"; then
            warning "Bazı servisler sorunlu durumda"
            
            # Show logs for failed services
            log "Sorunlu servis logları:"
            docker-compose logs --tail=20
            
            error "Servis başlatma başarısız"
        else
            success "Tüm servisler çalışıyor"
        fi
    fi
    
    # Wait for services to stabilize
    log "Servislerin stabilize olması bekleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Servis stabilizasyonu beklenecek"
    else
        show_progress "Servisler stabilize oluyor" 15
        success "Servisler stabilize oldu"
    fi
    
    # Perform basic health checks
    log "Temel sağlık kontrolleri yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Sağlık kontrolleri yapılacak"
    else
        local health_check_failed=false
        
        # Check MongoDB health
        if docker exec blog_mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
            success "MongoDB sağlık kontrolü: OK"
        else
            warning "MongoDB sağlık kontrolü: BAŞARISIZ"
            health_check_failed=true
        fi
        
        # Check Redis health
        if docker exec blog_redis redis-cli ping | grep -q "PONG"; then
            success "Redis sağlık kontrolü: OK"
        else
            warning "Redis sağlık kontrolü: BAŞARISIZ"
            health_check_failed=true
        fi
        
        # Check backend health
        if health_check_url "http://localhost:$BACKEND_PORT/api/health" 200 10; then
            success "Backend sağlık kontrolü: OK"
        else
            warning "Backend sağlık kontrolü: BAŞARISIZ"
            health_check_failed=true
        fi
        
        # Check frontend health
        if health_check_url "http://localhost:$FRONTEND_PORT" 200 10; then
            success "Frontend sağlık kontrolü: OK"
        else
            warning "Frontend sağlık kontrolü: BAŞARISIZ"
            health_check_failed=true
        fi
        
        if [ "$health_check_failed" = true ]; then
            warning "Bazı sağlık kontrolleri başarısız oldu"
            log "Servis loglarını kontrol edin:"
            echo "  docker-compose logs -f"
        fi
    fi
    
    # Setup log rotation for containers
    log "Konteyner log rotasyonu kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Log rotasyonu kurulacak"
    else
        # Configure Docker log rotation
        cat > /etc/docker/daemon.json << EOF
{
    "log-driver": "json-file",
    "log-opts": {
        "max-size": "10m",
        "max-file": "3"
    }
}
EOF
        
        # Restart Docker daemon to apply log settings
        systemctl restart docker
        
        # Wait for Docker to be ready again
        sleep 10
        
        success "Konteyner log rotasyonu kuruldu"
    fi
    
    # Create service monitoring script
    log "Servis izleme scripti oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] İzleme scripti oluşturulacak"
    else
        cat > "$REMOTE_DIR/monitor-services.sh" << 'EOF'
#!/bin/bash

# Service monitoring script
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo "=== Service Status Check ==="
echo "Date: $(date)"
echo ""

# Check Docker Compose services
echo "Docker Compose Services:"
docker-compose ps
echo ""

# Check individual service health
echo "Health Checks:"

# MongoDB
if docker exec blog_mongodb mongosh --eval "db.adminCommand('ping')" &>/dev/null; then
    echo "✅ MongoDB: Healthy"
else
    echo "❌ MongoDB: Unhealthy"
fi

# Redis
if docker exec blog_redis redis-cli ping | grep -q "PONG"; then
    echo "✅ Redis: Healthy"
else
    echo "❌ Redis: Unhealthy"
fi

# Backend
if curl -f http://localhost:5000/api/health &>/dev/null; then
    echo "✅ Backend: Healthy"
else
    echo "❌ Backend: Unhealthy"
fi

# Frontend
if curl -f http://localhost:8082 &>/dev/null; then
    echo "✅ Frontend: Healthy"
else
    echo "❌ Frontend: Unhealthy"
fi

echo ""
echo "=== Resource Usage ==="
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
EOF
        
        chmod +x "$REMOTE_DIR/monitor-services.sh"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/monitor-services.sh"
        
        success "Servis izleme scripti oluşturuldu: monitor-services.sh"
    fi
    
    # Display service summary
    log "Servis başlatma özeti:"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        echo "  🗄️  MongoDB: Port $MONGODB_PORT"
        echo "  🔄 Redis: Port $REDIS_PORT"
        echo "  🔧 Backend: Port $BACKEND_PORT"
        echo "  🌐 Frontend: Port $FRONTEND_PORT"
        echo ""
        echo "  📊 Servis durumu:"
        docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}"
        echo ""
        echo "  📝 Logları görüntülemek için:"
        echo "    cd $REMOTE_DIR && docker-compose logs -f"
        echo ""
        echo "  🔄 Servisleri yeniden başlatmak için:"
        echo "    cd $REMOTE_DIR && docker-compose restart"
        echo ""
        echo "  📊 Servis durumunu kontrol etmek için:"
        echo "    cd $REMOTE_DIR && ./monitor-services.sh"
    fi
    
    success "Adım 8: Servis başlatma işlemi tamamlandı"
    
    # Send notification
    send_notification "Tüm servisler başarıyla başlatıldı" "success"
}

# Run main function
main "$@"
