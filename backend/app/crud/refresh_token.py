"""
CRUD операции для RefreshToken.

Модуль содержит операции создания, чтения, обновления и удаления refresh токенов
с учетом безопасности и производительности.
"""

from datetime import datetime, timedelta, UTC
from typing import Optional, List
from uuid import uuid4

from sqlalchemy import select, delete, and_, func, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.refresh_token import RefreshToken
from app.models.user import User
from app.core.config import settings


class CRUDRefreshToken(CRUDBase[RefreshToken, dict, dict]):
    """CRUD операции для RefreshToken."""

    async def create_for_user(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        expires_at: datetime,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None,
    ) -> RefreshToken:
        """
        Создать refresh токен для пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            expires_at: Время истечения токена
            user_agent: User-Agent клиента
            ip_address: IP адрес клиента

        Returns:
            RefreshToken: Созданный токен
        """
        # Очистка старых токенов если превышен лимит
        await self._cleanup_user_tokens(db, user_id)

        refresh_token = RefreshToken(
            token=str(uuid4()),
            user_id=user_id,
            expires_at=expires_at,
            user_agent=user_agent,
            ip_address=ip_address,
        )

        db.add(refresh_token)
        await db.commit()

        # Загружаем с предварительной загрузкой пользователя
        query = (
            select(RefreshToken)
            .where(RefreshToken.id == refresh_token.id)
            .options(selectinload(RefreshToken.user))
        )
        result = await db.execute(query)
        return result.scalar_one()

    async def get_by_token(
        self, db: AsyncSession, *, token: str, include_user: bool = True
    ) -> Optional[RefreshToken]:
        """
        Получить refresh токен по значению токена.

        Args:
            db: Сессия базы данных
            token: Значение токена
            include_user: Включить информацию о пользователе (по умолчанию True)

        Returns:
            Optional[RefreshToken]: Токен или None
        """
        query = select(RefreshToken).where(RefreshToken.token == token)

        if include_user:
            query = query.options(selectinload(RefreshToken.user))

        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_valid_token(
        self, db: AsyncSession, *, token: str
    ) -> Optional[RefreshToken]:
        """
        Получить валидный (активный и не истекший) refresh токен.

        Args:
            db: Сессия базы данных
            token: Значение токена

        Returns:
            Optional[RefreshToken]: Валидный токен или None
        """
        now = datetime.now(UTC).replace(tzinfo=None)

        query = (
            select(RefreshToken)
            .where(
                and_(
                    RefreshToken.token == token,
                    RefreshToken.is_active == True,
                    RefreshToken.expires_at > now,
                )
            )
            .options(selectinload(RefreshToken.user))
        )

        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_tokens(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        active_only: bool = True,
        limit: Optional[int] = None,
        include_user: bool = False,
    ) -> List[RefreshToken]:
        """
        Получить токены пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            active_only: Только активные токены
            limit: Лимит результатов
            include_user: Включить информацию о пользователе

        Returns:
            List[RefreshToken]: Список токенов
        """
        query = select(RefreshToken).where(RefreshToken.user_id == user_id)

        if active_only:
            now = datetime.now(UTC).replace(tzinfo=None)
            query = query.where(
                and_(
                    RefreshToken.is_active == True,
                    RefreshToken.expires_at > now,
                )
            )

        if include_user:
            query = query.options(selectinload(RefreshToken.user))

        query = query.order_by(RefreshToken.created_at.desc())

        if limit:
            query = query.limit(limit)

        result = await db.execute(query)
        return list(result.scalars().all())

    async def mark_as_used(
        self, db: AsyncSession, *, token: RefreshToken
    ) -> RefreshToken:
        """
        Отметить токен как использованный.

        Args:
            db: Сессия базы данных
            token: Токен для обновления

        Returns:
            RefreshToken: Обновленный токен
        """
        token.mark_used()
        await db.commit()

        # Перезагружаем с предварительной загрузкой пользователя
        query = (
            select(RefreshToken)
            .where(RefreshToken.id == token.id)
            .options(selectinload(RefreshToken.user))
        )
        result = await db.execute(query)
        return result.scalar_one()

    async def revoke_token(
        self,
        db: AsyncSession,
        *,
        token: RefreshToken,
        reason: Optional[str] = None,
    ) -> RefreshToken:
        """
        Отозвать токен.

        Args:
            db: Сессия базы данных
            token: Токен для отзыва
            reason: Причина отзыва

        Returns:
            RefreshToken: Отозванный токен
        """
        token.revoke(reason)
        await db.commit()

        # Перезагружаем с предварительной загрузкой пользователя
        query = (
            select(RefreshToken)
            .where(RefreshToken.id == token.id)
            .options(selectinload(RefreshToken.user))
        )
        result = await db.execute(query)
        return result.scalar_one()

    async def revoke_user_tokens(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        exclude_token: Optional[str] = None,
        reason: Optional[str] = None,
    ) -> int:
        """
        Отозвать все токены пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
            exclude_token: Токен для исключения из отзыва
            reason: Причина отзыва

        Returns:
            int: Количество отозванных токенов
        """
        now = datetime.now(UTC).replace(tzinfo=None)

        query = update(RefreshToken).where(
            and_(
                RefreshToken.user_id == user_id,
                RefreshToken.is_active == True,
            )
        )

        if exclude_token:
            query = query.where(RefreshToken.token != exclude_token)

        query = query.values(
            is_active=False,
            revoked_at=now,
            revoked_by=reason or "user_logout_all",
        )

        result = await db.execute(query)
        await db.commit()
        return result.rowcount

    async def cleanup_expired_tokens(
        self, db: AsyncSession, *, before_date: Optional[datetime] = None
    ) -> int:
        """
        Очистить истекшие токены.

        Args:
            db: Сессия базы данных
            before_date: Удалить токены истекшие до этой даты

        Returns:
            int: Количество удаленных токенов
        """
        if before_date is None:
            before_date = datetime.now(UTC).replace(tzinfo=None)

        query = delete(RefreshToken).where(RefreshToken.expires_at < before_date)

        result = await db.execute(query)
        await db.commit()
        return result.rowcount

    async def get_user_active_sessions_count(
        self, db: AsyncSession, *, user_id: int
    ) -> int:
        """
        Получить количество активных сессий пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя

        Returns:
            int: Количество активных сессий
        """
        now = datetime.now(UTC).replace(tzinfo=None)

        query = select(func.count(RefreshToken.id)).where(
            and_(
                RefreshToken.user_id == user_id,
                RefreshToken.is_active == True,
                RefreshToken.expires_at > now,
            )
        )

        result = await db.execute(query)
        return result.scalar() or 0

    async def _cleanup_user_tokens(self, db: AsyncSession, user_id: int) -> None:
        """
        Очистить старые токены пользователя если превышен лимит.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя
        """
        max_tokens = settings.security.max_refresh_tokens_per_user

        # Получаем количество активных токенов
        active_count = await self.get_user_active_sessions_count(db, user_id=user_id)

        if active_count >= max_tokens:
            # Получаем старые токены для удаления
            tokens_to_remove = active_count - max_tokens + 1

            query = (
                select(RefreshToken)
                .where(
                    and_(
                        RefreshToken.user_id == user_id,
                        RefreshToken.is_active == True,
                    )
                )
                .order_by(RefreshToken.last_used_at.asc().nulls_first())
                .limit(tokens_to_remove)
            )

            result = await db.execute(query)
            old_tokens = result.scalars().all()

            # Отзываем старые токены
            for token in old_tokens:
                token.revoke("max_sessions_exceeded")

            await db.commit()


# Создаем экземпляр CRUD для использования
crud_refresh_token = CRUDRefreshToken(RefreshToken)
