"""
Projects Management Domain Router.

Главный роутер для домена управления проектами,
объединяющий все поддомены: core, requirements, releases, analytics.
"""

from fastapi import APIRouter

from .core.router import router as core_router
from .requirements.router import router as requirements_router
from .releases.router import router as releases_router
from .analytics.router import router as analytics_router

# Создаем главный роутер для projects домена
router = APIRouter()

# Основные операции с проектами
router.include_router(
    core_router,
    tags=["Projects - Core"],
)

# Управление требованиями
router.include_router(
    requirements_router,
    prefix="/requirements",
    tags=["Projects - Requirements"],
)

# Управление релизами
router.include_router(
    releases_router,
    prefix="/releases",
    tags=["Projects - Releases"],
)

# Аналитика проектов
router.include_router(
    analytics_router,
    prefix="/analytics",
    tags=["Projects - Analytics"],
)
