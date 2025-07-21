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
)
 
# Создаем основной роутер для API v1
api_router = APIRouter()

# Подключаем роутеры эндпоинтов
api_router.include_router(auth_router, prefix="/auth", tags=["authentication"])
api_router.include_router(users_router, prefix="/users", tags=["users"])

api_router.include_router(projects_router, prefix="/projects", tags=["projects"])

api_router.include_router(
    requirements_router, prefix="/requirements", tags=["requirements"]
)

api_router.include_router(releases_router, prefix="/releases", tags=["releases"])

api_router.include_router(testing_router, prefix="/testing", tags=["testing"])

api_router.include_router(admin_router, prefix="/admin", tags=["admin"])

api_router.include_router(reference_router, prefix="/reference", tags=["reference"])

api_router.include_router(
    specifications_router, prefix="/specifications", tags=["specifications"]
)

api_router.include_router(
    relationships_router, prefix="/relationships", tags=["relationships"]
)

api_router.include_router(comments_router, prefix="/comments", tags=["comments"])

api_router.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])

api_router.include_router(teams_router, prefix="/teams", tags=["teams"])


@api_router.get("/")
async def root():
    """Корневой эндпоинт API v1."""
    return {"message": "Requify API v1", "version": __version__, "docs": "/docs"}
