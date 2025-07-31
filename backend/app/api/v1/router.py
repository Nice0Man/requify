"""
Основной роутер для API версии 1.

Собирает все эндпоинты в единый роутер.
"""

from fastapi import APIRouter

from app import __version__

from .endpoints import (
    auth_router,
    users_router,
    projects_router,
    requirements_router,
    releases_router,
    testing_router,
    admin_router,
    reference_router,
    specifications_router,
    relationships_router,
    comments_router,
    dashboard_router,
    teams_router,
    settings_router,
    # Company related routers
    companies_router,
    company_contact_router,
    company_subscription_router,
    company_settings_router,
    company_branding_router,
    departments_router,
    # User related routers
    user_profiles_router,
    enhanced_roles_router,
)

# Создаем основной роутер для API v1
api_router = APIRouter()

# Core authentication
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])

# User management
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(user_profiles_router, prefix="/users", tags=["user-profiles"])
api_router.include_router(
    enhanced_roles_router, prefix="/roles", tags=["enhanced-roles"]
)

# Company management
api_router.include_router(companies_router, prefix="/companies", tags=["companies"])
api_router.include_router(
    company_contact_router, prefix="/companies", tags=["company-contact"]
)
api_router.include_router(
    company_subscription_router, prefix="/companies", tags=["company-subscription"]
)
api_router.include_router(
    company_settings_router, prefix="/companies", tags=["company-settings"]
)
api_router.include_router(
    company_branding_router, prefix="/companies", tags=["company-branding"]
)
api_router.include_router(
    departments_router, prefix="/departments", tags=["departments"]
)

# Project management
api_router.include_router(projects_router, prefix="/projects", tags=["projects"])
api_router.include_router(teams_router, prefix="/teams", tags=["teams"])

# Requirements management
api_router.include_router(
    requirements_router, prefix="/requirements", tags=["requirements"]
)
api_router.include_router(
    specifications_router, prefix="/specifications", tags=["specifications"]
)
api_router.include_router(
    relationships_router, prefix="/relationships", tags=["relationships"]
)

# Release management
api_router.include_router(releases_router, prefix="/releases", tags=["releases"])

# Testing
api_router.include_router(testing_router, prefix="/testing", tags=["testing"])

# Collaboration
api_router.include_router(comments_router, prefix="/comments", tags=["comments"])

# Analytics & Monitoring
api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])

# System & Configuration
api_router.include_router(reference_router, prefix="/reference", tags=["reference"])
api_router.include_router(settings_router, prefix="/settings", tags=["settings"])
api_router.include_router(admin_router, prefix="/admin", tags=["admin"])


@api_router.get("/")
async def root():
    """Корневой эндпоинт API v1."""
    return {"message": "Requify API v1", "version": __version__, "docs": "/docs"}
