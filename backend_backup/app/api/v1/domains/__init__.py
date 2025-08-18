"""
Domain-oriented API routers for Requify v2.

Каждый домен содержит логически связанные endpoints с собственными
зависимостями, схемами и бизнес-логикой.
"""

from .auth.router import router as auth_router
from .identity.router import router as identity_router
from .organizations.router import router as organizations_router
from .projects.router import router as projects_router
from .quality.router import router as quality_router
from .collaboration.router import router as collaboration_router
from .analytics.router import router as analytics_router
from .configuration.router import router as configuration_router
from .system.router import router as system_router

__all__ = [
    "auth_router",
    "identity_router",
    "organizations_router",
    "projects_router",
    "quality_router",
    "collaboration_router",
    "analytics_router",
    "configuration_router",
    "system_router",
]
