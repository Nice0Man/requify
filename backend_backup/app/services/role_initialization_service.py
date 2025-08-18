"""
Сервис инициализации системы ролей и их иерархии.

Выполняет настройку:
1. Создание базовых ролей с правильными разрешениями
2. Установка иерархии ролей (DAG)
3. Создание начального администратора
4. Валидация корректности системы
"""

from typing import Dict, List, Optional, Tuple, Set
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import select

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
from app.models.role_hierarchy import RoleHierarchy, InheritanceType
from app.models.user import User
from app.crud.enhanced_role import enhanced_role as role_crud, user_role_assignment
from app.crud.role_hierarchy import role_hierarchy
from app.schemas.enhanced_role import EnhancedRoleCreate, UserRoleAssignmentCreate
from app.schemas.role_hierarchy import RoleHierarchyCreate
from app.services.role_hierarchy_service import role_hierarchy_service
from app.utils.logger import logger
from .base import BaseService

class RoleInitializationService(BaseService):
    """Сервис инициализации системы ролей."""

    def __init__(self):
        super().__init__()

    def get_service_name(self) -> str:
        """Возвращает имя сервиса."""
        return "RoleInitializationService"

    def get_enhanced_role_definitions(self) -> List[Dict]:
        """Получить расширенные определения ролей с правильной иерархией."""
        return [
            #             # Системные роли (высший уровень)
            #             {
                "name": "system_administrator",
                "display_name": "System Administrator",
                "description": "Полный доступ ко всей системе",
                "scope": RoleScope.SYSTEM,
                "role_level": 100,
                "system_role": SystemRole.SYSTEM_ADMIN,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 1000,
                "hierarchy_level": 1,  # Самый высокий уровень
                "permissions_config": {
                    "permissions": [perm.value for perm in Permission]  # Все разрешения
                },
            },
            {
                "name": "platform_administrator",
                "display_name": "Platform Administrator",
                "description": "Управление платформой и системными настройками",
                "scope": RoleScope.SYSTEM,
                "role_level": 95,
                "system_role": SystemRole.PLATFORM_ADMIN,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 950,
                "hierarchy_level": 2,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_SYSTEM_SETTINGS.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.VIEW_SYSTEM_INFO.value,
                        Permission.VIEW_HEALTH_CHECK.value,
                        Permission.VIEW_METRICS.value,
                        Permission.CREATE_BACKUP.value,
                        Permission.VIEW_BACKUPS.value,
                        Permission.UPDATE_SYSTEM_SETTINGS.value,
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "support_admin",
                "display_name": "Support Administrator",
                "description": "Продвинутая техническая поддержка",
                "scope": RoleScope.SYSTEM,
                "role_level": 90,
                "system_role": SystemRole.SUPPORT_ADMIN,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 900,
                "hierarchy_level": 3,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_USERS.value,
                        Permission.MANAGE_ALL_COMPANIES.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.VIEW_SYSTEM_INFO.value,
                        Permission.VIEW_HEALTH_CHECK.value,
                        Permission.VIEW_METRICS.value,
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.USE_API.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                    ]
                },
            },
            {
                "name": "support_agent",
                "display_name": "Support Agent",
                "description": "Базовая техническая поддержка",
                "scope": RoleScope.SYSTEM,
                "role_level": 85,
                "system_role": SystemRole.SUPPORT_AGENT,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 850,
                "hierarchy_level": 4,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_USERS.value,
                        Permission.VIEW_SYSTEM_INFO.value,
                        Permission.VIEW_HEALTH_CHECK.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "billing_admin",
                "display_name": "Billing Administrator",
                "description": "Управление биллингом и подписками",
                "scope": RoleScope.SYSTEM,
                "role_level": 80,
                "system_role": SystemRole.BILLING_ADMIN,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 800,
                "hierarchy_level": 5,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_GLOBAL_BILLING.value,
                        Permission.VIEW_COMPANY_BILLING.value,
                        Permission.MANAGE_COMPANY_BILLING.value,
                        Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
                        Permission.VIEW_USERS_STATISTICS.value,
                        Permission.VIEW_PROJECTS_STATISTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "security_auditor",
                "display_name": "Security Auditor",
                "description": "Аудит безопасности системы",
                "scope": RoleScope.SYSTEM,
                "role_level": 75,
                "system_role": SystemRole.SECURITY_AUDITOR,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 750,
                "hierarchy_level": 6,
                "permissions_config": {
                    "permissions": [
                        Permission.AUDIT_SYSTEM.value,
                        Permission.MANAGE_SECURITY_POLICIES.value,
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.VIEW_USER_SESSIONS.value,
                        Permission.REVOKE_SESSIONS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.VIEW_USERS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "compliance_officer",
                "display_name": "Compliance Officer",
                "description": "Соответствие требованиям и стандартам",
                "scope": RoleScope.SYSTEM,
                "role_level": 70,
                "system_role": SystemRole.COMPLIANCE_OFFICER,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 700,
                "hierarchy_level": 7,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.VIEW_QUALITY_METRICS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "system_developer",
                "display_name": "System Developer",
                "description": "Системный разработчик для технической поддержки",
                "scope": RoleScope.SYSTEM,
                "role_level": 65,
                "system_role": SystemRole.DEVELOPER,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 650,
                "hierarchy_level": 8,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.VIEW_SYSTEM_INFO.value,
                        Permission.VIEW_HEALTH_CHECK.value,
                        Permission.VIEW_METRICS.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "system_data_analyst",
                "display_name": "System Data Analyst",
                "description": "Системный аналитик данных",
                "scope": RoleScope.SYSTEM,
                "role_level": 60,
                "system_role": SystemRole.DATA_ANALYST,
                "is_system": True,
                "is_active": True,
                "is_assignable": True,
                "priority": 600,
                "hierarchy_level": 9,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_ADVANCED_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.VIEW_QUALITY_METRICS.value,
                        Permission.VIEW_USERS_STATISTICS.value,
                        Permission.VIEW_PROJECTS_STATISTICS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            #             # Компанийные роли (высокий уровень управления)
            #             {
                "name": "company_owner",
                "display_name": "Company Owner",
                "description": "Владелец компании с полным контролем",
                "scope": RoleScope.COMPANY,
                "role_level": 65,
                "company_role": CompanyRole.COMPANY_OWNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 650,
                "hierarchy_level": 10,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY.value,
                        Permission.MANAGE_COMPANY_SETTINGS.value,
                        Permission.MANAGE_COMPANY_USERS.value,
                        Permission.MANAGE_COMPANY_BILLING.value,
                        Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_BILLING.value,
                        Permission.VIEW_COMPANY_ANALYTICS.value,
                        Permission.EXPORT_COMPANY_DATA.value,
                        Permission.INVITE_USERS.value,
                        Permission.REMOVE_USERS.value,
                        Permission.CREATE_API_KEYS.value,
                        Permission.USE_API.value,
                        Permission.CREATE_DEPARTMENT.value,
                        Permission.CREATE_TEAM.value,
                        Permission.CREATE_PROJECT.value,
                    ]
                },
            },
            {
                "name": "company_administrator",
                "display_name": "Company Administrator",
                "description": "Администратор компании",
                "scope": RoleScope.COMPANY,
                "role_level": 60,
                "company_role": CompanyRole.COMPANY_ADMIN,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 600,
                "hierarchy_level": 11,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY_SETTINGS.value,
                        Permission.MANAGE_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.INVITE_USERS.value,
                        Permission.REMOVE_USERS.value,
                        Permission.VIEW_COMPANY_ANALYTICS.value,
                        Permission.SEARCH_COMPANY.value,
                        Permission.USE_API.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.CREATE_DEPARTMENT.value,
                        Permission.CREATE_TEAM.value,
                    ]
                },
            },
            {
                "name": "hr_manager",
                "display_name": "HR Manager",
                "description": "HR менеджер компании",
                "scope": RoleScope.COMPANY,
                "role_level": 55,
                "company_role": CompanyRole.HR_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 550,
                "hierarchy_level": 12,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.INVITE_USERS.value,
                        Permission.REMOVE_USERS.value,
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.VIEW_USERS_STATISTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.ASSIGN_ROLE.value,
                    ]
                },
            },
            {
                "name": "billing_manager",
                "display_name": "Billing Manager",
                "description": "Менеджер по биллингу компании",
                "scope": RoleScope.COMPANY,
                "role_level": 53,
                "company_role": CompanyRole.BILLING_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 530,
                "hierarchy_level": 13,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_COMPANY_BILLING.value,
                        Permission.VIEW_COMPANY_BILLING.value,
                        Permission.MANAGE_COMPANY_SUBSCRIPTION.value,
                        Permission.VIEW_COMPANY_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "security_manager",
                "display_name": "Security Manager",
                "description": "Менеджер безопасности компании",
                "scope": RoleScope.COMPANY,
                "role_level": 52,
                "company_role": CompanyRole.SECURITY_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 520,
                "hierarchy_level": 14,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_SECURITY_POLICIES.value,
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.VIEW_USER_SESSIONS.value,
                        Permission.REVOKE_SESSIONS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "compliance_manager",
                "display_name": "Compliance Manager",
                "description": "Менеджер по соответствию компании",
                "scope": RoleScope.COMPANY,
                "role_level": 51,
                "company_role": CompanyRole.COMPLIANCE_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 510,
                "hierarchy_level": 15,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_AUDIT_LOG.value,
                        Permission.VIEW_QUALITY_METRICS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "company_viewer",
                "display_name": "Company Viewer",
                "description": "Просмотр данных компании",
                "scope": RoleScope.COMPANY,
                "role_level": 45,
                "company_role": CompanyRole.COMPANY_VIEWER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 450,
                "hierarchy_level": 16,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_COMPANY_SETTINGS.value,
                        Permission.VIEW_COMPANY_USERS.value,
                        Permission.VIEW_COMPANY_ANALYTICS.value,
                        Permission.SEARCH_COMPANY.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                    ]
                },
            },
            #             # Департаментские роли (управление подразделениями)
            #             {
                "name": "department_head",
                "display_name": "Department Head",
                "description": "Руководитель департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 58,
                "department_role": DepartmentRole.DEPARTMENT_HEAD,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 580,
                "hierarchy_level": 17,
                "permissions_config": {
                    "permissions": [
                        Permission.CREATE_DEPARTMENT.value,
                        Permission.MANAGE_DEPARTMENT.value,
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.DELETE_DEPARTMENT.value,
                        Permission.CREATE_TEAM.value,
                        Permission.MANAGE_TEAM.value,
                        Permission.VIEW_TEAM.value,
                        Permission.CREATE_PROJECT.value,
                        Permission.MANAGE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                    ]
                },
            },
            {
                "name": "department_admin",
                "display_name": "Department Admin",
                "description": "Администратор департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 56,
                "department_role": DepartmentRole.DEPARTMENT_ADMIN,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 560,
                "hierarchy_level": 18,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_DEPARTMENT.value,
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.CREATE_TEAM.value,
                        Permission.MANAGE_TEAM.value,
                        Permission.VIEW_TEAM.value,
                        Permission.CREATE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "deputy_head",
                "display_name": "Deputy Head",
                "description": "Заместитель руководителя департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 54,
                "department_role": DepartmentRole.DEPUTY_HEAD,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 540,
                "hierarchy_level": 19,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.CREATE_TEAM.value,
                        Permission.MANAGE_TEAM.value,
                        Permission.VIEW_TEAM.value,
                        Permission.CREATE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "senior_manager",
                "display_name": "Senior Manager",
                "description": "Старший менеджер департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 52,
                "department_role": DepartmentRole.SENIOR_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 520,
                "hierarchy_level": 20,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.CREATE_PROJECT.value,
                        Permission.MANAGE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_TEAM.value,
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "manager",
                "display_name": "Manager",
                "description": "Менеджер департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 50,
                "department_role": DepartmentRole.MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 500,
                "hierarchy_level": 21,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.CREATE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "coordinator",
                "display_name": "Coordinator",
                "description": "Координатор департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 48,
                "department_role": DepartmentRole.COORDINATOR,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 480,
                "hierarchy_level": 22,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_ACTIVITY_RECORD.value,
                    ]
                },
            },
            {
                "name": "department_viewer",
                "display_name": "Department Viewer",
                "description": "Просмотр данных департамента",
                "scope": RoleScope.DEPARTMENT,
                "role_level": 40,
                "department_role": DepartmentRole.DEPARTMENT_VIEWER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 400,
                "hierarchy_level": 23,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_DEPARTMENT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                    ]
                },
            },
            #             # Командные роли (управление командами и проектами)
            #             {
                "name": "team_lead",
                "display_name": "Team Lead",
                "description": "Лидер команды с правами управления проектами",
                "scope": RoleScope.TEAM,
                "role_level": 55,
                "team_role": TeamRole.TEAM_LEAD,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 550,
                "hierarchy_level": 20,
                "permissions_config": {
                    "permissions": [
                        Permission.CREATE_PROJECT.value,
                        Permission.MANAGE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_SETTINGS.value,
                        Permission.MANAGE_PROJECT_MEMBERS.value,
                        Permission.CREATE_TEAM.value,
                        Permission.MANAGE_TEAM.value,
                        Permission.VIEW_TEAM.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "product_owner",
                "display_name": "Product Owner",
                "description": "Владелец продукта с правами планирования",
                "scope": RoleScope.TEAM,
                "role_level": 52,
                "team_role": TeamRole.PRODUCT_OWNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 520,
                "hierarchy_level": 21,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_SETTINGS.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.APPROVE_REQUIREMENT.value,
                        Permission.CHANGE_REQUIREMENT_STATUS.value,
                        Permission.CREATE_RELEASE.value,
                        Permission.MANAGE_RELEASE.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.APPROVE_RELEASE.value,
                        Permission.PUBLISH_RELEASE.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                    ]
                },
            },
            {
                "name": "scrum_master",
                "display_name": "Scrum Master",
                "description": "Скрам-мастер с правами управления процессами",
                "scope": RoleScope.TEAM,
                "role_level": 50,
                "team_role": TeamRole.SCRUM_MASTER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 500,
                "hierarchy_level": 22,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_MEMBERS.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CHANGE_REQUIREMENT_STATUS.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.MANAGE_TESTS.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.VIEW_TEAM.value,
                        Permission.CREATE_ACTIVITY_RECORD.value,
                    ]
                },
            },
            {
                "name": "tester",
                "display_name": "Tester",
                "description": "Тестировщик с правами выполнения тестов",
                "scope": RoleScope.TEAM,
                "role_level": 45,
                "team_role": TeamRole.TESTER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 450,
                "hierarchy_level": 23,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.MANAGE_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_TEST_CASE.value,
                        Permission.EDIT_TEST_CASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.EXECUTE_TEST_CASE.value,
                        Permission.CREATE_TEST_EXECUTION.value,
                        Permission.VIEW_TEST_EXECUTIONS.value,
                        Permission.VIEW_TESTING_SUMMARY.value,
                        Permission.REQUEST_REQUIREMENT_TESTING_STATUS.value,
                        Permission.REQUEST_RELEASE_TESTING_STATUS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "devops_engineer",
                "display_name": "DevOps Engineer",
                "description": "DevOps инженер с правами развертывания",
                "scope": RoleScope.TEAM,
                "role_level": 47,
                "team_role": TeamRole.DEVOPS,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 470,
                "hierarchy_level": 85,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.DEPLOY_RELEASE.value,
                        Permission.ROLLBACK_RELEASE.value,
                        Permission.MANAGE_TEST_ENVIRONMENTS.value,
                        Permission.EXECUTE_INTEGRATION_TESTS.value,
                        Permission.RUN_INTEGRATION_TESTS.value,
                        Permission.GET_INTEGRATION_TEST_STATUS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.VIEW_SYSTEM_LOGS.value,
                        Permission.VIEW_HEALTH_CHECK.value,
                        Permission.VIEW_METRICS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                    ]
                },
            },
            {
                "name": "tech_lead",
                "display_name": "Tech Lead",
                "description": "Технический лидер команды",
                "scope": RoleScope.TEAM,
                "role_level": 49,
                "team_role": TeamRole.TECH_LEAD,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 490,
                "hierarchy_level": 31,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_SETTINGS.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.APPROVE_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.DEPLOY_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.MANAGE_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                        Permission.ASSIGN_ROLE.value,
                    ]
                },
            },
            {
                "name": "team_senior_developer",
                "display_name": "Team Senior Developer",
                "description": "Старший разработчик команды",
                "scope": RoleScope.TEAM,
                "role_level": 46,
                "team_role": TeamRole.SENIOR_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 460,
                "hierarchy_level": 32,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                    ]
                },
            },
            {
                "name": "team_developer",
                "display_name": "Team Developer",
                "description": "Разработчик команды",
                "scope": RoleScope.TEAM,
                "role_level": 44,
                "team_role": TeamRole.DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 440,
                "hierarchy_level": 33,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "junior_developer",
                "display_name": "Junior Developer",
                "description": "Младший разработчик команды",
                "scope": RoleScope.TEAM,
                "role_level": 42,
                "team_role": TeamRole.JUNIOR_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 420,
                "hierarchy_level": 34,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "team_analyst",
                "display_name": "Team Analyst",
                "description": "Аналитик команды",
                "scope": RoleScope.TEAM,
                "role_level": 43,
                "team_role": TeamRole.ANALYST,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 430,
                "hierarchy_level": 35,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.SEARCH_REQUIREMENTS.value,
                    ]
                },
            },
            {
                "name": "team_designer",
                "display_name": "Team Designer",
                "description": "Дизайнер команды",
                "scope": RoleScope.TEAM,
                "role_level": 41,
                "team_role": TeamRole.DESIGNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 410,
                "hierarchy_level": 61,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "senior_member",
                "display_name": "Senior Member",
                "description": "Старший участник команды",
                "scope": RoleScope.TEAM,
                "role_level": 39,
                "team_role": TeamRole.SENIOR_MEMBER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 390,
                "hierarchy_level": 65,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                    ]
                },
            },
            {
                "name": "team_member",
                "display_name": "Team Member",
                "description": "Участник команды",
                "scope": RoleScope.TEAM,
                "role_level": 37,
                "team_role": TeamRole.MEMBER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 370,
                "hierarchy_level": 66,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "mentor",
                "display_name": "Mentor",
                "description": "Ментор команды",
                "scope": RoleScope.TEAM,
                "role_level": 38,
                "team_role": TeamRole.MENTOR,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 380,
                "hierarchy_level": 67,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.ASSIGN_ROLE.value,
                    ]
                },
            },
            {
                "name": "consultant",
                "display_name": "Consultant",
                "description": "Консультант команды",
                "scope": RoleScope.TEAM,
                "role_level": 36,
                "team_role": TeamRole.CONSULTANT,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 360,
                "hierarchy_level": 70,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "observer",
                "display_name": "Observer",
                "description": "Наблюдатель команды",
                "scope": RoleScope.TEAM,
                "role_level": 34,
                "team_role": TeamRole.OBSERVER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 340,
                "hierarchy_level": 80,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_COMMENT.value,
                    ]
                },
            },
            {
                "name": "team_viewer",
                "display_name": "Team Viewer",
                "description": "Просмотр данных команды",
                "scope": RoleScope.TEAM,
                "role_level": 30,
                "team_role": TeamRole.TEAM_VIEWER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 300,
                "hierarchy_level": 85,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_TEAM.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_COMMENT.value,
                    ]
                },
            },
            #             # Проектные роли (специализированные роли в проектах)
            #             {
                "name": "project_manager",
                "display_name": "Project Manager",
                "description": "Менеджер проекта с полными правами управления",
                "scope": RoleScope.PROJECT,
                "role_level": 48,
                "project_role": ProjectRole.PROJECT_MANAGER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 480,
                "hierarchy_level": 50,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_SETTINGS.value,
                        Permission.MANAGE_PROJECT_MEMBERS.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.APPROVE_REQUIREMENT.value,
                        Permission.DELETE_REQUIREMENT.value,
                        Permission.CHANGE_REQUIREMENT_STATUS.value,
                        Permission.CREATE_RELEASE.value,
                        Permission.MANAGE_RELEASE.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.APPROVE_RELEASE.value,
                        Permission.PUBLISH_RELEASE.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "project_owner",
                "display_name": "Project Owner",
                "description": "Владелец проекта с высшими правами",
                "scope": RoleScope.PROJECT,
                "role_level": 49,
                "project_role": ProjectRole.PROJECT_OWNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 490,
                "hierarchy_level": 51,
                "permissions_config": {
                    "permissions": [
                        Permission.MANAGE_PROJECT.value,
                        Permission.VIEW_PROJECT.value,
                        Permission.MANAGE_PROJECT_SETTINGS.value,
                        Permission.MANAGE_PROJECT_MEMBERS.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.APPROVE_REQUIREMENT.value,
                        Permission.DELETE_REQUIREMENT.value,
                        Permission.CHANGE_REQUIREMENT_STATUS.value,
                        Permission.CREATE_RELEASE.value,
                        Permission.MANAGE_RELEASE.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.APPROVE_RELEASE.value,
                        Permission.PUBLISH_RELEASE.value,
                        Permission.DELETE_PROJECT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.ASSIGN_ROLE.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                    ]
                },
            },
            {
                "name": "architect",
                "display_name": "Architect",
                "description": "Архитектор системы с техническими правами",
                "scope": RoleScope.PROJECT,
                "role_level": 46,
                "project_role": ProjectRole.ARCHITECT,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 460,
                "hierarchy_level": 52,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.APPROVE_REQUIREMENT.value,
                        Permission.LINK_REQUIREMENTS.value,
                        Permission.UNLINK_REQUIREMENTS.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.APPROVE_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.VIEW_REQUIREMENT_RELATIONSHIPS.value,
                        Permission.CREATE_REQUIREMENT_RELATIONSHIP.value,
                        Permission.VIEW_REQUIREMENT_TRACE_MATRIX.value,
                        Permission.CREATE_RELATIONSHIP.value,
                        Permission.VIEW_RELATIONSHIP.value,
                        Permission.EDIT_RELATIONSHIP.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "qa_engineer",
                "display_name": "QA Engineer",
                "description": "QA инженер с расширенными правами тестирования",
                "scope": RoleScope.PROJECT,
                "role_level": 44,
                "project_role": ProjectRole.QA_ENGINEER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 440,
                "hierarchy_level": 53,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.DELETE_TEST.value,
                        Permission.MANAGE_TESTS.value,
                        Permission.EXECUTE_INTEGRATION_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.MANAGE_TEST_PLANS.value,
                        Permission.APPROVE_TEST_RESULTS.value,
                        Permission.CREATE_TEST_AUTOMATION.value,
                        Permission.MANAGE_TEST_ENVIRONMENTS.value,
                        Permission.CREATE_TEST_CASE.value,
                        Permission.EDIT_TEST_CASE.value,
                        Permission.DELETE_TEST_CASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.EXECUTE_TEST_CASE.value,
                        Permission.CREATE_TEST_EXECUTION.value,
                        Permission.VIEW_TEST_EXECUTIONS.value,
                        Permission.VIEW_TESTING_SUMMARY.value,
                        Permission.REQUEST_REQUIREMENT_TESTING_STATUS.value,
                        Permission.REQUEST_RELEASE_TESTING_STATUS.value,
                        Permission.RUN_INTEGRATION_TESTS.value,
                        Permission.GET_INTEGRATION_TEST_STATUS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "test_automation_engineer",
                "display_name": "Test Automation Engineer",
                "description": "Инженер автоматизации тестирования",
                "scope": RoleScope.PROJECT,
                "role_level": 43,
                "project_role": ProjectRole.TEST_AUTOMATION_ENGINEER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 430,
                "hierarchy_level": 55,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.MANAGE_TESTS.value,
                        Permission.CREATE_TEST_AUTOMATION.value,
                        Permission.EXECUTE_INTEGRATION_TESTS.value,
                        Permission.RUN_INTEGRATION_TESTS.value,
                        Permission.GET_INTEGRATION_TEST_STATUS.value,
                        Permission.MANAGE_TEST_ENVIRONMENTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_TEST_CASE.value,
                        Permission.EDIT_TEST_CASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.EXECUTE_TEST_CASE.value,
                        Permission.CREATE_TEST_EXECUTION.value,
                        Permission.VIEW_TEST_EXECUTIONS.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                    ]
                },
            },
            {
                "name": "business_analyst",
                "display_name": "Business Analyst",
                "description": "Бизнес-аналитик с правами работы с требованиями",
                "scope": RoleScope.PROJECT,
                "role_level": 42,
                "project_role": ProjectRole.BUSINESS_ANALYST,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 420,
                "hierarchy_level": 54,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CHANGE_REQUIREMENT_STATUS.value,
                        Permission.LINK_REQUIREMENTS.value,
                        Permission.UNLINK_REQUIREMENTS.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.VIEW_REQUIREMENT_RELATIONSHIPS.value,
                        Permission.CREATE_REQUIREMENT_RELATIONSHIP.value,
                        Permission.VIEW_REQUIREMENT_DEPENDENCIES.value,
                        Permission.VIEW_REQUIREMENT_DEPENDENTS.value,
                        Permission.VIEW_REQUIREMENT_TRACE_MATRIX.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REQUIREMENTS.value,
                        Permission.IMPORT_REQUIREMENTS.value,
                        Permission.SEARCH_REQUIREMENTS.value,
                    ]
                },
            },
            {
                "name": "senior_developer",
                "display_name": "Senior Developer",
                "description": "Старший разработчик с техническими правами",
                "scope": RoleScope.PROJECT,
                "role_level": 41,
                "project_role": ProjectRole.SENIOR_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 410,
                "hierarchy_level": 56,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.DEPLOY_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                        Permission.VIEW_API_LOGS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                    ]
                },
            },
            {
                "name": "developer",
                "display_name": "Developer",
                "description": "Разработчик с базовыми техническими правами",
                "scope": RoleScope.PROJECT,
                "role_level": 40,
                "project_role": ProjectRole.DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 400,
                "hierarchy_level": 61,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                        Permission.VIEW_API_LOGS.value,
                    ]
                },
            },
            {
                "name": "frontend_developer",
                "display_name": "Frontend Developer",
                "description": "Frontend разработчик",
                "scope": RoleScope.PROJECT,
                "role_level": 39,
                "project_role": ProjectRole.FRONTEND_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 390,
                "hierarchy_level": 65,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "backend_developer",
                "display_name": "Backend Developer",
                "description": "Backend разработчик",
                "scope": RoleScope.PROJECT,
                "role_level": 38,
                "project_role": ProjectRole.BACKEND_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 380,
                "hierarchy_level": 66,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                        Permission.CREATE_API_KEYS.value,
                        Permission.MANAGE_INTEGRATIONS.value,
                    ]
                },
            },
            {
                "name": "ux_designer",
                "display_name": "UX Designer",
                "description": "UX дизайнер с правами работы с пользовательским опытом",
                "scope": RoleScope.PROJECT,
                "role_level": 35,
                "project_role": ProjectRole.UX_DESIGNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 350,
                "hierarchy_level": 67,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                    ]
                },
            },
            {
                "name": "ui_designer",
                "display_name": "UI Designer",
                "description": "UI дизайнер",
                "scope": RoleScope.PROJECT,
                "role_level": 34,
                "project_role": ProjectRole.UI_DESIGNER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 340,
                "hierarchy_level": 70,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_REPORTS.value,
                    ]
                },
            },
            {
                "name": "technical_writer",
                "display_name": "Technical Writer",
                "description": "Технический писатель с правами документирования",
                "scope": RoleScope.PROJECT,
                "role_level": 33,
                "project_role": ProjectRole.TECHNICAL_WRITER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 330,
                "hierarchy_level": 80,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.CREATE_SPECIFICATION.value,
                        Permission.EDIT_SPECIFICATION.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.GENERATE_DOCUMENTATION.value,
                        Permission.GENERATE_SPECIFICATION_DOCUMENT.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.EDIT_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_RELEASE_CHANGELOG.value,
                    ]
                },
            },
            {
                "name": "data_analyst",
                "display_name": "Data Analyst",
                "description": "Аналитик данных",
                "scope": RoleScope.PROJECT,
                "role_level": 32,
                "project_role": ProjectRole.DATA_ANALYST,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 320,
                "hierarchy_level": 85,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.VIEW_QUALITY_METRICS.value,
                        Permission.VIEW_ADVANCED_ANALYTICS.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "stakeholder",
                "display_name": "Stakeholder",
                "description": "Заинтересованная сторона",
                "scope": RoleScope.PROJECT,
                "role_level": 25,
                "project_role": ProjectRole.STAKEHOLDER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 250,
                "hierarchy_level": 85,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                    ]
                },
            },
            {
                "name": "mobile_developer",
                "display_name": "Mobile Developer",
                "description": "Mobile разработчик",
                "scope": RoleScope.PROJECT,
                "role_level": 37,
                "project_role": ProjectRole.MOBILE_DEVELOPER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 370,
                "hierarchy_level": 65,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.CREATE_TEST.value,
                        Permission.EXECUTE_TEST.value,
                        Permission.VIEW_TESTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.USE_API.value,
                    ]
                },
            },
            {
                "name": "product_analyst",
                "display_name": "Product Analyst",
                "description": "Продуктовый аналитик",
                "scope": RoleScope.PROJECT,
                "role_level": 31,
                "project_role": ProjectRole.PRODUCT_ANALYST,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 310,
                "hierarchy_level": 66,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.CREATE_REQUIREMENT.value,
                        Permission.EDIT_REQUIREMENT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_ANALYTICS.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_REPORTS.value,
                        Permission.EXPORT_REPORTS.value,
                        Permission.VIEW_QUALITY_METRICS.value,
                        Permission.VIEW_ADVANCED_ANALYTICS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.SEARCH_REQUIREMENTS.value,
                    ]
                },
            },
            {
                "name": "client",
                "display_name": "Client",
                "description": "Клиент с ограниченными правами просмотра",
                "scope": RoleScope.PROJECT,
                "role_level": 20,
                "project_role": ProjectRole.CLIENT,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 200,
                "hierarchy_level": 90,
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_REPORTS.value,
                        Permission.CREATE_COMMENT.value,
                        Permission.VIEW_COMMENT.value,
                    ]
                },
            },
            #             # Базовые роли (низший уровень)
            #             {
                "name": "viewer",
                "display_name": "Viewer",
                "description": "Просмотр информации без возможности изменения",
                "scope": RoleScope.PROJECT,
                "role_level": 10,
                "project_role": ProjectRole.PROJECT_VIEWER,
                "is_system": False,
                "is_active": True,
                "is_assignable": True,
                "priority": 100,
                "hierarchy_level": 99,  # Самый низкий уровень
                "permissions_config": {
                    "permissions": [
                        Permission.VIEW_PROJECT.value,
                        Permission.VIEW_REQUIREMENT.value,
                        Permission.VIEW_SPECIFICATION.value,
                        Permission.VIEW_RELEASE.value,
                        Permission.VIEW_TEST_CASES.value,
                        Permission.VIEW_TESTS.value,
                        Permission.VIEW_TEST_RESULTS.value,
                        Permission.VIEW_COMMENT.value,
                        Permission.VIEW_RELATIONSHIP.value,
                        Permission.VIEW_REQUIREMENT_RELATIONSHIPS.value,
                        Permission.VIEW_DASHBOARD.value,
                        Permission.VIEW_MY_PROJECTS.value,
                        Permission.VIEW_MY_REQUIREMENTS.value,
                        Permission.VIEW_MY_ACTIVITY.value,
                        Permission.VIEW_MY_NOTIFICATIONS.value,
                        Permission.SEARCH_REQUIREMENTS.value,
                    ]
                },
            },
        ]

    def get_role_hierarchy_definitions(self) -> List[Tuple[str, str, InheritanceType]]:
        """
        Получить определения иерархии ролей.

        Returns:
            List[Tuple[parent_name, child_name, inheritance_type]]
        """
        return [
            #             # Системные роли - полная иерархия
            #             ("system_administrator", "platform_administrator", InheritanceType.FULL),
            ("platform_administrator", "support_admin", InheritanceType.FULL),
            ("support_admin", "support_agent", InheritanceType.FULL),
            ("support_admin", "billing_admin", InheritanceType.FULL),
            ("support_admin", "security_auditor", InheritanceType.FULL),
            ("security_auditor", "compliance_officer", InheritanceType.FULL),
            ("compliance_officer", "system_developer", InheritanceType.PARTIAL),
            ("system_developer", "system_data_analyst", InheritanceType.PARTIAL),
            #             # Компанийные роли - полная иерархия
            #             ("system_administrator", "company_owner", InheritanceType.FULL),
            ("company_owner", "company_administrator", InheritanceType.FULL),
            ("company_administrator", "hr_manager", InheritanceType.PARTIAL),
            ("company_administrator", "billing_manager", InheritanceType.PARTIAL),
            ("company_administrator", "security_manager", InheritanceType.PARTIAL),
            ("company_administrator", "compliance_manager", InheritanceType.PARTIAL),
            ("hr_manager", "company_viewer", InheritanceType.PARTIAL),
            ("billing_manager", "company_viewer", InheritanceType.PARTIAL),
            ("security_manager", "company_viewer", InheritanceType.PARTIAL),
            ("compliance_manager", "company_viewer", InheritanceType.PARTIAL),
            #             # Департаментские роли - иерархия управления
            #             ("company_administrator", "department_head", InheritanceType.FULL),
            ("department_head", "department_admin", InheritanceType.FULL),
            ("department_admin", "deputy_head", InheritanceType.PARTIAL),
            ("deputy_head", "senior_manager", InheritanceType.PARTIAL),
            ("senior_manager", "manager", InheritanceType.PARTIAL),
            ("manager", "coordinator", InheritanceType.PARTIAL),
            ("coordinator", "department_viewer", InheritanceType.PARTIAL),
            #             # Командные роли - иерархия команд
            #             ("department_head", "team_lead", InheritanceType.FULL),
            ("team_lead", "product_owner", InheritanceType.PARTIAL),
            ("team_lead", "scrum_master", InheritanceType.PARTIAL),
            ("team_lead", "tech_lead", InheritanceType.PARTIAL),
            ("tech_lead", "team_senior_developer", InheritanceType.PARTIAL),
            ("team_senior_developer", "team_developer", InheritanceType.PARTIAL),
            ("team_developer", "junior_developer", InheritanceType.PARTIAL),
            ("scrum_master", "tester", InheritanceType.PARTIAL),
            ("tech_lead", "devops_engineer", InheritanceType.PARTIAL),
            ("team_lead", "team_analyst", InheritanceType.PARTIAL),
            ("team_analyst", "team_designer", InheritanceType.PARTIAL),
            ("team_senior_developer", "senior_member", InheritanceType.PARTIAL),
            ("senior_member", "team_member", InheritanceType.PARTIAL),
            ("team_member", "mentor", InheritanceType.PARTIAL),
            ("mentor", "consultant", InheritanceType.PARTIAL),
            ("consultant", "observer", InheritanceType.PARTIAL),
            ("observer", "team_viewer", InheritanceType.PARTIAL),
            #             # Проектные роли - специализированная иерархия
            #             ("team_lead", "project_manager", InheritanceType.PARTIAL),
            ("project_manager", "project_owner", InheritanceType.PARTIAL),
            ("project_manager", "architect", InheritanceType.PARTIAL),
            ("architect", "qa_engineer", InheritanceType.PARTIAL),
            ("qa_engineer", "test_automation_engineer", InheritanceType.PARTIAL),
            ("architect", "business_analyst", InheritanceType.PARTIAL),
            ("business_analyst", "senior_developer", InheritanceType.PARTIAL),
            ("senior_developer", "developer", InheritanceType.PARTIAL),
            ("developer", "frontend_developer", InheritanceType.PARTIAL),
            ("developer", "backend_developer", InheritanceType.PARTIAL),
            ("developer", "mobile_developer", InheritanceType.PARTIAL),
            ("business_analyst", "product_analyst", InheritanceType.PARTIAL),
            ("business_analyst", "ux_designer", InheritanceType.PARTIAL),
            ("ux_designer", "ui_designer", InheritanceType.PARTIAL),
            ("business_analyst", "technical_writer", InheritanceType.PARTIAL),
            ("business_analyst", "data_analyst", InheritanceType.PARTIAL),
            ("business_analyst", "stakeholder", InheritanceType.PARTIAL),
            ("stakeholder", "client", InheritanceType.PARTIAL),
            #             # Все роли наследуют от viewer (базовый уровень)
            #             ("client", "viewer", InheritanceType.FULL),
            ("technical_writer", "viewer", InheritanceType.FULL),
            ("data_analyst", "viewer", InheritanceType.FULL),
            ("product_analyst", "viewer", InheritanceType.FULL),
            ("ui_designer", "viewer", InheritanceType.FULL),
            ("mobile_developer", "viewer", InheritanceType.FULL),
            ("frontend_developer", "viewer", InheritanceType.FULL),
            ("backend_developer", "viewer", InheritanceType.FULL),
            ("test_automation_engineer", "viewer", InheritanceType.FULL),
            ("tester", "viewer", InheritanceType.FULL),
            ("devops_engineer", "viewer", InheritanceType.FULL),
            ("team_viewer", "viewer", InheritanceType.FULL),
            ("department_viewer", "viewer", InheritanceType.FULL),
            ("company_viewer", "viewer", InheritanceType.FULL),
            ("system_data_analyst", "viewer", InheritanceType.FULL),
        ]

    async def initialize_role_system(
        self, db: AsyncSession, force_recreate: bool = False
    ) -> Dict[str, any]:
        """
        Полная инициализация системы ролей.

        Args:
            db: Асинхронная сессия БД
            force_recreate: Пересоздать иерархию принудительно

        Returns:
            Статистика инициализации
        """
        try:
            self.logger.info("Начинаем инициализацию системы ролей...")

            stats = {
                "roles_created": 0,
                "roles_updated": 0,
                "hierarchy_links_created": 0,
                "hierarchy_links_skipped": 0,
                "errors": 0,
                "warnings": 0,
            }

            # 1. Создаем или обновляем роли
            self.logger.info("Создание базовых ролей...")
            role_stats = await self._create_enhanced_roles(db)
            stats.update(role_stats)

            # 2. Настраиваем иерархию
            self.logger.info("Настройка иерархии ролей...")
            hierarchy_stats = await self._setup_role_hierarchy(db, force_recreate)
            stats.update(hierarchy_stats)

            # 3. Валидируем систему
            self.logger.info("Валидация системы ролей...")
            validation_result = await self._validate_role_system(db)
            if not validation_result["is_valid"]:
                self.logger.warning(
                    f"Система ролей имеет проблемы: {validation_result['issues']}"
                )
                stats["warnings"] += len(validation_result["issues"])

            await db.commit()

            self.logger.info(f"Инициализация системы ролей завершена: {stats}")
            return stats

        except Exception as e:
            await db.rollback()
            self.logger.error(
                f"Ошибка инициализации системы ролей: {str(e)}", exc_info=True
            )
            raise

    async def _create_enhanced_roles(self, db: AsyncSession) -> Dict[str, int]:
        """Создать расширенные роли."""
        stats = {"roles_created": 0, "roles_updated": 0, "errors": 0}

        definitions = self.get_enhanced_role_definitions()

        for role_def in definitions:
            try:
                # Проверяем существование роли
                stmt = select(EnhancedRole).where(EnhancedRole.name == role_def["name"])
                result = await db.execute(stmt)
                existing_role = result.scalar_one_or_none()

                if existing_role:
                    # Обновляем разрешения если изменились
                    if (
                        existing_role.permissions_config
                        != role_def["permissions_config"]
                    ):
                        existing_role.permissions_config = role_def[
                            "permissions_config"
                        ]
                        existing_role.description = role_def["description"]
                        stats["roles_updated"] += 1
                        self.logger.info(f"Обновлена роль: {role_def['name']}")
                    else:
                        self.logger.debug(f"Роль уже существует: {role_def['name']}")
                    continue

                # Создаем новую роль
                role_data = self._prepare_role_data(role_def)
                new_role = EnhancedRole(**role_data)

                db.add(new_role)
                await db.flush()  # Получаем ID

                stats["roles_created"] += 1
                self.logger.info(
                    f"Создана роль: {role_def['name']} (ID: {new_role.id})"
                )

            except Exception as e:
                stats["errors"] += 1
                self.logger.error(f"Ошибка создания роли {role_def['name']}: {str(e)}")
                continue

        return stats

    async def _setup_role_hierarchy(
        self, db: AsyncSession, force_recreate: bool = False
    ) -> Dict[str, int]:
        """Настроить иерархию ролей."""
        stats = {
            "hierarchy_links_created": 0,
            "hierarchy_links_skipped": 0,
            "errors": 0,
        }

        hierarchy_definitions = self.get_role_hierarchy_definitions()

        for parent_name, child_name, inheritance_type in hierarchy_definitions:
            try:
                # Получаем роли
                parent_stmt = select(EnhancedRole).where(
                    EnhancedRole.name == parent_name
                )
                child_stmt = select(EnhancedRole).where(EnhancedRole.name == child_name)

                parent_result = await db.execute(parent_stmt)
                child_result = await db.execute(child_stmt)

                parent_role = parent_result.scalar_one_or_none()
                child_role = child_result.scalar_one_or_none()

                if not parent_role:
                    self.logger.warning(f"Родительская роль не найдена: {parent_name}")
                    stats["errors"] += 1
                    continue

                if not child_role:
                    self.logger.warning(f"Дочерняя роль не найдена: {child_name}")
                    stats["errors"] += 1
                    continue

                # Проверяем существование связи
                existing_stmt = select(RoleHierarchy).where(
                    RoleHierarchy.parent_role_id == parent_role.id,
                    RoleHierarchy.child_role_id == child_role.id,
                )
                existing_result = await db.execute(existing_stmt)
                existing = existing_result.scalar_one_or_none()

                if existing and not force_recreate:
                    stats["hierarchy_links_skipped"] += 1
                    self.logger.debug(
                        f"Связь уже существует: {parent_name} -> {child_name}"
                    )
                    continue

                # Валидируем связь через сервис
                is_valid = await role_hierarchy_service.validate_inheritance(
                    db, parent_role.id, child_role.id
                )

                if not is_valid:
                    self.logger.warning(
                        f"Недопустимая связь: {parent_name} -> {child_name}"
                    )
                    stats["errors"] += 1
                    continue

                # Создаем связь
                if existing and force_recreate:
                    # Удаляем старую связь
                    await db.delete(existing)
                    await db.flush()

                hierarchy = await role_hierarchy_service.create_inheritance(
                    db=db,
                    parent_role_id=parent_role.id,
                    child_role_id=child_role.id,
                    inheritance_type=inheritance_type,
                    created_by=None,  # Системная инициализация
                )

                stats["hierarchy_links_created"] += 1
                self.logger.info(
                    f"Создана связь иерархии: {parent_name} -> {child_name}"
                )

            except Exception as e:
                stats["errors"] += 1
                self.logger.error(
                    f"Ошибка создания связи {parent_name} -> {child_name}: {str(e)}"
                )
                continue

        return stats

    async def _validate_role_system(self, db: AsyncSession) -> Dict[str, any]:
        """Валидировать корректность системы ролей."""
        issues = []

        try:
            # Строим DAG и проверяем на циклы
            dag = await role_hierarchy_service.build_role_dag(db, force_refresh=True)

            if dag.has_cycle():
                issues.append("Обнаружены циклы в иерархии ролей")

            # Проверяем, что все базовые роли существуют
            required_roles = [
                "system_administrator",
                "platform_administrator",
                "company_owner",
                "company_administrator",
                "team_lead",
                "tester",
                "qa_engineer",
                "viewer",
            ]

            for role_name in required_roles:
                stmt = select(EnhancedRole).where(EnhancedRole.name == role_name)
                result = await db.execute(stmt)
                role = result.scalar_one_or_none()

                if not role:
                    issues.append(f"Обязательная роль не найдена: {role_name}")
                elif not role.is_active:
                    issues.append(f"Обязательная роль неактивна: {role_name}")

            # Проверяем целостность разрешений
            for role_name in required_roles:
                stmt = select(EnhancedRole).where(EnhancedRole.name == role_name)
                result = await db.execute(stmt)
                role = result.scalar_one_or_none()

                if role:
                    effective_permissions = (
                        await role_hierarchy_service.get_role_effective_permissions(
                            db, role.id
                        )
                    )

                    if len(effective_permissions) == 0:
                        issues.append(
                            f"Роль {role_name} не имеет эффективных разрешений"
                        )

        except Exception as e:
            issues.append(f"Ошибка валидации: {str(e)}")

        return {"is_valid": len(issues) == 0, "issues": issues}

    def _prepare_role_data(self, role_def: Dict) -> Dict:
        """Подготовить данные роли для создания."""
        data = role_def.copy()

        # Конвертируем enum значения в строки
        if "scope" in data and hasattr(data["scope"], "value"):
            data["scope"] = data["scope"].value

        if (
            "system_role" in data
            and data["system_role"]
            and hasattr(data["system_role"], "value")
        ):
            data["system_role"] = data["system_role"].value

        if (
            "company_role" in data
            and data["company_role"]
            and hasattr(data["company_role"], "value")
        ):
            data["company_role"] = data["company_role"].value

        if (
            "department_role" in data
            and data["department_role"]
            and hasattr(data["department_role"], "value")
        ):
            data["department_role"] = data["department_role"].value

        if (
            "team_role" in data
            and data["team_role"]
            and hasattr(data["team_role"], "value")
        ):
            data["team_role"] = data["team_role"].value

        if (
            "project_role" in data
            and data["project_role"]
            and hasattr(data["project_role"], "value")
        ):
            data["project_role"] = data["project_role"].value

        # Удаляем служебные поля
        data.pop("hierarchy_level", None)

        return data

    async def assign_system_admin_role(self, db: AsyncSession, user_email: str) -> bool:
        """Назначить роль системного администратора пользователю."""
        try:
            # Получаем пользователя
            user_stmt = select(User).where(User.email == user_email)
            user_result = await db.execute(user_stmt)
            user = user_result.scalar_one_or_none()

            if not user:
                self.logger.warning(f"Пользователь не найден: {user_email}")
                return False

            # Получаем роль системного администратора
            role_stmt = select(EnhancedRole).where(
                EnhancedRole.name == "system_administrator"
            )
            role_result = await db.execute(role_stmt)
            admin_role = role_result.scalar_one_or_none()

            if not admin_role:
                self.logger.warning("Роль системного администратора не найдена")
                return False

            # Проверяем существование назначения
            assignment_stmt = select(UserRoleAssignment).where(
                UserRoleAssignment.user_id == user.id,
                UserRoleAssignment.role_id == admin_role.id,
                UserRoleAssignment.company_id.is_(None),
                UserRoleAssignment.department_id.is_(None),
                UserRoleAssignment.team_id.is_(None),
                UserRoleAssignment.project_id.is_(None),
            )
            assignment_result = await db.execute(assignment_stmt)
            existing = assignment_result.scalar_one_or_none()

            if existing:
                if existing.is_active:
                    self.logger.info(
                        f"Роль системного администратора уже назначена: {user_email}"
                    )
                    return True
                else:
                    # Активируем существующее назначение
                    existing.is_active = True
                    existing.is_primary = True
                    await db.flush()
                    self.logger.info(
                        f"Активировано назначение роли системного администратора: {user_email}"
                    )
                    return True

            # Создаем новое назначение
            assignment = UserRoleAssignment(
                user_id=user.id,
                role_id=admin_role.id,
                is_active=True,
                is_primary=True,
                assignment_reason="Инициализация системы",
                company_id=None,
                department_id=None,
                team_id=None,
                project_id=None,
            )

            db.add(assignment)
            await db.flush()

            self.logger.info(f"Назначена роль системного администратора: {user_email}")
            return True

        except Exception as e:
            self.logger.error(
                f"Ошибка назначения роли администратора: {str(e)}", exc_info=True
            )
            return False

# Регистрация сервиса в фабрике
from .base import ServiceFactory

ServiceFactory.register_service("role_initialization", RoleInitializationService)
# Создаем экземпляр сервиса
role_initialization_service = RoleInitializationService()
