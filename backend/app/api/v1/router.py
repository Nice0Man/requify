"""
Основной роутер для API версии 2.

Современная доменно-ориентированная архитектура с улучшенной организацией endpoints.
"""

from fastapi import APIRouter

from app import __version__
from .domains import (
    auth_router,
    identity_router,
    organizations_router,
    projects_router,
    quality_router,
    collaboration_router,
    analytics_router,
    configuration_router,
    system_router,
)

# Создаем основной роутер для API v2
api_router = APIRouter()

# Authentication & Authorization Domain
api_router.include_router(
    auth_router,
    prefix="/auth",
    tags=["Authentication"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        429: {"description": "Rate limit exceeded"},
    },
)

# Identity Management Domain
api_router.include_router(
    identity_router,
    prefix="/identity",
    tags=["Identity Management"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "User not found"},
    },
)

# Organization Management Domain
api_router.include_router(
    organizations_router,
    prefix="/organizations",
    tags=["Organizations"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Organization resource not found"},
    },
)

# Project Management Domain
api_router.include_router(
    projects_router,
    prefix="/projects",
    tags=["Projects"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Project not found"},
    },
)

# Quality Assurance Domain
api_router.include_router(
    quality_router,
    prefix="/quality",
    tags=["Quality Assurance"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Quality resource not found"},
    },
)

# Collaboration Domain
api_router.include_router(
    collaboration_router,
    prefix="/collaboration",
    tags=["Collaboration"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Collaboration resource not found"},
    },
)

# Analytics & Reporting Domain
api_router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Analytics"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Analytics resource not found"},
    },
)

# Configuration Domain
api_router.include_router(
    configuration_router,
    prefix="/configuration",
    tags=["Configuration"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "Configuration not found"},
    },
)

# System Administration Domain
api_router.include_router(
    system_router,
    prefix="/system",
    tags=["System Administration"],
    responses={
        401: {"description": "Authentication required"},
        403: {"description": "Insufficient permissions"},
        404: {"description": "System resource not found"},
    },
)


@api_router.get(
    "/",
    summary="API Root",
    description="Root endpoint for Requify API v2 with domain-oriented architecture",
)
async def root():
    """Корневой эндпоинт API v1."""
    return {
        "message": "Requify API v1 - Domain-Oriented Architecture",
        "version": __version__,
        "docs": "/docs",
        "domains": {
            "auth": "Authentication & Authorization",
            "identity": "User & Role Management",
            "organizations": "Company & Team Structure",
            "projects": "Project & Requirements Management",
            "quality": "Testing & Quality Assurance",
            "collaboration": "Comments & Relationships",
            "analytics": "Dashboard & Reporting",
            "configuration": "Settings & Reference Data",
            "system": "Administration & Monitoring",
        },
    }
