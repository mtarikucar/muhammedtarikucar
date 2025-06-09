#!/bin/bash

# =============================================================================
# Deployment Manager - Güvenli ve Dinamik Deployment Yönetimi
# =============================================================================
# Bu script tüm deployment işlemlerini güvenli bir şekilde yönetir
# Veri kaybı olmaksızın dinamik deployment sağlar
# =============================================================================

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPTS_DIR="$SCRIPT_DIR/deploy-scripts"

# Source configuration
if [ -f "$DEPLOY_SCRIPTS_DIR/config.sh" ]; then
    source "$DEPLOY_SCRIPTS_DIR/config.sh"
fi

if [ -f "$DEPLOY_SCRIPTS_DIR/utils.sh" ]; then
    source "$DEPLOY_SCRIPTS_DIR/utils.sh"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print colored output
print_header() {
    echo -e "${BLUE}=============================================="
    echo -e "$1"
    echo -e "==============================================${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Show usage
show_usage() {
    print_header "🚀 Deployment Manager - Güvenli Deployment Yönetimi"
    echo ""
    echo "Kullanım: $0 [KOMUT] [SEÇENEKLER]"
    echo ""
    echo "📋 TEMEL KOMUTLAR:"
    echo "  deploy              - Tam deployment (güvenlik kontrolleri ile)"
    echo "  deploy --dry-run    - Deployment simülasyonu (hiçbir değişiklik yapmaz)"
    echo "  deploy --force      - Zorla deployment (kontrolleri atla)"
    echo ""
    echo "🔍 KONTROL KOMUTLARI:"
    echo "  check               - Pre-deployment güvenlik kontrolü"
    echo "  status              - Mevcut sistem durumu"
    echo "  health              - Sağlık kontrolü"
    echo "  monitor             - Sürekli sağlık izleme başlat"
    echo ""
    echo "💾 YEDEK VE GERİ ALMA:"
    echo "  backup              - Manuel yedek oluştur"
    echo "  rollback            - Son yedekten geri al"
    echo "  rollback --force    - Zorla geri alma"
    echo "  list-backups        - Mevcut yedekleri listele"
    echo ""
    echo "🔧 SERVİS YÖNETİMİ:"
    echo "  start               - Servisleri başlat"
    echo "  stop                - Servisleri durdur"
    echo "  restart             - Servisleri yeniden başlat"
    echo "  logs                - Servis loglarını göster"
    echo "  logs --follow       - Logları canlı takip et"
    echo ""
    echo "🌐 NGINX YÖNETİMİ:"
    echo "  nginx-test          - Nginx konfigürasyonunu test et"
    echo "  nginx-reload        - Nginx'i yeniden yükle"
    echo "  nginx-status        - Nginx durumunu göster"
    echo ""
    echo "🔒 SSL YÖNETİMİ:"
    echo "  ssl-setup           - SSL sertifikası kur"
    echo "  ssl-renew           - SSL sertifikasını yenile"
    echo "  ssl-status          - SSL durumunu kontrol et"
    echo ""
    echo "📊 RAPORLAMA:"
    echo "  report              - Detaylı sistem raporu oluştur"
    echo "  info                - Deployment bilgilerini göster"
    echo ""
    echo "🆘 ACİL DURUM:"
    echo "  emergency-stop      - Tüm servisleri acil durdur"
    echo "  emergency-rollback  - Acil geri alma"
    echo "  cleanup             - Geçici dosyaları temizle"
    echo ""
    echo "Örnekler:"
    echo "  $0 deploy                    # Normal deployment"
    echo "  $0 deploy --dry-run          # Test deployment"
    echo "  $0 check                     # Güvenlik kontrolü"
    echo "  $0 rollback                  # Geri alma"
    echo "  $0 monitor                   # Sağlık izleme"
    echo ""
}

# Check if deployment is safe
check_deployment_safety() {
    print_info "Deployment güvenliği kontrol ediliyor..."
    
    # Check if another deployment is running
    if [ -f "$REMOTE_DIR/.deployment_lock" ]; then
        print_error "Başka bir deployment devam ediyor!"
        return 1
    fi
    
    # Check system resources
    local available_space=$(df "$REMOTE_DIR" 2>/dev/null | awk 'NR==2 {print $4}' || echo 0)
    if [ "$available_space" -lt 1048576 ]; then  # 1GB
        print_warning "Düşük disk alanı: ${available_space}KB"
    fi
    
    # Check if services are healthy
    if command -v docker >/dev/null 2>&1; then
        local unhealthy=$(docker ps --filter "health=unhealthy" --format "{{.Names}}" 2>/dev/null | wc -l)
        if [ "$unhealthy" -gt 0 ]; then
            print_warning "$unhealthy sağlıksız container tespit edildi"
        fi
    fi
    
    return 0
}

# Main command handler
case "$1" in
    "deploy")
        shift
        print_header "🚀 Güvenli Deployment Başlatılıyor"
        
        # Check safety unless forced
        if [[ "$*" != *"--force"* ]]; then
            if ! check_deployment_safety; then
                print_error "Güvenlik kontrolleri başarısız. --force ile zorla çalıştırabilirsiniz."
                exit 1
            fi
        fi
        
        # Run deployment
        if [[ "$*" == *"--dry-run"* ]]; then
            print_info "DRY RUN modu aktif - hiçbir değişiklik yapılmayacak"
            export DRY_RUN="true"
        fi
        
        exec "$SCRIPT_DIR/deploy.sh" "$@"
        ;;
        
    "check")
        print_header "🔍 Pre-Deployment Güvenlik Kontrolü"
        exec "$DEPLOY_SCRIPTS_DIR/00-pre-deployment-check.sh"
        ;;
        
    "status")
        print_header "📊 Sistem Durumu"
        echo ""
        print_info "Docker Containers:"
        docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null || print_warning "Docker erişilebilir değil"
        echo ""
        print_info "Nginx Durumu:"
        systemctl status nginx --no-pager -l | head -10
        echo ""
        print_info "Disk Kullanımı:"
        df -h "$REMOTE_DIR" 2>/dev/null || df -h /
        echo ""
        print_info "Bellek Kullanımı:"
        free -h
        ;;
        
    "health")
        print_header "🏥 Sağlık Kontrolü"
        exec "$DEPLOY_SCRIPTS_DIR/09-health-check.sh"
        ;;
        
    "monitor")
        print_header "📈 Sürekli Sağlık İzleme"
        shift
        exec "$DEPLOY_SCRIPTS_DIR/13-health-monitor.sh" "$@"
        ;;
        
    "backup")
        print_header "💾 Manuel Yedekleme"
        exec "$DEPLOY_SCRIPTS_DIR/04-backup-existing.sh"
        ;;
        
    "rollback")
        print_header "🔄 Geri Alma İşlemi"
        shift
        exec "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" "$@"
        ;;
        
    "list-backups")
        print_header "📋 Mevcut Yedekler"
        if [ -d "$BACKUP_DIR" ]; then
            ls -la "$BACKUP_DIR" | grep "deployment_"
        else
            print_warning "Yedek dizini bulunamadı: $BACKUP_DIR"
        fi
        ;;
        
    "start")
        print_header "▶️  Servisleri Başlatma"
        exec "$DEPLOY_SCRIPTS_DIR/08-start-services.sh"
        ;;
        
    "stop")
        print_header "⏹️  Servisleri Durdurma"
        exec "$DEPLOY_SCRIPTS_DIR/07-stop-services.sh"
        ;;
        
    "restart")
        print_header "🔄 Servisleri Yeniden Başlatma"
        "$DEPLOY_SCRIPTS_DIR/07-stop-services.sh"
        sleep 5
        exec "$DEPLOY_SCRIPTS_DIR/08-start-services.sh"
        ;;
        
    "logs")
        print_header "📝 Servis Logları"
        if [[ "$2" == "--follow" ]]; then
            docker-compose logs -f
        else
            docker-compose logs --tail=100
        fi
        ;;
        
    "nginx-test")
        print_header "🧪 Nginx Konfigürasyon Testi"
        nginx -t
        ;;
        
    "nginx-reload")
        print_header "🔄 Nginx Yeniden Yükleme"
        systemctl reload nginx
        print_success "Nginx yeniden yüklendi"
        ;;
        
    "nginx-status")
        print_header "🌐 Nginx Durumu"
        systemctl status nginx --no-pager -l
        ;;
        
    "ssl-setup")
        print_header "🔒 SSL Kurulumu"
        exec "$DEPLOY_SCRIPTS_DIR/10-setup-ssl.sh"
        ;;
        
    "ssl-renew")
        print_header "🔄 SSL Yenileme"
        certbot renew --nginx
        ;;
        
    "ssl-status")
        print_header "🔍 SSL Durumu"
        if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
            openssl x509 -in "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" -text -noout | grep -A 2 "Validity"
        else
            print_warning "SSL sertifikası bulunamadı"
        fi
        ;;
        
    "report")
        print_header "📊 Detaylı Sistem Raporu"
        exec "$DEPLOY_SCRIPTS_DIR/13-health-monitor.sh" --duration=60
        ;;
        
    "info")
        print_header "ℹ️  Deployment Bilgileri"
        exec "$DEPLOY_SCRIPTS_DIR/11-show-info.sh"
        ;;
        
    "emergency-stop")
        print_header "🆘 Acil Servis Durdurma"
        docker-compose down --timeout 10
        systemctl stop nginx
        print_warning "Tüm servisler acil olarak durduruldu"
        ;;
        
    "emergency-rollback")
        print_header "🆘 Acil Geri Alma"
        exec "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        ;;
        
    "cleanup")
        print_header "🧹 Temizlik İşlemi"
        rm -f "$REMOTE_DIR/.deployment_lock"
        docker system prune -f
        print_success "Temizlik tamamlandı"
        ;;
        
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
        
    *)
        print_error "Bilinmeyen komut: $1"
        echo ""
        show_usage
        exit 1
        ;;
esac
