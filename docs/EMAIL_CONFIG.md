# Email Configuration Guide

## Problem: No Emails Being Sent

If you're experiencing issues with emails not being sent (password reset emails, etc.), this is likely due to missing or incorrect email configuration.

## Quick Setup Options

### 🐳 Option 1: Docker Development Setup (Recommended for Development)

The easiest way to test email functionality is using our Docker setup with MailHog:

```bash
# Start development environment with email testing
./scripts/start-with-email.sh
```

This will start MailHog email server that captures all emails. Access the web interface at http://localhost:8025

### ⚙️ Option 2: Interactive SMTP Setup

Use our setup script to configure real SMTP providers:

```bash
# Run the interactive setup script
./scripts/setup-smtp.sh
```

### 🔧 Option 3: Manual Configuration

The email service is currently configured to use console output instead of SMTP. To enable actual email sending, you need to configure SMTP settings manually.

## Configuration Options

### 1. Environment Variables (.env file)

Create a `.env` file in the backend directory with these settings:

```bash
# Gmail Configuration (recommended for development)
APP_CONFIG__EMAIL__SMTP_HOST=smtp.gmail.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@gmail.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-app-password
APP_CONFIG__EMAIL__SMTP_TLS=true
APP_CONFIG__EMAIL__FROM_EMAIL=noreply@yourdomain.com
APP_CONFIG__EMAIL__FROM_NAME=Requify System
```

### 2. Gmail Setup

For Gmail, you'll need to:
1. Enable 2-factor authentication
2. Generate an "App Password" (not your regular password)
3. Use the app password in the configuration

### 3. Alternative SMTP Providers

#### SendGrid
```bash
APP_CONFIG__EMAIL__SMTP_HOST=smtp.sendgrid.net
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=apikey
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-sendgrid-api-key
```

#### AWS SES
```bash
APP_CONFIG__EMAIL__SMTP_HOST=email-smtp.us-east-1.amazonaws.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-aws-access-key
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-aws-secret-key
```

#### Outlook/Hotmail
```bash
APP_CONFIG__EMAIL__SMTP_HOST=smtp-mail.outlook.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@outlook.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-password
```

## Development vs Production

- **Development**: If SMTP settings are not configured, emails will be printed to console
- **Production**: SMTP settings are required for actual email delivery

## Testing Email Configuration

1. Configure your SMTP settings
2. Restart the backend server
3. Check the logs for: "Email service initialized with SMTP_HOST: ..."
4. Try the password reset feature
5. Check logs for email sending confirmation

## Troubleshooting

### Console Output Instead of Email
- **Cause**: SMTP_HOST is empty or set to "localhost"
- **Fix**: Set proper SMTP_HOST value

### SMTP Authentication Error
- **Cause**: Wrong username/password or security settings
- **Fix**: Verify credentials and enable "Less secure app access" or use app passwords

### Connection Timeout
- **Cause**: Firewall or wrong port
- **Fix**: Check firewall settings and verify port (usually 587 for TLS, 465 for SSL)

## Docker Development Setup Details

### MailHog Configuration

When using Docker development setup, MailHog is automatically configured:

- **SMTP Server**: `mailhog:1025` (internal Docker network)
- **Web Interface**: http://localhost:8025
- **Features**: 
  - Captures all outgoing emails
  - Web-based email viewer
  - No actual emails are sent
  - Perfect for development and testing

### Starting with Docker

```bash
# Option 1: Use our convenience script
./scripts/start-with-email.sh

# Option 2: Manual Docker Compose
cd deploy/docker
docker-compose -f docker-compose.dev.yml up -d
```

### Environment Files

The project includes several environment templates:

- `backend/env.example` - Template with all options
- `backend/env.development` - Pre-configured for MailHog
- `backend/env.production` - Template for production SMTP

## Current Status Check

The system will log the email configuration on startup. Look for:
```
Email service initialized with SMTP_HOST: <host>, CONSOLE_BACKEND: <true/false>
```

If CONSOLE_BACKEND is `true`, emails will be printed to console instead of sent. 