#!/bin/bash

# =============================================================================
# SSH Connection Test Script
# =============================================================================
# Bu script GitHub Actions'da SSH bağlantısını test eder
# =============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Server details
SERVER_IP="161.97.80.171"
DEPLOY_USER="root"
DOMAIN="muhammedtarikucar.com"

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')] INFO: $1${NC}"
}

success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] SUCCESS: $1${NC}"
}

warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}"
    exit 1
}

# Test SSH connection
test_ssh_connection() {
    log "SSH bağlantısı test ediliyor..."
    
    # Test basic connection
    if ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 $DEPLOY_USER@$SERVER_IP "echo 'SSH connection successful'"; then
        success "SSH bağlantısı başarılı"
    else
        error "SSH bağlantısı başarısız"
    fi
    
    # Test command execution
    log "Komut çalıştırma test ediliyor..."
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$SERVER_IP "whoami && pwd && date"; then
        success "Komut çalıştırma başarılı"
    else
        error "Komut çalıştırma başarısız"
    fi
    
    # Test directory access
    log "Dizin erişimi test ediliyor..."
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$SERVER_IP "ls -la /opt/ && mkdir -p /opt/test-ssh && rm -rf /opt/test-ssh"; then
        success "Dizin erişimi başarılı"
    else
        error "Dizin erişimi başarısız"
    fi
    
    # Test Docker access
    log "Docker erişimi test ediliyor..."
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$SERVER_IP "docker --version && docker ps"; then
        success "Docker erişimi başarılı"
    else
        warning "Docker erişimi başarısız"
    fi
    
    # Test Git access
    log "Git erişimi test ediliyor..."
    if ssh -o StrictHostKeyChecking=no $DEPLOY_USER@$SERVER_IP "git --version"; then
        success "Git erişimi başarılı"
    else
        warning "Git erişimi başarısız"
    fi
}

# Setup SSH for GitHub Actions
setup_ssh_for_github() {
    log "GitHub Actions için SSH kurulumu..."
    
    # Create SSH directory
    mkdir -p ~/.ssh
    chmod 700 ~/.ssh
    
    # Add server to known hosts
    log "Server known hosts'a ekleniyor..."
    ssh-keyscan -H $SERVER_IP >> ~/.ssh/known_hosts
    ssh-keyscan -H $DOMAIN >> ~/.ssh/known_hosts
    chmod 644 ~/.ssh/known_hosts
    
    # Create SSH config
    log "SSH config oluşturuluyor..."
    cat > ~/.ssh/config << EOF
Host $SERVER_IP
  HostName $SERVER_IP
  User $DEPLOY_USER
  Port 22
  StrictHostKeyChecking no
  UserKnownHostsFile ~/.ssh/known_hosts
  ServerAliveInterval 60
  ServerAliveCountMax 3
  ConnectTimeout 10

Host $DOMAIN
  HostName $SERVER_IP
  User $DEPLOY_USER
  Port 22
  StrictHostKeyChecking no
  UserKnownHostsFile ~/.ssh/known_hosts
  ServerAliveInterval 60
  ServerAliveCountMax 3
  ConnectTimeout 10
EOF
    chmod 600 ~/.ssh/config
    
    success "SSH kurulumu tamamlandı"
}

# Show SSH debug info
show_ssh_debug() {
    log "SSH debug bilgileri:"
    echo ""
    echo "🔑 SSH Agent:"
    ssh-add -l || echo "SSH agent'da key yok"
    echo ""
    echo "📁 SSH Directory:"
    ls -la ~/.ssh/ || echo "SSH dizini yok"
    echo ""
    echo "🌐 Known Hosts:"
    if [ -f ~/.ssh/known_hosts ]; then
        grep -E "(161\.97\.80\.171|muhammedtarikucar\.com)" ~/.ssh/known_hosts || echo "Server known hosts'da yok"
    else
        echo "Known hosts dosyası yok"
    fi
    echo ""
    echo "⚙️ SSH Config:"
    if [ -f ~/.ssh/config ]; then
        cat ~/.ssh/config
    else
        echo "SSH config dosyası yok"
    fi
}

# Main function
main() {
    echo "=============================================="
    echo "🔧 SSH Connection Test"
    echo "=============================================="
    echo "🌐 Server: $SERVER_IP"
    echo "👤 User: $DEPLOY_USER"
    echo "🌍 Domain: $DOMAIN"
    echo "=============================================="
    echo ""
    
    # Show debug info
    show_ssh_debug
    
    echo ""
    echo "=============================================="
    echo "🧪 Testing SSH Connection"
    echo "=============================================="
    
    # Setup SSH if needed
    if [ "$1" = "--setup" ]; then
        setup_ssh_for_github
        echo ""
    fi
    
    # Test connection
    test_ssh_connection
    
    echo ""
    echo "=============================================="
    success "🎉 SSH test tamamlandı!"
    echo "=============================================="
}

# Show usage
usage() {
    echo "Kullanım: $0 [OPTION]"
    echo ""
    echo "SSH bağlantı test scripti"
    echo ""
    echo "Seçenekler:"
    echo "  --setup             SSH kurulumu yap"
    echo "  --help, -h          Bu yardım mesajını göster"
    echo ""
    echo "Örnekler:"
    echo "  $0                  SSH bağlantısını test et"
    echo "  $0 --setup          SSH kurulumu yap ve test et"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        usage
        exit 0
        ;;
    --setup)
        main --setup
        ;;
    "")
        main
        ;;
    *)
        error "Bilinmeyen parametre: $1. --help kullanarak yardım alın."
        ;;
esac
