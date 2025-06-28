#!/usr/bin/env python3
"""
Simple email test for MailHog integration.
Tests basic email functionality without user interaction.
"""

import asyncio
import sys
import os
from datetime import datetime

# Add the backend directory to the path
sys.path.insert(0, '/app')

from app.core.config import settings
from app.services.email_service import EmailService
from app.schemas.user import UserCreate


async def test_email_service():
    """Test email service functionality."""
    print("=== Email Service Test ===")
    print(f"Timestamp: {datetime.now()}")
    print()
    
    # Display current email configuration
    print("Current Email Configuration:")
    print(f"  SMTP Host: {settings.email.smtp_host}")
    print(f"  SMTP Port: {settings.email.smtp_port}")
    print(f"  SMTP TLS: {settings.email.smtp_tls}")
    print(f"  SMTP SSL: {settings.email.smtp_ssl}")
    print(f"  From Email: {settings.email.from_email}")
    print(f"  From Name: {settings.email.from_name}")
    print()
    
    # Initialize email service
    try:
        email_service = EmailService()
        print("✓ Email service initialized successfully")
    except Exception as e:
        print(f"✗ Failed to initialize email service: {e}")
        return False
    
    # Test 1: Welcome email
    print("\n--- Test 1: Welcome Email ---")
    try:
        test_user = UserCreate(
            username="testuser",
            email="test@example.com",
            role="viewer",
            password="TestPass123!"
        )
        
        success = await email_service.send_welcome_email(
            email=test_user.email,
            username=test_user.username
        )
        
        if success:
            print("✓ Welcome email sent successfully")
        else:
            print("✗ Failed to send welcome email")
    except Exception as e:
        print(f"✗ Welcome email test failed: {e}")
    
    # Test 2: Email verification
    print("\n--- Test 2: Email Verification ---")
    try:
        verification_token = "test-verification-token-123"
        success = await email_service.send_email_verification(
            email="test@example.com",
            username="testuser",
            verification_token=verification_token
        )
        
        if success:
            print("✓ Email verification sent successfully")
        else:
            print("✗ Failed to send email verification")
    except Exception as e:
        print(f"✗ Email verification test failed: {e}")
    
    # Test 3: Password reset
    print("\n--- Test 3: Password Reset ---")
    try:
        reset_token = "test-reset-token-456"
        success = await email_service.send_password_reset_email(
            email="test@example.com",
            username="testuser",
            reset_token=reset_token
        )
        
        if success:
            print("✓ Password reset email sent successfully")
        else:
            print("✗ Failed to send password reset email")
    except Exception as e:
        print(f"✗ Password reset test failed: {e}")
    
    print("\n=== Test Complete ===")
    print("Check MailHog web interface at http://localhost:8025 to see captured emails")
    return True


if __name__ == "__main__":
    try:
        asyncio.run(test_email_service())
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
    except Exception as e:
        print(f"Test failed with error: {e}")
        sys.exit(1) 