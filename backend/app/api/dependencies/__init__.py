"""
Стандартизированная система dependency injection для FastAPI.

Следует принципам SOLID и лучшим практикам архитектуры.
Организована по доменам для лучшей поддерживаемости.

Архитектура:
- Core dependencies: базовые зависимости (auth, database)
- Permission dependencies: доменно-ориентированные permissions
- Specialized dependencies: специфичные зависимости (auth0, validation)
- Utility dependencies: вспомогательные функции

Стандарты:
- Все permission классы наследуются от StandardPermissionClass
- Единообразные методы: read(), write(), create(), update(), delete(), admin()
- Автоматическая backward compatibility
- Стандартизированная документация
"""

# Core dependencies
from .core.database import get_db, SessionDep
from .core.auth import (
    CurrentUserDep,
    CurrentActiveUserDep,
    SuperuserDep,
    OptionalUserDep,
    get_current_user,
    get_current_active_user,
    get_optional_user,
    get_superuser,
)

# Стандартизированная система permissions
from .permissions._base import BasePermissionClass, StandardPermissionMixin
from .permissions._interface import PermissionInterface, get_domain_config
from .permissions._standard import StandardPermissionClass, create_permission_class
from .permissions.factory import PermissionDependencyFactory
from .permissions.base import PermissionChecker

# Permission classes (стандартизированные)
from .permissions.auth import AuthPermissions
from .permissions.users import UserPermissions
from .permissions.projects import ProjectPermissions
from .permissions.requirements import RequirementPermissions
from .permissions.releases import ReleasePermissions
from .permissions.testing import TestingPermissions
from .permissions.admin import AdminPermissions
from .permissions.dashboard import DashboardPermissions
from .permissions.roles import RolePermissions
from .permissions.company import CompanyPermissions
from .permissions.teams import TeamPermissions

# Specialized dependencies
from .specialized.auth0 import get_user_from_auth0_token
from .specialized.validation import ValidationDependencies
from .specialized.analytics import AnalyticsDependencies

# Utility dependencies
from .utils.caching import CachedDependency
from .utils.helpers import (
    get_user_by_id_or_404,
    get_user_by_email_or_404,
    get_user_by_username_or_404,
)

# Backward compatibility (автоматически генерируемые из стандартизированных классов)
# Users
from .permissions.users import (
    get_users_read_user,
    get_users_write_user,
    get_users_delete_user,
)

# Admin
from .permissions.admin import (
    get_admin_read_user,
    get_admin_write_user,
    get_admin_user,
    get_dashboard_admin_user,
    get_system_manager_user,
)

# Dashboard
from .permissions.dashboard import (
    get_dashboard_user,
    get_stats_read_user,
    get_export_user,
    get_dashboard_analytics_user,
)

# Requirements
from .permissions.requirements import (
    get_requirements_read_user,
    get_requirements_write_user,
    get_requirements_delete_user,
    get_requirement_creator_user,
    get_requirement_approver_user,
)

# Projects
from .permissions.projects import (
    get_projects_read_user,
    get_projects_write_user,
    get_projects_delete_user,
    get_project_creator_user,
    get_project_archiver_user,
)

# Releases
from .permissions.releases import (
    get_releases_read_user,
    get_releases_write_user,
    get_releases_delete_user,
    get_release_creator_user,
    get_release_publisher_user,
)

# Testing
from .permissions.testing import (
    get_testing_read_user,
    get_testing_write_user,
    get_testing_execute_user,
    get_test_plans_manager_user,
)

# Roles
from .permissions.roles import (
    get_roles_read_user,
    get_roles_write_user,
    get_roles_delete_user,
    get_role_creator_user,
    get_role_assigner_user,
)

__all__ = [
    # === CORE DEPENDENCIES ===
    "get_db",
    "SessionDep",
    "CurrentUserDep",
    "CurrentActiveUserDep",
    "SuperuserDep",
    "OptionalUserDep",
    "get_current_user",
    "get_current_active_user",
    "get_optional_user",
    "get_superuser",
    # === PERMISSION SYSTEM ===
    # Base classes and interfaces
    "BasePermissionClass",
    "StandardPermissionMixin",
    "PermissionInterface",
    "StandardPermissionClass",
    "PermissionDependencyFactory",
    "PermissionChecker",
    # Factory functions
    "create_permission_class",
    "get_domain_config",
    # Domain permission classes
    "AuthPermissions",
    "UserPermissions",
    "ProjectPermissions",
    "RequirementPermissions",
    "ReleasePermissions",
    "TestingPermissions",
    "AdminPermissions",
    "DashboardPermissions",
    "RolePermissions",
    "CompanyPermissions",
    "TeamPermissions",
    # === SPECIALIZED DEPENDENCIES ===
    "get_user_from_auth0_token",
    "ValidationDependencies",
    "AnalyticsDependencies",
    # === UTILITY DEPENDENCIES ===
    "CachedDependency",
    "get_user_by_id_or_404",
    "get_user_by_email_or_404",
    "get_user_by_username_or_404",
    # === BACKWARD COMPATIBILITY ===
    # User management
    "get_users_read_user",
    "get_users_write_user",
    "get_users_delete_user",
    # Admin management
    "get_admin_read_user",
    "get_admin_write_user",
    "get_admin_user",
    "get_dashboard_admin_user",
    "get_system_manager_user",
    # Dashboard
    "get_dashboard_user",
    "get_stats_read_user",
    "get_export_user",
    "get_dashboard_analytics_user",
    # Requirements
    "get_requirements_read_user",
    "get_requirements_write_user",
    "get_requirements_delete_user",
    "get_requirement_creator_user",
    "get_requirement_approver_user",
    # Projects
    "get_projects_read_user",
    "get_projects_write_user",
    "get_projects_delete_user",
    "get_project_creator_user",
    "get_project_archiver_user",
    # Releases
    "get_releases_read_user",
    "get_releases_write_user",
    "get_releases_delete_user",
    "get_release_creator_user",
    "get_release_publisher_user",
    # Testing
    "get_testing_read_user",
    "get_testing_write_user",
    "get_testing_execute_user",
    "get_test_plans_manager_user",
    # Roles
    "get_roles_read_user",
    "get_roles_write_user",
    "get_roles_delete_user",
    "get_role_creator_user",
    "get_role_assigner_user",
]

# === CONVENIENCE EXPORTS ===
# Для упрощения использования в endpoints

# Наиболее часто используемые dependencies
from .permissions.auth import get_authenticated_user
from .permissions.users import (
    user_read_required,
    user_write_required,
    user_invite_required,
)
from .permissions.projects import (
    project_read_required,
    project_write_required,
)
from .permissions.admin import (
    admin_read_required,
    admin_write_required,
)

__all__.extend(
    [
        "get_authenticated_user",
        "user_read_required",
        "user_write_required",
        "user_invite_required",
        "project_read_required",
        "project_write_required",
        "admin_read_required",
        "admin_write_required",
    ]
)

# === DOCUMENTATION ===
"""
Использование стандартизированных permission dependencies:

Основные паттерны:

1. В endpoints используйте класс dependencies:
```python
@router.get("/users/")
async def get_users(
    current_user: User = Depends(UserPermissions.read())
):
    pass

@router.post("/users/")  
async def create_user(
    current_user: User = Depends(UserPermissions.create())
):
    pass
```

2. Для backward compatibility используйте legacy функции:
```python
@router.get("/users/")
async def get_users(
    current_user: User = Depends(get_users_read_user)
):
    pass
```

3. Для convenience exports:
```python
@router.get("/users/")
async def get_users(
    current_user: User = Depends(user_read_required)
):
    pass
```

Доступные методы для всех permission классов:
- read(): Чтение данных
- write(): Запись данных (создание + обновление)
- create(): Создание новых сущностей
- update(): Обновление существующих сущностей  
- delete(): Удаление сущностей
- admin(): Административные операции

Специфичные методы различаются по доменам.
"""
