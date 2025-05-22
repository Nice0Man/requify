from fastapi import APIRouter

from app.api.v1.endpoints import requirements, projects, releases, testing, users

api_router = APIRouter()

# Подключаем роутеры для различных эндпоинтов
api_router.include_router(
    requirements.router, prefix="/requirements", tags=["requirements"]
)
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(releases.router, prefix="/releases", tags=["releases"])
api_router.include_router(testing.router, prefix="/testing", tags=["testing"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
