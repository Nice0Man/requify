"""
Сервис для бизнес-логики брендинга компании.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
from datetime import datetime, timezone

from app.crud.company_branding import company_branding as branding_crud
from app.models.company_branding import CompanyBranding
from app.models.user import User
from app.services.permission_service import permission_service
from app.core.constants import Permission, RoleScope
from app.schemas.company_branding import (
    CompanyBrandingCreate,
    CompanyBrandingUpdate,
    CompanyBrandingResponse,
    ColorPalette,
    TypographyConfig,
    ComponentStyles,
    LayoutConfig,
    SocialLinks,
    ThemePreset,
    BrandingValidation,
    AssetUpload,
    BrandingExport,
    BrandingImport,
)


class CompanyBrandingService:
    """Сервис для работы с брендингом компании"""

    def __init__(self):
        self.crud = branding_crud

    def get_company_branding(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> Optional[CompanyBranding]:
        """Получить брендинг компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_by_company(db, company_id=company_id)

    def get_active_branding(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> Optional[CompanyBranding]:
        """Получить активный брендинг компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_active_branding(db, company_id=company_id)

    def create_or_update_branding(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        branding_data: CompanyBrandingCreate,
        current_user: User,
    ) -> CompanyBranding:
        """Создать или обновить брендинг компании"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company branding",
            )

        # Проверить существование компании
        company = company_crud.get(db, id=company_id)
        if not company:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Company not found"
            )

        # Валидировать брендинг
        validation_result = self._validate_branding(branding_data)
        if not validation_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Branding validation failed: {', '.join(validation_result.errors)}",
            )

        # Создать или обновить брендинг
        branding = self.crud.create_for_company(
            db, obj_in=branding_data, company_id=company_id
        )

        return branding

    def update_branding(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        branding_data: CompanyBrandingUpdate,
        current_user: User,
    ) -> CompanyBranding:
        """Обновить брендинг компании"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage company branding",
            )

        # Получить существующий брендинг
        branding = self.crud.get_by_company(db, company_id=company_id)
        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        # Обновить брендинг
        updated_branding = self.crud.update_for_company(
            db, company_id=company_id, obj_in=branding_data
        )

        if not updated_branding:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update company branding",
            )

        return updated_branding

    def update_color_palette(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        colors: ColorPalette,
        current_user: User,
    ) -> CompanyBranding:
        """Обновить цветовую палитру"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update color palette",
            )

        branding = self.crud.update_color_palette(
            db, company_id=company_id, colors=colors.dict()
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def update_typography(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        typography: TypographyConfig,
        current_user: User,
    ) -> CompanyBranding:
        """Обновить типографику"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update typography",
            )

        branding = self.crud.update_typography(
            db, company_id=company_id, typography=typography.dict()
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def update_component_styles(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        styles: ComponentStyles,
        current_user: User,
    ) -> CompanyBranding:
        """Обновить стили компонентов"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update component styles",
            )

        branding = self.crud.update_component_styles(
            db, company_id=company_id, styles=styles.dict()
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def update_social_links(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        social_links: SocialLinks,
        current_user: User,
    ) -> CompanyBranding:
        """Обновить ссылки на социальные сети"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to update social links",
            )

        branding = self.crud.update_social_links(
            db,
            company_id=company_id,
            social_links=social_links.dict(exclude_unset=True),
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def apply_preset_theme(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        preset_name: str,
        current_user: User,
    ) -> CompanyBranding:
        """Применить предустановленную тему"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to apply theme preset",
            )

        # Валидировать имя темы
        if not self._is_valid_preset(preset_name):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid preset theme: {preset_name}",
            )

        branding = self.crud.apply_preset_theme(
            db, company_id=company_id, preset_name=preset_name
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def generate_css(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> str:
        """Сгенерировать CSS для компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        css = self.crud.generate_css_for_company(db, company_id=company_id)

        if not css:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active branding found for company",
            )

        return css

    def validate_branding(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Валидировать брендинг компании"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.validate_branding(db, company_id=company_id)

    def activate_branding(
        self, db: AsyncSession, *, company_id: int, branding_id: int, current_user: User
    ) -> CompanyBranding:
        """Активировать брендинг"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to activate branding",
            )

        branding = self.crud.activate_branding(
            db, company_id=company_id, branding_id=branding_id
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Branding not found or access denied",
            )

        return branding

    def deactivate_branding(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> bool:
        """Деактивировать брендинг"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to deactivate branding",
            )

        success = self.crud.deactivate_branding(db, company_id=company_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No branding found to deactivate",
            )

        return success

    def clone_branding(
        self,
        db: AsyncSession,
        *,
        source_company_id: int,
        target_company_id: int,
        current_user: User,
    ) -> CompanyBranding:
        """Клонировать брендинг между компаниями"""

        # Проверить права доступа к обеим компаниям
        if not self._can_access_company(current_user, source_company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to source company",
            )

        if not self._can_manage_company_branding(current_user, target_company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to manage target company branding",
            )

        # Получить исходный брендинг
        source_branding = self.crud.get_by_company(db, company_id=source_company_id)
        if not source_branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Source company branding not found",
            )

        # Клонировать брендинг
        cloned_branding = self.crud.clone_branding(
            db,
            source_branding_id=source_branding.id,
            target_company_id=target_company_id,
        )

        if not cloned_branding:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to clone branding",
            )

        return cloned_branding

    def get_similar_themes(
        self, db: AsyncSession, *, company_id: int, current_user: User, limit: int = 5
    ) -> List[CompanyBranding]:
        """Получить похожие темы"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        return self.crud.get_similar_themes(db, company_id=company_id, limit=limit)

    def backup_branding(
        self, db: AsyncSession, *, company_id: int, current_user: User
    ) -> Dict[str, Any]:
        """Создать резервную копию брендинга"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to backup branding",
            )

        backup = self.crud.backup_branding(db, company_id=company_id)

        if not backup:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return backup

    def restore_branding(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        backup_data: Dict[str, Any],
        current_user: User,
    ) -> CompanyBranding:
        """Восстановить брендинг из резервной копии"""

        # Проверить права на управление брендингом
        if not self._can_manage_company_branding(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not enough permissions to restore branding",
            )

        branding = self.crud.restore_branding(
            db, company_id=company_id, backup_data=backup_data
        )

        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Company branding not found",
            )

        return branding

    def export_branding(
        self,
        db: AsyncSession,
        *,
        company_id: int,
        export_format: str,
        current_user: User,
    ) -> str:
        """Экспортировать брендинг"""

        # Проверить права доступа к компании
        if not self._can_access_company(current_user, company_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Access denied to company"
            )

        branding = self.crud.get_active_branding(db, company_id=company_id)
        if not branding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active branding found",
            )

        if export_format == "css":
            return branding.generate_css_variables()
        elif export_format == "json":
            # Экспорт в JSON
            export_data = {
                "color_palette": branding.get_color_palette(),
                "typography": branding.get_typography_config(),
                "components": branding.get_component_styles(),
                "layout": branding.get_layout_config(),
                "social_links": branding.get_social_links(),
                "theme_name": branding.theme_name,
                "is_dark_theme": branding.is_dark_theme,
            }
            import json

            return json.dumps(export_data, indent=2)
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported export format: {export_format}",
            )

    def get_available_presets(self) -> List[ThemePreset]:
        """Получить доступные предустановленные темы"""
        return [
            ThemePreset(
                name="default",
                display_name="Default",
                description="Light theme with blue accent",
                primary_color="#007bff",
                secondary_color="#6c757d",
                is_dark_theme=False,
            ),
            ThemePreset(
                name="dark",
                display_name="Dark",
                description="Dark theme for night work",
                primary_color="#375a7f",
                secondary_color="#495057",
                background_color="#212529",
                surface_color="#343a40",
                text_color="#ffffff",
                is_dark_theme=True,
            ),
            ThemePreset(
                name="corporate",
                display_name="Corporate",
                description="Professional business theme",
                primary_color="#2c3e50",
                secondary_color="#34495e",
                accent_color="#3498db",
                is_dark_theme=False,
            ),
            ThemePreset(
                name="modern",
                display_name="Modern",
                description="Vibrant modern theme",
                primary_color="#6f42c1",
                secondary_color="#e83e8c",
                accent_color="#fd7e14",
                is_dark_theme=False,
            ),
        ]

    def get_branding_statistics(
        self, db: AsyncSession, *, current_user: User
    ) -> Dict[str, Any]:
        """Получить статистику брендинга"""

        # Только системные администраторы могут просматривать статистику
        if not current_user.is_system_admin:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only system administrators can view branding statistics",
            )

        return self.crud.get_branding_statistics(db)

    # Приватные методы для валидации и проверки прав

    def _validate_branding(
        self, branding_data: CompanyBrandingCreate
    ) -> BrandingValidation:
        """Валидировать данные брендинга"""
        errors = []
        warnings = []
        recommendations = []

        # Проверить соответствие темной темы и цветов
        if branding_data.is_dark_theme:
            if branding_data.background_color and branding_data.background_color in [
                "#ffffff",
                "#f8f9fa",
            ]:
                warnings.append(
                    "Light background color detected with dark theme setting"
                )

        # Проверить контрастность
        if (
            branding_data.text_color
            and branding_data.background_color
            and branding_data.text_color == branding_data.background_color
        ):
            errors.append("Text color and background color cannot be the same")

        # Рекомендации
        if not branding_data.logo_url:
            recommendations.append("Consider adding a company logo")

        if not branding_data.company_slogan:
            recommendations.append("Consider adding a company slogan")

        if not branding_data.social_links:
            recommendations.append("Consider adding social media links")

        return BrandingValidation(
            is_valid=len(errors) == 0,
            errors=errors,
            warnings=warnings,
            recommendations=recommendations,
        )

    def _is_valid_preset(self, preset_name: str) -> bool:
        """Проверить валидность имени темы"""
        valid_presets = ["default", "dark", "corporate", "modern"]
        return preset_name in valid_presets

    async def _can_access_company(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права доступа к компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id:
            return True

        # Проверить доступ через Enhanced Role System
        return await permission_service.check_user_permission(
            db=db,
            user=user,
            permission=Permission.VIEW_PROJECT,  # Базовые права на просмотр компании
            scope=RoleScope.COMPANY,
            context_id=company_id,
        )

    async def _can_manage_company_branding(
        self, db: AsyncSession, user: User, company_id: int
    ) -> bool:
        """Проверить права на управление брендингом компании"""
        if user.is_system_admin:
            return True

        if user.company_id == company_id and user.is_company_admin:
            return True

        # Проверить права через Enhanced Role System
        return await permission_service.check_user_permission(
            db=db,
            user=user,
            permission=Permission.MANAGE_PROJECT,  # Права на управление компанией
            scope=RoleScope.COMPANY,
            context_id=company_id,
        )


# Создаем экземпляр сервиса
company_branding_service = CompanyBrandingService()
