"""
Admin user creation script for Requify.
"""

import asyncio
import sys
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.user import User
from app.utils.logger import get_logger

logger = get_logger(__name__)


async def create_admin_user(
    username: str,
    email: str,
    password: str,
    first_name: Optional[str] = None,
    last_name: Optional[str] = None,
) -> bool:
    """
    Create an admin user.

    Args:
        username: Username for the admin
        email: Email for the admin
        password: Password for the admin
        first_name: Optional first name
        last_name: Optional last name

    Returns:
        bool: True if user was created successfully, False otherwise
    """
    try:
        async with AsyncSessionLocal() as session:
            # Check if user already exists
            stmt_username = select(User).where(User.username == username)
            result_username = await session.execute(stmt_username)
            existing_user_by_username = result_username.scalar_one_or_none()

            stmt_email = select(User).where(User.email == email)
            result_email = await session.execute(stmt_email)
            existing_user_by_email = result_email.scalar_one_or_none()

            if existing_user_by_username:
                logger.error(f"User with username '{username}' already exists")
                return False

            if existing_user_by_email:
                logger.error(f"User with email '{email}' already exists")
                return False

            # Create new admin user
            hashed_password = get_password_hash(password)

            new_user = User(
                username=username,
                email=email,
                hashed_password=hashed_password,
                is_active=True,
                email_verified=True,  # Updated field name
            )

            session.add(new_user)
            await session.flush()  # Flush to get the user ID

            # Create user profile
            from app.models.user_profile import UserProfile

            user_profile = UserProfile(
                user_id=new_user.id,
                first_name=first_name or "Admin",
                last_name=last_name or "User",
                display_name=f"{first_name or 'Admin'} {last_name or 'User'}",
                profile_completed=True,
            )
            session.add(user_profile)

            # Add System Admin role using Enhanced Role System
            from app.models.enhanced_role_system import (
                EnhancedRole,
                UserRoleAssignment,
                SystemRole,
                RoleScope,
            )

            # Find or create System Admin role
            system_admin_role_stmt = select(EnhancedRole).where(
                EnhancedRole.system_role == SystemRole.SYSTEM_ADMIN.value,
                EnhancedRole.scope == RoleScope.SYSTEM.value,
            )
            system_admin_role = (
                await session.execute(system_admin_role_stmt)
            ).scalar_one_or_none()

            if not system_admin_role:
                # Create System Admin role if it doesn't exist
                system_admin_role = EnhancedRole(
                    name="system_admin",
                    display_name="System Administrator",
                    description="Full system administrator with all permissions",
                    scope=RoleScope.SYSTEM.value,
                    system_role=SystemRole.SYSTEM_ADMIN.value,
                    is_system=True,
                    is_active=True,
                    priority=1000,
                )
                session.add(system_admin_role)
                await session.flush()

            # Assign System Admin role to user
            role_assignment = UserRoleAssignment(
                user_id=new_user.id,
                role_id=system_admin_role.id,
                is_active=True,
                assigned_by=new_user.id,  # Self-assigned for first admin
            )
            session.add(role_assignment)

            await session.commit()
            await session.refresh(new_user)

            logger.info(
                f"Admin user '{username}' created successfully with ID: {new_user.id}"
            )
            return True

    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        return False


def safe_input(prompt: str) -> str:
    """Safe input function that handles encoding issues in Windows PowerShell."""
    try:
        # For Windows PowerShell encoding issues
        result = input(prompt)
        # Try to encode/decode to fix any encoding issues
        if isinstance(result, str):
            # Remove any problematic characters and normalize
            result = result.encode("utf-8", errors="ignore").decode("utf-8")
            # Additional cleanup for PowerShell artifacts
            result = "".join(
                char
                for char in result
                if ord(char) < 65536 and char.isprintable() or char.isspace()
            )
        return result.strip()
    except (UnicodeDecodeError, UnicodeEncodeError):
        print(
            "Error: Input contains invalid characters. Please use only ASCII characters."
        )
        return ""


async def interactive_create_admin():
    """Interactive admin user creation."""
    print("Creating admin user for Requify...")
    print("=" * 40)

    username = safe_input("Enter username: ")
    if not username:
        print("Username cannot be empty!")
        return False

    email = safe_input("Enter email: ")
    if not email or "@" not in email:
        print("Valid email is required!")
        return False

    password = safe_input("Enter password: ")
    if not password or len(password) < 8:
        print("Password must be at least 8 characters long!")
        return False

    first_name = safe_input("Enter first name (optional): ") or None
    last_name = safe_input("Enter last name (optional): ") or None

    print(f"\nCreating admin user with:")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    print(f"  First name: {first_name or 'Admin'}")
    print(f"  Last name: {last_name or 'User'}")

    confirm = safe_input("\nConfirm creation? (y/N): ").lower()
    if confirm != "y":
        print("Admin creation cancelled.")
        return False

    success = await create_admin_user(username, email, password, first_name, last_name)

    if success:
        print(f"\n✅ Admin user '{username}' created successfully!")
        print("You can now log in to the system with these credentials.")
    else:
        print("\n❌ Failed to create admin user. Check logs for details.")

    return success


async def main():
    """Main function for module execution."""
    if len(sys.argv) == 4:
        # Command line arguments provided
        username, email, password = sys.argv[1], sys.argv[2], sys.argv[3]
        success = await create_admin_user(username, email, password)
        if success:
            print(f"✅ Admin user '{username}' created successfully!")
        else:
            print("❌ Failed to create admin user.")
            sys.exit(1)
    else:
        # Interactive mode
        success = await interactive_create_admin()
        sys.exit(0 if success else 1)


if __name__ == "__main__":
    asyncio.run(main())
