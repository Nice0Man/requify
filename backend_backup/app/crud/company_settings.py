"""
CRUD операции для модели CompanySettings.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from datetime import datetime

from app.crud.base import CRUDBase
from app.models.company_settings import CompanySettings
from app.schemas.company_settings import CompanySettingsCreate, CompanySettingsUpdate


class CRUDCompanySettings(
    CRUDBase[CompanySettings, CompanySettingsCreate, CompanySettingsUpdate]
):
    """CRUD операции для настроек компании"""

    def get_by_company(
        self, db: Session, *, company_id: int
    ) -> Optional[CompanySettings]:
        """Получить настройки компании"""
        return db.query(self.model).filter(self.model.company_id == company_id).first()

    def create_for_company(
        self, db: Session, *, obj_in: CompanySettingsCreate, company_id: int
    ) -> CompanySettings:
        """Создать настройки для компании"""
        # Проверить, нет ли уже настроек для этой компании
        existing = self.get_by_company(db, company_id=company_id)
        if existing:
            # Обновить существующие настройки
            return self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новые настройки
        db_obj = self.model(company_id=company_id, **obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_for_company(
        self, db: Session, *, company_id: int, obj_in: CompanySettingsUpdate
    ) -> Optional[CompanySettings]:
        """Обновить настройки компании"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        return self.update(db, db_obj=settings, obj_in=obj_in)

    def get_companies_by_domain(
        self, db: Session, *, domain: str
    ) -> List[CompanySettings]:
        """Найти компании по домену"""
        return db.query(self.model).filter(self.model.domain == domain).all()

    def get_companies_with_sso(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Получить компании с включенным SSO"""
        return (
            db.query(self.model)
            .filter(self.model.enable_sso == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_by_language(
        self, db: Session, *, language: str, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Найти компании по языку"""
        return (
            db.query(self.model)
            .filter(self.model.default_language == language)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_by_timezone(
        self, db: Session, *, timezone: str, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Найти компании по часовому поясу"""
        return (
            db.query(self.model)
            .filter(self.model.default_timezone == timezone)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def search_by_domain_signup(
        self, db: Session, *, allow_signup: bool = True, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Поиск компаний с разрешенной регистрацией по домену"""
        return (
            db.query(self.model)
            .filter(self.model.allow_domain_signup == allow_signup)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_with_2fa(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Получить компании с обязательной 2FA"""
        return (
            db.query(self.model)
            .filter(self.model.enforce_2fa == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_by_file_storage(
        self, db: Session, *, provider: str, skip: int = 0, limit: int = 100
    ) -> List[CompanySettings]:
        """Получить компании по провайдеру хранения файлов"""
        return (
            db.query(self.model)
            .filter(self.model.file_storage_provider == provider)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def update_custom_setting(
        self, db: Session, *, company_id: int, key: str, value: Any
    ) -> Optional[CompanySettings]:
        """Обновить кастомную настройку"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        if not settings.custom_settings:
            settings.custom_settings = {}

        settings.custom_settings[key] = value
        db.commit()
        db.refresh(settings)
        return settings

    def delete_custom_setting(
        self, db: Session, *, company_id: int, key: str
    ) -> Optional[CompanySettings]:
        """Удалить кастомную настройку"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings or not settings.custom_settings:
            return None

        if key in settings.custom_settings:
            del settings.custom_settings[key]
            db.commit()
            db.refresh(settings)

        return settings

    def get_notification_settings(
        self, db: Session, *, company_id: int
    ) -> Dict[str, Any]:
        """Получить настройки уведомлений"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {}

        return settings.get_notification_settings()

    def update_notification_settings(
        self, db: Session, *, company_id: int, notification_settings: Dict[str, Any]
    ) -> Optional[CompanySettings]:
        """Обновить настройки уведомлений"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        if not settings.notification_settings:
            settings.notification_settings = {}

        settings.notification_settings.update(notification_settings)
        db.commit()
        db.refresh(settings)
        return settings

    def get_password_policy(self, db: Session, *, company_id: int) -> Dict[str, Any]:
        """Получить политику паролей"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {}

        return settings.get_password_policy()

    def update_password_policy(
        self, db: Session, *, company_id: int, password_policy: Dict[str, Any]
    ) -> Optional[CompanySettings]:
        """Обновить политику паролей"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        if not settings.password_policy:
            settings.password_policy = {}

        settings.password_policy.update(password_policy)
        db.commit()
        db.refresh(settings)
        return settings

    def get_sso_configuration(
        self, db: Session, *, company_id: int
    ) -> Optional[Dict[str, Any]]:
        """Получить конфигурацию SSO"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings or not settings.enable_sso:
            return None

        return {
            "provider": settings.sso_provider,
            "config": settings.sso_config,
            "is_valid": settings.validate_sso_config(),
        }

    def update_sso_configuration(
        self,
        db: Session,
        *,
        company_id: int,
        sso_provider: str,
        sso_config: Dict[str, Any],
    ) -> Optional[CompanySettings]:
        """Обновить конфигурацию SSO"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        settings.sso_provider = sso_provider
        settings.sso_config = sso_config
        settings.enable_sso = True

        db.commit()
        db.refresh(settings)
        return settings

    def disable_sso(self, db: Session, *, company_id: int) -> Optional[CompanySettings]:
        """Отключить SSO"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        settings.enable_sso = False
        settings.sso_provider = None
        settings.sso_config = None

        db.commit()
        db.refresh(settings)
        return settings

    def get_analytics_settings(self, db: Session, *, company_id: int) -> Dict[str, Any]:
        """Получить настройки аналитики"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {}

        return {
            "enable_analytics": settings.enable_analytics,
            "analytics_retention_days": settings.analytics_retention_days,
            "enable_usage_tracking": settings.enable_usage_tracking,
        }

    def get_file_upload_settings(
        self, db: Session, *, company_id: int
    ) -> Dict[str, Any]:
        """Получить настройки загрузки файлов"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {}

        return {
            "file_storage_provider": settings.file_storage_provider,
            "max_file_size_mb": settings.max_file_size_mb,
            "allowed_file_types": settings.get_allowed_file_types(),
            "max_file_size_bytes": settings.max_file_size_mb * 1024 * 1024,
        }

    def validate_file_upload(
        self, db: Session, *, company_id: int, file_size_bytes: int, file_extension: str
    ) -> Dict[str, Any]:
        """Валидировать загрузку файла"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {"valid": False, "reason": "Company settings not found"}

        # Проверить размер файла
        if not settings.is_file_size_allowed(file_size_bytes):
            return {
                "valid": False,
                "reason": f"File size exceeds limit of {settings.max_file_size_mb} MB",
            }

        # Проверить тип файла
        if not settings.can_upload_file_type(file_extension):
            return {
                "valid": False,
                "reason": f"File type .{file_extension} is not allowed",
            }

        return {"valid": True, "reason": None}

    def get_export_settings(self, db: Session, *, company_id: int) -> Dict[str, Any]:
        """Получить настройки экспорта"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return {}

        return {
            "allow_data_export": settings.allow_data_export,
            "export_formats": settings.get_export_formats(),
        }

    def can_export_format(
        self, db: Session, *, company_id: int, format_name: str
    ) -> bool:
        """Проверить, разрешен ли формат экспорта"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return False

        return settings.can_export_format(format_name)

    def get_settings_statistics(self, db: Session) -> Dict[str, Any]:
        """Получить статистику настроек"""
        total_settings = db.query(func.count(self.model.id)).scalar()

        sso_enabled = (
            db.query(func.count(self.model.id))
            .filter(self.model.enable_sso == True)
            .scalar()
        )

        two_fa_enforced = (
            db.query(func.count(self.model.id))
            .filter(self.model.enforce_2fa == True)
            .scalar()
        )

        analytics_enabled = (
            db.query(func.count(self.model.id))
            .filter(self.model.enable_analytics == True)
            .scalar()
        )

        # Статистика по языкам
        language_stats = (
            db.query(
                self.model.default_language, func.count(self.model.id).label("count")
            )
            .group_by(self.model.default_language)
            .all()
        )

        # Статистика по валютам
        currency_stats = (
            db.query(
                self.model.default_currency, func.count(self.model.id).label("count")
            )
            .group_by(self.model.default_currency)
            .all()
        )

        # Статистика по провайдерам хранения
        storage_stats = (
            db.query(
                self.model.file_storage_provider,
                func.count(self.model.id).label("count"),
            )
            .group_by(self.model.file_storage_provider)
            .all()
        )

        return {
            "total_companies": total_settings,
            "sso_enabled": sso_enabled,
            "two_fa_enforced": two_fa_enforced,
            "analytics_enabled": analytics_enabled,
            "language_distribution": {lang: count for lang, count in language_stats},
            "currency_distribution": {curr: count for curr, count in currency_stats},
            "storage_provider_distribution": {
                provider: count for provider, count in storage_stats
            },
            "sso_adoption_rate": (
                round((sso_enabled / total_settings * 100), 2)
                if total_settings > 0
                else 0
            ),
            "two_fa_adoption_rate": (
                round((two_fa_enforced / total_settings * 100), 2)
                if total_settings > 0
                else 0
            ),
            "analytics_adoption_rate": (
                round((analytics_enabled / total_settings * 100), 2)
                if total_settings > 0
                else 0
            ),
        }

    def backup_settings(
        self, db: Session, *, company_id: int
    ) -> Optional[Dict[str, Any]]:
        """Создать резервную копию настроек"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        # Исключаем служебные поля
        backup_data = {
            column.name: getattr(settings, column.name)
            for column in settings.__table__.columns
            if column.name not in ["id", "company_id", "created_at", "updated_at"]
        }

        return {
            "company_id": company_id,
            "backup_date": datetime.utcnow().isoformat(),
            "settings": backup_data,
        }

    def restore_settings(
        self, db: Session, *, company_id: int, backup_data: Dict[str, Any]
    ) -> Optional[CompanySettings]:
        """Восстановить настройки из резервной копии"""
        settings = self.get_by_company(db, company_id=company_id)
        if not settings:
            return None

        # Восстанавливаем только безопасные поля
        safe_fields = backup_data.get("settings", {})

        for field, value in safe_fields.items():
            if hasattr(settings, field) and field not in [
                "id",
                "company_id",
                "created_at",
                "updated_at",
            ]:
                setattr(settings, field, value)

        db.commit()
        db.refresh(settings)
        return settings


# Создаем экземпляр CRUD
company_settings = CRUDCompanySettings(CompanySettings)
