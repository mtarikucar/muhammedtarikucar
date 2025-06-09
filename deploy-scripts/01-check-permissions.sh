#!/bin/bash

# =============================================================================
# Step 1: Check Permissions
# =============================================================================
# Bu script deployment için gerekli yetkileri kontrol eder
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 1: Yetki kontrolü başlatılıyor..."
    
    # Check if running as root
    if [[ $EUID -ne 0 ]]; then
        error "Bu script root olarak çalıştırılmalı. 'sudo ./deploy.sh' kullanın."
    fi
    
    success "Root yetkisi doğrulandı"
    
    # Check sudo access for deploy user
    if [ "$DEPLOY_USER" != "root" ]; then
        if ! id "$DEPLOY_USER" &>/dev/null; then
            warning "Deploy kullanıcısı bulunamadı: $DEPLOY_USER"
            
            if [[ "$DRY_RUN" == "true" ]]; then
                info "[DRY RUN] Kullanıcı oluşturulacak: $DEPLOY_USER"
            else
                log "Deploy kullanıcısı oluşturuluyor: $DEPLOY_USER"
                useradd -m -s /bin/bash "$DEPLOY_USER"
                usermod -aG sudo "$DEPLOY_USER"
                success "Deploy kullanıcısı oluşturuldu: $DEPLOY_USER"
            fi
        else
            success "Deploy kullanıcısı mevcut: $DEPLOY_USER"
        fi
    fi
    
    # Check write permissions for target directories
    local dirs_to_check=(
        "/opt"
        "/etc/nginx"
        "/var/log"
        "/etc/systemd/system"
    )
    
    for dir in "${dirs_to_check[@]}"; do
        if [ ! -w "$dir" ]; then
            error "Yazma yetkisi yok: $dir"
        fi
        debug "Yazma yetkisi OK: $dir"
    done
    
    success "Dizin yazma yetkileri doğrulandı"
    
    # Check if we can manage systemd services
    if ! systemctl --version &>/dev/null; then
        error "Systemd erişimi yok"
    fi
    
    success "Systemd erişimi doğrulandı"
    
    # Check if we can manage Docker
    if command_exists docker; then
        if ! docker ps &>/dev/null; then
            error "Docker erişimi yok. Docker daemon çalışıyor mu?"
        fi
        success "Docker erişimi doğrulandı"
    fi
    
    # Check if we can manage firewall (if UFW is enabled)
    if [[ "$UFW_ENABLED" == "true" ]] && command_exists ufw; then
        if ! ufw status &>/dev/null; then
            warning "UFW erişimi yok"
        else
            success "UFW erişimi doğrulandı"
        fi
    fi
    
    # Check network connectivity
    log "Ağ bağlantısı kontrol ediliyor..."
    
    if ! ping -c 1 8.8.8.8 &>/dev/null; then
        error "İnternet bağlantısı yok"
    fi
    
    success "İnternet bağlantısı OK"
    
    # Check DNS resolution
    if ! nslookup google.com &>/dev/null; then
        warning "DNS çözümleme sorunu olabilir"
    else
        success "DNS çözümleme OK"
    fi
    
    # Check if domain points to this server
    log "Domain DNS kontrolü yapılıyor..."
    
    local domain_ip=$(nslookup "$DOMAIN" | grep -A 1 "Name:" | grep "Address:" | awk '{print $2}' | head -1)
    
    if [ "$domain_ip" != "$SERVER_IP" ]; then
        warning "Domain henüz bu sunucuya yönlendirilmemiş!"
        warning "Mevcut IP: $domain_ip, Beklenen IP: $SERVER_IP"
        warning "GoDaddy'de DNS ayarlarını kontrol edin:"
        warning "  A Record: @ -> $SERVER_IP"
        warning "  CNAME Record: www -> $DOMAIN"
        
        if [[ "$DRY_RUN" != "true" ]]; then
            read -p "DNS ayarları tamamlandı ve propagasyon beklendi mi? (y/N): " confirm
            if [[ $confirm != [yY] ]]; then
                error "DNS ayarlarını tamamlayıp tekrar çalıştırın."
            fi
        fi
    else
        success "Domain DNS ayarları doğru"
    fi
    
    # Check available ports
    log "Port kullanılabilirliği kontrol ediliyor..."
    
    local ports_to_check=("$FRONTEND_PORT" "$BACKEND_PORT" "80" "443")
    
    for port in "${ports_to_check[@]}"; do
        if port_open "$port"; then
            warning "Port $port zaten kullanımda"
            
            # Show what's using the port
            local process=$(lsof -ti:$port 2>/dev/null)
            if [ -n "$process" ]; then
                local process_name=$(ps -p $process -o comm= 2>/dev/null)
                warning "Port $port kullanıcısı: $process_name (PID: $process)"
            fi
        else
            success "Port $port kullanılabilir"
        fi
    done
    
    # Check system resources
    check_disk_space "/"
    check_memory
    
    # Validate configuration
    validate_config
    
    # Print system information if in debug mode
    if [[ "$DEBUG_MODE" == "true" ]]; then
        print_system_info
    fi
    
    success "Adım 1: Yetki kontrolü tamamlandı"
    
    # Send notification
    send_notification "Yetki kontrolü başarıyla tamamlandı" "success"
}

# Run main function
main "$@"
