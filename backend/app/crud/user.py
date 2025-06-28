"""
CRUD операции для модели User.
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from requify.app.crud.base import CRUDBase
from requify.app.models.user import User
from requify.app.schemas.user import UserCreate, UserUpdate
from requify.app.core.security import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    """CRUD операции для модели User."""

    async def get_by_email(self, db: AsyncSession, *, email: str) -> Optional[User]:
        """
        Получить пользователя по email.

        Args:
            db: Сессия базы данных
            email: Email пользователя

        Returns:
            Пользователь или None если не найден
        """
        stmt = select(User).where(User.email == email)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_username(
        self, db: AsyncSession, *, username: str
    ) -> Optional[User]:
        """
        Получить пользователя по имени пользователя.

        Args:
            db: Сессия базы данных
            username: Имя пользователя

        Returns:
            Пользователь или None если не найден
        """
        stmt = select(User).where(User.username == username)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def create(self, db: AsyncSession, *, obj_in: UserCreate) -> User:
        """
        Создать нового пользователя с хэшированным паролем.

        Args:
            db: Сессия базы данных
            obj_in: Схема для создания пользователя

        Returns:
            Созданный пользователь
        """
        # Хэшируем пароль
        hashed_password = get_password_hash(obj_in.password)

        # Создаем пользователя
        db_obj = User(
            username=obj_in.username,
            email=obj_in.email,
            role=obj_in.role,
            hashed_password=hashed_password,
        )

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def authenticate(
        self, db: AsyncSession, *, email: str, password: str
    ) -> Optional[User]:
        """
        Аутентификация пользователя.

        Args:
            db: Сессия базы данных
            email: Email пользователя
            password: Пароль в открытом виде

        Returns:
            Пользователь если аутентификация успешна, None иначе
        """
        user = await self.get_by_email(db, email=email)
        if not user:
            return None
        if not verify_password(password, user.hashed_password):
            return None
        return user

    async def update_password(
        self, db: AsyncSession, *, user: User, new_password: str
    ) -> User:
        """
        Обновить пароль пользователя.

        Args:
            db: Сессия базы данных
            user: Пользователь
            new_password: Новый пароль в открытом виде

        Returns:
            Обновленный пользователь
        """
        hashed_password = get_password_hash(new_password)
        user.hashed_password = hashed_password

        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user

    async def get_users_by_role(
        self, db: AsyncSession, *, role: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """
        Получить пользователей по роли.

        Args:
            db: Сессия базы данных
            role: Роль пользователя
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список пользователей
        """
        stmt = select(User).where(User.role == role).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count_by_role(self, db: AsyncSession, *, role: str) -> int:
        """
        Подсчитать количество пользователей по роли.

        Args:
            db: Сессия базы данных
            role: Роль пользователя

        Returns:
            Количество пользователей
        """
        stmt = select(func.count(User.id)).where(User.role == role)
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def is_email_taken(self, db: AsyncSession, *, email: str) -> bool:
        """
        Проверить занят ли email.

        Args:
            db: Сессия базы данных
            email: Email для проверки

        Returns:
            True если email занят, False иначе
        """
        user = await self.get_by_email(db, email=email)
        return user is not None

    async def is_username_taken(self, db: AsyncSession, *, username: str) -> bool:
        """
        Проверить занято ли имя пользователя.

        Args:
            db: Сессия базы данных
            username: Имя пользователя для проверки

        Returns:
            True если имя пользователя занято, False иначе
        """
        user = await self.get_by_username(db, username=username)
        return user is not None

    async def get_by_role(
        self, db: AsyncSession, *, role: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Получить пользователей по роли."""
        return await self.get_users_by_role(db, role=role, skip=skip, limit=limit)

    async def get_by_active_status(
        self, db: AsyncSession, *, is_active: bool, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Получить пользователей по статусу активности."""
        stmt = select(User).where(User.is_active == is_active).offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def search_users(
        self, db: AsyncSession, *, search_term: str, skip: int = 0, limit: int = 100
    ) -> List[User]:
        """Поиск пользователей по email или имени."""
        from sqlalchemy import or_

        stmt = (
            select(User)
            .where(
                or_(
                    User.email.ilike(f"%{search_term}%"),
                    User.username.ilike(f"%{search_term}%"),
                )
            )
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def activate(self, db: AsyncSession, *, user_id: int) -> User:
        """Активировать пользователя."""
        user = await self.get(db, id=user_id)
        if user:
            user.is_active = True
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user

    async def deactivate(self, db: AsyncSession, *, user_id: int) -> User:
        """Деактивировать пользователя."""
        user = await self.get(db, id=user_id)
        if user:
            user.is_active = False
            db.add(user)
            await db.commit()
            await db.refresh(user)
        return user


# Создаем экземпляр CRUD для использования в API
user = CRUDUser(User)
