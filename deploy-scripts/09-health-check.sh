#!/bin/bash

# =============================================================================
# Step 9: Health Check
# =============================================================================
# Bu script deployment sonrası kapsamlı sağlık kontrolleri yapar
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 9: Sağlık kontrolü başlatılıyor..."
    
    # Check if health check should be skipped
    if [[ "$SKIP_HEALTH_CHECK" == "true" ]]; then
        warning "Sağlık kontrolü atlandı (--skip-health-check parametresi)"
        return 0
    fi
    
    local health_check_failed=false
    local total_checks=0
    local passed_checks=0
    
    # Change to project directory
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Proje dizinine geçilecek: $REMOTE_DIR"
    else
        cd "$REMOTE_DIR" || error "Proje dizini bulunamadı: $REMOTE_DIR"
    fi
    
    # 1. System Health Checks
    log "1. Sistem sağlık kontrolleri..."
    
    # Check disk space
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Disk alanı kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        local available_space=$(df -BG "$REMOTE_DIR" | awk 'NR==2 {print $4}' | sed 's/G//')
        if [ "$available_space" -gt 5 ]; then
            success "Disk alanı: ${available_space}GB mevcut"
            passed_checks=$((passed_checks + 1))
        else
            warning "Düşük disk alanı: ${available_space}GB"
            health_check_failed=true
        fi
    fi
    
    # Check memory usage
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Bellek kullanımı kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
        if (( $(echo "$memory_usage < 80" | bc -l) )); then
            success "Bellek kullanımı: %${memory_usage}"
            passed_checks=$((passed_checks + 1))
        else
            warning "Yüksek bellek kullanımı: %${memory_usage}"
            health_check_failed=true
        fi
    fi
    
    # 2. Docker Health Checks
    log "2. Docker sağlık kontrolleri..."
    
    # Check Docker daemon
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker daemon kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        if docker ps &>/dev/null; then
            success "Docker daemon çalışıyor"
            passed_checks=$((passed_checks + 1))
        else
            error "Docker daemon çalışmıyor"
        fi
    fi
    
    # Check Docker Compose services
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose servisleri kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        local running_services=$(docker-compose ps --services --filter status=running | wc -l)
        local total_services=$(docker-compose ps --services | wc -l)
        
        if [ "$running_services" -eq "$total_services" ] && [ "$total_services" -gt 0 ]; then
            success "Docker Compose servisleri: $running_services/$total_services çalışıyor"
            passed_checks=$((passed_checks + 1))
        else
            warning "Docker Compose servisleri: $running_services/$total_services çalışıyor"
            health_check_failed=true
            
            # Show failed services
            log "Çalışmayan servisler:"
            docker-compose ps --filter status=exited
        fi
    fi
    
    # 3. Database Health Checks
    log "3. Veritabanı sağlık kontrolleri..."
    
    # MongoDB health check
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] MongoDB sağlık kontrolü yapılacak"
        passed_checks=$((passed_checks + 1))
    else
        if docker exec blog_mongodb mongosh --quiet --eval "db.adminCommand('ping').ok" 2>/dev/null | grep -q "1"; then
            success "MongoDB: Sağlıklı"
            passed_checks=$((passed_checks + 1))
            
            # Check MongoDB connection
            local db_status=$(docker exec blog_mongodb mongosh --quiet --eval "db.runCommand({connectionStatus: 1}).ok" 2>/dev/null)
            if echo "$db_status" | grep -q "1"; then
                debug "MongoDB bağlantısı: OK"
            else
                warning "MongoDB bağlantı sorunu"
            fi
        else
            warning "MongoDB: Sağlıksız"
            health_check_failed=true
        fi
    fi
    
    # Redis health check
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Redis sağlık kontrolü yapılacak"
        passed_checks=$((passed_checks + 1))
    else
        if docker exec blog_redis redis-cli ping 2>/dev/null | grep -q "PONG"; then
            success "Redis: Sağlıklı"
            passed_checks=$((passed_checks + 1))
            
            # Check Redis memory usage
            local redis_memory=$(docker exec blog_redis redis-cli info memory | grep "used_memory_human" | cut -d: -f2 | tr -d '\r')
            debug "Redis bellek kullanımı: $redis_memory"
        else
            warning "Redis: Sağlıksız"
            health_check_failed=true
        fi
    fi
    
    # 4. Application Health Checks
    log "4. Uygulama sağlık kontrolleri..."
    
    # Backend API health check
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Backend API sağlık kontrolü yapılacak"
        passed_checks=$((passed_checks + 1))
    else
        local backend_url="http://localhost:$BACKEND_PORT/api/health"
        local max_retries=5
        local retry_count=0
        local backend_healthy=false
        
        while [ $retry_count -lt $max_retries ]; do
            if health_check_url "$backend_url" 200 10; then
                backend_healthy=true
                break
            fi
            retry_count=$((retry_count + 1))
            debug "Backend retry $retry_count/$max_retries"
            sleep 5
        done
        
        if [ "$backend_healthy" = true ]; then
            success "Backend API: Sağlıklı"
            passed_checks=$((passed_checks + 1))
            
            # Test API endpoints
            if health_check_url "http://localhost:$BACKEND_PORT/api" 404 5; then
                debug "Backend API base endpoint: OK"
            fi
        else
            warning "Backend API: Sağlıksız"
            health_check_failed=true
        fi
    fi
    
    # Frontend health check
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Frontend sağlık kontrolü yapılacak"
        passed_checks=$((passed_checks + 1))
    else
        local frontend_url="http://localhost:$FRONTEND_PORT"
        local max_retries=5
        local retry_count=0
        local frontend_healthy=false
        
        while [ $retry_count -lt $max_retries ]; do
            if health_check_url "$frontend_url" 200 10; then
                frontend_healthy=true
                break
            fi
            retry_count=$((retry_count + 1))
            debug "Frontend retry $retry_count/$max_retries"
            sleep 5
        done
        
        if [ "$frontend_healthy" = true ]; then
            success "Frontend: Sağlıklı"
            passed_checks=$((passed_checks + 1))
        else
            warning "Frontend: Sağlıksız"
            health_check_failed=true
        fi
    fi
    
    # 5. Network Health Checks
    log "5. Ağ sağlık kontrolleri..."
    
    # Check port accessibility
    local ports_to_check=("$FRONTEND_PORT" "$BACKEND_PORT")
    
    for port in "${ports_to_check[@]}"; do
        total_checks=$((total_checks + 1))
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Port $port kontrol edilecek"
            passed_checks=$((passed_checks + 1))
        else
            if port_open "$port"; then
                success "Port $port: Erişilebilir"
                passed_checks=$((passed_checks + 1))
            else
                warning "Port $port: Erişilemiyor"
                health_check_failed=true
            fi
        fi
    done
    
    # 6. Nginx Health Checks
    log "6. Nginx sağlık kontrolleri..."
    
    # Check Nginx status
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx durumu kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        if service_running nginx; then
            success "Nginx: Çalışıyor"
            passed_checks=$((passed_checks + 1))
        else
            warning "Nginx: Çalışmıyor"
            health_check_failed=true
        fi
    fi
    
    # Check Nginx configuration
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx konfigürasyonu test edilecek"
        passed_checks=$((passed_checks + 1))
    else
        if nginx -t &>/dev/null; then
            success "Nginx konfigürasyonu: Geçerli"
            passed_checks=$((passed_checks + 1))
        else
            warning "Nginx konfigürasyonu: Hatalı"
            health_check_failed=true
        fi
    fi
    
    # 7. SSL/HTTPS Health Checks (if not skipped)
    if [[ "$SKIP_SSL" != "true" ]]; then
        log "7. SSL/HTTPS sağlık kontrolleri..."
        
        # Check if SSL certificates exist
        total_checks=$((total_checks + 1))
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] SSL sertifikaları kontrol edilecek"
            passed_checks=$((passed_checks + 1))
        else
            if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
                success "SSL sertifikası: Mevcut"
                passed_checks=$((passed_checks + 1))
                
                # Check certificate expiry
                local cert_expiry=$(openssl x509 -enddate -noout -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" | cut -d= -f2)
                local expiry_timestamp=$(date -d "$cert_expiry" +%s)
                local current_timestamp=$(date +%s)
                local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
                
                if [ $days_until_expiry -gt 30 ]; then
                    debug "SSL sertifikası $days_until_expiry gün geçerli"
                else
                    warning "SSL sertifikası $days_until_expiry gün içinde sona erecek"
                fi
            else
                info "SSL sertifikası: Henüz kurulmamış (normal, SSL kurulumu sonraki adımda)"
                passed_checks=$((passed_checks + 1))
            fi
        fi
    fi
    
    # 8. Performance Health Checks
    log "8. Performans sağlık kontrolleri..."
    
    # Check response times
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yanıt süreleri kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        local response_time=$(curl -o /dev/null -s -w '%{time_total}' "http://localhost:$FRONTEND_PORT" || echo "999")
        local response_time_ms=$(echo "$response_time * 1000" | bc | cut -d. -f1)
        
        if [ "$response_time_ms" -lt 3000 ]; then
            success "Frontend yanıt süresi: ${response_time_ms}ms"
            passed_checks=$((passed_checks + 1))
        else
            warning "Yavaş frontend yanıt süresi: ${response_time_ms}ms"
            health_check_failed=true
        fi
    fi
    
    # 9. Log Health Checks
    log "9. Log sağlık kontrolleri..."
    
    # Check for critical errors in logs
    total_checks=$((total_checks + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Loglar kontrol edilecek"
        passed_checks=$((passed_checks + 1))
    else
        local error_count=$(docker-compose logs --since=10m 2>&1 | grep -i "error\|fatal\|exception" | wc -l)
        
        if [ "$error_count" -lt 5 ]; then
            success "Log kontrolleri: $error_count hata bulundu (kabul edilebilir)"
            passed_checks=$((passed_checks + 1))
        else
            warning "Çok fazla hata logu: $error_count hata son 10 dakikada"
            health_check_failed=true
        fi
    fi
    
    # 10. Security Health Checks
    log "10. Güvenlik sağlık kontrolleri..."
    
    # Check firewall status
    total_checks=$((total_checks + 1))
    if [[ "$UFW_ENABLED" == "true" ]]; then
        if [[ "$DRY_RUN" == "true" ]]; then
            info "[DRY RUN] Firewall durumu kontrol edilecek"
            passed_checks=$((passed_checks + 1))
        else
            if ufw status | grep -q "Status: active"; then
                success "Firewall: Aktif"
                passed_checks=$((passed_checks + 1))
            else
                warning "Firewall: Pasif"
                health_check_failed=true
            fi
        fi
    else
        info "Firewall kontrolü atlandı (UFW_ENABLED=false)"
        passed_checks=$((passed_checks + 1))
    fi
    
    # Generate health report
    log "Sağlık raporu oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Sağlık raporu oluşturulacak"
    else
        cat > "$REMOTE_DIR/HEALTH_REPORT.md" << EOF
# Health Check Report

**Date:** $(date)
**Server:** $SERVER_IP
**Domain:** $DOMAIN
**Project:** $PROJECT_NAME

## Summary
- **Total Checks:** $total_checks
- **Passed:** $passed_checks
- **Failed:** $((total_checks - passed_checks))
- **Success Rate:** $(echo "scale=1; $passed_checks * 100 / $total_checks" | bc)%

## System Status
- **Disk Space:** $(df -h $REMOTE_DIR | awk 'NR==2{print $4}') available
- **Memory Usage:** $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
- **Load Average:** $(uptime | awk -F'load average:' '{print $2}')

## Service Status
$(docker-compose ps --format "table {{.Service}}\t{{.Status}}")

## Port Status
- Frontend (Port $FRONTEND_PORT): $(port_open $FRONTEND_PORT && echo "✅ Open" || echo "❌ Closed")
- Backend (Port $BACKEND_PORT): $(port_open $BACKEND_PORT && echo "✅ Open" || echo "❌ Closed")

## Health Check Details
$(if [ "$health_check_failed" = true ]; then echo "⚠️ Some health checks failed. Review the deployment logs."; else echo "✅ All critical health checks passed."; fi)

## Next Steps
$(if [ "$health_check_failed" = true ]; then echo "1. Review failed health checks above\n2. Check service logs: \`docker-compose logs -f\`\n3. Restart failed services if needed"; else echo "1. Setup SSL certificates\n2. Configure monitoring\n3. Test application functionality"; fi)

---
Generated by deployment health check system
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/HEALTH_REPORT.md"
        success "Sağlık raporu oluşturuldu: HEALTH_REPORT.md"
    fi
    
    # Display health check summary
    log "Sağlık kontrolü özeti:"
    echo "  📊 Toplam kontrol: $total_checks"
    echo "  ✅ Başarılı: $passed_checks"
    echo "  ❌ Başarısız: $((total_checks - passed_checks))"
    echo "  📈 Başarı oranı: $(echo "scale=1; $passed_checks * 100 / $total_checks" | bc)%"
    
    if [ "$health_check_failed" = true ]; then
        warning "Bazı sağlık kontrolleri başarısız oldu"
        warning "Detaylar için HEALTH_REPORT.md dosyasını inceleyin"
        warning "Logları kontrol edin: docker-compose logs -f"
    else
        success "Tüm kritik sağlık kontrolleri başarılı"
    fi
    
    success "Adım 9: Sağlık kontrolü tamamlandı"
    
    # Send notification
    if [ "$health_check_failed" = true ]; then
        send_notification "Sağlık kontrolü tamamlandı - bazı kontroller başarısız ($passed_checks/$total_checks)" "warning"
    else
        send_notification "Sağlık kontrolü başarıyla tamamlandı ($passed_checks/$total_checks)" "success"
    fi
    
    # Return appropriate exit code
    if [ "$health_check_failed" = true ]; then
        return 1
    else
        return 0
    fi
}

# Run main function
main "$@"
