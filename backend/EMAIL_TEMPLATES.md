# Email Templates Documentation

## Overview

The Requify email system now includes professional, modern email templates with excellent UI/UX design. These templates are responsive, accessible, and follow email best practices.

## Template Structure

### Base Template (`base.html.jinja`)
The foundation template that all other email templates extend. Features:

- **Modern Design**: Clean, professional layout with gradient headers
- **Responsive**: Optimized for desktop, tablet, and mobile devices
- **Cross-Client Compatibility**: Works with Gmail, Outlook, Apple Mail, etc.
- **Dark Mode Support**: Automatic adaptation for dark mode preferences
- **Accessibility**: Proper semantic HTML and ARIA attributes
- **Brand Consistency**: Unified Requify branding and color scheme

### Email Templates

#### 1. Password Reset (`password_reset.html.jinja` / `password_reset.txt.jinja`)
- **Purpose**: Secure password reset with verification
- **Features**:
  - Clear call-to-action button
  - Security warnings and expiration notices
  - IP address and timestamp tracking
  - Fallback text link
  - Security best practices information

#### 2. Email Verification (`email_verification.html.jinja` / `email_verification.txt.jinja`)
- **Purpose**: Email address verification for new users
- **Features**:
  - Welcome messaging
  - Feature highlights
  - Clear verification button
  - Expiration information
  - Onboarding guidance

#### 3. Welcome Email (`welcome.html.jinja`)
- **Purpose**: Welcome new users after successful registration
- **Features**:
  - Congratulatory messaging
  - Feature overview with benefits
  - Quick start guide
  - Call-to-action buttons for dashboard and help
  - Professional onboarding experience

#### 4. Security Alert (`security_alert.html.jinja`)
- **Purpose**: Notify users of security events
- **Features**:
  - Different alert types (password change, new device, etc.)
  - Event details (timestamp, IP, device)
  - Security recommendations
  - Action buttons for security settings
  - Clear visual indicators

## Design Features

### Visual Design
- **Color Scheme**: Professional gradient (blue to purple)
- **Typography**: System fonts for optimal rendering
- **Layout**: Clean, centered design with proper spacing
- **Buttons**: Modern gradient buttons with hover effects
- **Alerts**: Color-coded information boxes

### Technical Features
- **Responsive Design**: Mobile-first approach
- **Email Client Support**: Tested across major clients
- **Fallback Support**: Graceful degradation for older clients
- **Performance**: Optimized images and minimal CSS
- **Security**: Safe HTML practices

### Accessibility
- **Screen Readers**: Proper semantic HTML
- **High Contrast**: Sufficient color contrast ratios
- **Font Sizes**: Readable text sizes
- **Focus States**: Clear focus indicators
- **Alt Text**: Descriptive alternative text

## Usage

### Email Service Integration

The templates are automatically used by the EmailService class:

```python
from app.services.email_service import email_service

# Password reset with modern template
await email_service.send_password_reset_email(
    user_email="user@example.com",
    reset_token="token123",
    user_name="John Doe",
    ip_address="192.168.1.1",
    timestamp=datetime.now()
)

# Email verification with professional design
await email_service.send_email_verification(
    user_email="user@example.com",
    verification_token="verify123",
    user_name="John Doe",
    ip_address="192.168.1.1"
)

# Welcome email with onboarding
await email_service.send_welcome_email(
    user_email="user@example.com",
    user_name="John Doe"
)

# Security alerts with detailed information
await email_service.send_security_alert(
    user_email="user@example.com",
    alert_type="login_new_device",
    details={
        "timestamp": "2024-01-15T10:30:00Z",
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "location": "New York, USA"
    },
    user_name="John Doe"
)
```

### Template Variables

All templates support these common variables:
- `user_email`: Recipient's email address
- `user_name`: User's display name
- `app_url`: Frontend application URL
- `support_email`: Support contact email
- `timestamp`: Event timestamp
- `ip_address`: Request IP address

### Customization

Templates use Jinja2 templating engine and can be customized:

1. **Modify existing templates** in `backend/app/templates/email/`
2. **Add new templates** by creating new `.jinja` files
3. **Update the EmailTemplates class** to include new rendering methods
4. **Test changes** using the test script

## File Structure

```
backend/app/templates/email/
├── base.html.jinja                 # Base template with common layout
├── password_reset.html.jinja       # Password reset email (HTML)
├── password_reset.txt.jinja        # Password reset email (text)
├── email_verification.html.jinja   # Email verification (HTML)
├── email_verification.txt.jinja    # Email verification (text)
├── welcome.html.jinja              # Welcome email (HTML)
└── security_alert.html.jinja       # Security alert email (HTML)
```

## Testing

Use the test script to verify templates:

```bash
# Run template tests
docker exec requify-backend-dev python /app/test_email_templates.py

# View emails in MailHog (development)
# Open http://localhost:8025 in your browser
```

## Best Practices

### Email Design
1. **Keep it simple**: Clean, focused design
2. **Mobile-first**: Design for mobile devices
3. **Clear CTAs**: Obvious call-to-action buttons
4. **Consistent branding**: Unified visual identity
5. **Readable fonts**: System fonts for reliability

### Content
1. **Clear subject lines**: Descriptive and actionable
2. **Concise messaging**: Brief, scannable content
3. **Security information**: Include relevant security details
4. **Help resources**: Provide support contact information
5. **Professional tone**: Consistent voice and messaging

### Technical
1. **Fallback content**: Always provide text alternatives
2. **Cross-client testing**: Test in major email clients
3. **Performance**: Optimize for fast loading
4. **Security**: Validate all user inputs
5. **Tracking**: Include relevant metadata

## Browser and Client Support

### Supported Email Clients
- ✅ Gmail (Web, Mobile, Desktop)
- ✅ Outlook (2016+, Web, Mobile)
- ✅ Apple Mail (macOS, iOS)
- ✅ Yahoo Mail
- ✅ Thunderbird
- ✅ Mobile clients (iOS Mail, Android Gmail)

### Features by Client
- **Modern clients**: Full CSS support, responsive design
- **Older clients**: Graceful degradation with fallback styles
- **Text-only clients**: Clean text versions provided

## Troubleshooting

### Template Not Loading
1. Check template file exists in `backend/app/templates/email/`
2. Verify Jinja2 environment initialization
3. Check file permissions
4. Review error logs

### Styling Issues
1. Use inline CSS for critical styles
2. Test in target email clients
3. Provide fallback styles
4. Use email-safe CSS properties

### Content Problems
1. Verify template variables are passed correctly
2. Check for encoding issues (UTF-8)
3. Validate HTML structure
4. Test with different user data

## Future Enhancements

Planned improvements:
- [ ] Additional template variants
- [ ] A/B testing support
- [ ] Multi-language templates
- [ ] Advanced personalization
- [ ] Template editor interface
- [ ] Analytics integration 