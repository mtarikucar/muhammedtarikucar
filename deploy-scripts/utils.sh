#!/bin/bash

# =============================================================================
# Deployment Utilities
# =============================================================================
# Bu dosya tüm deployment scriptleri tarafından kullanılan
# yardımcı fonksiyonları içerir
# =============================================================================

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
    exit 1
}

debug() {
    if [[ "$DEBUG_MODE" == "true" || "$VERBOSE_LOGGING" == "true" ]]; then
        echo -e "${PURPLE}🐛 [DEBUG] $1${NC}"
    fi
}

# Progress indicator
show_progress() {
    local message="$1"
    local duration="${2:-3}"
    
    echo -n "$message"
    for i in $(seq 1 $duration); do
        echo -n "."
        sleep 1
    done
    echo " ✓"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if service is running
service_running() {
    systemctl is-active --quiet "$1"
}

# Check if port is open
port_open() {
    local port="$1"
    local host="${2:-localhost}"
    
    if command_exists nc; then
        nc -z "$host" "$port" >/dev/null 2>&1
    elif command_exists telnet; then
        timeout 5 telnet "$host" "$port" >/dev/null 2>&1
    else
        # Fallback using /dev/tcp
        timeout 5 bash -c "echo >/dev/tcp/$host/$port" >/dev/null 2>&1
    fi
}

# Wait for service to be ready
wait_for_service() {
    local service_name="$1"
    local port="$2"
    local host="${3:-localhost}"
    local timeout="${4:-60}"
    local interval="${5:-5}"
    
    log "Servis bekleniyor: $service_name (port: $port)"
    
    local elapsed=0
    while [ $elapsed -lt $timeout ]; do
        if port_open "$port" "$host"; then
            success "$service_name hazır (port: $port)"
            return 0
        fi
        
        debug "Bekleniyor... ($elapsed/$timeout saniye)"
        sleep $interval
        elapsed=$((elapsed + interval))
    done
    
    error "$service_name $timeout saniye içinde hazır olmadı"
}

# Check disk space
check_disk_space() {
    local path="${1:-/}"
    local required_gb="${2:-$MIN_DISK_SPACE_GB}"
    
    local available_gb=$(df -BG "$path" | awk 'NR==2 {print $4}' | sed 's/G//')
    
    if [ "$available_gb" -lt "$required_gb" ]; then
        error "Yetersiz disk alanı. Gerekli: ${required_gb}GB, Mevcut: ${available_gb}GB"
    fi
    
    success "Disk alanı yeterli: ${available_gb}GB mevcut"
}

# Check memory
check_memory() {
    local required_mb="${1:-$MIN_RAM_MB}"
    
    local available_mb=$(free -m | awk 'NR==2{print $7}')
    
    if [ "$available_mb" -lt "$required_mb" ]; then
        warning "Düşük bellek. Gerekli: ${required_mb}MB, Mevcut: ${available_mb}MB"
    else
        success "Bellek yeterli: ${available_mb}MB mevcut"
    fi
}

# Backup function
create_backup() {
    local source_dir="$1"
    local backup_name="${2:-backup_$(date +%Y%m%d_%H%M%S)}"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    if [ ! -d "$source_dir" ]; then
        warning "Yedeklenecek dizin bulunamadı: $source_dir"
        return 1
    fi
    
    log "Yedek oluşturuluyor: $backup_name"
    
    mkdir -p "$BACKUP_DIR"
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Yedek oluşturulacak: $backup_path"
        return 0
    fi
    
    cp -r "$source_dir" "$backup_path"
    
    if [ $? -eq 0 ]; then
        success "Yedek oluşturuldu: $backup_path"
        
        # Compress backup
        tar -czf "${backup_path}.tar.gz" -C "$BACKUP_DIR" "$backup_name"
        rm -rf "$backup_path"
        
        success "Yedek sıkıştırıldı: ${backup_path}.tar.gz"
    else
        error "Yedek oluşturulamadı"
    fi
}

# Cleanup old backups
cleanup_old_backups() {
    local max_backups="${1:-$MAX_BACKUPS}"
    local retention_days="${2:-$BACKUP_RETENTION_DAYS}"
    
    if [ ! -d "$BACKUP_DIR" ]; then
        return 0
    fi
    
    log "Eski yedekler temizleniyor..."
    
    # Remove backups older than retention days
    find "$BACKUP_DIR" -name "*.tar.gz" -mtime +$retention_days -delete
    
    # Keep only max_backups newest backups
    local backup_count=$(ls -1 "$BACKUP_DIR"/*.tar.gz 2>/dev/null | wc -l)
    
    if [ "$backup_count" -gt "$max_backups" ]; then
        local to_remove=$((backup_count - max_backups))
        ls -1t "$BACKUP_DIR"/*.tar.gz | tail -n $to_remove | xargs rm -f
        success "$to_remove eski yedek silindi"
    fi
}

# Docker helper functions
docker_cleanup() {
    log "Docker temizliği yapılıyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker temizliği yapılacak"
        return 0
    fi
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes
    docker volume prune -f
    
    # Remove unused networks
    docker network prune -f
    
    success "Docker temizliği tamamlandı"
}

# Health check function
health_check_url() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-10}"
    
    local status_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time $timeout "$url" || echo "000")
    
    if [ "$status_code" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Send notification (if configured)
send_notification() {
    local message="$1"
    local level="${2:-info}"
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        local emoji="ℹ️"
        case $level in
            success) emoji="✅" ;;
            warning) emoji="⚠️" ;;
            error) emoji="❌" ;;
        esac
        
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"$emoji $PROJECT_NAME: $message\"}" \
            "$SLACK_WEBHOOK_URL" >/dev/null 2>&1
    fi
    
    # Email notification (if configured)
    if [[ "$EMAIL_NOTIFICATIONS" == "true" ]] && command_exists mail; then
        echo "$message" | mail -s "[$PROJECT_NAME] Deployment $level" "$SSL_EMAIL"
    fi
}

# Validate configuration
validate_config() {
    local errors=0
    
    # Check required variables
    local required_vars=(
        "SERVER_IP" "DOMAIN" "PROJECT_NAME" "DEPLOY_USER"
        "REMOTE_DIR" "BACKUP_DIR" "FRONTEND_PORT" "BACKEND_PORT"
    )
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            error "Gerekli konfigürasyon eksik: $var"
            errors=$((errors + 1))
        fi
    done
    
    # Validate IP address
    if ! [[ "$SERVER_IP" =~ ^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$ ]]; then
        error "Geçersiz IP adresi: $SERVER_IP"
        errors=$((errors + 1))
    fi
    
    # Validate domain
    if ! [[ "$DOMAIN" =~ ^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$ ]]; then
        error "Geçersiz domain: $DOMAIN"
        errors=$((errors + 1))
    fi
    
    if [ $errors -gt 0 ]; then
        error "Konfigürasyon doğrulaması başarısız: $errors hata"
    fi
    
    success "Konfigürasyon doğrulandı"
}

# Print system information
print_system_info() {
    log "Sistem bilgileri:"
    echo "  OS: $(lsb_release -d 2>/dev/null | cut -f2 || uname -s)"
    echo "  Kernel: $(uname -r)"
    echo "  Architecture: $(uname -m)"
    echo "  CPU Cores: $(nproc)"
    echo "  Memory: $(free -h | awk 'NR==2{print $2}')"
    echo "  Disk Space: $(df -h / | awk 'NR==2{print $4}') available"
    echo "  Docker: $(docker --version 2>/dev/null || echo 'Not installed')"
    echo "  Docker Compose: $(docker-compose --version 2>/dev/null || docker compose version 2>/dev/null || echo 'Not installed')"
    echo "  Nginx: $(nginx -v 2>&1 | cut -d' ' -f3 2>/dev/null || echo 'Not installed')"
}

echo "✅ Yardımcı fonksiyonlar yüklendi"
