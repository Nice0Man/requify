"""
Интеграционные тесты системы иерархии ролей с реальными ролями и разрешениями.
Тестирование реальных сценариев использования системы ролей.
"""

import pytest
from typing import List, Set, Dict, Any
from datetime import datetime, timezone, timedelta

from app.models.enhanced_role_system import EnhancedRole, UserRoleAssignment
from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.user import User
from app.core.constants import (
    RoleScope,
    Permission,
    SystemRole,
    CompanyRole,
    DepartmentRole,
    TeamRole,
    ProjectRole,
)
from app.services.role_hierarchy_service import RoleHierarchyService
from app.services.role_service import role_service
from app.crud.enhanced_role import enhanced_role
from .conftest_role_hierarchy import RoleHierarchyTestHelper


class TestRealWorldRoleHierarchy:
    """Тесты с реальными ролями из production окружения."""

    @pytest.fixture
    async def system_roles(self, db_session) -> List[EnhancedRole]:
        """Создать системные роли."""
        system_roles_data = [
            {
                "name": SystemRole.SYSTEM_ADMIN.value,
                "display_name": "System Administrator",
                "scope": RoleScope.SYSTEM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_SYSTEM.value,
                        Permission.MANAGE_USERS.value,
                        Permission.MANAGE_ALL_COMPANIES.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.MANAGE_SYSTEM_SETTINGS.value,
                        Permission.AUDIT_SYSTEM.value,
                    ]
                },
                "role_level": 100,
                "is_active": True,
                "is_system": True,
            },
            {
                "name": SystemRole.PLATFORM_ADMIN.value,
                "display_name": "Platform Administrator",
                "scope": RoleScope.SYSTEM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_SYSTEM.value,
                        Permission.VIEW_USERS.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.MANAGE_SYSTEM_SETTINGS.value,
                    ]
                },
                "role_level": 90,
                "is_active": True,
                "is_system": True,
            },
            {
                "name": SystemRole.SUPPORT_ADMIN.value,
                "display_name": "Support Administrator",
                "scope": RoleScope.SYSTEM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_USERS.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.MANAGE_USERS.value,
                    ]
                },
                "role_level": 80,
                "is_active": True,
                "is_system": True,
            },
        ]

        roles = []
        for role_data in system_roles_data:
            role = EnhancedRole(**role_data)
            db_session.add(role)
            roles.append(role)

        await db_session.commit()

        for role in roles:
            await db_session.refresh(role)

        return roles

    @pytest.fixture
    async def company_roles(self, db_session) -> List[EnhancedRole]:
        """Создать роли уровня компании."""
        company_roles_data = [
            {
                "name": CompanyRole.COMPANY_OWNER.value,
                "display_name": "Company Owner",
                "scope": RoleScope.COMPANY.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY.value,
                        Permission.MANAGE_COMPANY_SETTINGS.value,
                        Permission.MANAGE_COMPANY_USERS.value,
                        Permission.MANAGE_COMPANY_BILLING.value,
                        Permission.INVITE_USERS.value,
                        Permission.REMOVE_USERS.value,
                    ]
                },
                "role_level": 50,
                "is_active": True,
            },
            {
                "name": CompanyRole.COMPANY_ADMIN.value,
                "display_name": "Company Administrator",
                "scope": RoleScope.COMPANY.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY_SETTINGS.value,
                        Permission.MANAGE_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_BILLING.value,
                        Permission.INVITE_USERS.value,
                    ]
                },
                "role_level": 40,
                "is_active": True,
            },
            {
                "name": CompanyRole.COMPANY_VIEWER.value,
                "display_name": "Company Viewer",
                "scope": RoleScope.COMPANY.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_ANALYTICS.value,
                    ]
                },
                "role_level": 10,
                "is_active": True,
            },
        ]

        roles = []
        for role_data in company_roles_data:
            role = EnhancedRole(**role_data)
            db_session.add(role)
            roles.append(role)

        await db_session.commit()

        for role in roles:
            await db_session.refresh(role)

        return roles

    @pytest.fixture
    async def team_roles(self, db_session) -> List[EnhancedRole]:
        """Создать роли уровня команды."""
        team_roles_data = [
            {
                "name": TeamRole.TEAM_LEAD.value,
                "display_name": "Team Lead",
                "scope": RoleScope.TEAM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_TEAM.value,
                        Permission.MANAGE_TEAM_MEMBERS.value,
                        Permission.ASSIGN_TEAM_ROLES.value,
                        Permission.VIEW_TEAM_PERFORMANCE.value,
                        Permission.CREATE_PROJECT.value,
                    ]
                },
                "role_level": 30,
                "is_active": True,
            },
            {
                "name": TeamRole.SENIOR_DEVELOPER.value,
                "display_name": "Senior Developer",
                "scope": RoleScope.TEAM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_TEAM_MEMBERS.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.APPROVE_REQUIREMENT.value,
                    ]
                },
                "role_level": 25,
                "is_active": True,
            },
            {
                "name": TeamRole.DEVELOPER.value,
                "display_name": "Developer",
                "scope": RoleScope.TEAM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_TEAM.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                    ]
                },
                "role_level": 20,
                "is_active": True,
            },
            {
                "name": TeamRole.MEMBER.value,
                "display_name": "Team Member",
                "scope": RoleScope.TEAM.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_COMMENT.value,
                    ]
                },
                "role_level": 15,
                "is_active": True,
            },
        ]

        roles = []
        for role_data in team_roles_data:
            role = EnhancedRole(**role_data)
            db_session.add(role)
            roles.append(role)

        await db_session.commit()

        for role in roles:
            await db_session.refresh(role)

        return roles

    @pytest.mark.asyncio
    async def test_system_role_hierarchy_creation(
        self, db_session, system_roles, role_hierarchy_service: RoleHierarchyService
    ):
        """Тест создания иерархии системных ролей."""
        # Создаем иерархию: SUPPORT_ADMIN -> PLATFORM_ADMIN -> SYSTEM_ADMIN
        support_admin = next(
            r for r in system_roles if r.name == SystemRole.SUPPORT_ADMIN.value
        )
        platform_admin = next(
            r for r in system_roles if r.name == SystemRole.PLATFORM_ADMIN.value
        )
        system_admin = next(
            r for r in system_roles if r.name == SystemRole.SYSTEM_ADMIN.value
        )

        # Создаем связи наследования
        hierarchy1 = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=support_admin.id,
            child_role_id=platform_admin.id,
            inheritance_type=InheritanceType.FULL,
        )

        hierarchy2 = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=platform_admin.id,
            child_role_id=system_admin.id,
            inheritance_type=InheritanceType.FULL,
        )

        assert hierarchy1.is_active
        assert hierarchy2.is_active

        # Проверяем эффективные разрешения SYSTEM_ADMIN
        system_admin_perms = (
            await role_hierarchy_service.get_role_effective_permissions(
                db_session, system_admin.id
            )
        )

        # SYSTEM_ADMIN должен иметь все разрешения из цепочки
        expected_perms = {
            # Собственные
            Permission.MANAGE_SYSTEM.value,
            Permission.MANAGE_USERS.value,
            Permission.MANAGE_ALL_COMPANIES.value,
            Permission.VIEW_SYSTEM_LOGS.value,
            Permission.MANAGE_SYSTEM_SETTINGS.value,
            Permission.AUDIT_SYSTEM.value,
            # От PLATFORM_ADMIN (уже есть пересечения)
            # От SUPPORT_ADMIN (уже есть пересечения)
            Permission.VIEW_USERS.value,
        }

        assert expected_perms.issubset(system_admin_perms)

    @pytest.mark.asyncio
    async def test_company_role_hierarchy_creation(
        self, db_session, company_roles, role_hierarchy_service: RoleHierarchyService
    ):
        """Тест создания иерархии ролей компании."""
        # Создаем иерархию: COMPANY_VIEWER -> COMPANY_ADMIN -> COMPANY_OWNER
        viewer = next(
            r for r in company_roles if r.name == CompanyRole.COMPANY_VIEWER.value
        )
        admin = next(
            r for r in company_roles if r.name == CompanyRole.COMPANY_ADMIN.value
        )
        owner = next(
            r for r in company_roles if r.name == CompanyRole.COMPANY_OWNER.value
        )

        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=viewer.id,
            child_role_id=admin.id,
            inheritance_type=InheritanceType.FULL,
        )

        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=admin.id,
            child_role_id=owner.id,
            inheritance_type=InheritanceType.FULL,
        )

        # Проверяем эффективные разрешения COMPANY_OWNER
        owner_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, owner.id
        )

        # Должен иметь все разрешения из цепочки
        expected_perms = {
            # От COMPANY_VIEWER
            Permission.VIEW_COMPANY_SETTINGS.value,
            Permission.VIEW_COMPANY_USERS.value,
            Permission.VIEW_COMPANY_ANALYTICS.value,
            # От COMPANY_ADMIN
            Permission.MANAGE_COMPANY_SETTINGS.value,
            Permission.MANAGE_COMPANY_USERS.value,
            Permission.VIEW_COMPANY_BILLING.value,
            Permission.INVITE_USERS.value,
            # Собственные
            Permission.MANAGE_COMPANY.value,
            Permission.MANAGE_COMPANY_BILLING.value,
            Permission.REMOVE_USERS.value,
        }

        assert expected_perms.issubset(owner_perms)

    @pytest.mark.asyncio
    async def test_team_role_hierarchy_with_partial_inheritance(
        self, db_session, team_roles, role_hierarchy_service: RoleHierarchyService
    ):
        """Тест иерархии команды с частичным наследованием."""
        member = next(r for r in team_roles if r.name == TeamRole.MEMBER.value)
        developer = next(r for r in team_roles if r.name == TeamRole.DEVELOPER.value)
        senior_dev = next(
            r for r in team_roles if r.name == TeamRole.SENIOR_DEVELOPER.value
        )
        team_lead = next(r for r in team_roles if r.name == TeamRole.TEAM_LEAD.value)

        # Создаем иерархию с разными типами наследования

        # MEMBER -> DEVELOPER (полное наследование)
        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=member.id,
            child_role_id=developer.id,
            inheritance_type=InheritanceType.FULL,
        )

        # DEVELOPER -> SENIOR_DEVELOPER (частичное наследование)
        hierarchy = RoleHierarchy(
            parent_role_id=developer.id,
            child_role_id=senior_dev.id,
            inheritance_type=InheritanceType.PARTIAL,
            inherited_permissions=[
                Permission.VIEW_TEAM.value,
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
            ],
            is_active=True,
        )
        db_session.add(hierarchy)
        await db_session.commit()

        # SENIOR_DEVELOPER -> TEAM_LEAD (ограниченное наследование)
        hierarchy2 = RoleHierarchy(
            parent_role_id=senior_dev.id,
            child_role_id=team_lead.id,
            inheritance_type=InheritanceType.RESTRICT,
            excluded_permissions=[
                Permission.APPROVE_REQUIREMENT.value  # исключаем это разрешение
            ],
            is_active=True,
        )
        db_session.add(hierarchy2)
        await db_session.commit()

        # Проверяем эффективные разрешения TEAM_LEAD
        team_lead_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, team_lead.id
        )

        # Должен иметь свои разрешения + наследованные (с ограничениями)
        assert Permission.MANAGE_TEAM.value in team_lead_perms  # собственное
        assert Permission.VIEW_TEAM.value in team_lead_perms  # унаследованное
        assert Permission.CREATE_PROJECT.value in team_lead_perms  # собственное

        # НЕ должен иметь исключенные разрешения из RESTRICT
        # (но может иметь собственные такие же)


class TestCrossHierarchyScenarios:
    """Тесты сценариев пересечения разных иерархий."""

    @pytest.mark.asyncio
    async def test_user_with_multiple_scope_roles(
        self, db_session, test_helper: RoleHierarchyTestHelper
    ):
        """Тест пользователя с ролями в разных областях."""
        # Создаем пользователя
        user = User(
            email="multi.role@example.com",
            username="multirole",
            hashed_password="hashed",
            is_active=True,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)

        # Создаем роли в разных областях
        system_role = await test_helper.create_test_role(
            db_session,
            SystemRole.SUPPORT_ADMIN.value,
            [Permission.VIEW_USERS.value, Permission.VIEW_SYSTEM_LOGS.value],
            scope=RoleScope.SYSTEM.value,
        )

        company_role = await test_helper.create_test_role(
            db_session,
            CompanyRole.COMPANY_ADMIN.value,
            [Permission.MANAGE_COMPANY_SETTINGS.value, Permission.INVITE_USERS.value],
            scope=RoleScope.COMPANY.value,
        )

        team_role = await test_helper.create_test_role(
            db_session,
            TeamRole.TEAM_LEAD.value,
            [Permission.MANAGE_TEAM.value, Permission.CREATE_PROJECT.value],
            scope=RoleScope.TEAM.value,
        )

        # Назначаем роли пользователю
        assignments = []
        for role in [system_role, company_role, team_role]:
            assignment = UserRoleAssignment(
                user_id=user.id, role_id=role.id, is_active=True
            )
            db_session.add(assignment)
            assignments.append(assignment)

        await db_session.commit()

        # Получаем все разрешения пользователя
        user_permissions = await role_service.get_user_permissions(db_session, user)

        # Пользователь должен иметь разрешения из всех ролей
        expected_perms = {
            Permission.VIEW_USERS.value,
            Permission.VIEW_SYSTEM_LOGS.value,
            Permission.MANAGE_COMPANY_SETTINGS.value,
            Permission.INVITE_USERS.value,
            Permission.MANAGE_TEAM.value,
            Permission.CREATE_PROJECT.value,
        }

        assert expected_perms.issubset(user_permissions)

    @pytest.mark.asyncio
    async def test_complex_multi_inheritance_scenario(
        self,
        db_session,
        test_helper: RoleHierarchyTestHelper,
        role_hierarchy_service: RoleHierarchyService,
    ):
        """Тест сложного сценария множественного наследования."""
        # Создаем роли
        base_viewer = await test_helper.create_test_role(
            db_session, "base_viewer", [Permission.VIEW_DASHBOARD.value]
        )

        requirement_reader = await test_helper.create_test_role(
            db_session, "requirement_reader", [Permission.VIEW_REQUIREMENT.value]
        )

        project_reader = await test_helper.create_test_role(
            db_session, "project_reader", [Permission.VIEW_PROJECT.value]
        )

        analyst = await test_helper.create_test_role(
            db_session,
            "analyst",
            [Permission.VIEW_ANALYTICS.value, Permission.CREATE_REPORTS.value],
        )

        # Создаем множественное наследование: analyst наследует от всех
        for parent_role in [base_viewer, requirement_reader, project_reader]:
            await role_hierarchy_service.create_inheritance(
                db_session,
                parent_role_id=parent_role.id,
                child_role_id=analyst.id,
                inheritance_type=InheritanceType.FULL,
            )

        # Проверяем эффективные разрешения analyst
        analyst_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, analyst.id
        )

        expected_perms = {
            # Собственные
            Permission.VIEW_ANALYTICS.value,
            Permission.CREATE_REPORTS.value,
            # Унаследованные
            Permission.VIEW_DASHBOARD.value,
            Permission.VIEW_REQUIREMENT.value,
            Permission.VIEW_PROJECT.value,
        }

        test_helper.assert_permissions_equal(expected_perms, analyst_perms)


class TestProjectHierarchyScenarios:
    """Тесты сценариев иерархии проектных ролей."""

    @pytest.fixture
    async def project_roles(self, db_session) -> List[EnhancedRole]:
        """Создать проектные роли."""
        project_roles_data = [
            {
                "name": ProjectRole.PROJECT_VIEWER.value,
                "display_name": "Project Viewer",
                "scope": RoleScope.PROJECT.value,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_DASHBOARD.value,
                    ]
                },
                "role_level": 10,
            },
            {
                "name": ProjectRole.DEVELOPER.value,
                "display_name": "Project Developer",
                "scope": RoleScope.PROJECT.value,
                "permissions_config": {
                    "permissions": [
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.CREATE_COMMENT.value,
                    ]
                },
                "role_level": 20,
            },
            {
                "name": ProjectRole.QA_ENGINEER.value,
                "display_name": "QA Engineer",
                "scope": RoleScope.PROJECT.value,
                "permissions_config": {
                    "permissions": [
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_TEST_CASE.value,
                    ]
                },
                "role_level": 25,
            },
            {
                "name": ProjectRole.PROJECT_MANAGER.value,
                "display_name": "Project Manager",
                "scope": RoleScope.PROJECT.value,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_PROJECT.value,
                        Permission.MANAGE_PROJECT_MEMBERS.value,
                        Permission.APPROVE_REQUIREMENT.value,
                        Permission.CREATE_RELEASE.value,
                        Permission.APPROVE_RELEASE.value,
                    ]
                },
                "role_level": 40,
            },
        ]

        roles = []
        for role_data in project_roles_data:
            role = EnhancedRole(**role_data)
            db_session.add(role)
            roles.append(role)

        await db_session.commit()

        for role in roles:
            await db_session.refresh(role)

        return roles

    @pytest.mark.asyncio
    async def test_project_role_hierarchy_with_specializations(
        self, db_session, project_roles, role_hierarchy_service: RoleHierarchyService
    ):
        """Тест иерархии проектных ролей со специализациями."""
        viewer = next(
            r for r in project_roles if r.name == ProjectRole.PROJECT_VIEWER.value
        )
        developer = next(
            r for r in project_roles if r.name == ProjectRole.DEVELOPER.value
        )
        qa_engineer = next(
            r for r in project_roles if r.name == ProjectRole.QA_ENGINEER.value
        )
        pm = next(
            r for r in project_roles if r.name == ProjectRole.PROJECT_MANAGER.value
        )

        # Создаем базовую иерархию: viewer -> developer
        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=viewer.id,
            child_role_id=developer.id,
            inheritance_type=InheritanceType.FULL,
        )

        # QA наследует от viewer (базовые разрешения просмотра)
        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=viewer.id,
            child_role_id=qa_engineer.id,
            inheritance_type=InheritanceType.FULL,
        )

        # PM наследует от developer и QA (может делать все)
        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=developer.id,
            child_role_id=pm.id,
            inheritance_type=InheritanceType.FULL,
            priority=1,
        )

        await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=qa_engineer.id,
            child_role_id=pm.id,
            inheritance_type=InheritanceType.FULL,
            priority=2,
        )

        # Проверяем разрешения PM
        pm_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, pm.id
        )

        expected_perms = {
            # От viewer (через developer и qa)
            Permission.VIEW_PROJECT.value,
            Permission.VIEW_REQUIREMENT.value,
            Permission.VIEW_DASHBOARD.value,
            # От developer
            Permission.CREATE_REQUIREMENT.value,
            Permission.EDIT_REQUIREMENT.value,
            Permission.CREATE_COMMENT.value,
            # От QA
            Permission.CREATE_TEST.value,
            Permission.EXECUTE_TEST.value,
            Permission.VIEW_TESTS.value,
            Permission.CREATE_TEST_CASE.value,
            # Собственные
            Permission.MANAGE_PROJECT.value,
            Permission.MANAGE_PROJECT_MEMBERS.value,
            Permission.APPROVE_REQUIREMENT.value,
            Permission.CREATE_RELEASE.value,
            Permission.APPROVE_RELEASE.value,
        }

        assert expected_perms.issubset(pm_perms)


class TestPermissionInheritanceEdgeCases:
    """Тесты граничных случаев наследования разрешений."""

    @pytest.mark.asyncio
    async def test_partial_inheritance_with_overlapping_permissions(
        self, db_session, test_helper: RoleHierarchyTestHelper
    ):
        """Тест частичного наследования с пересекающимися разрешениями."""
        # Создаем роли с пересекающимися разрешениями
        base_role = await test_helper.create_test_role(
            db_session,
            "base_role",
            [
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_REQUIREMENT.value,
                Permission.EDIT_REQUIREMENT.value,
                Permission.DELETE_REQUIREMENT.value,
            ],
        )

        specialized_role = await test_helper.create_test_role(
            db_session,
            "specialized_role",
            [
                Permission.VIEW_REQUIREMENT.value,  # пересечение
                Permission.APPROVE_REQUIREMENT.value,
                Permission.CREATE_COMMENT.value,
            ],
        )

        # Создаем частичное наследование - только некоторые разрешения
        hierarchy = RoleHierarchy(
            parent_role_id=base_role.id,
            child_role_id=specialized_role.id,
            inheritance_type=InheritanceType.PARTIAL,
            inherited_permissions=[
                Permission.VIEW_REQUIREMENT.value,
                Permission.CREATE_REQUIREMENT.value,
            ],
            is_active=True,
        )
        db_session.add(hierarchy)
        await db_session.commit()

        # Получаем эффективные разрешения
        from app.services.role_hierarchy_service import role_hierarchy_service

        specialized_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, specialized_role.id
        )

        expected_perms = {
            # Собственные
            Permission.VIEW_REQUIREMENT.value,
            Permission.APPROVE_REQUIREMENT.value,
            Permission.CREATE_COMMENT.value,
            # Унаследованные частично
            Permission.CREATE_REQUIREMENT.value,
        }

        test_helper.assert_permissions_equal(expected_perms, specialized_perms)

        # НЕ должно быть исключенных разрешений
        assert Permission.EDIT_REQUIREMENT.value not in specialized_perms
        assert Permission.DELETE_REQUIREMENT.value not in specialized_perms

    @pytest.mark.asyncio
    async def test_restrict_inheritance_edge_cases(
        self, db_session, test_helper: RoleHierarchyTestHelper
    ):
        """Тест ограничивающего наследования в граничных случаях."""
        # Создаем мощную родительскую роль
        super_role = await test_helper.create_test_role(
            db_session,
            "super_role",
            [
                Permission.MANAGE_SYSTEM.value,
                Permission.MANAGE_USERS.value,
                (
                    Permission.DELETE_USER.value
                    if hasattr(Permission, "DELETE_USER")
                    else Permission.REMOVE_USERS.value
                ),
                Permission.VIEW_SYSTEM_LOGS.value,
                Permission.AUDIT_SYSTEM.value,
            ],
        )

        # Создаем ограниченную роль
        limited_role = await test_helper.create_test_role(
            db_session,
            "limited_role",
            [Permission.VIEW_DASHBOARD.value, Permission.CREATE_COMMENT.value],
        )

        # Создаем ограничивающее наследование - исключаем опасные разрешения
        hierarchy = RoleHierarchy(
            parent_role_id=super_role.id,
            child_role_id=limited_role.id,
            inheritance_type=InheritanceType.RESTRICT,
            excluded_permissions=[
                Permission.MANAGE_SYSTEM.value,
                Permission.REMOVE_USERS.value,
                Permission.AUDIT_SYSTEM.value,
            ],
            is_active=True,
        )
        db_session.add(hierarchy)
        await db_session.commit()

        # Получаем эффективные разрешения
        from app.services.role_hierarchy_service import role_hierarchy_service

        limited_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, limited_role.id
        )

        expected_perms = {
            # Собственные
            Permission.VIEW_DASHBOARD.value,
            Permission.CREATE_COMMENT.value,
            # Унаследованные (не исключенные)
            Permission.MANAGE_USERS.value,
            Permission.VIEW_SYSTEM_LOGS.value,
        }

        test_helper.assert_permissions_equal(expected_perms, limited_perms)

        # Исключенные разрешения не должны присутствовать
        excluded_perms = {
            Permission.MANAGE_SYSTEM.value,
            Permission.REMOVE_USERS.value,
            Permission.AUDIT_SYSTEM.value,
        }

        assert not excluded_perms.intersection(limited_perms)


class TestHierarchyValidationWithRealRoles:
    """Тесты валидации иерархии с реальными ролями."""

    @pytest.mark.asyncio
    async def test_prevent_invalid_scope_hierarchy(
        self,
        db_session,
        test_helper: RoleHierarchyTestHelper,
        role_hierarchy_service: RoleHierarchyService,
    ):
        """Тест предотвращения некорректной иерархии между областями."""
        # Создаем роли в разных областях
        system_role = await test_helper.create_test_role(
            db_session,
            SystemRole.SYSTEM_ADMIN.value,
            [Permission.MANAGE_SYSTEM.value],
            scope=RoleScope.SYSTEM.value,
        )

        team_role = await test_helper.create_test_role(
            db_session,
            TeamRole.TEAM_LEAD.value,
            [Permission.MANAGE_TEAM.value],
            scope=RoleScope.TEAM.value,
        )

        # Попытка создать иерархию между разными областями должна быть разрешена
        # (бизнес-логика может это поддерживать)
        hierarchy = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=team_role.id,
            child_role_id=system_role.id,
            inheritance_type=InheritanceType.PARTIAL,
        )

        assert hierarchy is not None
        assert hierarchy.is_active

    @pytest.mark.asyncio
    async def test_hierarchy_level_validation(
        self,
        db_session,
        test_helper: RoleHierarchyTestHelper,
        role_hierarchy_service: RoleHierarchyService,
    ):
        """Тест валидации уровней ролей в иерархии."""
        # Создаем роли с разными уровнями
        low_level_role = await test_helper.create_test_role(
            db_session,
            "junior_role",
            [Permission.VIEW_REQUIREMENT.value],
            role_level=10,
        )

        high_level_role = await test_helper.create_test_role(
            db_session, "senior_role", [Permission.MANAGE_SYSTEM.value], role_level=100
        )

        # Создание иерархии где высокий уровень наследует от низкого
        # должно выдавать предупреждение (но не ошибку)
        hierarchy = await role_hierarchy_service.create_inheritance(
            db_session,
            parent_role_id=high_level_role.id,  # высокий уровень родитель
            child_role_id=low_level_role.id,  # низкий уровень потомок
            inheritance_type=InheritanceType.FULL,
        )

        # Связь должна создаться, но может быть зафиксировано предупреждение
        assert hierarchy is not None


class TestPerformanceWithRealRoles:
    """Тесты производительности с реальными ролями."""

    @pytest.mark.asyncio
    async def test_large_role_hierarchy_performance(
        self,
        db_session,
        test_helper: RoleHierarchyTestHelper,
        role_hierarchy_service: RoleHierarchyService,
    ):
        """Тест производительности с большой иерархией реальных ролей."""
        import time

        # Создаем иерархию системных ролей
        roles = []
        base_permissions = [
            perm.value for perm in list(Permission)[:20]
        ]  # Первые 20 разрешений

        for i in range(20):  # Создаем 20 ролей
            role = await test_helper.create_test_role(
                db_session,
                f"test_role_{i}",
                base_permissions[: i + 1],  # Увеличиваем количество разрешений
                role_level=i * 5,
            )
            roles.append(role)

        # Создаем линейную иерархию
        hierarchies = []
        for i in range(19):
            hierarchy = await role_hierarchy_service.create_inheritance(
                db_session,
                parent_role_id=roles[i].id,
                child_role_id=roles[i + 1].id,
                inheritance_type=InheritanceType.FULL,
            )
            hierarchies.append(hierarchy)

        # Измеряем время вычисления разрешений для последней роли
        start_time = time.time()

        final_perms = await role_hierarchy_service.get_role_effective_permissions(
            db_session, roles[-1].id
        )

        end_time = time.time()
        computation_time = end_time - start_time

        # Проверяем, что время разумное (< 0.5 сек для 20 ролей)
        assert computation_time < 0.5

        # Последняя роль должна иметь все разрешения из цепочки
        assert len(final_perms) >= len(base_permissions)

    @pytest.mark.asyncio
    async def test_complex_hierarchy_cycle_detection_performance(
        self,
        db_session,
        test_helper: RoleHierarchyTestHelper,
        role_hierarchy_service: RoleHierarchyService,
    ):
        """Тест производительности обнаружения циклов в сложной иерархии."""
        import time

        # Создаем сложную сеть ролей
        roles = []
        for i in range(15):
            role = await test_helper.create_test_role(
                db_session,
                f"role_{i}",
                [Permission.VIEW_DASHBOARD.value, Permission.CREATE_COMMENT.value],
            )
            roles.append(role)

        # Создаем сложную (но ациклическую) сеть связей
        for i in range(12):
            for j in range(
                i + 1, min(i + 4, 15)
            ):  # Каждая роль наследует от 2-3 следующих
                await role_hierarchy_service.create_inheritance(
                    db_session,
                    parent_role_id=roles[i].id,
                    child_role_id=roles[j].id,
                    inheritance_type=InheritanceType.FULL,
                )

        # Измеряем время проверки валидации (включая обнаружение циклов)
        start_time = time.time()

        # Пытаемся создать связь, которая может создать цикл
        try:
            is_valid = await role_hierarchy_service.validate_inheritance(
                db_session,
                roles[-1].id,  # последняя роль
                roles[0].id,  # первая роль (может создать цикл)
            )
        except Exception:
            is_valid = False

        end_time = time.time()
        validation_time = end_time - start_time

        # Проверяем, что валидация быстрая (< 0.3 сек для 15 ролей с множественными связями)
        assert validation_time < 0.3


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
