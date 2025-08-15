"""
Quality Assurance Domain Router.

Современный роутер для управления тестированием и обеспечением качества.
"""

from fastapi import APIRouter

from .testing.router import router as testing_router
from .specifications.router import router as specifications_router
from .reports.router import router as reports_router

# Создаем главный роутер для quality домена
router = APIRouter()

# Управление тестированием
router.include_router(
    testing_router,
    prefix="/testing",
    tags=["Quality - Testing"],
)

# Управление спецификациями
router.include_router(
    specifications_router,
    prefix="/specifications",
    tags=["Quality - Specifications"],
)

# Отчеты по качеству
router.include_router(
    reports_router,
    prefix="/reports",
    tags=["Quality - Reports"],
)
