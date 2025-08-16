"""
Configuration Domain Router.

Современный роутер для конфигурации системы и справочных данных.
"""

from fastapi import APIRouter

from .settings.router import router as settings_router
from .reference.router import router as reference_router
from .workflows.router import router as workflows_router

# Создаем главный роутер для configuration домена
router = APIRouter()

# Настройки системы
router.include_router(
    settings_router,
    prefix="/settings",
    tags=["Configuration - Settings"],
)

# Справочные данные
router.include_router(
    reference_router,
    prefix="/reference",
    tags=["Configuration - Reference"],
)

# Настройки workflow
router.include_router(
    workflows_router,
    prefix="/workflows",
    tags=["Configuration - Workflows"],
)
