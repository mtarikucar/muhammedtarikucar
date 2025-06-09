#!/bin/bash

# =============================================================================
# Step 13: Continuous Health Monitor
# =============================================================================
# Bu script deployment sonrası sürekli sağlık izleme yapar
# Sorunları erken tespit eder ve otomatik düzeltme önerileri sunar
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

# Health monitoring configuration
MONITOR_INTERVAL=30
MONITOR_DURATION=300
ALERT_THRESHOLD=3
CONTINUOUS_MODE=false

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --continuous)
            CONTINUOUS_MODE=true
            shift
            ;;
        --interval=*)
            MONITOR_INTERVAL="${1#*=}"
            shift
            ;;
        --duration=*)
            MONITOR_DURATION="${1#*=}"
            shift
            ;;
        --threshold=*)
            ALERT_THRESHOLD="${1#*=}"
            shift
            ;;
        *)
            shift
            ;;
    esac
done

# Health check functions
check_docker_health() {
    local unhealthy_count=0
    local containers=$(docker ps --format "{{.Names}}")
    
    for container in $containers; do
        local health=$(docker inspect --format='{{.State.Health.Status}}' "$container" 2>/dev/null || echo "no-health-check")
        
        if [ "$health" = "unhealthy" ]; then
            warning "Container sağlıksız: $container"
            unhealthy_count=$((unhealthy_count + 1))
        elif [ "$health" = "starting" ]; then
            info "Container başlatılıyor: $container"
        elif [ "$health" = "healthy" ] || [ "$health" = "no-health-check" ]; then
            debug "Container sağlıklı: $container"
        fi
    done
    
    return $unhealthy_count
}

check_nginx_health() {
    if ! systemctl is-active --quiet nginx; then
        warning "Nginx çalışmıyor"
        return 1
    fi
    
    if ! nginx -t >/dev/null 2>&1; then
        warning "Nginx konfigürasyonu hatalı"
        return 1
    fi
    
    debug "Nginx sağlıklı"
    return 0
}

check_website_accessibility() {
    local errors=0
    
    # Check frontend
    if command_exists curl; then
        if ! curl -f -s --max-time 10 "http://localhost:$FRONTEND_PORT" >/dev/null; then
            warning "Frontend erişilebilir değil (port $FRONTEND_PORT)"
            errors=$((errors + 1))
        else
            debug "Frontend erişilebilir"
        fi
        
        # Check backend API
        if ! curl -f -s --max-time 10 "http://localhost:$BACKEND_PORT/api/health" >/dev/null; then
            warning "Backend API erişilebilir değil (port $BACKEND_PORT)"
            errors=$((errors + 1))
        else
            debug "Backend API erişilebilir"
        fi
        
        # Check domain accessibility
        if ! curl -f -s --max-time 10 "http://$DOMAIN" >/dev/null; then
            warning "Domain erişilebilir değil: $DOMAIN"
            errors=$((errors + 1))
        else
            debug "Domain erişilebilir"
        fi
    else
        warning "curl komutu bulunamadı, web erişilebilirlik kontrolü yapılamıyor"
        errors=1
    fi
    
    return $errors
}

check_resource_usage() {
    local warnings=0
    
    # Check disk usage
    local disk_usage=$(df "$REMOTE_DIR" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 90 ]; then
        warning "Disk kullanımı yüksek: %$disk_usage"
        warnings=$((warnings + 1))
    elif [ "$disk_usage" -gt 80 ]; then
        info "Disk kullanımı: %$disk_usage"
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    if [ "$memory_usage" -gt 90 ]; then
        warning "Bellek kullanımı yüksek: %$memory_usage"
        warnings=$((warnings + 1))
    elif [ "$memory_usage" -gt 80 ]; then
        info "Bellek kullanımı: %$memory_usage"
    fi
    
    # Check CPU load
    local cpu_load=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local cpu_cores=$(nproc)
    local cpu_usage=$(echo "$cpu_load $cpu_cores" | awk '{printf "%.0f", ($1/$2)*100}')
    
    if [ "$cpu_usage" -gt 90 ]; then
        warning "CPU kullanımı yüksek: %$cpu_usage"
        warnings=$((warnings + 1))
    elif [ "$cpu_usage" -gt 80 ]; then
        info "CPU kullanımı: %$cpu_usage"
    fi
    
    return $warnings
}

check_log_errors() {
    local error_count=0
    
    # Check Docker logs for errors
    local containers=$(docker ps --format "{{.Names}}")
    for container in $containers; do
        local recent_errors=$(docker logs --since="1m" "$container" 2>&1 | grep -i "error\|exception\|fatal" | wc -l)
        if [ "$recent_errors" -gt 0 ]; then
            warning "Container $container: $recent_errors hata son 1 dakikada"
            error_count=$((error_count + recent_errors))
        fi
    done
    
    # Check Nginx error logs
    if [ -f "$LOG_DIR/error.log" ]; then
        local nginx_errors=$(tail -n 100 "$LOG_DIR/error.log" | grep "$(date '+%Y/%m/%d %H:%M')" | wc -l)
        if [ "$nginx_errors" -gt 0 ]; then
            warning "Nginx: $nginx_errors hata son dakikada"
            error_count=$((error_count + nginx_errors))
        fi
    fi
    
    return $error_count
}

generate_health_report() {
    local timestamp=$(date)
    local report_file="$REMOTE_DIR/HEALTH_REPORT_$(date +%Y%m%d_%H%M%S).md"
    
    cat > "$report_file" << EOF
# Health Report

**Generated:** $timestamp

## System Overview

### Docker Containers
\`\`\`
$(docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}")
\`\`\`

### Container Health Details
\`\`\`
$(docker ps --format "{{.Names}}" | while read container; do
    echo "=== $container ==="
    docker inspect --format='Health: {{.State.Health.Status}}' "$container" 2>/dev/null || echo "Health: no-health-check"
    echo "Status: $(docker inspect --format='{{.State.Status}}' "$container")"
    echo "Started: $(docker inspect --format='{{.State.StartedAt}}' "$container")"
    echo ""
done)
\`\`\`

### Nginx Status
\`\`\`
$(systemctl status nginx --no-pager -l)
\`\`\`

### Resource Usage
\`\`\`
Disk Usage: $(df -h "$REMOTE_DIR" | awk 'NR==2 {print $5}')
Memory Usage: $(free -h | awk 'NR==2{printf "%.1f%%", $3*100/$2}')
CPU Load: $(uptime | awk -F'load average:' '{print $2}')
\`\`\`

### Network Connectivity
\`\`\`
$(netstat -tlnp | grep -E ":($FRONTEND_PORT|$BACKEND_PORT|80|443)")
\`\`\`

### Recent Errors
\`\`\`
$(docker ps --format "{{.Names}}" | while read container; do
    echo "=== $container errors (last 5 minutes) ==="
    docker logs --since="5m" "$container" 2>&1 | grep -i "error\|exception\|fatal" | tail -5
    echo ""
done)
\`\`\`

## Recommendations

EOF

    # Add recommendations based on current status
    check_docker_health
    local docker_issues=$?
    
    check_nginx_health
    local nginx_issues=$?
    
    check_website_accessibility
    local web_issues=$?
    
    check_resource_usage
    local resource_issues=$?
    
    if [ $docker_issues -gt 0 ]; then
        echo "- 🐳 Docker container'ları yeniden başlatmayı düşünün: \`docker-compose restart\`" >> "$report_file"
    fi
    
    if [ $nginx_issues -gt 0 ]; then
        echo "- 🌐 Nginx konfigürasyonunu kontrol edin: \`nginx -t\`" >> "$report_file"
    fi
    
    if [ $web_issues -gt 0 ]; then
        echo "- 🔗 Ağ bağlantısını ve port erişilebilirliğini kontrol edin" >> "$report_file"
    fi
    
    if [ $resource_issues -gt 0 ]; then
        echo "- 💾 Sistem kaynaklarını optimize edin veya kapasiteyi artırın" >> "$report_file"
    fi
    
    if [ $((docker_issues + nginx_issues + web_issues + resource_issues)) -eq 0 ]; then
        echo "- ✅ Sistem sağlıklı görünüyor, rutin izlemeye devam edin" >> "$report_file"
    fi
    
    echo "" >> "$report_file"
    echo "---" >> "$report_file"
    echo "Generated by health monitoring script" >> "$report_file"
    
    success "Sağlık raporu oluşturuldu: $report_file"
}

main() {
    log "Adım 13: Sağlık izleme başlatılıyor..."
    
    local start_time=$(date +%s)
    local end_time=$((start_time + MONITOR_DURATION))
    local check_count=0
    local total_issues=0
    local consecutive_issues=0
    
    if [ "$CONTINUOUS_MODE" = true ]; then
        log "Sürekli izleme modu aktif (Ctrl+C ile durdurun)"
        end_time=$((start_time + 86400))  # 24 hours
    else
        log "İzleme süresi: $MONITOR_DURATION saniye"
    fi
    
    while [ $(date +%s) -lt $end_time ]; do
        check_count=$((check_count + 1))
        local current_issues=0
        
        log "Sağlık kontrolü #$check_count başlatılıyor..."
        
        # Perform health checks
        check_docker_health
        current_issues=$((current_issues + $?))
        
        check_nginx_health
        current_issues=$((current_issues + $?))
        
        check_website_accessibility
        current_issues=$((current_issues + $?))
        
        check_resource_usage
        current_issues=$((current_issues + $?))
        
        check_log_errors
        current_issues=$((current_issues + $?))
        
        total_issues=$((total_issues + current_issues))
        
        if [ $current_issues -gt 0 ]; then
            consecutive_issues=$((consecutive_issues + 1))
            warning "Sağlık kontrolü #$check_count: $current_issues sorun tespit edildi"
            
            if [ $consecutive_issues -ge $ALERT_THRESHOLD ]; then
                error "ALERT: $consecutive_issues ardışık kontrolde sorun tespit edildi!"
                
                # Generate emergency report
                generate_health_report
                
                # Send notification
                send_notification "Sağlık izleme ALERT: Ardışık sorunlar tespit edildi" "error"
                
                if [ "$CONTINUOUS_MODE" != true ]; then
                    warning "Kritik sorunlar tespit edildi. Rollback düşünün: ./deploy-scripts/12-rollback.sh"
                    break
                fi
            fi
        else
            consecutive_issues=0
            success "Sağlık kontrolü #$check_count: Tüm sistemler sağlıklı"
        fi
        
        # Wait for next check
        if [ $(date +%s) -lt $end_time ]; then
            sleep $MONITOR_INTERVAL
        fi
    done
    
    # Final summary
    local total_time=$(($(date +%s) - start_time))
    
    log "Sağlık izleme özeti:"
    echo "  ⏱️  Toplam Süre: $total_time saniye"
    echo "  🔍 Toplam Kontrol: $check_count"
    echo "  ⚠️  Toplam Sorun: $total_issues"
    echo "  🔄 Ardışık Sorun: $consecutive_issues"
    
    if [ $total_issues -eq 0 ]; then
        success "Hiç sorun tespit edilmedi - Sistem stabil"
    elif [ $consecutive_issues -lt $ALERT_THRESHOLD ]; then
        info "Geçici sorunlar tespit edildi ancak sistem stabil"
    else
        warning "Kritik sorunlar tespit edildi - Manuel müdahale gerekli"
    fi
    
    # Generate final report
    generate_health_report
    
    success "Adım 13: Sağlık izleme tamamlandı"
    
    # Send final notification
    if [ $total_issues -eq 0 ]; then
        send_notification "Sağlık izleme tamamlandı - Sistem stabil" "success"
    else
        send_notification "Sağlık izleme tamamlandı - $total_issues sorun tespit edildi" "warning"
    fi
}

# Cleanup function for graceful exit
cleanup() {
    log "Sağlık izleme durduruluyor..."
    generate_health_report
    exit 0
}

# Set trap for graceful cleanup
trap cleanup INT TERM

# Run main function
main "$@"
