from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from requify.app.api.v1.router import api_router
from requify.app.core.config import settings

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API для автоматизированной системы управления требованиями Requify",
)

# Настройка CORS
requify.app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение маршрутизатора API
requify.app.include_router(api_router, prefix=settings.API_V1_STR)


@requify.app.get("/")
async def root():
    """
    Корневой эндпоинт для проверки работоспособности API.
    """
    return {
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
    }


@requify.app.get("/health")
async def health_check():
    """
    Эндпоинт для проверки работоспособности сервиса.
    """
    return {"status": "healthy"}
