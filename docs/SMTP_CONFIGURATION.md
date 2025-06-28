# SMTP Configuration Documentation

## Overview

This document provides comprehensive information about configuring SMTP for email functionality in the Requify project. The system supports multiple SMTP providers and includes a development email testing setup using MailHog.

## Quick Start

### For Development (Recommended)

```bash
# Start development environment with MailHog
make email-dev

# Test email functionality
make email-test
```

Access MailHog web interface: http://localhost:8025

### For Production Setup

```bash
# Interactive SMTP configuration
make email-setup
```

## Architecture

### Email Service Components

1. **Email Service** (`app/services/email_service.py`)
   - Handles SMTP configuration
   - Sends emails using aiosmtplib
   - Supports both console and SMTP modes

2. **Email Configuration** (`app/core/config.py`)
   - Environment-based configuration
   - Automatic SMTP detection
   - Fallback to console mode

3. **Email Templates** 
   - User registration verification
   - Password reset
   - Custom email sending

### Development vs Production

| Environment | SMTP Server | Purpose | Access |
|-------------|-------------|---------|--------|
| **Development** | MailHog | Email testing & debugging | http://localhost:8025 |
| **Production** | Real SMTP | Actual email delivery | N/A |

## Configuration Options

### Environment Variables

All email configuration is done through environment variables with the prefix `APP_CONFIG__EMAIL__`:

```bash
# SMTP Server Configuration
APP_CONFIG__EMAIL__SMTP_HOST=smtp.example.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=username
APP_CONFIG__EMAIL__SMTP_PASSWORD=password
APP_CONFIG__EMAIL__SMTP_TLS=true
APP_CONFIG__EMAIL__SMTP_SSL=false

# Email Headers
APP_CONFIG__EMAIL__FROM_EMAIL=noreply@yourdomain.com
APP_CONFIG__EMAIL__FROM_NAME=Your Company Name
```

### Supported SMTP Providers

#### 1. MailHog (Development)
```bash
APP_CONFIG__EMAIL__SMTP_HOST=mailhog  # or localhost
APP_CONFIG__EMAIL__SMTP_PORT=1025
APP_CONFIG__EMAIL__SMTP_TLS=false
```

#### 2. Gmail
```bash
APP_CONFIG__EMAIL__SMTP_HOST=smtp.gmail.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@gmail.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-app-password
APP_CONFIG__EMAIL__SMTP_TLS=true
```

#### 3. SendGrid
```bash
APP_CONFIG__EMAIL__SMTP_HOST=smtp.sendgrid.net
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=apikey
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-sendgrid-api-key
APP_CONFIG__EMAIL__SMTP_TLS=true
```

#### 4. AWS SES
```bash
APP_CONFIG__EMAIL__SMTP_HOST=email-smtp.us-east-1.amazonaws.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-aws-access-key
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-aws-secret-key
APP_CONFIG__EMAIL__SMTP_TLS=true
```

#### 5. Outlook/Office365
```bash
APP_CONFIG__EMAIL__SMTP_HOST=smtp-mail.outlook.com
APP_CONFIG__EMAIL__SMTP_PORT=587
APP_CONFIG__EMAIL__SMTP_USER=your-email@outlook.com
APP_CONFIG__EMAIL__SMTP_PASSWORD=your-password
APP_CONFIG__EMAIL__SMTP_TLS=true
```

## Docker Configuration

### Development Setup

The development environment includes MailHog automatically:

```yaml
# docker-compose.dev.yml
mailhog:
  image: mailhog/mailhog:latest
  container_name: requify_mailhog_dev
  ports:
    - "1025:1025"  # SMTP
    - "8025:8025"  # Web UI
  networks:
    - requify-dev-network
```

### Backend Environment Variables

The backend container is automatically configured with MailHog settings:

```yaml
environment:
  - APP_CONFIG__EMAIL__SMTP_HOST=mailhog
  - APP_CONFIG__EMAIL__SMTP_PORT=1025
  - APP_CONFIG__EMAIL__SMTP_TLS=false
  - APP_CONFIG__EMAIL__FROM_EMAIL=noreply@requify.local
  - APP_CONFIG__EMAIL__FROM_NAME=Requify Development
```

## Available Commands

### Make Commands

```bash
# Email & SMTP Commands
make email-setup        # Interactive SMTP configuration
make email-dev          # Start development with MailHog
make email-test         # Test current email configuration
make email-mailhog      # Test MailHog specifically
make email-status       # Show email service status
```

### Scripts

```bash
# Setup Scripts
./scripts/setup-smtp.sh         # Interactive SMTP setup (Linux/Mac)
./scripts/start-with-email.sh   # Start dev environment (Linux/Mac)
./scripts/start-with-email.ps1  # Start dev environment (Windows)

# Test Scripts
./backend/test_email.py         # General email testing
./backend/test_mailhog.py       # MailHog specific testing
./backend/test_registration.py  # Test registration with email
```

## Testing Email Functionality

### 1. Development Testing (MailHog)

```bash
# Start development environment
make email-dev

# Test email sending
make email-test

# Check MailHog web interface
open http://localhost:8025
```

### 2. Registration Flow Testing

```bash
# Start backend
make email-dev

# Test user registration
cd backend
python test_registration.py

# Check MailHog for verification email
```

### 3. Production Testing

```bash
# Configure real SMTP
make email-setup

# Test with real provider
make email-test
```

## Troubleshooting

### Common Issues

#### 1. Connection Refused
**Symptoms**: `Connection refused` error
**Solutions**:
- Check if MailHog container is running: `docker ps`
- Verify port 1025 is not blocked
- Ensure SMTP_HOST is correctly set

#### 2. Authentication Failed
**Symptoms**: `Authentication failed` error
**Solutions**:
- For Gmail: Use App Password, not regular password
- Verify username/password are correct
- Check if 2FA is required

#### 3. Console Output Only
**Symptoms**: Emails printed to console instead of sent
**Solutions**:
- Check SMTP_HOST is not empty or "localhost"
- Verify SMTP configuration is loaded
- Restart application after configuration changes

#### 4. SSL/TLS Errors
**Symptoms**: SSL certificate or TLS errors
**Solutions**:
- Verify TLS/SSL settings match provider requirements
- Check port number (587 for TLS, 465 for SSL)
- Ensure firewall allows SMTP traffic

### Debug Commands

```bash
# Check container status
docker ps | grep mailhog

# View backend logs
make logs-backend

# Test email configuration
cd backend && python test_email.py

# Check environment variables
docker exec -it requify-backend-dev env | grep EMAIL
```

### Log Analysis

Look for these log messages:

```
# Successful configuration
Email service initialized with SMTP_HOST: mailhog, CONSOLE_BACKEND: False

# Console mode (no SMTP)
Email service initialized with SMTP_HOST: localhost, CONSOLE_BACKEND: True

# Email sent successfully
Email sent successfully to: user@example.com
```

## Security Considerations

### Production Security

1. **Use App Passwords**: For Gmail and similar providers
2. **Environment Variables**: Never commit SMTP credentials to code
3. **TLS Encryption**: Always use TLS in production
4. **Rate Limiting**: Implement email rate limiting
5. **Monitoring**: Monitor email delivery and failures

### Development Security

1. **MailHog Isolation**: MailHog should only be accessible locally
2. **No Real Emails**: Ensure development doesn't send real emails
3. **Test Data**: Use fake email addresses for testing

## Performance Optimization

### Async Email Sending

The email service uses async/await for non-blocking email sending:

```python
await email_service.send_email(
    to_email="user@example.com",
    subject="Welcome",
    text_content="Welcome to Requify!"
)
```

### Connection Pooling

For high-volume production use, consider:
- SMTP connection pooling
- Queue-based email sending
- Background task processing

## Monitoring and Logging

### Email Metrics

Monitor these metrics in production:
- Email delivery success rate
- SMTP connection failures
- Email bounce rates
- Queue depth (if using queues)

### Log Levels

Configure appropriate log levels:
- `DEBUG`: Detailed SMTP communication
- `INFO`: Email send confirmations
- `ERROR`: SMTP failures and errors

## Advanced Configuration

### Custom Email Templates

Email templates are located in:
- `app/services/email_service.py` - Email sending logic
- Template customization for different email types

### Multiple SMTP Providers

For redundancy, implement multiple SMTP providers:
- Primary provider (e.g., SendGrid)
- Fallback provider (e.g., AWS SES)
- Local SMTP relay for internal emails

### Email Queuing

For production systems, consider implementing:
- Redis-based email queues
- Celery for background email processing
- Retry mechanisms for failed emails

## API Integration

### Email Verification Endpoints

```
POST /api/v1/auth/verify-email/request
POST /api/v1/auth/verify-email/confirm
```

### Password Reset Endpoints

```
POST /api/v1/auth/reset-password
POST /api/v1/auth/reset-password/confirm
```

## File Structure

```
backend/
├── app/
│   ├── services/
│   │   └── email_service.py          # Email service implementation
│   ├── core/
│   │   └── config.py                 # Email configuration
│   └── api/v1/endpoints/
│       └── auth.py                   # Email verification endpoints
├── env.example                       # Environment template
├── env.development                   # Development configuration
├── env.production                    # Production template
├── test_email.py                     # Email testing script
├── test_mailhog.py                   # MailHog testing script
└── EMAIL_CONFIG.md                   # Detailed email guide

scripts/
├── setup-smtp.sh                     # SMTP setup script (Linux/Mac)
├── start-with-email.sh               # Development start script (Linux/Mac)
└── start-with-email.ps1              # Development start script (Windows)

deploy/docker/
├── docker-compose.dev.yml            # Development with MailHog
└── docker-compose.prod.yml           # Production configuration
```

## Support and Resources

### Documentation
- [Email Configuration Guide](../backend/EMAIL_CONFIG.md)
- [SMTP Setup Guide](../SMTP_SETUP.md)
- [Environment Templates](../backend/env.example)

### External Resources
- [MailHog Documentation](https://github.com/mailhog/MailHog)
- [Gmail App Passwords](https://support.google.com/accounts/answer/185833)
- [SendGrid SMTP Guide](https://docs.sendgrid.com/for-developers/sending-email/smtp)
- [AWS SES SMTP](https://docs.aws.amazon.com/ses/latest/dg/smtp-connect.html) 