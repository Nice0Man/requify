"""
Database seeding for Enhanced Role System.
Creates all roles defined in constants.py and assigns system admin role to admin@example.com.
"""

from typing import Dict, List
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from app.core.constants import (
    RoleScope,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
    Permission,
)
from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.user import User
from app.crud.enhanced_role import enhanced_role as role_crud
from app.crud.user import user as user_crud
from app.schemas.enhanced_role import EnhancedRoleCreate, UserRoleAssignmentCreate
from app.utils.logger import logger


def get_system_role_definitions() -> List[Dict]:
    """Get all system role definitions with their permissions"""
    return [
        {
            "name": "system_administrator",
            "display_name": "System Administrator",
            "description": "Full system access and administration",
            "scope": RoleScope.SYSTEM,
            "role_level": 10,
            "system_role": SystemRole.SYSTEM_ADMIN,
            "is_system": True,
            "is_active": True,
            "is_assignable": True,
            "priority": 100,
            "permissions_config": {
                "permissions": [
                    perm.value for perm in Permission
                ]  # All available permissions
            },
        },
        {
            "name": "platform_administrator",
            "display_name": "Platform Administrator",
            "description": "Platform management and configuration",
            "scope": RoleScope.SYSTEM,
            "role_level": 9,
            "system_role": SystemRole.PLATFORM_ADMIN,
            "is_system": True,
            "is_active": True,
            "is_assignable": True,
            "priority": 90,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_SYSTEM_SETTINGS.value,
                    Permission.VIEW_SYSTEM_LOGS.value,
                    Permission.MANAGE_INTEGRATIONS.value,
                    Permission.VIEW_ADVANCED_ANALYTICS.value,
                ]
            },
        },
        {
            "name": "support_administrator",
            "display_name": "Support Administrator",
            "description": "Advanced support and troubleshooting",
            "scope": RoleScope.SYSTEM,
            "role_level": 8,
            "system_role": SystemRole.SUPPORT_ADMIN,
            "is_system": True,
            "is_active": True,
            "is_assignable": True,
            "priority": 80,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_SYSTEM_LOGS.value,
                    Permission.VIEW_COMPANY_ANALYTICS.value,
                    Permission.VIEW_REPORTS.value,
                    Permission.CREATE_REPORTS.value,
                ]
            },
        },
        {
            "name": "support_agent",
            "display_name": "Support Agent",
            "description": "Basic support and user assistance",
            "scope": RoleScope.SYSTEM,
            "role_level": 7,
            "system_role": SystemRole.SUPPORT_AGENT,
            "is_system": True,
            "is_active": True,
            "is_assignable": True,
            "priority": 70,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_REPORTS.value,
                    Permission.USE_API.value,
                ]
            },
        },
    ]


def get_company_role_definitions() -> List[Dict]:
    """Get all company role definitions with their permissions"""
    return [
        {
            "name": "company_owner",
            "display_name": "Company Owner",
            "description": "Company owner with full control",
            "scope": RoleScope.COMPANY,
            "role_level": 10,
            "company_role": CompanyRole.COMPANY_OWNER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 100,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_COMPANY.value,
                    Permission.MANAGE_COMPANY_SETTINGS.value,
                    Permission.MANAGE_COMPANY_USERS.value,
                    Permission.MANAGE_COMPANY_BILLING.value,
                    Permission.VIEW_COMPANY_ANALYTICS.value,
                    Permission.EXPORT_COMPANY_DATA.value,
                ]
            },
        },
        {
            "name": "company_administrator",
            "display_name": "Company Administrator",
            "description": "Company administration and management",
            "scope": RoleScope.COMPANY,
            "role_level": 9,
            "company_role": CompanyRole.COMPANY_ADMIN,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 90,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_COMPANY_SETTINGS.value,
                    Permission.MANAGE_COMPANY_USERS.value,
                    Permission.VIEW_COMPANY_SETTINGS.value,
                    Permission.VIEW_COMPANY_USERS.value,
                    Permission.INVITE_USERS.value,
                    Permission.REMOVE_USERS.value,
                    Permission.VIEW_COMPANY_ANALYTICS.value,
                ]
            },
        },
        {
            "name": "billing_manager",
            "display_name": "Billing Manager",
            "description": "Billing and subscription management",
            "scope": RoleScope.COMPANY,
            "role_level": 7,
            "company_role": CompanyRole.BILLING_MANAGER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 70,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_COMPANY_BILLING.value,
                    Permission.VIEW_COMPANY_BILLING.value,
                    Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
                ]
            },
        },
        {
            "name": "company_viewer",
            "display_name": "Company Viewer",
            "description": "Read-only access to company data",
            "scope": RoleScope.COMPANY,
            "role_level": 1,
            "company_role": CompanyRole.COMPANY_VIEWER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 10,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_COMPANY_SETTINGS.value,
                    Permission.VIEW_COMPANY_USERS.value,
                    Permission.USE_API.value,
                ]
            },
        },
    ]


def get_team_role_definitions() -> List[Dict]:
    """Get all team role definitions with their permissions"""
    return [
        {
            "name": "team_lead",
            "display_name": "Team Lead",
            "description": "Team leadership and coordination",
            "scope": RoleScope.TEAM,
            "role_level": 9,
            "team_role": TeamRole.TEAM_LEAD,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 90,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_TEAM.value,
                    Permission.MANAGE_TEAM_MEMBERS.value,
                    Permission.VIEW_TEAM_MEMBERS.value,
                    Permission.ASSIGN_TEAM_ROLES.value,
                    Permission.VIEW_TEAM_PERFORMANCE.value,
                ]
            },
        },
        {
            "name": "senior_developer",
            "display_name": "Senior Developer",
            "description": "Senior development team member",
            "scope": RoleScope.TEAM,
            "role_level": 7,
            "team_role": TeamRole.SENIOR_DEVELOPER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 70,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_TEAM.value,
                    Permission.VIEW_TEAM_MEMBERS.value,
                    Permission.CREATE_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                    Permission.VIEW_REQUIREMENT.value,
                ]
            },
        },
        {
            "name": "developer",
            "display_name": "Developer",
            "description": "Development team member",
            "scope": RoleScope.TEAM,
            "role_level": 5,
            "team_role": TeamRole.DEVELOPER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 50,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_TEAM.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.CREATE_COMMENT.value,
                    Permission.USE_API.value,
                ]
            },
        },
    ]


def get_project_role_definitions() -> List[Dict]:
    """Get all project role definitions with their permissions"""
    return [
        {
            "name": "project_manager",
            "display_name": "Project Manager",
            "description": "Project management and coordination",
            "scope": RoleScope.PROJECT,
            "role_level": 9,
            "project_role": ProjectRole.PROJECT_MANAGER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 90,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_PROJECT.value,
                    Permission.MANAGE_PROJECT_SETTINGS.value,
                    Permission.MANAGE_PROJECT_MEMBERS.value,
                    Permission.VIEW_PROJECT_MEMBERS.value,
                    Permission.VIEW_PROJECT_ANALYTICS.value,
                    Permission.CREATE_PROJECT.value,
                    Permission.VIEW_PROJECT.value,
                ]
            },
        },
        {
            "name": "project_owner",
            "display_name": "Project Owner",
            "description": "Project ownership and control",
            "scope": RoleScope.PROJECT,
            "role_level": 10,
            "project_role": ProjectRole.PROJECT_OWNER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 100,
            "permissions_config": {
                "permissions": [
                    Permission.MANAGE_PROJECT.value,
                    Permission.DELETE_PROJECT.value,
                    Permission.ARCHIVE_PROJECT.value,
                    Permission.MANAGE_PROJECT_SETTINGS.value,
                    Permission.MANAGE_PROJECT_MEMBERS.value,
                    Permission.VIEW_PROJECT_ANALYTICS.value,
                ]
            },
        },
        {
            "name": "business_analyst",
            "display_name": "Business Analyst",
            "description": "Business analysis and requirements management",
            "scope": RoleScope.PROJECT,
            "role_level": 7,
            "project_role": ProjectRole.BUSINESS_ANALYST,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 70,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_PROJECT.value,
                    Permission.CREATE_REQUIREMENT.value,
                    Permission.EDIT_REQUIREMENT.value,
                    Permission.VIEW_REQUIREMENT.value,
                    Permission.APPROVE_REQUIREMENT.value,
                    Permission.LINK_REQUIREMENTS.value,
                ]
            },
        },
        {
            "name": "qa_engineer",
            "display_name": "QA Engineer",
            "description": "Quality assurance and testing",
            "scope": RoleScope.PROJECT,
            "role_level": 6,
            "project_role": ProjectRole.QA_ENGINEER,
            "is_system": False,
            "is_active": True,
            "is_assignable": True,
            "priority": 60,
            "permissions_config": {
                "permissions": [
                    Permission.VIEW_PROJECT.value,
                    Permission.CREATE_TEST.value,
                    Permission.EXECUTE_TEST.value,
                    Permission.VIEW_TEST_RESULTS.value,
                    Permission.MANAGE_TEST_PLANS.value,
                    Permission.VIEW_REQUIREMENT.value,
                ]
            },
        },
    ]


def create_role_from_definition(db: Session, role_def: Dict) -> EnhancedRole:
    """Create a role from definition dictionary"""

    # Convert enum values to strings
    role_data = role_def.copy()

    if "scope" in role_data and hasattr(role_data["scope"], "value"):
        role_data["scope"] = role_data["scope"].value

    if (
        "system_role" in role_data
        and role_data["system_role"]
        and hasattr(role_data["system_role"], "value")
    ):
        role_data["system_role"] = role_data["system_role"].value

    if (
        "company_role" in role_data
        and role_data["company_role"]
        and hasattr(role_data["company_role"], "value")
    ):
        role_data["company_role"] = role_data["company_role"].value

    if (
        "team_role" in role_data
        and role_data["team_role"]
        and hasattr(role_data["team_role"], "value")
    ):
        role_data["team_role"] = role_data["team_role"].value

    if (
        "project_role" in role_data
        and role_data["project_role"]
        and hasattr(role_data["project_role"], "value")
    ):
        role_data["project_role"] = role_data["project_role"].value

    try:
        role_create = EnhancedRoleCreate(**role_data)
        return role_crud.create(db, obj_in=role_create)
    except Exception as e:
        logger.error(f"Error creating role {role_def['name']}: {e}")
        raise


def assign_system_admin_role(
    db: Session, admin_email: str = "admin@example.com"
) -> bool:
    """Assign system administrator role to the admin user"""
    try:
        # Get admin user
        admin_user = user_crud.get_by_email(db, email=admin_email)
        if not admin_user:
            logger.warning(f"Admin user {admin_email} not found")
            return False

        # Get system administrator role
        system_admin_role = role_crud.get_by_name(db, name="system_administrator")
        if not system_admin_role:
            logger.warning("System administrator role not found")
            return False

        # Check if assignment already exists
        from app.crud.enhanced_role import user_role_assignment as assignment_crud

        existing = assignment_crud.has_assignment(
            db,
            user_id=admin_user.id,
            role_id=system_admin_role.id,
            company_id=None,
            department_id=None,
            team_id=None,
            project_id=None,
        )

        if existing:
            logger.info(f"System admin role already assigned to {admin_email}")
            return True

        # Create assignment
        assignment_data = UserRoleAssignmentCreate(
            user_id=admin_user.id,
            role_id=system_admin_role.id,
            is_active=True,
            is_primary=True,
            assignment_reason="Initial system setup",
        )

        assignment = assignment_crud.create(db, obj_in=assignment_data)
        logger.info(f"System admin role assigned to {admin_email}")
        return True

    except Exception as e:
        logger.error(f"Error assigning system admin role: {e}")
        return False


def seed_enhanced_roles(db: Session) -> Dict[str, int]:
    """Seed all enhanced roles from constants.py"""

    stats = {
        "system_roles_created": 0,
        "company_roles_created": 0,
        "team_roles_created": 0,
        "project_roles_created": 0,
        "total_roles_created": 0,
        "errors": 0,
    }

    logger.info("Starting enhanced roles seeding...")

    # Seed system roles
    logger.info("Creating system roles...")
    for role_def in get_system_role_definitions():
        try:
            existing = role_crud.get_by_name(db, name=role_def["name"])
            if existing:
                logger.info(f"System role {role_def['name']} already exists")
                continue

            role = create_role_from_definition(db, role_def)
            stats["system_roles_created"] += 1
            logger.info(f"Created system role: {role.name}")

        except IntegrityError:
            logger.warning(
                f"System role {role_def['name']} already exists (integrity error)"
            )
            db.rollback()
        except Exception as e:
            logger.error(f"Error creating system role {role_def['name']}: {e}")
            stats["errors"] += 1
            db.rollback()

    # Seed company roles
    logger.info("Creating company roles...")
    for role_def in get_company_role_definitions():
        try:
            existing = role_crud.get_by_name(db, name=role_def["name"])
            if existing:
                logger.info(f"Company role {role_def['name']} already exists")
                continue

            role = create_role_from_definition(db, role_def)
            stats["company_roles_created"] += 1
            logger.info(f"Created company role: {role.name}")

        except IntegrityError:
            logger.warning(
                f"Company role {role_def['name']} already exists (integrity error)"
            )
            db.rollback()
        except Exception as e:
            logger.error(f"Error creating company role {role_def['name']}: {e}")
            stats["errors"] += 1
            db.rollback()

    # Seed team roles
    logger.info("Creating team roles...")
    for role_def in get_team_role_definitions():
        try:
            existing = role_crud.get_by_name(db, name=role_def["name"])
            if existing:
                logger.info(f"Team role {role_def['name']} already exists")
                continue

            role = create_role_from_definition(db, role_def)
            stats["team_roles_created"] += 1
            logger.info(f"Created team role: {role.name}")

        except IntegrityError:
            logger.warning(
                f"Team role {role_def['name']} already exists (integrity error)"
            )
            db.rollback()
        except Exception as e:
            logger.error(f"Error creating team role {role_def['name']}: {e}")
            stats["errors"] += 1
            db.rollback()

    # Seed project roles
    logger.info("Creating project roles...")
    for role_def in get_project_role_definitions():
        try:
            existing = role_crud.get_by_name(db, name=role_def["name"])
            if existing:
                logger.info(f"Project role {role_def['name']} already exists")
                continue

            role = create_role_from_definition(db, role_def)
            stats["project_roles_created"] += 1
            logger.info(f"Created project role: {role.name}")

        except IntegrityError:
            logger.warning(
                f"Project role {role_def['name']} already exists (integrity error)"
            )
            db.rollback()
        except Exception as e:
            logger.error(f"Error creating project role {role_def['name']}: {e}")
            stats["errors"] += 1
            db.rollback()

    # Calculate total
    stats["total_roles_created"] = (
        stats["system_roles_created"]
        + stats["company_roles_created"]
        + stats["team_roles_created"]
        + stats["project_roles_created"]
    )

    # Assign system admin role to admin user
    logger.info("Assigning system admin role to admin@example.com...")
    admin_assigned = assign_system_admin_role(db)

    # Commit all changes
    try:
        db.commit()
        logger.info("Enhanced roles seeding completed successfully")
        logger.info(f"Stats: {stats}")
        if admin_assigned:
            logger.info("System admin role assigned successfully")
    except Exception as e:
        logger.error(f"Error committing seeding changes: {e}")
        db.rollback()
        stats["errors"] += 1

    return stats
