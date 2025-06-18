"""
Эндпоинты API v1.

Содержит все обработчики HTTP-запросов для различных ресурсов.
"""

from .requirements import router as requirements_router
from .projects import router as projects_router
from .releases import router as releases_router
from .users import router as users_router
from .testing import router as testing_router
from .admin import router as admin_router
from .reference import router as reference_router
