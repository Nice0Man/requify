#!/usr/bin/env python3
"""
Script to fix system admin permissions.
Updates the existing system admin role to have all available permissions.
"""

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.user import User
from app.core.constants import Permission
from app.utils.logger import logger


def fix_admin_permissions():
    """Fix system admin role to have all permissions"""
    db = SessionLocal()
    try:
        # Find existing system admin roles
        admin_roles = (
            db.query(EnhancedRole)
            .filter(EnhancedRole.name.in_(["system_admin", "system_administrator"]))
            .all()
        )

        print(f"Found {len(admin_roles)} admin roles:")
        for role in admin_roles:
            print(f"- {role.name}: {role.display_name}")
            current_perms = (
                role.permissions_config.get("permissions", [])
                if role.permissions_config
                else []
            )
            print(f"  Current permissions: {len(current_perms)}")

        # Get all available permissions
        all_permissions = [perm.value for perm in Permission]
        print(f"\nAll available permissions: {len(all_permissions)}")

        # Update each admin role
        for role in admin_roles:
            print(f"\nUpdating role: {role.name}")
            role.permissions_config = {"permissions": all_permissions}
            db.add(role)
            print(f"Updated {role.name} with {len(all_permissions)} permissions")

        # Check if we need to create system_administrator role
        system_admin_role = (
            db.query(EnhancedRole)
            .filter(EnhancedRole.name == "system_administrator")
            .first()
        )

        if not system_admin_role:
            print("\nCreating new system_administrator role...")
            from app.db.seeding import (
                get_system_role_definitions,
                create_role_from_definition,
            )

            system_roles = get_system_role_definitions()
            system_admin_def = next(
                (r for r in system_roles if r["name"] == "system_administrator"), None
            )

            if system_admin_def:
                system_admin_role = create_role_from_definition(db, system_admin_def)
                print(
                    f"Created system_administrator role with {len(all_permissions)} permissions"
                )

        # Find admin user and ensure role assignment
        admin_user = db.query(User).filter(User.email == "admin@example.com").first()
        if admin_user:
            print(f"\nFound admin user: {admin_user.email}")

            # Find the best admin role (prefer system_administrator)
            best_admin_role = (
                system_admin_role or admin_roles[0] if admin_roles else None
            )

            if best_admin_role:
                # Check if assignment exists
                existing_assignment = (
                    db.query(UserRoleAssignment)
                    .filter(
                        UserRoleAssignment.user_id == admin_user.id,
                        UserRoleAssignment.role_id == best_admin_role.id,
                        UserRoleAssignment.is_active == True,
                    )
                    .first()
                )

                if existing_assignment:
                    print(
                        f"Admin user already has role assignment: {best_admin_role.name}"
                    )
                else:
                    print(f"Creating role assignment for admin user...")
                    from app.schemas.enhanced_role import UserRoleAssignmentCreate
                    from app.crud.enhanced_role import (
                        user_role_assignment as assignment_crud,
                    )

                    assignment_data = UserRoleAssignmentCreate(
                        user_id=admin_user.id,
                        role_id=best_admin_role.id,
                        is_active=True,
                        is_primary=True,
                        assignment_reason="System admin permissions fix",
                    )

                    assignment = assignment_crud.create(db, obj_in=assignment_data)
                    print(f"Created role assignment: {assignment.id}")

        # Commit changes
        db.commit()
        print("\n✅ Successfully updated admin permissions!")
        return True

    except Exception as e:
        print(f"❌ Error fixing admin permissions: {e}")
        db.rollback()
        return False
    finally:
        db.close()


if __name__ == "__main__":
    print("Fixing system admin permissions...")
    success = fix_admin_permissions()
    sys.exit(0 if success else 1)
