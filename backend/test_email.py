#!/usr/bin/env python3
"""
Simple test script to verify email configuration.
Run this to check if your email settings are properly configured.
"""

import asyncio
import sys
from pathlib import Path

# Add the app directory to the Python path
sys.path.insert(0, str(Path(__file__).parent / "app"))

from app.services.email_service import EmailService, EmailConfig


async def test_email_config():
    """Test email configuration and send a test email."""
    print("🔧 Testing Email Configuration...")
    print("=" * 50)
    
    # Initialize email service
    email_service = EmailService()
    config = email_service.config
    
    # Display current configuration
    print(f"SMTP Host: {config.SMTP_HOST}")
    print(f"SMTP Port: {config.SMTP_PORT}")
    print(f"SMTP Username: {config.SMTP_USERNAME}")
    print(f"SMTP Password: {'***' if config.SMTP_PASSWORD else 'Not set'}")
    print(f"Use TLS: {config.SMTP_USE_TLS}")
    print(f"Use SSL: {config.SMTP_USE_SSL}")
    print(f"From Email: {config.FROM_EMAIL}")
    print(f"From Name: {config.FROM_NAME}")
    print(f"Console Backend: {config.CONSOLE_BACKEND}")
    print(f"Development Mode: {config.DEVELOPMENT_MODE}")
    print("=" * 50)
    
    # Check if SMTP is configured
    if not config.SMTP_HOST or config.SMTP_HOST == "localhost":
        print("❌ SMTP is not configured - emails will be printed to console")
        print("ℹ️  To configure SMTP, set these environment variables in .env:")
        print("   APP_CONFIG__EMAIL__SMTP_HOST=smtp.gmail.com")
        print("   APP_CONFIG__EMAIL__SMTP_PORT=587")
        print("   APP_CONFIG__EMAIL__SMTP_USER=your-email@gmail.com")
        print("   APP_CONFIG__EMAIL__SMTP_PASSWORD=your-app-password")
        print("   APP_CONFIG__EMAIL__SMTP_TLS=true")
        print("   APP_CONFIG__EMAIL__FROM_EMAIL=noreply@yourdomain.com")
    else:
        print("✅ SMTP configuration found")
        
    print("\n📧 Sending test email...")
    
    # Send test email
    test_email = input("Enter email address to send test to (or press Enter to skip): ").strip()
    
    if test_email:
        try:
            success = await email_service.send_email(
                to_email=test_email,
                subject="Test Email - Requify",
                html_content="""
                <h1>Test Email</h1>
                <p>This is a test email from Requify system.</p>
                <p>If you received this, your email configuration is working correctly!</p>
                """,
                text_content="Test Email\n\nThis is a test email from Requify system.\nIf you received this, your email configuration is working correctly!"
            )
            
            if success:
                if config.CONSOLE_BACKEND:
                    print("✅ Email printed to console (console mode)")
                else:
                    print("✅ Email sent successfully via SMTP")
            else:
                print("❌ Failed to send email")
                
        except Exception as e:
            print(f"❌ Error sending email: {e}")
    else:
        print("ℹ️  Skipping test email send")


if __name__ == "__main__":
    asyncio.run(test_email_config()) 