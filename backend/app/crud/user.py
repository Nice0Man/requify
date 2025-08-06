"""
CRUD операции для модели User.
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy import func, select, or_, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.utils.logger import logger


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

    async def get_by_email_with_profile(
        self, db: AsyncSession, *, email: str
    ) -> Optional[User]:
        """
        Получить пользователя по email с предварительной загрузкой профиля и ролей.

        Args:
            db: Сессия базы данных
            email: Email пользователя

        Returns:
            Пользователь с загруженным профилем и ролями или None если не найден
        """
        from app.models.enhanced_role_system import UserRoleAssignment

        stmt = (
            select(User)
            .where(User.email == email)
            .options(
                selectinload(User.profile),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.role
                ),
            )
        )
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

    async def get_by_username_with_profile(
        self, db: AsyncSession, *, username: str
    ) -> Optional[User]:
        """
        Получить пользователя по имени пользователя с предварительной загрузкой профиля и ролей.

        Args:
            db: Сессия базы данных
            username: Имя пользователя

        Returns:
            Пользователь с загруженным профилем и ролями или None если не найден
        """
        from app.models.enhanced_role_system import UserRoleAssignment

        stmt = (
            select(User)
            .where(User.username == username)
            .options(
                selectinload(User.profile),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.role
                ),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_with_profile(self, db: AsyncSession, id: Any) -> Optional[User]:
        """
        Получить пользователя по ID с предварительной загрузкой профиля и ролей.

        Args:
            db: Сессия базы данных
            id: ID пользователя

        Returns:
            Пользователь с загруженным профилем и ролями или None если не найден
        """
        from app.models.enhanced_role_system import UserRoleAssignment

        stmt = (
            select(User)
            .where(User.id == id)
            .options(
                selectinload(User.profile),
                selectinload(User.role_assignments).selectinload(
                    UserRoleAssignment.role
                ),
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_role_assignments(self, db: AsyncSession, *, user_id: int):
        """
        Получить активные назначения ролей пользователя.

        Args:
            db: Сессия базы данных
            user_id: ID пользователя

        Returns:
            Список активных назначений ролей
        """
        from app.models.enhanced_role_system import UserRoleAssignment

        stmt = (
            select(UserRoleAssignment)
            .where(
                UserRoleAssignment.user_id == user_id,
                UserRoleAssignment.is_active == True,
            )
            .options(selectinload(UserRoleAssignment.role))
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_by_auth0_id(
        self, db: AsyncSession, *, auth0_id: str
    ) -> Optional[User]:
        """
        Получить пользователя по Auth0 ID.

        Args:
            db: Сессия базы данных
            auth0_id: Auth0 ID пользователя

        Returns:
            Пользователь или None если не найден
        """
        stmt = select(User).where(User.auth0_id == auth0_id)
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

        # Создаем пользователя, исключая поля которые есть только в схеме
        user_data = obj_in.model_dump(exclude={
            "password", "confirm_password", "invite_token", 
            "first_name", "last_name", "timezone", "language"
        })
        db_obj = User(
            **user_data,
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

    async def get_user_stats(self, db: AsyncSession, *, user_id: int) -> Dict[str, Any]:
        """Получить статистику пользователя"""
        try:
            # Получаем базовую информацию о пользователе
            user = await self.get(db, id=user_id)
            if not user:
                return {}

            # Простая статистика - можно расширить
            return {
                "user_id": user_id,
                "projects_count": 0,  # TODO: реализовать подсчет проектов
                "requirements_count": 0,  # TODO: реализовать подсчет требований
                "comments_count": 0,  # TODO: реализовать подсчет комментариев
                "last_login": user.last_login.isoformat() if user.last_login else None,
                "created_at": user.created_at.isoformat(),
                "is_active": user.is_active,
                "role": user.role,
            }
        except Exception as e:
            return {"error": str(e)}

    async def get_user_activity(
        self, db: AsyncSession, *, user_id: int, limit: int = 20
    ) -> List[Dict[str, Any]]:
        """Получить активность пользователя"""
        try:
            # Базовая реализация - возвращаем пустой список
            # TODO: реализовать получение активности из таблицы активности
            return []
        except Exception as e:
            return [{"error": str(e)}]

    async def validate_user_data(
        self, db: AsyncSession, *, user_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Валидация данных пользователя"""
        try:
            validation_result = {"valid": True, "errors": []}

            # Проверяем email
            if "email" in user_data:
                email = user_data["email"]
                if await self.is_email_taken(db, email=email):
                    validation_result["errors"].append("Email уже используется")
                    validation_result["valid"] = False

            # Проверяем username
            if "username" in user_data:
                username = user_data["username"]
                if await self.is_username_taken(db, username=username):
                    validation_result["errors"].append("Username уже используется")
                    validation_result["valid"] = False

            return validation_result
        except Exception as e:
            return {"valid": False, "errors": [str(e)]}

    async def get_user_audit_log(
        self, db: AsyncSession, *, user_id: int, limit: int = 50
    ) -> List[Dict[str, Any]]:
        """Получить журнал аудита пользователя"""
        try:
            # Базовая реализация - возвращаем пустой список
            # TODO: реализовать получение из таблицы аудита
            return []
        except Exception as e:
            return [{"error": str(e)}]

    async def update_avatar(
        self, db: AsyncSession, *, user_id: int, avatar_url: str
    ) -> User:
        """Обновить аватар пользователя"""
        try:
            # Получаем пользователя
            user = await self.get(db, id=user_id)
            if not user:
                raise ValueError(f"User with id {user_id} not found")

            # Сохраняем старый URL для удаления
            old_avatar_url = user.avatar_url

            # Обновляем аватар
            user.avatar_url = avatar_url
            await db.commit()
            await db.refresh(user)

            logger.info(f"Avatar updated for user {user_id}: {avatar_url}")

            # Удаляем старый аватар если он был
            if old_avatar_url:
                try:
                    from app.services.file_service import file_service

                    await file_service.delete_avatar(old_avatar_url)
                except Exception as e:
                    logger.warning(
                        f"Failed to delete old avatar for user {user_id}: {str(e)}"
                    )
                    pass

            return user
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update avatar for user {user_id}: {str(e)}")
            raise e

    async def remove_avatar(self, db: AsyncSession, *, user_id: int) -> User:
        """Удалить аватар пользователя"""
        try:
            # Получаем пользователя
            user = await self.get(db, id=user_id)
            if not user:
                raise ValueError(f"User with id {user_id} not found")

            # Сохраняем URL для удаления файла
            avatar_url = user.avatar_url

            # Удаляем аватар из БД
            user.avatar_url = None
            await db.commit()
            await db.refresh(user)

            # Удаляем файл
            if avatar_url:
                try:
                    from app.services.file_service import file_service

                    await file_service.delete_avatar(avatar_url)
                except Exception as e:
                    logger.warning(
                        f"Failed to delete avatar file for user {user_id}: {str(e)}"
                    )
                    pass

            logger.info(f"Avatar removed for user {user_id}")
            return user
        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to remove avatar for user {user_id}: {str(e)}")
            raise e


# Создаем экземпляр CRUD для использования в API
user = CRUDUser(User)
