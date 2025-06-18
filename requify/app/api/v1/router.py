"""
Основной роутер для API версии 1.

Собирает все эндпоинты в единый роутер.
"""

from fastapi import APIRouter

from .endpoints import (
    users,
    projects,
    requirements,
    releases,
    testing,
    admin,
    reference,
)

# Создаем основной роутер для API v1
api_router = APIRouter()

# Подключаем роутеры эндпоинтов
api_router.include_router(users.router, prefix="/users", tags=["users"])

api_router.include_router(projects.router, prefix="/projects", tags=["projects"])

api_router.include_router(
    requirements.router, prefix="/requirements", tags=["requirements"]
)

api_router.include_router(releases.router, prefix="/releases", tags=["releases"])

api_router.include_router(testing.router, prefix="/testing", tags=["testing"])

api_router.include_router(admin.router, prefix="/admin", tags=["admin"])

api_router.include_router(reference.router, prefix="/reference", tags=["reference"])


@api_router.get("/")
async def root():
    """Корневой эндпоинт API v1."""
    return {"message": "Requify API v1", "version": "1.0.0", "docs": "/docs"}
