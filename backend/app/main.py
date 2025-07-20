from datetime import UTC, datetime
from fastapi import FastAPI
from sqlalchemy import text
from contextlib import asynccontextmanager

# from fastapi.middleware.cors import CORSMiddleware  # CORS handled by Nginx

from app.api.v1.router import api_router
from app.core.config import settings
from app.utils.logger import logger, LoggedOperation


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Обработчик жизненного цикла приложения.
    Выполняет инициализацию при запуске и очистку при остановке.
    """
    # Startup
    with LoggedOperation("Application startup", logger):
        try:
            # Инициализация логирования
            logger.info(
                f"Starting {settings.app_config.name} v{settings.app_config.version}"
            )
            logger.info(f"Environment: {settings.app_config.env}")
            logger.info(f"Debug mode: {settings.app_config.debug}")

            # Проверка подключения к базе данных
            try:
                from app.db.session import check_async_db_connection

                if await check_async_db_connection():
                    logger.info("Database connection successful")
                else:
                    logger.error("Database connection failed")
                    if settings.is_production():
                        raise RuntimeError("Database connection failed")
            except Exception as e:
                logger.error(f"Database connection failed: {e}")
                # В продакшене можно остановить приложение
                if settings.is_production():
                    raise

            # Проверка критических настроек
            if settings.is_production():
                # Проверяем, что секретные ключи изменены
                if "change-in-production" in settings.security.secret_key:
                    logger.warning("Secret key should be changed in production!")

                # Проверяем CORS настройки
                if "localhost" in str(settings.cors_origins):
                    logger.warning("CORS origins contain localhost in production!")

            # Инициализация директорий
            import os

            directories = [
                settings.logging.file.rsplit("/", 1)[0],  # logs directory
                settings.file_storage.upload_dir,  # uploads directory
                "backups",  # backups directory
            ]

            for directory in directories:
                if not os.path.exists(directory):
                    os.makedirs(directory, exist_ok=True)
                    logger.info(f"Created directory: {directory}")

            # Инициализация Redis (если настроен)
            if settings.redis.host:
                try:
                    import redis.asyncio as redis  # type: ignore

                    # In Docker, use service name 'redis' instead of localhost
                    redis_host = (
                        "redis"
                        if settings.redis.host == "localhost"
                        else settings.redis.host
                    )

                    redis_client = redis.Redis(
                        host=redis_host,
                        port=settings.redis.port,
                        db=settings.redis.db,
                        password=(
                            settings.redis.password if settings.redis.password else None
                        ),
                        decode_responses=True,
                        socket_timeout=5,
                        socket_connect_timeout=5,
                        retry_on_timeout=True,
                        health_check_interval=30,
                    )
                    await redis_client.ping()
                    logger.info(
                        f"Redis connection successful to {redis_host}:{settings.redis.port}"
                    )
                    await redis_client.close()
                except Exception as e:
                    logger.warning(
                        f"Redis connection failed to {redis_host if 'redis_host' in locals() else settings.redis.host}:{settings.redis.port}: {e}"
                    )

            # Проверка интеграций
            if hasattr(settings, "integrations"):
                if settings.integrations.testing_system_api_url:
                    logger.info("Testing system integration configured")
                if settings.integrations.project_management_api_url:
                    logger.info("Project management integration configured")

            # Планировщик задач (если нужен)
            # В будущем можно добавить APScheduler для периодических задач

            logger.info("Application startup completed successfully")

        except Exception as e:
            logger.error(f"Application startup failed: {e}")
            raise

    yield  # Приложение работает

    # Shutdown
    with LoggedOperation("Application shutdown", logger):
        try:
            logger.info("Starting application shutdown...")

            # Закрытие соединений с базой данных
            from app.db.db_helper import main_db_helper

            await main_db_helper.dispose()
            logger.info("Database connections closed")

            # Закрытие других ресурсов
            # Например, Redis, внешние API клиенты и т.д.

            logger.info("Application shutdown completed successfully")

        except Exception as e:
            logger.error(f"Error during application shutdown: {e}")


# Создаем FastAPI приложение с обработчиком жизненного цикла
app = FastAPI(
    title=settings.app_config.name,
    version=settings.app_config.version,
    description="API для автоматизированной системы управления требованиями Requify",
    lifespan=lifespan,
)

# CORS is handled by Nginx reverse proxy
# Commented out to prevent duplicate headers
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=settings.cors_origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# Регистрация обработчиков исключений
from app.core.exceptions import register_exception_handlers

register_exception_handlers(app)

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
        "environment": settings.app_config.env,
        "debug": settings.app_config.debug,
    }


@app.get("/api/v1/health")
async def health_check():
    """
    Эндпоинт для проверки работоспособности сервиса.
    Выполняет базовые проверки компонентов системы.
    """

    # Базовый статус
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now(UTC).isoformat(),
        "version": settings.app_config.version,
        "environment": settings.app_config.env,
        "checks": {
            "database": "unknown",
            "api": "healthy",
            "redis": "unknown",
            "integrations": "unknown",
        },
    }

    # Проверка подключения к базе данных
    try:
        from app.db.session import get_async_session

        async for db in get_async_session():
            # Выполняем простой запрос для проверки соединения
            result = await db.execute(text("SELECT version()"))
            db_version = result.scalar()
            health_status["checks"]["database"] = "healthy"
            health_status["database_version"] = db_version
            logger.debug("Database health check passed")
            break
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = "error"
        health_status["checks"]["database_error"] = str(e)
        logger.error(f"Database health check failed: {e}")

    # Проверка Redis (если настроен)
    try:
        if settings.redis.host:
            import redis.asyncio as redis  # type: ignore

            # In Docker, use service name 'redis' instead of localhost
            redis_host = (
                "redis" if settings.redis.host == "localhost" else settings.redis.host
            )

            redis_client = redis.Redis(
                host=redis_host,
                port=settings.redis.port,
                db=settings.redis.db,
                password=settings.redis.password if settings.redis.password else None,
                decode_responses=True,
                socket_timeout=2,
            )
            await redis_client.ping()
            health_status["checks"]["redis"] = "healthy"
            await redis_client.close()
        else:
            health_status["checks"]["redis"] = "not_configured"
    except Exception as e:
        health_status["checks"]["redis"] = "error"
        health_status["checks"]["redis_error"] = str(e)
        logger.warning(f"Redis health check failed: {e}")

    # Проверка интеграций
    try:
        integration_status = []

        if hasattr(settings, "integrations"):
            if settings.integrations.testing_system_api_url:
                integration_status.append("testing_system")
            if settings.integrations.project_management_api_url:
                integration_status.append("project_management")

        if integration_status:
            health_status["checks"]["integrations"] = "configured"
            health_status["configured_integrations"] = integration_status
        else:
            health_status["checks"]["integrations"] = "not_configured"

    except Exception as e:
        health_status["checks"]["integrations"] = "error"
        health_status["checks"]["integrations_error"] = str(e)

    # Общий статус
    if any(check == "error" for check in health_status["checks"].values()):
        health_status["status"] = "unhealthy"
    elif all(
        check in ["healthy", "not_configured", "configured"]
        for check in health_status["checks"].values()
    ):
        health_status["status"] = "healthy"
    else:
        health_status["status"] = "degraded"

    return health_status
