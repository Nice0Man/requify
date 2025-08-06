"""
CRUD операции для настроек пользователя.
Соответствует структуре в frontend/src/entities/settings/api/settingsDAO.ts

ОБНОВЛЕНО: Теперь использует отдельную таблицу UserSettings вместо JSON поля в User
"""

import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select, update, delete
from sqlalchemy.orm import selectinload

from app.crud.base import CRUDBase
from app.models.user import User
from app.models.user_settings import (
    UserSettings as UserSettingsModel,
    UserSettingsHistory,
)
from app.schemas.settings import (
    UserSettings,
    UserSettingsUpdate,
    UserProfileSettings,
    NotificationSettings,
    InterfaceSettings,
    SecuritySettings,
    PrivacySettings,
    SettingsResponse,
    UserSession,
    UserSessionsResponse,
    RevokeSessionsRequest,
    ChangePasswordRequest,
)
from app.utils.logger import logger
from app.core.security import get_password_hash, verify_password
import logging

logger = logging.getLogger(__name__)


class CRUDSettings(CRUDBase[UserSettings, UserSettingsUpdate, UserSettingsUpdate]):
    """CRUD для настроек пользователя"""

    # =============================================================================
    # Получение настроек
    # =============================================================================

    async def get_user_settings(
        self, db: AsyncSession, *, user_id: int
    ) -> UserSettings:
        """Получить все настройки пользователя"""
        try:
            # Получаем пользователя с настройками
            result = await db.execute(
                select(User)
                .options(selectinload(User.user_settings))
                .where(User.id == user_id)
            )
            user = result.scalar_one_or_none()

            if not user:
                raise ValueError(f"User {user_id} not found")

            # Если настроек нет, создаем дефолтные
            if not user.user_settings:
                return await self._create_default_settings_for_user(db, user)

            # Преобразуем из модели в схему
            return self._transform_model_to_schema(user, user.user_settings)

        except Exception as e:
            logger.error(f"Failed to get settings for user {user_id}: {e}")
            raise

    async def get_profile_settings(
        self, db: AsyncSession, *, user_id: int
    ) -> UserProfileSettings:
        """Получить настройки профиля (прямо из User модели)"""
        try:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                raise ValueError(f"User {user_id} not found")

            # Данные профиля берём прямо из User модели (source of truth)
            return UserProfileSettings(
                firstName=user.first_name or "",
                lastName=user.last_name or "",
                email=user.email,
                phone=user.phone,
                position=user.position or "",  # Новое поле добавлено в миксин
                bio=user.bio or "",  # Новое поле добавлено в миксин
                avatar_url=user.avatar_url,
                timezone=user.timezone,  # Новое поле добавлено в миксин
            )

        except Exception as e:
            logger.error(f"Failed to get profile settings for user {user_id}: {e}")
            raise

    # =============================================================================
    # Обновление настроек
    # =============================================================================

    async def update_user_settings(
        self, db: AsyncSession, *, user_id: int, settings_update: UserSettingsUpdate
    ) -> SettingsResponse:
        """Обновить настройки пользователя (БЕЗ профильных данных)"""
        try:
            # Получаем или создаём UserSettings запись
            result = await db.execute(
                select(UserSettingsModel).where(UserSettingsModel.user_id == user_id)
            )
            settings_model = result.scalar_one_or_none()

            if not settings_model:
                # Создаём новую запись если её нет
                settings_model = UserSettingsModel(
                    user_id=user_id,
                    notification_settings={},
                    interface_settings={},
                    security_settings={},
                    privacy_settings={},
                    version=1,
                )
                db.add(settings_model)

            update_data = {}
            updated_fields = []

            # ВАЖНО: Профильные настройки игнорируются!
            # Профиль обновляется через update_profile_settings()
            if settings_update.profile:
                logger.warning(
                    f"Profile settings ignored in update_user_settings for user {user_id}. Use update_profile_settings() instead."
                )

            # Обновляем только настройки поведения
            if settings_update.notifications:
                current_notifications = settings_model.notification_settings or {}
                current_notifications.update(
                    settings_update.notifications.model_dump(exclude_unset=True)
                )
                update_data["notification_settings"] = current_notifications
                updated_fields.append("notifications")

            if settings_update.interface:
                current_interface = settings_model.interface_settings or {}
                current_interface.update(
                    settings_update.interface.model_dump(exclude_unset=True)
                )
                update_data["interface_settings"] = current_interface
                updated_fields.append("interface")

            if settings_update.security:
                current_security = settings_model.security_settings or {}
                current_security.update(
                    settings_update.security.model_dump(exclude_unset=True)
                )
                update_data["security_settings"] = current_security
                updated_fields.append("security")

            if settings_update.privacy:
                current_privacy = settings_model.privacy_settings or {}
                current_privacy.update(
                    settings_update.privacy.model_dump(exclude_unset=True)
                )
                update_data["privacy_settings"] = current_privacy
                updated_fields.append("privacy")

            # Сохраняем изменения в UserSettings таблице
            if update_data:
                update_data["version"] = settings_model.version + 1
                update_data["updated_at"] = datetime.utcnow()

                await db.execute(
                    update(UserSettingsModel)
                    .where(UserSettingsModel.user_id == user_id)
                    .values(**update_data)
                )

            await db.commit()

            return SettingsResponse(
                success=True,
                message="Настройки успешно обновлены",
                data={"updated_fields": updated_fields},
            )

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update settings for user {user_id}: {e}")
            return SettingsResponse(
                success=False, message=f"Ошибка при обновлении настроек: {str(e)}"
            )

    async def update_profile_settings(
        self, db: AsyncSession, *, user_id: int, profile_settings: UserProfileSettings
    ) -> SettingsResponse:
        """Обновить настройки профиля (сохраняется в User модели)"""
        try:
            update_data = {}

            # Обновляем все данные профиля в таблице User (source of truth)
            if profile_settings.firstName is not None:
                update_data["first_name"] = profile_settings.firstName

            if profile_settings.lastName is not None:
                update_data["last_name"] = profile_settings.lastName

            if profile_settings.email:
                # Проверяем уникальность email
                existing = await db.execute(
                    select(User).where(
                        User.email == profile_settings.email, User.id != user_id
                    )
                )
                if existing.scalar_one_or_none():
                    return SettingsResponse(
                        success=False,
                        message="Email уже используется другим пользователем",
                    )
                update_data["email"] = profile_settings.email

            if profile_settings.phone is not None:
                update_data["phone"] = profile_settings.phone

            if profile_settings.avatar_url is not None:
                update_data["avatar_url"] = profile_settings.avatar_url

            # Обновляем новые поля (уже добавлены в ProfileMixin)
            if profile_settings.bio is not None:
                update_data["bio"] = profile_settings.bio

            if profile_settings.position is not None:
                update_data["position"] = profile_settings.position

            if profile_settings.timezone:
                update_data["timezone"] = profile_settings.timezone

            # Сохраняем изменения в User модели
            if update_data:
                update_data["updated_at"] = datetime.utcnow()
                await db.execute(
                    update(User).where(User.id == user_id).values(**update_data)
                )

            # ВАЖНО: НЕ обновляем UserSettings - профиль хранится только в User модели!
            # Убрано дублирующее обновление в настройках

            await db.commit()

            return SettingsResponse(success=True, message="Профиль успешно обновлен")

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to update profile for user {user_id}: {e}")
            return SettingsResponse(
                success=False, message=f"Ошибка при обновлении профиля: {str(e)}"
            )

    async def update_notification_settings(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        notification_settings: NotificationSettings,
    ) -> SettingsResponse:
        """Обновить настройки уведомлений"""
        try:
            settings_update = UserSettingsUpdate(notifications=notification_settings)
            return await self.update_user_settings(
                db, user_id=user_id, settings_update=settings_update
            )

        except Exception as e:
            logger.error(
                f"Failed to update notification settings for user {user_id}: {e}"
            )
            return SettingsResponse(
                success=False,
                message=f"Ошибка при обновлении настроек уведомлений: {str(e)}",
            )

    async def update_interface_settings(
        self, db: AsyncSession, *, user_id: int, interface_settings: InterfaceSettings
    ) -> SettingsResponse:
        """Обновить настройки интерфейса"""
        try:
            settings_update = UserSettingsUpdate(interface=interface_settings)
            return await self.update_user_settings(
                db, user_id=user_id, settings_update=settings_update
            )

        except Exception as e:
            logger.error(f"Failed to update interface settings for user {user_id}: {e}")
            return SettingsResponse(
                success=False,
                message=f"Ошибка при обновлении настроек интерфейса: {str(e)}",
            )

    async def update_security_settings(
        self, db: AsyncSession, *, user_id: int, security_settings: SecuritySettings
    ) -> SettingsResponse:
        """Обновить настройки безопасности"""
        try:
            settings_update = UserSettingsUpdate(security=security_settings)
            return await self.update_user_settings(
                db, user_id=user_id, settings_update=settings_update
            )

        except Exception as e:
            logger.error(f"Failed to update security settings for user {user_id}: {e}")
            return SettingsResponse(
                success=False,
                message=f"Ошибка при обновлении настроек безопасности: {str(e)}",
            )

    async def update_privacy_settings(
        self, db: AsyncSession, *, user_id: int, privacy_settings: PrivacySettings
    ) -> SettingsResponse:
        """Обновить настройки приватности"""
        try:
            settings_update = UserSettingsUpdate(privacy=privacy_settings)
            return await self.update_user_settings(
                db, user_id=user_id, settings_update=settings_update
            )

        except Exception as e:
            logger.error(f"Failed to update privacy settings for user {user_id}: {e}")
            return SettingsResponse(
                success=False,
                message=f"Ошибка при обновлении настроек приватности: {str(e)}",
            )

    # =============================================================================
    # Управление паролем
    # =============================================================================

    async def change_password(
        self, db: AsyncSession, *, user_id: int, password_data: ChangePasswordRequest
    ) -> SettingsResponse:
        """Изменить пароль пользователя"""
        try:
            # Проверяем что пароли совпадают
            if password_data.new_password != password_data.confirm_password:
                return SettingsResponse(
                    success=False, message="Новые пароли не совпадают"
                )

            # Получаем пользователя
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()

            if not user:
                return SettingsResponse(success=False, message="Пользователь не найден")

            # Проверяем текущий пароль
            if not verify_password(
                password_data.current_password, user.password_hash
            ):
                return SettingsResponse(
                    success=False, message="Неверный текущий пароль"
                )

            # Хешируем новый пароль
            new_hashed_password = get_password_hash(password_data.new_password)

            # Обновляем пароль
            await db.execute(
                update(User)
                .where(User.id == user_id)
                .values(
                    password_hash=new_hashed_password, updated_at=datetime.utcnow()
                )
            )
            await db.commit()

            logger.info(f"Password changed for user {user_id}")

            return SettingsResponse(success=True, message="Пароль успешно изменен")

        except Exception as e:
            await db.rollback()
            logger.error(f"Failed to change password for user {user_id}: {e}")
            return SettingsResponse(
                success=False, message=f"Ошибка при смене пароля: {str(e)}"
            )

    # =============================================================================
    # Управление сессиями
    # =============================================================================

    async def get_user_sessions(
        self, db: AsyncSession, *, user_id: int
    ) -> UserSessionsResponse:
        """Получить активные сессии пользователя"""
        try:
            # TODO: Реализовать когда будет таблица сессий
            # Пока возвращаем заглушку
            mock_session = UserSession(
                session_id="current_session",
                device_info="Current Browser",
                ip_address="127.0.0.1",
                location="Local",
                created_at=datetime.utcnow(),
                last_active=datetime.utcnow(),
                is_current=True,
            )

            return UserSessionsResponse(sessions=[mock_session], total_count=1)

        except Exception as e:
            logger.error(f"Failed to get sessions for user {user_id}: {e}")
            return UserSessionsResponse(sessions=[], total_count=0)

    async def revoke_sessions(
        self, db: AsyncSession, *, user_id: int, revoke_data: RevokeSessionsRequest
    ) -> SettingsResponse:
        """Отозвать сессии пользователя"""
        try:
            from app.crud.refresh_token import crud_refresh_token

            if revoke_data.revoke_all:
                # Отозвать все сессии пользователя
                revoked_count = await crud_refresh_token.revoke_user_tokens(
                    db, user_id=user_id, reason="user_revoke_all_sessions"
                )
                logger.info(
                    f"All sessions revoked for user {user_id}: {revoked_count} tokens"
                )
                message = f"Все сессии отозваны ({revoked_count})"
            else:
                # Отозвать конкретные сессии по ID токенов
                revoked_count = 0
                for session_id in revoke_data.session_ids:
                    token = await crud_refresh_token.get_by_token(db, token=session_id)
                    if token and token.user_id == user_id:
                        await crud_refresh_token.revoke_token(
                            db, token=token, reason="user_revoke_session"
                        )
                        revoked_count += 1

                logger.info(
                    f"Sessions revoked for user {user_id}: {revoked_count} of {len(revoke_data.session_ids)}"
                )
                message = f"Отозвано сессий: {revoked_count}"

            return SettingsResponse(success=True, message=message)

        except Exception as e:
            logger.error(f"Failed to revoke sessions for user {user_id}: {e}")
            return SettingsResponse(
                success=False, message=f"Ошибка при отзыве сессий: {str(e)}"
            )

    # =============================================================================
    # Импорт/экспорт настроек
    # =============================================================================

    async def export_settings(self, db: AsyncSession, *, user_id: int) -> str:
        """Экспортировать настройки пользователя в JSON"""
        try:
            settings = await self.get_user_settings(db, user_id=user_id)

            export_data = {
                "user_id": user_id,
                "export_date": datetime.utcnow().isoformat(),
                "settings": settings.model_dump(),
                "version": "1.0",
            }

            return json.dumps(export_data, ensure_ascii=False, indent=2)

        except Exception as e:
            logger.error(f"Failed to export settings for user {user_id}: {e}")
            raise

    async def import_settings(
        self,
        db: AsyncSession,
        *,
        user_id: int,
        settings_json: str,
        overwrite: bool = False,
    ) -> SettingsResponse:
        """Импортировать настройки пользователя из JSON"""
        try:
            import_data = json.loads(settings_json)

            if "settings" not in import_data:
                return SettingsResponse(
                    success=False, message="Неверный формат файла настроек"
                )

            imported_settings = UserSettings(**import_data["settings"])

            if overwrite:
                # Полная замена настроек
                settings_update = UserSettingsUpdate(
                    profile=imported_settings.profile,
                    notifications=imported_settings.notifications,
                    interface=imported_settings.interface,
                    security=imported_settings.security,
                    privacy=imported_settings.privacy,
                )
            else:
                # Частичное обновление (только непустые поля)
                settings_update = UserSettingsUpdate()
                # TODO: Реализовать логику частичного импорта

            result = await self.update_user_settings(
                db, user_id=user_id, settings_update=settings_update
            )

            return result

        except json.JSONDecodeError:
            return SettingsResponse(
                success=False, message="Ошибка при разборе JSON файла"
            )
        except Exception as e:
            logger.error(f"Failed to import settings for user {user_id}: {e}")
            return SettingsResponse(
                success=False, message=f"Ошибка при импорте настроек: {str(e)}"
            )

    # =============================================================================
    # Вспомогательные методы
    # =============================================================================

    async def _create_default_settings_for_user(
        self, db: AsyncSession, user: User
    ) -> UserSettings:
        """Создать настройки по умолчанию для пользователя в отдельной таблице"""

        # Создаём только настройки поведения (БЕЗ профильных данных)
        notifications = NotificationSettings()
        interface = InterfaceSettings()
        security = SecuritySettings()
        privacy = PrivacySettings()

        # Создаём модель настроек в БД с JSON данными (БЕЗ профиля)
        settings_model = UserSettingsModel(
            user_id=user.id,
            notification_settings=notifications.model_dump(),
            interface_settings=interface.model_dump(),
            security_settings=security.model_dump(),
            privacy_settings=privacy.model_dump(),
            version=1,
        )

        db.add(settings_model)
        await db.commit()
        await db.refresh(settings_model)

        # Профильные данные всегда берём из User модели
        profile_settings = UserProfileSettings(
            firstName=user.first_name or "",
            lastName=user.last_name or "",
            email=user.email,
            phone=user.phone,
            position=user.position or "",
            bio=user.bio or "",
            avatar_url=user.avatar_url,
            timezone=user.timezone,
        )

        # Возвращаем полную схему (профиль из User + настройки из UserSettings)
        return UserSettings(
            profile=profile_settings,
            notifications=notifications,
            interface=interface,
            security=security,
            privacy=privacy,
        )

    def _transform_model_to_schema(
        self, user: User, settings_model: UserSettingsModel
    ) -> UserSettings:
        """Преобразовать данные настроек из модели UserSettings в схему UserSettings"""
        try:
            # Получаем данные настроек из JSON полей или используем дефолты
            notifications_data = settings_model.notification_settings or {}
            interface_data = settings_model.interface_settings or {}
            security_data = settings_model.security_settings or {}
            privacy_data = settings_model.privacy_settings or {}

            # Профильные данные ВСЕГДА берём из User модели (source of truth)
            profile_settings = UserProfileSettings(
                firstName=user.first_name or "",
                lastName=user.last_name or "",
                email=user.email,
                phone=user.phone,
                position=user.position or "",
                bio=user.bio or "",
                avatar_url=user.avatar_url,
                timezone=user.timezone,
            )

            return UserSettings(
                profile=profile_settings,
                notifications=NotificationSettings(**notifications_data),
                interface=InterfaceSettings(**interface_data),
                security=SecuritySettings(**security_data),
                privacy=PrivacySettings(**privacy_data),
            )

        except Exception as e:
            logger.warning(f"Failed to transform settings, using defaults: {e}")
            # Fallback на дефолтные настройки
            return UserSettings(
                profile=UserProfileSettings(
                    firstName=user.first_name or "",
                    lastName=user.last_name or "",
                    email=user.email,
                    phone=user.phone,
                    position=user.position or "",
                    bio=user.bio or "",
                    avatar_url=user.avatar_url,
                    timezone=user.timezone,
                ),
                notifications=NotificationSettings(),
                interface=InterfaceSettings(),
                security=SecuritySettings(),
                privacy=PrivacySettings(),
            )


# Создаем singleton instance
settings_crud = CRUDSettings(UserSettingsModel)
