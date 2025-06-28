"""
Помощники для работы с базой данных согласно принципам SOLID.

Принципы SOLID применены следующим образом:
- SRP: Каждый класс имеет одну ответственность
- OCP: Классы открыты для расширения через наследование
- LSP: Реализации интерфейсов взаимозаменяемы
- ISP: Интерфейсы разделены по функциональности
- DIP: Зависимости от абстракций, а не от конкретных реализаций
"""

from abc import ABC, abstractmethod
from typing import AsyncGenerator, Protocol, TypeVar
from contextlib import asynccontextmanager

from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncEngine,
    async_sessionmaker,
    AsyncSession,
)
from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool

from app.core.config import DatabaseConfig, settings

# Типы для generic классов
TSession = TypeVar("TSession", bound=Session)


class DatabaseConnectionProtocol(Protocol):
    """Протокол для подключения к базе данных (Interface Segregation Principle)"""

    def get_url(self) -> str:
        """Возвращает URL подключения к базе данных"""
        ...

    def get_pool_size(self) -> int:
        """Возвращает размер пула соединений"""
        ...

    def get_max_overflow(self) -> int:
        """Возвращает максимальное количество дополнительных соединений"""
        ...


class SessionManagerProtocol(Protocol[TSession]):
    """Протокол для управления сессиями (Interface Segregation Principle)"""

    @abstractmethod
    def create_session(self) -> TSession:
        """Создает новую сессию"""
        ...

    @abstractmethod
    def close_session(self, session: TSession) -> None:
        """Закрывает сессию"""
        ...


class AsyncSessionManagerProtocol(Protocol):
    """Протокол для асинхронного управления сессиями"""

    @abstractmethod
    async def create_session(self) -> AsyncSession:
        """Создает новую асинхронную сессию"""
        ...

    @abstractmethod
    async def close_session(self, session: AsyncSession) -> None:
        """Закрывает асинхронную сессию"""
        ...


class DatabaseEngineBase(ABC):
    """Базовый абстрактный класс для движков БД (Open/Closed Principle)"""

    def __init__(self, config: DatabaseConfig):
        self._config = config
        self._engine = None

    @abstractmethod
    def _create_engine(self):
        """Создает движок базы данных"""
        pass

    @property
    def engine(self):
        """Возвращает движок, создавая его при необходимости (Lazy initialization)"""
        if self._engine is None:
            self._engine = self._create_engine()
        return self._engine

    @abstractmethod
    def dispose(self) -> None:
        """Освобождает ресурсы движка"""
        pass


class SyncDatabaseEngine(DatabaseEngineBase):
    """Синхронный движок базы данных (Single Responsibility Principle)"""

    def _create_engine(self) -> Engine:
        """Создает синхронный движок SQLAlchemy"""
        return create_engine(
            self._config.sync_url,
            pool_size=self._config.pool_size,
            max_overflow=self._config.max_overflow,
            pool_pre_ping=self._config.pool_pre_ping,
            pool_recycle=self._config.pool_recycle,
            echo=self._config.echo,
            echo_pool=self._config.echo_pool,
            poolclass=QueuePool,
        )

    def dispose(self) -> None:
        """Освобождает ресурсы синхронного движка"""
        if self._engine:
            self._engine.dispose()


class AsyncDatabaseEngine(DatabaseEngineBase):
    """Асинхронный движок базы данных (Single Responsibility Principle)"""

    def _create_engine(self) -> AsyncEngine:
        """Создает асинхронный движок SQLAlchemy"""
        return create_async_engine(
            self._config.async_url,
            pool_size=self._config.pool_size,
            max_overflow=self._config.max_overflow,
            pool_pre_ping=self._config.pool_pre_ping,
            pool_recycle=self._config.pool_recycle,
            echo=self._config.echo,
            echo_pool=self._config.echo_pool,
        )

    async def dispose(self) -> None:
        """Освобождает ресурсы асинхронного движка"""
        if self._engine:
            await self._engine.dispose()


class SyncSessionManager:
    """Менеджер синхронных сессий (Single Responsibility Principle)"""

    def __init__(self, engine: Engine):
        self._session_factory = sessionmaker(
            bind=engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    def create_session(self) -> Session:
        """Создает новую синхронную сессию"""
        return self._session_factory()

    def close_session(self, session: Session) -> None:
        """Закрывает синхронную сессию"""
        session.close()

    @asynccontextmanager
    async def session_scope(self) -> AsyncGenerator[Session, None]:
        """Контекстный менеджер для автоматического управления сессией"""
        session = self.create_session()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            self.close_session(session)


class AsyncSessionManager:
    """Менеджер асинхронных сессий (Single Responsibility Principle)"""

    def __init__(self, engine: AsyncEngine):
        self._session_factory = async_sessionmaker(
            bind=engine,
            autoflush=False,
            autocommit=False,
            expire_on_commit=False,
        )

    async def create_session(self) -> AsyncSession:
        """Создает новую асинхронную сессию"""
        return self._session_factory()

    async def close_session(self, session: AsyncSession) -> None:
        """Закрывает асинхронную сессию"""
        await session.close()

    @asynccontextmanager
    async def session_scope(self) -> AsyncGenerator[AsyncSession, None]:
        """Контекстный менеджер для автоматического управления сессией"""
        session = await self.create_session()
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await self.close_session(session)


class DatabaseHelper:
    """
    Главный класс для работы с базой данных (Facade Pattern + Dependency Injection).

    Применяет принцип Dependency Inversion - зависит от абстракций, а не от конкретных реализаций.
    """

    def __init__(
        self,
        sync_engine: SyncDatabaseEngine,
        async_engine: AsyncDatabaseEngine,
    ):
        self._sync_engine = sync_engine
        self._async_engine = async_engine
        self._sync_session_manager = None
        self._async_session_manager = None

    @property
    def sync_session_manager(self) -> SyncSessionManager:
        """Возвращает менеджер синхронных сессий (Lazy initialization)"""
        if self._sync_session_manager is None:
            self._sync_session_manager = SyncSessionManager(self._sync_engine.engine)
        return self._sync_session_manager

    @property
    def async_session_manager(self) -> AsyncSessionManager:
        """Возвращает менеджер асинхронных сессий (Lazy initialization)"""
        if self._async_session_manager is None:
            self._async_session_manager = AsyncSessionManager(self._async_engine.engine)
        return self._async_session_manager

    def get_sync_session(self) -> Session:
        """Создает синхронную сессию"""
        return self.sync_session_manager.create_session()

    async def get_async_session(self) -> AsyncSession:
        """Создает асинхронную сессию"""
        return await self.async_session_manager.create_session()

    @asynccontextmanager
    async def async_session_scope(self) -> AsyncGenerator[AsyncSession, None]:
        """Контекстный менеджер для асинхронной сессии"""
        async with self.async_session_manager.session_scope() as session:
            yield session

    @asynccontextmanager
    async def sync_session_scope(self) -> AsyncGenerator[Session, None]:
        """Контекстный менеджер для синхронной сессии"""
        async with self.sync_session_manager.session_scope() as session:
            yield session

    async def dispose(self) -> None:
        """Освобождает все ресурсы"""
        self._sync_engine.dispose()
        await self._async_engine.dispose()


class DatabaseFactory:
    """
    Фабрика для создания экземпляров DatabaseHelper (Factory Pattern).

    Применяет принцип Open/Closed - можно расширить для поддержки новых типов БД.
    """

    @staticmethod
    def create_database_helper(config: DatabaseConfig) -> DatabaseHelper:
        """Создает экземпляр DatabaseHelper с заданной конфигурацией"""
        sync_engine = SyncDatabaseEngine(config)
        async_engine = AsyncDatabaseEngine(config)

        return DatabaseHelper(
            sync_engine=sync_engine,
            async_engine=async_engine,
        )

    @staticmethod
    def create_main_database_helper() -> DatabaseHelper:
        """Создает DatabaseHelper для основной базы данных"""
        return DatabaseFactory.create_database_helper(settings.db)

    @staticmethod
    def create_test_database_helper() -> DatabaseHelper:
        """Создает DatabaseHelper для тестовой базы данных"""
        return DatabaseFactory.create_database_helper(settings.test_db)


# Создаем экземпляры для основной и тестовой БД
main_db_helper = DatabaseFactory.create_main_database_helper()
test_db_helper = DatabaseFactory.create_test_database_helper()

# Алиас для обратной совместимости
db_helper = main_db_helper


# Функция-генератор для FastAPI Dependency Injection
async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Генератор асинхронных сессий для использования в FastAPI dependencies.

    Пример использования:
    @requify.app.get("/users/")
    async def get_users(session: AsyncSession = Depends(get_async_session)):
        ...
    """
    async with main_db_helper.async_session_scope() as session:
        yield session


async def get_test_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Генератор асинхронных сессий для тестирования"""
    async with test_db_helper.async_session_scope() as session:
        yield session
