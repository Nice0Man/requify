from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from requify.app.api.v1.router import api_router
from requify.app.core.config import settings

app = FastAPI(
    title=settings.app_config.name,
    version=settings.app_config.version,
    description="API для автоматизированной системы управления требованиями Requify",
)

# Настройка CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключение маршрутизатора API
app.include_router(api_router, prefix=settings.app_config.api_v1_str)


@app.get("/")
async def root():
    """
    Корневой эндпоинт для проверки работоспособности API.
    """
    return {
        "app_name": settings.app_config.name,
        "version": settings.app_config.version,
        "status": "running",
    }


@app.get("/health")
async def health_check():
    """
    Эндпоинт для проверки работоспособности сервиса.
    """
    return {"status": "healthy"}



