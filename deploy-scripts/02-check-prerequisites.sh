#!/bin/bash

# =============================================================================
# Step 2: Check Prerequisites
# =============================================================================
# Bu script deployment için gerekli yazılımları kontrol eder ve kurar
# =============================================================================

# Get script directory and source dependencies
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/utils.sh"

# Function to compare versions
version_compare() {
    local version1="$1"
    local version2="$2"
    
    if [[ "$version1" == "$version2" ]]; then
        return 0
    fi
    
    local IFS=.
    local i ver1=($version1) ver2=($version2)
    
    # Fill empty fields in ver1 with zeros
    for ((i=${#ver1[@]}; i<${#ver2[@]}; i++)); do
        ver1[i]=0
    done
    
    for ((i=0; i<${#ver1[@]}; i++)); do
        if [[ -z ${ver2[i]} ]]; then
            ver2[i]=0
        fi
        if ((10#${ver1[i]} > 10#${ver2[i]})); then
            return 1
        fi
        if ((10#${ver1[i]} < 10#${ver2[i]})); then
            return 2
        fi
    done
    return 0
}

# Function to install Docker
install_docker() {
    log "Docker kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker kurulacak"
        return 0
    fi
    
    # Update package index
    apt-get update
    
    # Install required packages
    apt-get install -y \
        apt-transport-https \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    
    # Set up the stable repository
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Update package index again
    apt-get update
    
    # Install Docker Engine
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    # Add deploy user to docker group
    if [ "$DEPLOY_USER" != "root" ]; then
        usermod -aG docker "$DEPLOY_USER"
    fi
    
    success "Docker kuruldu"
}

# Function to install Docker Compose
install_docker_compose() {
    log "Docker Compose kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Docker Compose kurulacak"
        return 0
    fi
    
    # Get latest version
    local latest_version=$(curl -s https://api.github.com/repos/docker/compose/releases/latest | grep -Po '"tag_name": "\K.*?(?=")')
    
    # Download and install
    curl -L "https://github.com/docker/compose/releases/download/${latest_version}/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    
    # Make executable
    chmod +x /usr/local/bin/docker-compose
    
    # Create symlink
    ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    success "Docker Compose kuruldu: $latest_version"
}

# Function to install Nginx
install_nginx() {
    log "Nginx kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Nginx kurulacak"
        return 0
    fi
    
    # Update package index
    apt-get update
    
    # Install Nginx
    apt-get install -y nginx
    
    # Start and enable Nginx
    systemctl start nginx
    systemctl enable nginx
    
    # Create log directory
    mkdir -p "$LOG_DIR"
    chown www-data:www-data "$LOG_DIR"
    
    success "Nginx kuruldu"
}

# Function to install Certbot
install_certbot() {
    log "Certbot kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Certbot kurulacak"
        return 0
    fi
    
    # Update package index
    apt-get update
    
    # Install Certbot and Nginx plugin
    apt-get install -y certbot python3-certbot-nginx
    
    success "Certbot kuruldu"
}

# Function to install additional tools
install_additional_tools() {
    log "Ek araçlar kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Ek araçlar kurulacak"
        return 0
    fi
    
    # Update package index
    apt-get update
    
    # Install useful tools
    apt-get install -y \
        curl \
        wget \
        git \
        unzip \
        htop \
        tree \
        jq \
        nc \
        lsof \
        rsync \
        fail2ban \
        ufw \
        logrotate
    
    success "Ek araçlar kuruldu"
}

# Function to setup firewall
setup_firewall() {
    if [[ "$UFW_ENABLED" != "true" ]]; then
        return 0
    fi
    
    log "Firewall kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Firewall kurulacak"
        return 0
    fi
    
    # Reset UFW to defaults
    ufw --force reset
    
    # Set default policies
    ufw default deny incoming
    ufw default allow outgoing
    
    # Allow SSH
    ufw allow ssh
    
    # Allow HTTP and HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Allow application ports
    ufw allow "$FRONTEND_PORT"/tcp
    ufw allow "$BACKEND_PORT"/tcp
    
    # Enable UFW
    ufw --force enable
    
    success "Firewall kuruldu"
}

# Function to setup fail2ban
setup_fail2ban() {
    if [[ "$FAIL2BAN_ENABLED" != "true" ]]; then
        return 0
    fi
    
    log "Fail2ban kuruluyor..."
    
    if [[ "$DRY_RUN" == "true" ]]; then
        info "[DRY RUN] Fail2ban kurulacak"
        return 0
    fi
    
    # Create jail configuration
    cat > /etc/fail2ban/jail.local << EOF
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log

[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log

[nginx-limit-req]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 10
EOF
    
    # Start and enable fail2ban
    systemctl start fail2ban
    systemctl enable fail2ban
    
    success "Fail2ban kuruldu"
}

main() {
    log "Adım 2: Ön koşul kontrolü başlatılıyor..."
    
    # Check and install Docker
    if ! command_exists docker; then
        warning "Docker kurulu değil"
        install_docker
    else
        local docker_version=$(docker --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        version_compare "$docker_version" "$MIN_DOCKER_VERSION"
        local result=$?
        
        if [ $result -eq 2 ]; then
            warning "Docker versiyonu eski: $docker_version (minimum: $MIN_DOCKER_VERSION)"
            install_docker
        else
            success "Docker kurulu: $docker_version"
        fi
    fi
    
    # Check and install Docker Compose
    local compose_cmd=""
    if command_exists docker-compose; then
        compose_cmd="docker-compose"
    elif docker compose version &>/dev/null; then
        compose_cmd="docker compose"
    fi
    
    if [ -z "$compose_cmd" ]; then
        warning "Docker Compose kurulu değil"
        install_docker_compose
    else
        local compose_version=$($compose_cmd --version | grep -oP '\d+\.\d+\.\d+' | head -1)
        version_compare "$compose_version" "$MIN_COMPOSE_VERSION"
        local result=$?
        
        if [ $result -eq 2 ]; then
            warning "Docker Compose versiyonu eski: $compose_version (minimum: $MIN_COMPOSE_VERSION)"
            install_docker_compose
        else
            success "Docker Compose kurulu: $compose_version"
        fi
    fi
    
    # Check and install Nginx
    if ! command_exists nginx; then
        warning "Nginx kurulu değil"
        install_nginx
    else
        local nginx_version=$(nginx -v 2>&1 | grep -oP '\d+\.\d+\.\d+')
        version_compare "$nginx_version" "$MIN_NGINX_VERSION"
        local result=$?
        
        if [ $result -eq 2 ]; then
            warning "Nginx versiyonu eski: $nginx_version (minimum: $MIN_NGINX_VERSION)"
            install_nginx
        else
            success "Nginx kurulu: $nginx_version"
        fi
    fi
    
    # Check and install Certbot
    if ! command_exists certbot; then
        warning "Certbot kurulu değil"
        install_certbot
    else
        success "Certbot kurulu: $(certbot --version | grep -oP '\d+\.\d+\.\d+')"
    fi
    
    # Install additional tools
    install_additional_tools
    
    # Setup firewall
    setup_firewall
    
    # Setup fail2ban
    setup_fail2ban
    
    # Verify all installations
    log "Kurulumlar doğrulanıyor..."
    
    local required_commands=("docker" "nginx" "certbot" "curl" "git")
    
    for cmd in "${required_commands[@]}"; do
        if ! command_exists "$cmd"; then
            error "$cmd kurulumu başarısız"
        fi
        debug "$cmd kurulumu OK"
    done
    
    # Check if Docker daemon is running
    if ! docker ps &>/dev/null; then
        error "Docker daemon çalışmıyor"
    fi
    
    success "Docker daemon çalışıyor"
    
    # Check if Nginx is running
    if ! service_running nginx; then
        warning "Nginx çalışmıyor, başlatılıyor..."
        if [[ "$DRY_RUN" != "true" ]]; then
            systemctl start nginx
            sleep 2  # Wait for service to start

            if service_running nginx; then
                success "Nginx başarıyla başlatıldı"
            else
                error "Nginx başlatılamadı"
            fi
        fi
    else
        success "Nginx zaten çalışıyor"
    fi
    
    success "Adım 2: Ön koşul kontrolü tamamlandı"
    
    # Send notification
    send_notification "Ön koşullar başarıyla kontrol edildi ve kuruldu" "success"
}

# Run main function
main "$@"
