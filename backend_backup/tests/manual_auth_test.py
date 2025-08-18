"""
Manual testing script for Authentication API with admin credentials.

This script provides interactive testing capabilities for authentication endpoints
using admin credentials. It can be run independently or as part of development workflow.
"""

import asyncio
import json
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
from pathlib import Path
import sys

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from app.core.config import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


class AuthAPITester:
    """Interactive tester for Authentication API."""

    def __init__(self, base_url: str = "http://localhost:8000"):
        """Initialize the tester with base URL."""
        self.base_url = base_url.rstrip("/")
        self.api_url = f"{self.base_url}/api/v1"
        self.access_token: Optional[str] = None
        self.refresh_token: Optional[str] = None
        self.admin_credentials = {
            "email": settings.admin.email,
            "password": settings.admin.password,
            "username": "admin",
        }

    async def make_request(
        self,
        method: str,
        endpoint: str,
        data: Optional[Dict] = None,
        headers: Optional[Dict] = None,
        use_auth: bool = False,
    ) -> Dict[str, Any]:
        """Make HTTP request to API endpoint."""
        url = f"{self.api_url}{endpoint}"

        # Default headers
        req_headers = {"Content-Type": "application/json"}
        if headers:
            req_headers.update(headers)

        # Add authorization if requested and token available
        if use_auth and self.access_token:
            req_headers["Authorization"] = f"Bearer {self.access_token}"

        async with httpx.AsyncClient() as client:
            try:
                if method.upper() == "GET":
                    response = await client.get(url, headers=req_headers)
                elif method.upper() == "POST":
                    if endpoint == "/auth/login":
                        # Special handling for login endpoint
                        form_data = {
                            "username": data.get("email", data.get("username")),
                            "password": data["password"],
                        }
                        response = await client.post(
                            url,
                            data=form_data,
                            headers={
                                "Content-Type": "application/x-www-form-urlencoded"
                            },
                        )
                    else:
                        response = await client.post(
                            url, json=data, headers=req_headers
                        )
                elif method.upper() == "PUT":
                    response = await client.put(url, json=data, headers=req_headers)
                elif method.upper() == "DELETE":
                    response = await client.delete(url, headers=req_headers)
                else:
                    raise ValueError(f"Unsupported method: {method}")

                return {
                    "status_code": response.status_code,
                    "headers": dict(response.headers),
                    "content": response.text,
                    "json": (
                        response.json()
                        if response.headers.get("content-type", "").startswith(
                            "application/json"
                        )
                        else None
                    ),
                }

            except httpx.RequestError as e:
                logger.error(f"Request error: {e}")
                return {"status_code": 0, "error": str(e), "content": "", "json": None}
            except Exception as e:
                logger.error(f"Unexpected error: {e}")
                return {"status_code": 0, "error": str(e), "content": "", "json": None}

    def print_response(self, response: Dict[str, Any], title: str = "Response"):
        """Pretty print API response."""
        print(f"\n{'='*60}")
        print(f"{title}")
        print(f"{'='*60}")
        print(f"Status Code: {response['status_code']}")

        if response.get("error"):
            print(f"Error: {response['error']}")
            return

        if response.get("json"):
            print("JSON Response:")
            print(json.dumps(response["json"], indent=2, ensure_ascii=False))
        else:
            print("Raw Content:")
            print(response["content"][:1000])  # Limit output
        print(f"{'='*60}\n")

    async def test_admin_login(self) -> bool:
        """Test admin login and store tokens."""
        print("🔐 Testing Admin Login...")

        response = await self.make_request(
            "POST", "/auth/login", data=self.admin_credentials
        )

        self.print_response(response, "Admin Login")

        if response["status_code"] == 200 and response.get("json"):
            json_data = response["json"]
            self.access_token = json_data.get("access_token")
            self.refresh_token = json_data.get("refresh_token")
            print("✅ Admin login successful! Tokens stored.")
            return True
        else:
            print("❌ Admin login failed!")
            return False

    async def test_token_validation(self):
        """Test token validation."""
        print("🔍 Testing Token Validation...")

        # Test with current token (using Authorization header)
        response = await self.make_request(
            "POST", "/auth/validate-current-token", use_auth=True
        )

        self.print_response(response, "Token Validation")

        # Also test the endpoint that requires token in body
        if self.access_token:
            print("🔍 Testing Token Validation with token in body...")
            response2 = await self.make_request(
                "POST", "/auth/validate-token", data={"token": self.access_token}
            )
            self.print_response(response2, "Token Validation (Body)")

    async def test_current_user(self):
        """Test getting current user info."""
        print("👤 Testing Get Current User...")

        response = await self.make_request("GET", "/auth/me", use_auth=True)

        self.print_response(response, "Current User Info")

    async def test_token_refresh(self):
        """Test token refresh."""
        print("🔄 Testing Token Refresh...")

        if not self.refresh_token:
            print("❌ No refresh token available!")
            return

        response = await self.make_request(
            "POST", "/auth/refresh", data={"refresh_token": self.refresh_token}
        )

        self.print_response(response, "Token Refresh")

        if response["status_code"] == 200 and response.get("json"):
            json_data = response["json"]
            old_access_token = self.access_token
            self.access_token = json_data.get("access_token")
            self.refresh_token = json_data.get("refresh_token")
            print(f"✅ Token refreshed successfully!")
            print(f"Old token: {old_access_token[:20]}...")
            print(f"New token: {self.access_token[:20]}...")

    async def test_password_change(self):
        """Test password change."""
        print("🔑 Testing Password Change...")

        # Note: This is a destructive test - use with caution
        new_password = "TempNewPass123!"

        response = await self.make_request(
            "POST",
            "/auth/password/change",
            data={
                "current_password": self.admin_credentials["password"],
                "new_password": new_password,
                "confirm_password": new_password,
            },
            use_auth=True,
        )

        self.print_response(response, "Password Change")

        if response["status_code"] == 200:
            print("⚠️  Password changed successfully!")
            print("⚠️  Reverting password change...")

            # Revert password change
            revert_response = await self.make_request(
                "POST",
                "/auth/password/change",
                data={
                    "current_password": new_password,
                    "new_password": self.admin_credentials["password"],
                    "confirm_password": self.admin_credentials["password"],
                },
                use_auth=True,
            )

            if revert_response["status_code"] == 200:
                print("✅ Password reverted successfully!")
            else:
                print("❌ Failed to revert password!")
                print("⚠️  MANUAL INTERVENTION REQUIRED!")

    async def test_sessions_management(self):
        """Test session management."""
        print("📱 Testing Session Management...")

        # Get sessions
        response = await self.make_request("GET", "/auth/sessions", use_auth=True)

        self.print_response(response, "Get Sessions")

        # Note: Commenting out session revocation as it would invalidate current token
        # print("🚫 Testing Session Revocation...")
        #
        # revoke_response = await self.make_request(
        #     "POST",
        #     "/auth/sessions/revoke",
        #     data={"revoke_all": False},
        #     use_auth=True
        # )
        #
        # self.print_response(revoke_response, "Session Revocation")

    async def test_email_verification(self):
        """Test email verification."""
        print("📧 Testing Email Verification...")

        # Request verification
        response = await self.make_request(
            "POST",
            "/auth/email/request",
            data={"email": self.admin_credentials["email"]},
        )

        self.print_response(response, "Email Verification Request")

    async def test_password_reset(self):
        """Test password reset request."""
        print("🔄 Testing Password Reset Request...")

        response = await self.make_request(
            "POST",
            "/auth/password/reset",
            data={"email": self.admin_credentials["email"]},
        )

        self.print_response(response, "Password Reset Request")

    async def test_invalid_scenarios(self):
        """Test invalid scenarios for security."""
        print("🚨 Testing Invalid Scenarios...")

        # Invalid login
        print("\n--- Invalid Login ---")
        invalid_response = await self.make_request(
            "POST",
            "/auth/login",
            data={
                "email": self.admin_credentials["email"],
                "password": "wrong_password",
            },
        )
        self.print_response(invalid_response, "Invalid Login")

        # Invalid token
        print("\n--- Invalid Token ---")
        old_token = self.access_token
        self.access_token = "invalid_token"

        invalid_token_response = await self.make_request(
            "GET", "/auth/me", use_auth=True
        )
        self.print_response(invalid_token_response, "Invalid Token")

        # Restore valid token
        self.access_token = old_token

        # Missing token
        print("\n--- Missing Token ---")
        no_auth_response = await self.make_request("GET", "/auth/me", use_auth=False)
        self.print_response(no_auth_response, "No Authentication")

    async def test_logout(self):
        """Test logout."""
        print("🚪 Testing Logout...")

        # Test simple logout (no body required)
        response = await self.make_request("POST", "/auth/logout/simple", use_auth=True)

        self.print_response(response, "Logout (Simple)")

        # Test full logout with body
        if response["status_code"] != 200:
            print("🚪 Testing Full Logout...")
            response = await self.make_request(
                "POST",
                "/auth/logout",
                data={"refresh_token": self.refresh_token, "logout_all": False},
                use_auth=True,
            )

        self.print_response(response, "Logout")

        if response["status_code"] == 200:
            print("✅ Logout successful!")
            self.access_token = None
            self.refresh_token = None

    async def run_comprehensive_test(self):
        """Run comprehensive authentication test suite."""
        print("🚀 Starting Comprehensive Authentication API Test")
        print(f"🎯 Target URL: {self.api_url}")
        print(f"👤 Admin Email: {self.admin_credentials['email']}")
        print(f"🕐 Started at: {datetime.now().isoformat()}")

        try:
            # 1. Admin Login
            login_success = await self.test_admin_login()
            if not login_success:
                print("❌ Cannot proceed without successful login!")
                return

            # 2. Token Validation
            await self.test_token_validation()

            # 3. Current User Info
            await self.test_current_user()

            # 4. Token Refresh
            await self.test_token_refresh()

            # 5. Session Management
            await self.test_sessions_management()

            # 6. Email Verification
            await self.test_email_verification()

            # 7. Password Reset Request
            await self.test_password_reset()

            # 8. Password Change (careful!)
            change_password = input(
                "\n⚠️  Test password change? This is destructive! (y/N): "
            )
            if change_password.lower() == "y":
                await self.test_password_change()

            # 9. Invalid Scenarios
            await self.test_invalid_scenarios()

            # 10. Logout (at the end)
            await self.test_logout()

            print("\n🎉 Comprehensive test completed!")
            print(f"🕐 Finished at: {datetime.now().isoformat()}")

        except Exception as e:
            logger.error(f"Test failed with error: {e}")
            print(f"❌ Test failed: {e}")

    async def interactive_mode(self):
        """Interactive testing mode."""
        print("🎮 Interactive Authentication API Tester")
        print("=" * 50)

        while True:
            print("\nAvailable commands:")
            print("1. login - Admin login")
            print("2. validate - Validate current token")
            print("3. me - Get current user info")
            print("4. refresh - Refresh token")
            print("5. sessions - Get sessions")
            print("6. verify-email - Request email verification")
            print("7. reset-password - Request password reset")
            print("8. change-password - Change password")
            print("9. logout - Logout")
            print("10. invalid - Test invalid scenarios")
            print("11. comprehensive - Run all tests")
            print("0. exit - Exit")

            choice = input("\nEnter command number or name: ").strip().lower()

            try:
                if choice in ["0", "exit"]:
                    break
                elif choice in ["1", "login"]:
                    await self.test_admin_login()
                elif choice in ["2", "validate"]:
                    await self.test_token_validation()
                elif choice in ["3", "me"]:
                    await self.test_current_user()
                elif choice in ["4", "refresh"]:
                    await self.test_token_refresh()
                elif choice in ["5", "sessions"]:
                    await self.test_sessions_management()
                elif choice in ["6", "verify-email"]:
                    await self.test_email_verification()
                elif choice in ["7", "reset-password"]:
                    await self.test_password_reset()
                elif choice in ["8", "change-password"]:
                    await self.test_password_change()
                elif choice in ["9", "logout"]:
                    await self.test_logout()
                elif choice in ["10", "invalid"]:
                    await self.test_invalid_scenarios()
                elif choice in ["11", "comprehensive"]:
                    await self.run_comprehensive_test()
                else:
                    print("❌ Invalid command!")

            except KeyboardInterrupt:
                print("\n🛑 Interrupted by user")
                break
            except Exception as e:
                logger.error(f"Command failed: {e}")
                print(f"❌ Error: {e}")

        print("👋 Goodbye!")


async def main():
    """Main function."""
    import argparse

    parser = argparse.ArgumentParser(description="Authentication API Tester")
    parser.add_argument(
        "--url",
        default="http://localhost:8000",
        help="Base URL for API (default: http://localhost:8000)",
    )
    parser.add_argument(
        "--mode",
        choices=["comprehensive", "interactive"],
        default="interactive",
        help="Testing mode (default: interactive)",
    )

    args = parser.parse_args()

    tester = AuthAPITester(args.url)

    if args.mode == "comprehensive":
        await tester.run_comprehensive_test()
    else:
        await tester.interactive_mode()


if __name__ == "__main__":
    asyncio.run(main())
