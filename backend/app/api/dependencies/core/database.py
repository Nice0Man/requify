"""
Core database dependencies.

Следует принципам SOLID:
- Single Responsibility: Только управление БД сессиями
- Open/Closed: Легко расширяется для новых БД провайдеров
- Dependency Inversion: Зависит от абстракций AsyncSession
"""

from typing import AsyncGenerator, Annotated
from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.db_helper import get_async_session


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Core database session dependency.
    
    Provides async SQLAlchemy session with proper lifecycle management.
    Uses context manager pattern for automatic cleanup.
    
    Yields:
        AsyncSession: Database session for request lifecycle
    """
    async for session in get_async_session():
        yield session


# Type alias for cleaner dependency injection
SessionDep = Annotated[AsyncSession, Depends(get_db)]
