#!/usr/bin/env python3
"""
Test script specifically for MailHog email configuration.
This script tests the email service with MailHog settings.
"""

import asyncio
import os
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent))

from app.core.config import settings
from app.services.email_service import email_service


async def test_mailhog_configuration():
    """Test MailHog email configuration."""
    
    print("🐳 Testing MailHog Email Configuration")
    print("=" * 50)
    
    # Override settings for MailHog
    settings.email.smtp_host = "localhost"  # or "mailhog" if running in Docker
    settings.email.smtp_port = 1025
    settings.email.smtp_user = ""
    settings.email.smtp_password = ""
    settings.email.smtp_tls = False
    settings.email.smtp_ssl = False
    settings.email.from_email = "noreply@requify.local"
    settings.email.from_name = "Requify Development"
    
    print(f"SMTP Host: {settings.email.smtp_host}")
    print(f"SMTP Port: {settings.email.smtp_port}")
    print(f"From Email: {settings.email.from_email}")
    print(f"From Name: {settings.email.from_name}")
    print()
    
    # Test email sending
    test_email = input("Enter test email address (or press Enter for default): ").strip()
    if not test_email:
        test_email = "test@example.com"
    
    print(f"📧 Sending test email to: {test_email}")
    print()
    
    try:
        await email_service.send_email(
            to_email=test_email,
            subject="MailHog Test Email - Requify",
            text_content="This is a test email from Requify using MailHog.",
            html_content="""
            <h1>MailHog Test Email</h1>
            <p>This is a test email from Requify using MailHog.</p>
            <p>If you see this in MailHog's web interface, the configuration is working correctly!</p>
            <hr>
            <p><small>Sent from Requify Development Environment</small></p>
            """
        )
        
        print("✅ Email sent successfully!")
        print()
        print("🌐 Next steps:")
        print("1. Open MailHog web interface: http://localhost:8025")
        print("2. Check if the email appears in the inbox")
        print("3. If running with Docker, make sure MailHog container is running")
        
    except Exception as e:
        print(f"❌ Failed to send email: {e}")
        print()
        print("🔍 Troubleshooting:")
        print("1. Make sure MailHog is running:")
        print("   - Docker: docker-compose -f docker-compose.dev.yml up mailhog")
        print("   - Standalone: mailhog")
        print("2. Check if port 1025 is accessible")
        print("3. Verify SMTP host setting (localhost vs mailhog)")


async def test_verification_email():
    """Test email verification email template."""
    
    print("\n" + "=" * 50)
    print("🔐 Testing Email Verification Template")
    print("=" * 50)
    
    test_email = "test@example.com"
    verification_token = "test-verification-token-123"
    user_name = "Test User"
    
    try:
        await email_service.send_email_verification(
            user_email=test_email,
            verification_token=verification_token,
            user_name=user_name
        )
        
        print("✅ Email verification email sent successfully!")
        print("📧 Check MailHog for the verification email template")
        
    except Exception as e:
        print(f"❌ Failed to send verification email: {e}")


if __name__ == "__main__":
    print("🧪 MailHog Email Testing for Requify")
    print("=" * 50)
    print()
    
    # Run tests
    asyncio.run(test_mailhog_configuration())
    
    # Test verification email if user wants
    test_verification = input("\nTest email verification template? (y/N): ").strip().lower()
    if test_verification == 'y':
        asyncio.run(test_verification_email())
    
    print("\n✨ Testing complete!")
    print("📚 For more information, see: SMTP_SETUP.md") 