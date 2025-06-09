#!/bin/bash

# =============================================================================
# muhammedtarikucar.com Modular Deployment Script
# =============================================================================
# This is the main deployment orchestrator that calls individual scripts
# Server IP: 161.97.80.171
# Domain: muhammedtarikucar.com
# =============================================================================

set -e  # Exit on any error

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DEPLOY_SCRIPTS_DIR="$SCRIPT_DIR/deploy-scripts"

# Source configuration and utilities
source "$DEPLOY_SCRIPTS_DIR/config.sh"
source "$DEPLOY_SCRIPTS_DIR/utils.sh"

# Main deployment function
main() {
    echo "=============================================="
    echo "🚀 muhammedtarikucar.com Modular Deployment"
    echo "=============================================="
    echo ""

    # Check if deploy-scripts directory exists
    if [ ! -d "$DEPLOY_SCRIPTS_DIR" ]; then
        error "Deploy scripts dizini bulunamadı: $DEPLOY_SCRIPTS_DIR"
    fi

    # Execute deployment steps with enhanced safety
    log "Güvenli deployment başlatılıyor..."

    # Step 0: Pre-deployment safety check
    "$DEPLOY_SCRIPTS_DIR/00-pre-deployment-check.sh" || {
        error "Pre-deployment kontrolleri başarısız. Deployment durduruluyor."
    }

    # Step 1: Check permissions
    "$DEPLOY_SCRIPTS_DIR/01-check-permissions.sh" || {
        error "Yetki kontrolü başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 2: Check prerequisites
    "$DEPLOY_SCRIPTS_DIR/02-check-prerequisites.sh" || {
        error "Ön koşul kontrolü başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 3: Setup directories
    "$DEPLOY_SCRIPTS_DIR/03-setup-directories.sh" || {
        error "Dizin kurulumu başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 4: Backup existing deployment
    "$DEPLOY_SCRIPTS_DIR/04-backup-existing.sh" || {
        error "Yedekleme başarısız"
        exit 1
    }

    # Step 5: Deploy files
    "$DEPLOY_SCRIPTS_DIR/05-deploy-files.sh" || {
        error "Dosya deployment başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 6: Setup Nginx
    "$DEPLOY_SCRIPTS_DIR/06-setup-nginx.sh" || {
        error "Nginx kurulumu başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 7: Stop existing services
    "$DEPLOY_SCRIPTS_DIR/07-stop-services.sh" || {
        warning "Servis durdurma sırasında sorun oluştu, devam ediliyor..."
    }

    # Step 8: Start services
    "$DEPLOY_SCRIPTS_DIR/08-start-services.sh" || {
        error "Servis başlatma başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 9: Health check
    "$DEPLOY_SCRIPTS_DIR/09-health-check.sh" || {
        error "Sağlık kontrolü başarısız"
        "$DEPLOY_SCRIPTS_DIR/12-rollback.sh" --force
        exit 1
    }

    # Step 10: Setup SSL
    "$DEPLOY_SCRIPTS_DIR/10-setup-ssl.sh" || {
        warning "SSL kurulumu başarısız, HTTP modunda devam ediliyor"
    }

    # Step 11: Show deployment info
    "$DEPLOY_SCRIPTS_DIR/11-show-info.sh"

    # Step 12: Start continuous health monitoring (background)
    log "Sürekli sağlık izleme başlatılıyor..."
    nohup "$DEPLOY_SCRIPTS_DIR/13-health-monitor.sh" --continuous > "$LOG_DIR/health-monitor.log" 2>&1 &
    local monitor_pid=$!
    echo $monitor_pid > "$REMOTE_DIR/.health_monitor_pid"
    success "Sağlık izleme başlatıldı (PID: $monitor_pid)"

    # Clean up deployment lock
    rm -f "$REMOTE_DIR/.deployment_lock"

    # Update deployment state
    if [ -f "$REMOTE_DIR/.deployment_state" ]; then
        sed -i 's/DEPLOYMENT_STATUS=.*/DEPLOYMENT_STATUS=COMPLETED/' "$REMOTE_DIR/.deployment_state"
        echo "DEPLOYMENT_COMPLETED=$(date)" >> "$REMOTE_DIR/.deployment_state"
    fi

    echo ""
    echo "=============================================="
    success "🎉 Deployment başarıyla tamamlandı!"
    echo "=============================================="
}

# Show usage information
usage() {
    echo "Kullanım: $0 [OPTION]"
    echo ""
    echo "Seçenekler:"
    echo "  --help, -h          Bu yardım mesajını göster"
    echo "  --dry-run          Sadece kontrol yap, değişiklik yapma"
    echo "  --skip-ssl         SSL kurulumunu atla"
    echo "  --skip-backup      Yedekleme işlemini atla"
    echo ""
    echo "Örnekler:"
    echo "  $0                 Tam deployment yap"
    echo "  $0 --dry-run       Sadece kontrol yap"
    echo "  $0 --skip-ssl      SSL olmadan deploy et"
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --help|-h)
            usage
            exit 0
            ;;
        --dry-run)
            export DRY_RUN=true
            shift
            ;;
        --skip-ssl)
            export SKIP_SSL=true
            shift
            ;;
        --skip-backup)
            export SKIP_BACKUP=true
            shift
            ;;
        *)
            error "Bilinmeyen parametre: $1. --help kullanarak yardım alın."
            ;;
    esac
done

# Run main function
main "$@"
