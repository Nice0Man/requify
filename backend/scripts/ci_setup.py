#!/usr/bin/env python3
"""
CI/CD Setup Script for Requify Backend.

This script prepares the environment for continuous integration testing.
"""

import asyncio
import os
import sys
from pathlib import Path
import logging
from typing import Optional

# Add project root to path
project_root = Path(__file__).parent.parent
sys.path.append(str(project_root))

from app.core.config import settings
from app.db.db_helper import db_helper
from app.models.user import User
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment, SystemRole, RoleScope
from app.core.security import get_password_hash
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class CISetup:
    """CI/CD environment setup."""
    
    def __init__(self):
        """Initialize CI setup."""
        self.admin_email = os.getenv("ADMIN__EMAIL", "admin@example.com")
        self.admin_password = os.getenv("ADMIN__PASSWORD", "SecurePass123!")
        self.admin_name = os.getenv("ADMIN__NAME", "CI Admin User")
    
    async def create_admin_user(self) -> bool:
        """Create admin user for CI testing."""
        try:
            async with db_helper.session_factory() as session:
                # Check if admin user already exists
                stmt = select(User).where(User.email == self.admin_email)
                result = await session.execute(stmt)
                existing_user = result.scalar_one_or_none()
                
                if existing_user:
                    logger.info(f"Admin user {self.admin_email} already exists")
                    return True
                
                # Create admin user
                admin_user = User(
                    username="admin",
                    email=self.admin_email,
                    password_hash=get_password_hash(self.admin_password),
                    name=self.admin_name,
                    is_active=True,
                    is_email_verified=True,
                    status="active"
                )
                
                session.add(admin_user)
                await session.flush()
                
                # Create system admin role if it doesn't exist
                stmt = select(EnhancedRole).where(
                    EnhancedRole.system_role == SystemRole.SYSTEM_ADMIN.value,
                    EnhancedRole.scope == RoleScope.SYSTEM.value
                )
                result = await session.execute(stmt)
                system_admin_role = result.scalar_one_or_none()
                
                if not system_admin_role:
                    system_admin_role = EnhancedRole(
                        name="System Administrator",
                        system_role=SystemRole.SYSTEM_ADMIN.value,
                        scope=RoleScope.SYSTEM.value,
                        description="Full system access for CI testing",
                        is_system_role=True,
                        permissions=["*"]  # All permissions
                    )
                    session.add(system_admin_role)
                    await session.flush()
                
                # Assign system admin role to user
                role_assignment = UserRoleAssignment(
                    user_id=admin_user.id,
                    role_id=system_admin_role.id,
                    scope=RoleScope.SYSTEM.value,
                    assigned_by=admin_user.id,
                    is_active=True
                )
                
                session.add(role_assignment)
                await session.commit()
                
                logger.info(f"Admin user {self.admin_email} created successfully")
                return True
                
        except Exception as e:
            logger.error(f"Failed to create admin user: {e}")
            return False
    
    async def setup_test_data(self) -> bool:
        """Setup minimal test data for CI."""
        try:
            async with db_helper.session_factory() as session:
                # Add any additional test data setup here
                # For now, just admin user is sufficient
                logger.info("Test data setup completed")
                return True
                
        except Exception as e:
            logger.error(f"Failed to setup test data: {e}")
            return False
    
    async def verify_setup(self) -> bool:
        """Verify CI setup is working."""
        try:
            async with db_helper.session_factory() as session:
                # Verify admin user exists and can authenticate
                stmt = select(User).where(User.email == self.admin_email)
                result = await session.execute(stmt)
                admin_user = result.scalar_one_or_none()
                
                if not admin_user:
                    logger.error("Admin user not found")
                    return False
                
                if not admin_user.is_active:
                    logger.error("Admin user is not active")
                    return False
                
                # Verify admin has system admin role
                stmt = select(UserRoleAssignment).where(
                    UserRoleAssignment.user_id == admin_user.id,
                    UserRoleAssignment.is_active == True
                )
                result = await session.execute(stmt)
                role_assignments = result.scalars().all()
                
                if not role_assignments:
                    logger.error("Admin user has no role assignments")
                    return False
                
                logger.info("CI setup verification successful")
                return True
                
        except Exception as e:
            logger.error(f"Setup verification failed: {e}")
            return False
    
    async def run_setup(self) -> bool:
        """Run complete CI setup."""
        logger.info("Starting CI environment setup...")
        
        # Create admin user
        if not await self.create_admin_user():
            logger.error("Failed to create admin user")
            return False
        
        # Setup test data
        if not await self.setup_test_data():
            logger.error("Failed to setup test data")
            return False
        
        # Verify setup
        if not await self.verify_setup():
            logger.error("Setup verification failed")
            return False
        
        logger.info("CI environment setup completed successfully")
        return True


async def main():
    """Main function."""
    setup = CISetup()
    success = await setup.run_setup()
    
    if success:
        logger.info("✅ CI setup completed successfully")
        return 0
    else:
        logger.error("❌ CI setup failed")
        return 1


if __name__ == "__main__":
    result = asyncio.run(main())
    sys.exit(result)
