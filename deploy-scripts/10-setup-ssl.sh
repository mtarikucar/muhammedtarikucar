#!/bin/bash

# =============================================================================
# Step 10: Setup SSL
# =============================================================================
# Bu script Let's Encrypt SSL sertifikalarını kurar
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 10: SSL kurulumu başlatılıyor..."
    
    # Check if SSL should be skipped
    if [[ "$SKIP_SSL" == "true" ]]; then
        warning "SSL kurulumu atlandı (--skip-ssl parametresi)"
        return 0
    fi
    
    # Check prerequisites
    if ! command_exists certbot; then
        error "Certbot kurulu değil. Önce 02-check-prerequisites.sh çalıştırın."
    fi
    
    if ! service_running nginx; then
        error "Nginx çalışmıyor. SSL kurulumu için Nginx gerekli."
    fi
    
    # Verify domain DNS
    log "Domain DNS kontrolü yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Domain DNS kontrolü yapılacak"
    else
        local domain_ip=$(dig +short "$DOMAIN" | tail -n1)
        local www_domain_ip=$(dig +short "$WWW_DOMAIN" | tail -n1)
        
        if [ "$domain_ip" != "$SERVER_IP" ]; then
            warning "Domain DNS ayarları hatalı!"
            warning "Mevcut IP: $domain_ip, Beklenen IP: $SERVER_IP"
            warning "GoDaddy'de DNS ayarlarını kontrol edin:"
            warning "  A Record: @ -> $SERVER_IP"
            warning "  CNAME Record: www -> $DOMAIN"
            
            read -p "DNS ayarları doğru ve propagasyon tamamlandı mı? (y/N): " confirm
            if [[ $confirm != [yY] ]]; then
                error "DNS ayarlarını düzeltin ve tekrar çalıştırın"
            fi
        else
            success "Domain DNS ayarları doğru"
        fi
        
        if [ "$www_domain_ip" != "$SERVER_IP" ] && [ -n "$www_domain_ip" ]; then
            warning "WWW domain DNS ayarları hatalı: $www_domain_ip"
        else
            success "WWW domain DNS ayarları doğru"
        fi
    fi
    
    # Create webroot directory for Let's Encrypt
    log "Let's Encrypt webroot dizini oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Webroot dizini oluşturulacak: $CERTBOT_WEBROOT"
    else
        mkdir -p "$CERTBOT_WEBROOT"
        chown -R www-data:www-data "$CERTBOT_WEBROOT"
        chmod 755 "$CERTBOT_WEBROOT"
        success "Webroot dizini oluşturuldu: $CERTBOT_WEBROOT"
    fi
    
    # Test HTTP access before SSL
    log "HTTP erişimi test ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] HTTP erişimi test edilecek"
    else
        # Create test file
        echo "Let's Encrypt test" > "$CERTBOT_WEBROOT/test.txt"
        
        # Test HTTP access
        local test_url="http://$DOMAIN/.well-known/acme-challenge/../test.txt"
        
        if curl -f "$test_url" &>/dev/null; then
            success "HTTP erişimi test başarılı"
            rm -f "$CERTBOT_WEBROOT/test.txt"
        else
            warning "HTTP erişimi test başarısız"
            warning "Nginx konfigürasyonunu kontrol edin"
        fi
    fi
    
    # Check if certificates already exist
    log "Mevcut SSL sertifikaları kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] SSL sertifikaları kontrol edilecek"
    else
        if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
            log "Mevcut SSL sertifikası bulundu"
            
            # Check certificate expiry
            local cert_file="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
            local expiry_date=$(openssl x509 -enddate -noout -in "$cert_file" | cut -d= -f2)
            local expiry_timestamp=$(date -d "$expiry_date" +%s)
            local current_timestamp=$(date +%s)
            local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
            
            if [ $days_until_expiry -gt 30 ]; then
                success "SSL sertifikası geçerli ($days_until_expiry gün kaldı)"
                log "Sertifika yenileme gerekmiyor"
                
                # Still update Nginx configuration for HTTPS
                update_nginx_for_https
                success "Adım 10: SSL kurulumu tamamlandı (mevcut sertifika kullanıldı)"
                return 0
            else
                warning "SSL sertifikası yakında sona erecek ($days_until_expiry gün kaldı)"
                log "Sertifika yenilenecek..."
            fi
        else
            info "SSL sertifikası bulunamadı, yeni sertifika alınacak"
        fi
    fi
    
    # Stop services that might interfere with port 80
    log "Port 80'i kullanan servisler kontrol ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Port 80 kontrol edilecek"
    else
        # Check if anything else is using port 80
        local port80_process=$(lsof -ti:80 | grep -v $(pgrep nginx) | head -1)
        if [ -n "$port80_process" ]; then
            warning "Port 80'i kullanan başka bir process var: $port80_process"
            local process_name=$(ps -p $port80_process -o comm= 2>/dev/null)
            warning "Process: $process_name"
            
            read -p "Bu process'i durdurmak istiyor musunuz? (y/N): " confirm
            if [[ $confirm == [yY] ]]; then
                kill -TERM "$port80_process"
                sleep 2
                success "Process durduruldu"
            fi
        fi
    fi
    
    # Obtain SSL certificate
    log "Let's Encrypt SSL sertifikası alınıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] SSL sertifikası alınacak:"
        info "  Domain: $DOMAIN"
        info "  WWW Domain: $WWW_DOMAIN"
        info "  Email: $SSL_EMAIL"
        info "  Webroot: $CERTBOT_WEBROOT"
    else
        # Run certbot
        certbot certonly \
            --webroot \
            --webroot-path="$CERTBOT_WEBROOT" \
            --email "$SSL_EMAIL" \
            --agree-tos \
            --no-eff-email \
            --domains "$DOMAIN,$WWW_DOMAIN" \
            --non-interactive \
            --expand
        
        local certbot_exit_code=$?
        
        if [ $certbot_exit_code -eq 0 ]; then
            success "SSL sertifikası başarıyla alındı"
        else
            error "SSL sertifikası alınamadı (exit code: $certbot_exit_code)"
        fi
    fi
    
    # Update Nginx configuration for HTTPS
    update_nginx_for_https
    
    # Test SSL configuration
    log "SSL konfigürasyonu test ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] SSL konfigürasyonu test edilecek"
    else
        # Test Nginx configuration
        if nginx -t; then
            success "Nginx SSL konfigürasyonu geçerli"
        else
            error "Nginx SSL konfigürasyonu hatalı"
        fi
        
        # Reload Nginx
        systemctl reload nginx
        
        if [ $? -eq 0 ]; then
            success "Nginx SSL konfigürasyonu yüklendi"
        else
            error "Nginx SSL konfigürasyonu yüklenemedi"
        fi
    fi
    
    # Test HTTPS access
    log "HTTPS erişimi test ediliyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] HTTPS erişimi test edilecek"
    else
        # Wait a moment for Nginx to reload
        sleep 5
        
        local https_url="https://$DOMAIN"
        local max_retries=5
        local retry_count=0
        local https_working=false
        
        while [ $retry_count -lt $max_retries ]; do
            if curl -f -k "$https_url" &>/dev/null; then
                https_working=true
                break
            fi
            retry_count=$((retry_count + 1))
            debug "HTTPS test retry $retry_count/$max_retries"
            sleep 10
        done
        
        if [ "$https_working" = true ]; then
            success "HTTPS erişimi başarılı"
            
            # Test SSL certificate
            local ssl_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | openssl x509 -noout -subject -dates)
            debug "SSL sertifika bilgisi: $ssl_info"
        else
            warning "HTTPS erişimi başarısız"
            warning "Nginx loglarını kontrol edin: tail -f /var/log/nginx/error.log"
        fi
    fi
    
    # Setup automatic renewal
    log "Otomatik sertifika yenileme kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Otomatik yenileme kurulacak"
    else
        # Create renewal script
        cat > "/etc/cron.d/certbot-${PROJECT_NAME}" << EOF
# Automatic SSL certificate renewal for $PROJECT_NAME
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# Check for renewal twice daily
0 */12 * * * root certbot renew --quiet --post-hook "systemctl reload nginx"
EOF
        
        chmod 644 "/etc/cron.d/certbot-${PROJECT_NAME}"
        success "Otomatik yenileme kuruldu"
        
        # Test renewal (dry run)
        log "Sertifika yenileme test ediliyor..."
        if certbot renew --dry-run --quiet; then
            success "Sertifika yenileme testi başarılı"
        else
            warning "Sertifika yenileme testi başarısız"
        fi
    fi
    
    # Create SSL monitoring script
    log "SSL izleme scripti oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] SSL izleme scripti oluşturulacak"
    else
        cat > "$REMOTE_DIR/check-ssl.sh" << 'EOF'
#!/bin/bash

# SSL Certificate monitoring script
DOMAIN="$1"
if [ -z "$DOMAIN" ]; then
    DOMAIN="muhammedtarikucar.com"
fi

echo "=== SSL Certificate Check for $DOMAIN ==="
echo "Date: $(date)"
echo ""

# Check certificate file
CERT_FILE="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

if [ -f "$CERT_FILE" ]; then
    echo "Certificate file: ✅ Found"
    
    # Get certificate info
    CERT_INFO=$(openssl x509 -in "$CERT_FILE" -noout -subject -issuer -dates)
    
    echo "Certificate details:"
    echo "$CERT_INFO"
    echo ""
    
    # Check expiry
    EXPIRY_DATE=$(echo "$CERT_INFO" | grep "notAfter" | cut -d= -f2)
    EXPIRY_TIMESTAMP=$(date -d "$EXPIRY_DATE" +%s)
    CURRENT_TIMESTAMP=$(date +%s)
    DAYS_UNTIL_EXPIRY=$(( (EXPIRY_TIMESTAMP - CURRENT_TIMESTAMP) / 86400 ))
    
    echo "Days until expiry: $DAYS_UNTIL_EXPIRY"
    
    if [ $DAYS_UNTIL_EXPIRY -gt 30 ]; then
        echo "Status: ✅ Certificate is valid"
    elif [ $DAYS_UNTIL_EXPIRY -gt 7 ]; then
        echo "Status: ⚠️  Certificate expires soon"
    else
        echo "Status: ❌ Certificate expires very soon!"
    fi
    
else
    echo "Certificate file: ❌ Not found"
fi

echo ""

# Test HTTPS connection
echo "Testing HTTPS connection..."
if curl -f -s "https://$DOMAIN" > /dev/null; then
    echo "HTTPS connection: ✅ Working"
else
    echo "HTTPS connection: ❌ Failed"
fi

# Check SSL grade
echo ""
echo "For detailed SSL analysis, visit:"
echo "https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
EOF
        
        chmod +x "$REMOTE_DIR/check-ssl.sh"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/check-ssl.sh"
        success "SSL izleme scripti oluşturuldu: check-ssl.sh"
    fi
    
    # Display SSL summary
    log "SSL kurulum özeti:"
    
    if [[ "$DRY_RUN" != "true" ]]; then
        echo "  🔒 Domain: $DOMAIN"
        echo "  🔒 WWW Domain: $WWW_DOMAIN"
        echo "  📧 Email: $SSL_EMAIL"
        echo "  📁 Certificates: /etc/letsencrypt/live/$DOMAIN/"
        echo "  🔄 Auto-renewal: Aktif (günde 2 kez kontrol)"
        echo ""
        echo "  🌐 Test URLs:"
        echo "    https://$DOMAIN"
        echo "    https://$WWW_DOMAIN"
        echo ""
        echo "  📊 SSL durumunu kontrol etmek için:"
        echo "    cd $REMOTE_DIR && ./check-ssl.sh"
        echo ""
        echo "  🔧 Sertifikayı manuel yenilemek için:"
        echo "    certbot renew --force-renewal"
        
        # Show certificate info if available
        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            echo ""
            echo "  📋 Sertifika bilgileri:"
            openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -noout -subject -issuer -dates | sed 's/^/    /'
        fi
    fi
    
    success "Adım 10: SSL kurulumu tamamlandı"
    
    # Send notification
    send_notification "SSL sertifikaları başarıyla kuruldu ve HTTPS aktifleştirildi" "success"
}

# Function to update Nginx configuration for HTTPS
update_nginx_for_https() {
    log "Nginx HTTPS konfigürasyonu güncelleniyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx HTTPS konfigürasyonu güncellenecek"
        return 0
    fi
    
    # The HTTPS configuration is already in the Nginx config from step 6
    # We just need to ensure the SSL certificate paths are correct
    
    local site_config="$NGINX_SITES_AVAILABLE/$DOMAIN"
    
    # Update SSL certificate paths in the configuration
    sed -i "s|ssl_certificate .*|ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;|" "$site_config"
    sed -i "s|ssl_certificate_key .*|ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;|" "$site_config"
    
    success "Nginx HTTPS konfigürasyonu güncellendi"
}

# Run main function
main "$@"
