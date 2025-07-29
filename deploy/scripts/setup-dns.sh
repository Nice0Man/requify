#!/bin/bash

# Requify DNS Setup Script
# Automatic setup of local domains for development

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Output functions
print_info() {
    echo "[INFO] $1"
}

print_success() {
    echo "[SUCCESS] $1"
}

print_warning() {
    echo "[WARNING] $1"
}

print_error() {
    echo "[ERROR] $1"
}

# Operating system detection
detect_os() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        OS="linux"
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        OS="macos"
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
        OS="windows"
    else
        print_error "Unsupported operating system: $OSTYPE"
        exit 1
    fi
}

# Check administrator privileges
check_admin() {
    if [ "$OS" = "windows" ]; then
        # For Windows check in PowerShell
        if ! powershell -Command "([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')" 2>/dev/null | grep -q "True"; then
            print_error "Administrator privileges required. Run script as administrator."
            exit 1
        fi
    else
        if [ "$EUID" -ne 0 ]; then
            print_error "Root privileges required. Run: sudo $0"
            exit 1
        fi
    fi
}

# Domains to configure
DOMAINS=(
    "requify.local"
    "api.requify.local"
    "cdn.requify.local"
    "admin.requify.local"
    "docs.requify.local"
)

# Backup and update hosts file
setup_hosts_file() {
    local hosts_file
    local backup_file
    local marker_start="# Requify Local Development - START"
    local marker_end="# Requify Local Development - END"
    
    # Determine hosts file path
    case $OS in
        "linux"|"macos")
            hosts_file="/etc/hosts"
            ;;
        "windows")
            hosts_file="/c/Windows/System32/drivers/etc/hosts"
            ;;
    esac
    
    backup_file="${hosts_file}.requify.backup.$(date +%Y%m%d_%H%M%S)"
    
    print_info "Creating hosts file backup: $backup_file"
    cp "$hosts_file" "$backup_file"
    
    print_info "Removing old Requify entries from hosts file..."
    
    # Remove old entries between markers
    if grep -q "$marker_start" "$hosts_file"; then
        # Create temporary file without our entries
        awk "
        /$marker_start/{skip=1} 
        !skip{print} 
        /$marker_end/{skip=0; next}
        " "$hosts_file" > "${hosts_file}.tmp"
        mv "${hosts_file}.tmp" "$hosts_file"
    fi
    
    print_info "Adding new Requify entries..."
    
    # Add new entries
    {
        echo ""
        echo "$marker_start"
        for domain in "${DOMAINS[@]}"; do
            echo "127.0.0.1    $domain"
        done
        echo "$marker_end"
        echo ""
    } >> "$hosts_file"
    
    print_success "Hosts file updated successfully!"
}

# Setup dnsmasq (for Linux/macOS)
setup_dnsmasq() {
    if [ "$OS" = "windows" ]; then
        print_info "dnsmasq setup skipped for Windows (using Docker container)"
        return
    fi
    
    print_info "Setting up dnsmasq..."
    
    case $OS in
        "linux")
            # Ubuntu/Debian
            if command -v apt-get &> /dev/null; then
                apt-get update
                apt-get install -y dnsmasq
            # CentOS/RHEL/Fedora
            elif command -v yum &> /dev/null; then
                yum install -y dnsmasq
            elif command -v dnf &> /dev/null; then
                dnf install -y dnsmasq
            fi
            ;;
        "macos")
            if command -v brew &> /dev/null; then
                brew install dnsmasq
            else
                print_error "Homebrew not found. Install Homebrew or dnsmasq manually."
                exit 1
            fi
            ;;
    esac
    
    # Create dnsmasq configuration
    local dnsmasq_conf="/usr/local/etc/dnsmasq.conf"
    if [ "$OS" = "linux" ]; then
        dnsmasq_conf="/etc/dnsmasq.conf"
    fi
    
    # Backup original file
    if [ -f "$dnsmasq_conf" ]; then
        cp "$dnsmasq_conf" "$dnsmasq_conf.backup.$(date +%Y%m%d_%H%M%S)"
    fi
    
    # Create our configuration
    cat > "$dnsmasq_conf" << EOF
# Requify dnsmasq configuration
listen-address=127.0.0.1
port=53
bind-interfaces
no-resolv
server=8.8.8.8
server=1.1.1.1

# Local domains
domain=requify.local
address=/requify.local/127.0.0.1
address=/api.requify.local/127.0.0.1
address=/cdn.requify.local/127.0.0.1
address=/admin.requify.local/127.0.0.1
address=/docs.requify.local/127.0.0.1

# Caching
cache-size=1000
neg-ttl=60
local-ttl=60

# Logging
log-queries
log-facility=/var/log/dnsmasq.log

# Security
bogus-priv
domain-needed
stop-dns-rebind
rebind-localhost-ok
EOF

    # Start and enable autostart
    if [ "$OS" = "linux" ]; then
        systemctl enable dnsmasq
        systemctl restart dnsmasq
        systemctl status dnsmasq --no-pager
    elif [ "$OS" = "macos" ]; then
        brew services restart dnsmasq
    fi
    
    print_success "dnsmasq configured and started!"
}

# Setup DNS resolver (macOS)
setup_resolver_macos() {
    if [ "$OS" != "macos" ]; then
        return
    fi
    
    print_info "Setting up DNS resolver for macOS..."
    
    # Create resolver directory
    mkdir -p /etc/resolver
    
    # Create resolver file for .local domains
    cat > /etc/resolver/requify.local << EOF
nameserver 127.0.0.1
port 53
EOF
    
    print_success "DNS resolver for macOS configured!"
}

# Test DNS
test_dns() {
    print_info "Testing DNS resolution..."
    
    local test_passed=true
    
    for domain in "${DOMAINS[@]}"; do
        print_info "Testing $domain..."
        
        if nslookup "$domain" >/dev/null 2>&1; then
            print_success "$domain ✓"
        else
            print_error "$domain ✗"
            test_passed=false
        fi
    done
    
    if [ "$test_passed" = true ]; then
        print_success "All domains configured correctly!"
    else
        print_warning "Some domains are not resolving. Check your settings."
    fi
}

# Show instructions
show_instructions() {
    print_info "=== ИНСТРУКЦИИ ПО ИСПОЛЬЗОВАНИЮ ==="
    echo ""
    echo "1. Локальные домены настроены:"
    for domain in "${DOMAINS[@]}"; do
        echo "   - http://$domain"
    done
    echo ""
    echo "2. Сервисы доступны по адресам:"
    echo "   - Frontend:  http://requify.local"
    echo "   - API:       http://api.requify.local"
    echo "   - CDN:       http://cdn.requify.local"
    echo "   - Admin:     http://admin.requify.local"
    echo "   - Docs:      http://docs.requify.local"
    echo ""
    echo "3. Запуск development среды:"
    echo "   cd ../docker && make dev"
    echo ""
    echo "4. Тестирование:"
    echo "   curl http://requify.local/health"
    echo "   curl http://api.requify.local/health"
    echo "   curl http://cdn.requify.local/health"
    echo ""
    print_warning "ВАЖНО: Для работы требуется запущенный Docker контейнер с nginx!"
}

# Cleanup function
cleanup_dns() {
    print_info "Cleaning up Requify DNS settings..."
    
    # Clean hosts file
    local hosts_file
    case $OS in
        "linux"|"macos")
            hosts_file="/etc/hosts"
            ;;
        "windows")
            hosts_file="/c/Windows/System32/drivers/etc/hosts"
            ;;
    esac
    
    local marker_start="# Requify Local Development - START"
    local marker_end="# Requify Local Development - END"
    
    if grep -q "$marker_start" "$hosts_file"; then
        awk "
        /$marker_start/{skip=1} 
        !skip{print} 
        /$marker_end/{skip=0; next}
        " "$hosts_file" > "${hosts_file}.tmp"
        mv "${hosts_file}.tmp" "$hosts_file"
        print_success "Entries removed from hosts file"
    fi
    
    # Stop dnsmasq
    if [ "$OS" = "linux" ]; then
        systemctl stop dnsmasq || true
        systemctl disable dnsmasq || true
    elif [ "$OS" = "macos" ]; then
        brew services stop dnsmasq || true
        rm -f /etc/resolver/requify.local || true
    fi
    
    print_success "DNS settings cleaned up!"
}

# Main function
main() {
    print_info "Requify DNS Setup Script"
    print_info "========================"
    
    # Check arguments
    case "${1:-setup}" in
        "setup")
            detect_os
            print_info "Detected OS: $OS"
            check_admin
            setup_hosts_file
            if [ "$OS" != "windows" ]; then
                setup_dnsmasq
                setup_resolver_macos
            fi
            test_dns
            show_instructions
            ;;
        "cleanup")
            detect_os
            check_admin
            cleanup_dns
            ;;
        "test")
            test_dns
            ;;
        *)
            echo "Usage: $0 [setup|cleanup|test]"
            echo "  setup   - Setup DNS (default)"
            echo "  cleanup - Clean DNS settings"
            echo "  test    - Test DNS"
            exit 1
            ;;
    esac
}

# Run
main "$@"