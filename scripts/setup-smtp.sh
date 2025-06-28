#!/bin/bash

# =============================================================================
# SMTP Configuration Setup Script for Requify
# =============================================================================

set -e

echo "🔧 Requify SMTP Configuration Setup"
echo "===================================="
echo

# Function to prompt for input with default value
prompt_with_default() {
    local prompt="$1"
    local default="$2"
    local var_name="$3"
    
    if [ -n "$default" ]; then
        read -p "$prompt [$default]: " input
        eval "$var_name=\"\${input:-$default}\""
    else
        read -p "$prompt: " input
        eval "$var_name=\"$input\""
    fi
}

# Function to prompt for password (hidden input)
prompt_password() {
    local prompt="$1"
    local var_name="$2"
    
    read -s -p "$prompt: " input
    echo
    eval "$var_name=\"$input\""
}

echo "Select SMTP Provider:"
echo "1) Gmail"
echo "2) SendGrid"
echo "3) AWS SES"
echo "4) Outlook/Office365"
echo "5) Custom SMTP Server"
echo "6) MailHog (Development only)"
echo

read -p "Choose option (1-6): " provider_choice

case $provider_choice in
    1)
        echo
        echo "📧 Gmail Configuration"
        echo "====================="
        echo "Note: You'll need to:"
        echo "1. Enable 2-factor authentication on your Gmail account"
        echo "2. Generate an App Password (not your regular password)"
        echo "3. Use the App Password in the configuration"
        echo
        
        SMTP_HOST="smtp.gmail.com"
        SMTP_PORT="587"
        SMTP_TLS="true"
        SMTP_SSL="false"
        
        prompt_with_default "Gmail address" "" "SMTP_USER"
        prompt_password "App Password (not regular password)" "SMTP_PASSWORD"
        prompt_with_default "From email address" "$SMTP_USER" "FROM_EMAIL"
        prompt_with_default "From name" "Requify System" "FROM_NAME"
        ;;
        
    2)
        echo
        echo "📧 SendGrid Configuration"
        echo "========================"
        echo "Note: You'll need your SendGrid API key"
        echo
        
        SMTP_HOST="smtp.sendgrid.net"
        SMTP_PORT="587"
        SMTP_TLS="true"
        SMTP_SSL="false"
        SMTP_USER="apikey"
        
        prompt_password "SendGrid API Key" "SMTP_PASSWORD"
        prompt_with_default "From email address" "" "FROM_EMAIL"
        prompt_with_default "From name" "Requify System" "FROM_NAME"
        ;;
        
    3)
        echo
        echo "📧 AWS SES Configuration"
        echo "========================"
        echo "Note: You'll need AWS Access Key and Secret Key with SES permissions"
        echo
        
        prompt_with_default "AWS Region" "us-east-1" "AWS_REGION"
        SMTP_HOST="email-smtp.$AWS_REGION.amazonaws.com"
        SMTP_PORT="587"
        SMTP_TLS="true"
        SMTP_SSL="false"
        
        prompt_with_default "AWS Access Key ID" "" "SMTP_USER"
        prompt_password "AWS Secret Access Key" "SMTP_PASSWORD"
        prompt_with_default "From email address" "" "FROM_EMAIL"
        prompt_with_default "From name" "Requify System" "FROM_NAME"
        ;;
        
    4)
        echo
        echo "📧 Outlook/Office365 Configuration"
        echo "=================================="
        
        SMTP_HOST="smtp-mail.outlook.com"
        SMTP_PORT="587"
        SMTP_TLS="true"
        SMTP_SSL="false"
        
        prompt_with_default "Outlook email address" "" "SMTP_USER"
        prompt_password "Password" "SMTP_PASSWORD"
        prompt_with_default "From email address" "$SMTP_USER" "FROM_EMAIL"
        prompt_with_default "From name" "Requify System" "FROM_NAME"
        ;;
        
    5)
        echo
        echo "📧 Custom SMTP Server Configuration"
        echo "==================================="
        
        prompt_with_default "SMTP Host" "" "SMTP_HOST"
        prompt_with_default "SMTP Port" "587" "SMTP_PORT"
        prompt_with_default "Username" "" "SMTP_USER"
        prompt_password "Password" "SMTP_PASSWORD"
        prompt_with_default "Use TLS" "true" "SMTP_TLS"
        prompt_with_default "Use SSL" "false" "SMTP_SSL"
        prompt_with_default "From email address" "" "FROM_EMAIL"
        prompt_with_default "From name" "Requify System" "FROM_NAME"
        ;;
        
    6)
        echo
        echo "📧 MailHog Development Configuration"
        echo "==================================="
        echo "This is for development only - emails will be captured by MailHog"
        
        SMTP_HOST="mailhog"
        SMTP_PORT="1025"
        SMTP_USER=""
        SMTP_PASSWORD=""
        SMTP_TLS="false"
        SMTP_SSL="false"
        FROM_EMAIL="noreply@requify.local"
        FROM_NAME="Requify Development"
        ;;
        
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo
echo "📄 Generating environment configuration..."

# Determine environment file based on current directory
if [ -f "../backend/env.development" ]; then
    ENV_FILE="../backend/.env"
elif [ -f "./backend/env.development" ]; then
    ENV_FILE="./backend/.env"
elif [ -f "./env.development" ]; then
    ENV_FILE="./.env"
else
    ENV_FILE="./.env"
fi

# Create or update .env file
cat > "$ENV_FILE" << EOF
# Email Configuration - Generated by setup-smtp.sh
APP_CONFIG__EMAIL__SMTP_HOST=$SMTP_HOST
APP_CONFIG__EMAIL__SMTP_PORT=$SMTP_PORT
APP_CONFIG__EMAIL__SMTP_USER=$SMTP_USER
APP_CONFIG__EMAIL__SMTP_PASSWORD=$SMTP_PASSWORD
APP_CONFIG__EMAIL__SMTP_TLS=$SMTP_TLS
APP_CONFIG__EMAIL__SMTP_SSL=$SMTP_SSL
APP_CONFIG__EMAIL__FROM_EMAIL=$FROM_EMAIL
APP_CONFIG__EMAIL__FROM_NAME=$FROM_NAME

# Add other configuration variables as needed
APP_CONFIG__ENV=development
EOF

echo "✅ Configuration saved to: $ENV_FILE"
echo
echo "🧪 Testing email configuration..."

# Test the configuration if Python is available
if command -v python3 &> /dev/null; then
    if [ -f "./backend/test_email.py" ]; then
        cd backend && python3 test_email.py
    elif [ -f "./test_email.py" ]; then
        python3 test_email.py
    else
        echo "⚠️  Email test script not found. Please run it manually."
    fi
else
    echo "⚠️  Python3 not found. Please test email configuration manually."
fi

echo
echo "🚀 Next steps:"
echo "1. Restart your application to load the new configuration"
echo "2. Test email functionality (registration, password reset, etc.)"

if [ "$provider_choice" = "6" ]; then
    echo "3. Access MailHog web interface at: http://localhost:8025"
fi

echo
echo "📚 For more information, see: backend/EMAIL_CONFIG.md" 