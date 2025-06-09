#!/bin/bash

# =============================================================================
# Step 11: Show Deployment Info
# =============================================================================
# Bu script deployment bilgilerini ve yönetim komutlarını gösterir
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

main() {
    log "Adım 11: Deployment bilgileri gösteriliyor..."
    
    # Change to project directory
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Proje dizinine geçilecek: $REMOTE_DIR"
    else
        cd "$REMOTE_DIR" || error "Proje dizini bulunamadı: $REMOTE_DIR"
    fi
    
    # Create comprehensive deployment summary
    log "Deployment özeti oluşturuluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Deployment özeti oluşturulacak"
    else
        cat > "$REMOTE_DIR/DEPLOYMENT_SUMMARY.md" << EOF
# 🚀 Deployment Summary - $PROJECT_NAME

**Deployment Date:** $(date)  
**Server IP:** $SERVER_IP  
**Domain:** $DOMAIN  
**Environment:** Production  

## 🌐 Access URLs

### Main Site
- **HTTPS:** https://$DOMAIN
- **WWW:** https://$WWW_DOMAIN
- **HTTP:** http://$DOMAIN (redirects to HTTPS)

### API Endpoints
- **API Base:** https://$DOMAIN/api
- **Health Check:** https://$DOMAIN/api/health
- **Socket.IO:** https://$DOMAIN/socket.io

## 📊 Service Status

$(docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || echo "Docker services information not available")

## 🔧 System Information

### Ports
- **Frontend:** $FRONTEND_PORT
- **Backend:** $BACKEND_PORT
- **MongoDB:** $MONGODB_PORT
- **Redis:** $REDIS_PORT

### Directories
- **Project Root:** $REMOTE_DIR
- **Backups:** $BACKUP_DIR
- **Logs:** $LOG_DIR
- **SSL Certificates:** /etc/letsencrypt/live/$DOMAIN/

### Configuration Files
- **Nginx Config:** /etc/nginx/sites-available/$DOMAIN
- **Docker Compose:** $REMOTE_DIR/docker-compose.yml
- **Environment:** $REMOTE_DIR/.env.production

## 🛠️ Management Commands

### Service Management
\`\`\`bash
# View all service status
cd $REMOTE_DIR && docker-compose ps

# View service logs
cd $REMOTE_DIR && docker-compose logs -f

# View specific service logs
cd $REMOTE_DIR && docker-compose logs -f server
cd $REMOTE_DIR && docker-compose logs -f client

# Restart all services
cd $REMOTE_DIR && docker-compose restart

# Restart specific service
cd $REMOTE_DIR && docker-compose restart server

# Stop all services
cd $REMOTE_DIR && docker-compose down

# Start all services
cd $REMOTE_DIR && docker-compose up -d

# Update and restart (after code changes)
cd $REMOTE_DIR && docker-compose up --build -d
\`\`\`

### Monitoring Commands
\`\`\`bash
# Check service health
cd $REMOTE_DIR && ./monitor-services.sh

# Check SSL certificate
cd $REMOTE_DIR && ./check-ssl.sh

# View system resources
htop

# Check disk usage
df -h

# Check memory usage
free -h

# View Nginx status
systemctl status nginx

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
\`\`\`

### Database Management
\`\`\`bash
# Connect to MongoDB
docker exec -it blog_mongodb mongosh blog_db -u admin -p password123

# Backup database
docker exec blog_mongodb mongodump --db blog_db --out /data/backup_\$(date +%Y%m%d)

# Connect to Redis
docker exec -it blog_redis redis-cli

# View Redis info
docker exec blog_redis redis-cli info
\`\`\`

### SSL Management
\`\`\`bash
# Check certificate status
certbot certificates

# Renew certificates (dry run)
certbot renew --dry-run

# Force certificate renewal
certbot renew --force-renewal

# View certificate details
openssl x509 -in /etc/letsencrypt/live/$DOMAIN/fullchain.pem -noout -text
\`\`\`

### Backup and Restore
\`\`\`bash
# List available backups
ls -la $BACKUP_DIR/

# Create manual backup
cd $REMOTE_DIR && ./deploy-scripts/04-backup-existing.sh

# View backup info
tar -tzf $BACKUP_DIR/backup_YYYYMMDD_HHMMSS.tar.gz | head -20
\`\`\`

## 🔍 Troubleshooting

### Common Issues

#### Services Not Starting
\`\`\`bash
# Check Docker daemon
systemctl status docker

# Check service logs
cd $REMOTE_DIR && docker-compose logs

# Restart Docker
systemctl restart docker

# Rebuild and restart services
cd $REMOTE_DIR && docker-compose down
cd $REMOTE_DIR && docker-compose up --build -d
\`\`\`

#### SSL Issues
\`\`\`bash
# Check Nginx configuration
nginx -t

# Check SSL certificate
cd $REMOTE_DIR && ./check-ssl.sh

# Renew SSL certificate
certbot renew --force-renewal
systemctl reload nginx
\`\`\`

#### Performance Issues
\`\`\`bash
# Check system resources
htop
df -h
free -h

# Check Docker stats
docker stats

# Check service logs for errors
cd $REMOTE_DIR && docker-compose logs | grep -i error
\`\`\`

#### Database Issues
\`\`\`bash
# Check MongoDB status
docker exec blog_mongodb mongosh --eval "db.adminCommand('ping')"

# Check Redis status
docker exec blog_redis redis-cli ping

# Restart database services
cd $REMOTE_DIR && docker-compose restart mongodb redis
\`\`\`

## 📞 Support Information

### Log Locations
- **Application Logs:** $REMOTE_DIR/logs/
- **Nginx Logs:** /var/log/nginx/
- **Docker Logs:** \`docker-compose logs\`
- **System Logs:** \`journalctl -u docker\`

### Configuration Files
- **Main Config:** $REMOTE_DIR/docker-compose.yml
- **Nginx Config:** /etc/nginx/sites-available/$DOMAIN
- **Environment:** $REMOTE_DIR/.env.production

### Important Directories
- **Project:** $REMOTE_DIR
- **Backups:** $BACKUP_DIR
- **SSL Certs:** /etc/letsencrypt/live/$DOMAIN/

---
*Generated on $(date) by $PROJECT_NAME deployment system*
EOF
        
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/DEPLOYMENT_SUMMARY.md"
        success "Deployment özeti oluşturuldu: DEPLOYMENT_SUMMARY.md"
    fi
    
    # Display deployment information
    echo ""
    echo "=============================================="
    echo "🎉 DEPLOYMENT BAŞARILI!"
    echo "=============================================="
    echo ""
    
    # Basic information
    echo "📋 TEMEL BİLGİLER"
    echo "  🌐 Domain: https://$DOMAIN"
    echo "  🌐 WWW: https://$WWW_DOMAIN"
    echo "  🖥️  Server IP: $SERVER_IP"
    echo "  📁 Proje Dizini: $REMOTE_DIR"
    echo "  📅 Deployment Tarihi: $(date)"
    echo ""
    
    # Service status
    echo "📊 SERVİS DURUMU"
    if [[ "$DRY_RUN" == "true" ]]; then
        echo "  [DRY RUN] Servis durumu gösterilecek"
    else
        docker-compose ps --format "table {{.Service}}\t{{.Status}}\t{{.Ports}}" | sed 's/^/  /'
    fi
    echo ""
    
    # URLs to test
    echo "🔗 TEST EDİLECEK URL'LER"
    echo "  🌐 Ana Site: https://$DOMAIN"
    echo "  🌐 WWW Site: https://$WWW_DOMAIN"
    echo "  🔧 API Health: https://$DOMAIN/api/health"
    echo "  📊 API Base: https://$DOMAIN/api"
    echo ""
    
    # Quick commands
    echo "⚡ HIZLI KOMUTLAR"
    echo "  📝 Logları görüntüle:"
    echo "    cd $REMOTE_DIR && docker-compose logs -f"
    echo ""
    echo "  🔄 Servisleri yeniden başlat:"
    echo "    cd $REMOTE_DIR && docker-compose restart"
    echo ""
    echo "  📊 Servis durumunu kontrol et:"
    echo "    cd $REMOTE_DIR && ./monitor-services.sh"
    echo ""
    echo "  🔒 SSL durumunu kontrol et:"
    echo "    cd $REMOTE_DIR && ./check-ssl.sh"
    echo ""
    
    # System information
    if [[ "$DRY_RUN" != "true" ]]; then
        echo "💻 SİSTEM BİLGİLERİ"
        echo "  🖥️  OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)"
        echo "  🐳 Docker: $(docker --version | cut -d' ' -f3 | tr -d ',')"
        echo "  🌐 Nginx: $(nginx -v 2>&1 | cut -d' ' -f3)"
        echo "  💾 Disk: $(df -h $REMOTE_DIR | awk 'NR==2{print $4}') available"
        echo "  🧠 Memory: $(free -h | awk 'NR==2{print $7}') available"
        echo ""
    fi
    
    # Health check summary
    if [[ "$DRY_RUN" != "true" ]] && [ -f "$REMOTE_DIR/HEALTH_REPORT.md" ]; then
        echo "🏥 SAĞLIK DURUMU"
        local health_summary=$(grep "Success Rate:" "$REMOTE_DIR/HEALTH_REPORT.md" | cut -d: -f2 | tr -d ' ')
        echo "  📊 Başarı Oranı: $health_summary"
        echo "  📋 Detaylı rapor: $REMOTE_DIR/HEALTH_REPORT.md"
        echo ""
    fi
    
    # Security information
    echo "🔐 GÜVENLİK"
    if [[ "$SKIP_SSL" != "true" ]]; then
        echo "  🔒 SSL: Aktif (Let's Encrypt)"
        echo "  🔄 Otomatik Yenileme: Aktif"
    else
        echo "  🔒 SSL: Atlandı"
    fi
    
    if [[ "$UFW_ENABLED" == "true" ]]; then
        echo "  🛡️  Firewall: Aktif (UFW)"
    fi
    
    if [[ "$FAIL2BAN_ENABLED" == "true" ]]; then
        echo "  🚫 Fail2ban: Aktif"
    fi
    echo ""
    
    # Backup information
    echo "💾 YEDEKLEME"
    echo "  📁 Yedek Dizini: $BACKUP_DIR"
    if [[ "$DRY_RUN" != "true" ]] && [ -d "$BACKUP_DIR" ]; then
        local backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
        echo "  📦 Mevcut Yedek Sayısı: $backup_count"
        if [ $backup_count -gt 0 ]; then
            local latest_backup=$(ls -1t "$BACKUP_DIR"/*.tar.gz 2>/dev/null | head -1)
            echo "  📅 Son Yedek: $(basename "$latest_backup")"
        fi
    fi
    echo ""
    
    # Important files
    echo "📄 ÖNEMLİ DOSYALAR"
    echo "  📋 Deployment Özeti: $REMOTE_DIR/DEPLOYMENT_SUMMARY.md"
    echo "  🏥 Sağlık Raporu: $REMOTE_DIR/HEALTH_REPORT.md"
    echo "  📊 İzleme Scripti: $REMOTE_DIR/monitor-services.sh"
    echo "  🔒 SSL Kontrol: $REMOTE_DIR/check-ssl.sh"
    echo "  🐳 Docker Compose: $REMOTE_DIR/docker-compose.yml"
    echo "  🌐 Nginx Config: /etc/nginx/sites-available/$DOMAIN"
    echo ""
    
    # Next steps
    echo "🚀 SONRAKİ ADIMLAR"
    echo "  1. 🌐 Web sitesini test edin: https://$DOMAIN"
    echo "  2. 🔧 API'yi test edin: https://$DOMAIN/api/health"
    echo "  3. 📊 SSL durumunu kontrol edin: ./check-ssl.sh"
    echo "  4. 📝 Logları izleyin: docker-compose logs -f"
    echo "  5. 📋 Deployment özetini okuyun: DEPLOYMENT_SUMMARY.md"
    echo ""
    
    # Monitoring recommendations
    echo "📊 İZLEME ÖNERİLERİ"
    echo "  🔄 Düzenli sağlık kontrolü yapın"
    echo "  📝 Log dosyalarını izleyin"
    echo "  💾 Düzenli yedekleme yapın"
    echo "  🔒 SSL sertifikası süresini takip edin"
    echo "  📈 Sistem kaynaklarını izleyin"
    echo ""
    
    # Support information
    echo "📞 DESTEK BİLGİLERİ"
    echo "  📧 SSL Email: $SSL_EMAIL"
    echo "  📁 Log Dizini: $LOG_DIR"
    echo "  🐳 Docker Logs: docker-compose logs"
    echo "  🌐 Nginx Logs: /var/log/nginx/"
    echo ""
    
    # Create quick access script
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Hızlı erişim scripti oluşturulacak"
    else
        cat > "$REMOTE_DIR/quick-commands.sh" << 'EOF'
#!/bin/bash

# Quick commands for deployment management
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

case "$1" in
    "status"|"s")
        echo "=== Service Status ==="
        docker-compose ps
        ;;
    "logs"|"l")
        echo "=== Service Logs ==="
        docker-compose logs -f
        ;;
    "restart"|"r")
        echo "=== Restarting Services ==="
        docker-compose restart
        ;;
    "health"|"h")
        echo "=== Health Check ==="
        ./monitor-services.sh
        ;;
    "ssl")
        echo "=== SSL Check ==="
        ./check-ssl.sh
        ;;
    "update"|"u")
        echo "=== Updating Services ==="
        docker-compose up --build -d
        ;;
    "backup"|"b")
        echo "=== Creating Backup ==="
        ./deploy-scripts/04-backup-existing.sh
        ;;
    *)
        echo "Usage: $0 {status|logs|restart|health|ssl|update|backup}"
        echo ""
        echo "Commands:"
        echo "  status (s)  - Show service status"
        echo "  logs (l)    - Show service logs"
        echo "  restart (r) - Restart all services"
        echo "  health (h)  - Run health check"
        echo "  ssl         - Check SSL certificate"
        echo "  update (u)  - Update and restart services"
        echo "  backup (b)  - Create backup"
        ;;
esac
EOF
        
        chmod +x "$REMOTE_DIR/quick-commands.sh"
        chown "$DEPLOY_USER:$DEPLOY_USER" "$REMOTE_DIR/quick-commands.sh"
        
        echo "⚡ HIZLI ERİŞİM"
        echo "  🚀 Hızlı komutlar: $REMOTE_DIR/quick-commands.sh"
        echo "    Kullanım: ./quick-commands.sh status"
        echo ""
    fi
    
    echo "=============================================="
    echo "🎉 DEPLOYMENT TAMAMLANDI!"
    echo "=============================================="
    
    success "Adım 11: Deployment bilgileri gösterildi"
    
    # Send final notification
    send_notification "🎉 Deployment başarıyla tamamlandı! Site erişilebilir: https://$DOMAIN" "success"
}

# Run main function
main "$@"
