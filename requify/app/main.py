from datetime import UTC, datetime
from fastapi import FastAPI
from sqlalchemy import text

from fastapi.middleware.cors import CORSMiddleware

from requify.app.api.deps import get_db
from requify.app.api.v1.router import api_router
from requify.app.core.config import settings


# Создаем FastAPI приложение
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
    Выполняет базовые проверки компонентов системы.
    """

    
    # Базовый статус
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "checks": {
            "database": "unknown",
            "api": "healthy"
        }
    }
    
    # Проверка подключения к базе данных
    try:
        db = next(get_db())
        # Выполняем простой запрос для проверки соединения
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = "healthy"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"error: {str(e)}"
    finally:
        try:
            db.close()
        except:
            pass
    
    return health_status
