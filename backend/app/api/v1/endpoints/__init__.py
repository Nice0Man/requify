"""
Эндпоинты API v1.

Содержит все обработчики HTTP-запросов для различных ресурсов.
"""

from .auth import router as auth_router
from .requirements import router as requirements_router
from .projects import router as projects_router
from .releases import router as releases_router
from .users import router as users_router
from .testing import router as testing_router
from .admin import router as admin_router
from .reference import router as reference_router
from .specifications import router as specifications_router
from .relationships import router as relationships_router
from .comments import router as comments_router
from .dashboard import router as dashboard_router
from .teams import router as teams_router
from .settings import router as settings_router

# Новые роутеры для расширенной функциональности
from .departments import router as departments_router
from .company_contact import router as company_contact_router
from .company_subscription import router as company_subscription_router
from .company_settings import router as company_settings_router
from .company_branding import router as company_branding_router
from .enhanced_roles import router as enhanced_roles_router
from .user_profiles import router as user_profiles_router
from .companies import router as companies_router

__all__ = [
    "auth_router",
    "users_router",
    "projects_router",
    "requirements_router",
    "releases_router",
    "testing_router",
    "admin_router",
    "reference_router",
    "specifications_router",
    "relationships_router",
    "comments_router",
    "dashboard_router",
    "teams_router",
    "settings_router",
    # Новые роутеры
    "departments_router",
    "company_contact_router",
    "company_subscription_router",
    "company_settings_router",
    "company_branding_router",
    "enhanced_roles_router",
    "user_profiles_router",
    "companies_router",
]
