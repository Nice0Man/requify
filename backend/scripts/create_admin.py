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
                first_name=first_name or "Admin",
                last_name=last_name or "User",
                is_active=True,
                is_superuser=True,
                is_verified=True,
                role="admin",  # Set admin role
            )

            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)

            logger.info(
                f"Admin user '{username}' created successfully with ID: {new_user.id}"
            )
            return True

    except Exception as e:
        logger.error(f"Error creating admin user: {e}")
        return False


async def interactive_create_admin():
    """Interactive admin user creation."""
    print("Creating admin user for Requify...")
    print("=" * 40)

    username = input("Enter username: ").strip()
    if not username:
        print("Username cannot be empty!")
        return False

    email = input("Enter email: ").strip()
    if not email or "@" not in email:
        print("Valid email is required!")
        return False

    password = input("Enter password: ").strip()
    if not password or len(password) < 8:
        print("Password must be at least 8 characters long!")
        return False

    first_name = input("Enter first name (optional): ").strip() or None
    last_name = input("Enter last name (optional): ").strip() or None

    print(f"\nCreating admin user with:")
    print(f"  Username: {username}")
    print(f"  Email: {email}")
    print(f"  First name: {first_name or 'Admin'}")
    print(f"  Last name: {last_name or 'User'}")

    confirm = input("\nConfirm creation? (y/N): ").strip().lower()
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
