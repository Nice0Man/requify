from sqlalchemy import create_engine, text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, Session

from requify.app.core.config import settings

# =============================================================================
# ОСНОВНАЯ БАЗА ДАННЫХ
# =============================================================================

# Создаем синхронный движок для соединения с основной базой данных
engine = create_engine(
    settings.DATABASE_URI,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DEBUG,
    # Упрощенные настройки для Windows совместимости
    pool_timeout=30,
)

# Создаем асинхронный движок для соединения с основной базой данных
async_engine = create_async_engine(
    settings.ASYNC_DATABASE_URI,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_pre_ping=settings.DB_POOL_PRE_PING,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DEBUG,
    # Упрощенные настройки для Windows совместимости
    pool_timeout=30,
)

# Создаем фабрику синхронных сессий для основной БД
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=Session
)

# Создаем фабрику асинхронных сессий для основной БД
AsyncSessionLocal = async_sessionmaker(
    async_engine, expire_on_commit=False, autoflush=False, class_=AsyncSession
)

# =============================================================================
# ТЕСТОВАЯ БАЗА ДАННЫХ
# =============================================================================

# Создаем движки для тестовой базы данных
test_engine = create_engine(
    settings.TEST_DATABASE_URI,
    pool_size=5,  # Меньший пул для тестов
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
    pool_timeout=30,
)

test_async_engine = create_async_engine(
    settings.TEST_ASYNC_DATABASE_URI,
    pool_size=5,  # Меньший пул для тестов
    max_overflow=5,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=settings.DEBUG,
    pool_timeout=30,
)

# Создаем фабрики сессий для тестовой БД
TestSessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=test_engine, class_=Session
)

TestAsyncSessionLocal = async_sessionmaker(
    test_async_engine, expire_on_commit=False, autoflush=False, class_=AsyncSession
)

# =============================================================================
# ФУНКЦИИ ДЛЯ РАБОТЫ С ОСНОВНОЙ БД
# =============================================================================


# Функция для получения синхронной сессии
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Функция для получения асинхронной сессии
async def get_async_session():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Функция для проверки соединения
def check_db_connection():
    """Проверяет соединение с основной базой данных"""
    try:
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Ошибка подключения к основной базе данных: {e}")
        return False


# Функция для проверки асинхронного соединения
async def check_async_db_connection():
    """Проверяет асинхронное соединение с основной базой данных"""
    try:
        async with async_engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Ошибка асинхронного подключения к основной базе данных: {e}")
        return False


# =============================================================================
# ФУНКЦИИ ДЛЯ РАБОТЫ С ТЕСТОВОЙ БД
# =============================================================================


def get_test_db():
    """Функция для получения тестовой синхронной сессии"""
    db = TestSessionLocal()
    try:
        yield db
    finally:
        db.close()


async def get_test_async_session():
    """Функция для получения тестовой асинхронной сессии"""
    async with TestAsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


def check_test_db_connection():
    """Проверяет соединение с тестовой базой данных"""
    try:
        with test_engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Ошибка подключения к тестовой базе данных: {e}")
        return False


async def check_test_async_db_connection():
    """Проверяет асинхронное соединение с тестовой базой данных"""
    try:
        async with test_async_engine.connect() as connection:
            result = await connection.execute(text("SELECT 1"))
            return True
    except Exception as e:
        print(f"Ошибка асинхронного подключения к тестовой базе данных: {e}")
        return False
