# 📧 SMTP Configuration for Requify

This guide helps you set up email functionality in Requify for development and production environments.

## 🚀 Quick Start (Development)

### Option 1: Docker with MailHog (Recommended)

The fastest way to get email testing working:

```bash
# Start development environment with email testing
./scripts/start-with-email.sh
```

**What this does:**
- Starts all services (database, backend, frontend, etc.)
- Includes MailHog email testing server
- Captures all emails in a web interface
- No real emails are sent

**Access points:**
- 📧 MailHog Web UI: http://localhost:8025
- 🔧 Backend API: http://localhost:8000
- 📱 Frontend: http://localhost:3000

### Option 2: Interactive Setup Script

Configure real SMTP providers (Gmail, SendGrid, AWS SES, etc.):

```bash
./scripts/setup-smtp.sh
```

This script will:
- Guide you through provider selection
- Generate the correct configuration
- Test the email setup
- Create the `.env` file

## 📋 Supported SMTP Providers

| Provider | Setup Difficulty | Cost | Notes |
|----------|------------------|------|-------|
| **MailHog** | ✅ Easy | Free | Development only |
| **Gmail** | ✅ Easy | Free | Requires app password |
| **SendGrid** | ⚠️ Medium | Free tier | API key required |
| **AWS SES** | ⚠️ Medium | Pay per email | AWS account needed |
| **Outlook** | ✅ Easy | Free | Office365 account |

## 🔧 Manual Configuration

### Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
# For Development (MailHog)
APP_CONFIG__EMAIL__SMTP_HOST=mailhog
APP_CONFIG__EMAIL__SMTP_PORT=1025
APP_CONFIG__EMAIL__SMTP_TLS=false
APP_CONFIG__EMAIL__FROM_EMAIL=noreply@requify.local

# For Production (Gmail example)
APP_CONFIG__EMAIL__SMTP_HOST=smtp.gmail.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@gmail.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-app-password
APP_CONFIG__EMAIL__SMTP_TLS=true
APP_CONFIG__EMAIL__FROM_EMAIL=noreply@yourdomain.com
```

### Gmail Setup Steps

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Use App Password** (not your regular password) in configuration

### Testing Configuration

```bash
# Test email configuration
cd backend
python test_email.py
```

## 🐳 Docker Configuration

### Development Environment

The development Docker Compose includes MailHog:

```yaml
# docker-compose.dev.yml includes:
mailhog:
  image: mailhog/mailhog:latest
  ports:
    - "1025:1025"  # SMTP
    - "8025:8025"  # Web UI
```

### Production Environment

For production, configure environment variables in your deployment:

```bash
# Production environment variables
APP_CONFIG__EMAIL__SMTP_HOST=smtp.gmail.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@gmail.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-app-password
APP_CONFIG__EMAIL__SMTP_TLS=true
```

## 🧪 Testing Email Functionality

### 1. Using MailHog (Development)

1. Start development environment: `./scripts/start-with-email.sh`
2. Register a new user or request password reset
3. Check MailHog web interface: http://localhost:8025
4. Verify email appears in MailHog inbox

### 2. Using Real SMTP

1. Configure SMTP provider using `./scripts/setup-smtp.sh`
2. Run email test: `cd backend && python test_email.py`
3. Check your actual email inbox

## 🔍 Troubleshooting

### Common Issues

| Problem | Solution |
|---------|----------|
| "Connection refused" | Check if MailHog/SMTP server is running |
| "Authentication failed" | Verify username/password, use app password for Gmail |
| "Console output only" | SMTP_HOST not configured or set to localhost |
| "SSL/TLS errors" | Check TLS/SSL settings match provider requirements |

### Debug Steps

1. **Check service status**:
   ```bash
   docker ps  # Verify MailHog is running
   ```

2. **View backend logs**:
   ```bash
   docker-compose -f deploy/docker/docker-compose.dev.yml logs backend
   ```

3. **Test email configuration**:
   ```bash
   cd backend && python test_email.py
   ```

## 📚 Additional Resources

- [Email Configuration Guide](backend/EMAIL_CONFIG.md) - Detailed configuration options
- [Environment Templates](backend/env.example) - All configuration variables
- [Docker Setup](deploy/docker/) - Docker Compose configurations

## 🆘 Need Help?

1. Check the logs for error messages
2. Verify your SMTP provider settings
3. Test with MailHog first to isolate issues
4. Review the detailed guide: `backend/EMAIL_CONFIG.md` 