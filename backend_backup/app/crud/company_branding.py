"""
CRUD операции для модели CompanyBranding.
"""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from app.crud.base import CRUDBase
from app.models.company_branding import CompanyBranding
from app.schemas.company_branding import CompanyBrandingCreate, CompanyBrandingUpdate


class CRUDCompanyBranding(
    CRUDBase[CompanyBranding, CompanyBrandingCreate, CompanyBrandingUpdate]
):
    """CRUD операции для брендинга компании"""

    def get_by_company(
        self, db: Session, *, company_id: int
    ) -> Optional[CompanyBranding]:
        """Получить брендинг компании"""
        return db.query(self.model).filter(self.model.company_id == company_id).first()

    def create_for_company(
        self, db: Session, *, obj_in: CompanyBrandingCreate, company_id: int
    ) -> CompanyBranding:
        """Создать брендинг для компании"""
        # Проверить, нет ли уже брендинга для этой компании
        existing = self.get_by_company(db, company_id=company_id)
        if existing:
            # Обновить существующий брендинг
            return self.update(db, db_obj=existing, obj_in=obj_in)

        # Создать новый брендинг
        db_obj = self.model(company_id=company_id, **obj_in.dict())
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    def update_for_company(
        self, db: Session, *, company_id: int, obj_in: CompanyBrandingUpdate
    ) -> Optional[CompanyBranding]:
        """Обновить брендинг компании"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        return self.update(db, db_obj=branding, obj_in=obj_in)

    def get_active_branding(
        self, db: Session, *, company_id: int
    ) -> Optional[CompanyBranding]:
        """Получить активный брендинг компании"""
        return (
            db.query(self.model)
            .filter(
                and_(self.model.company_id == company_id, self.model.is_active == True)
            )
            .first()
        )

    def get_by_theme(
        self, db: Session, *, theme_name: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyBranding]:
        """Получить брендинг по теме"""
        return (
            db.query(self.model)
            .filter(self.model.theme_name == theme_name)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_dark_themes(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanyBranding]:
        """Получить темные темы"""
        return (
            db.query(self.model)
            .filter(self.model.is_dark_theme == True)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_companies_with_custom_branding(
        self, db: Session, skip: int = 0, limit: int = 100
    ) -> List[CompanyBranding]:
        """Получить компании с кастомным брендингом"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.custom_css.isnot(None),
                    self.model.custom_js.isnot(None),
                    self.model.theme_name == "custom",
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def set_as_default(
        self, db: Session, *, company_id: int, branding_id: int
    ) -> Optional[CompanyBranding]:
        """Установить брендинг как default"""
        # Сначала убрать флаг default с других схем этой компании
        db.query(self.model).filter(
            and_(self.model.company_id == company_id, self.model.id != branding_id)
        ).update({"is_default": False})

        # Установить current как default
        branding = self.get(db, id=branding_id)
        if branding and branding.company_id == company_id:
            branding.is_default = True
            db.commit()
            db.refresh(branding)
            return branding

        return None

    def activate_branding(
        self, db: Session, *, company_id: int, branding_id: int
    ) -> Optional[CompanyBranding]:
        """Активировать брендинг"""
        # Деактивировать другие схемы брендинга компании
        db.query(self.model).filter(
            and_(self.model.company_id == company_id, self.model.id != branding_id)
        ).update({"is_active": False})

        # Активировать выбранную схему
        branding = self.get(db, id=branding_id)
        if branding and branding.company_id == company_id:
            branding.is_active = True
            db.commit()
            db.refresh(branding)
            return branding

        return None

    def deactivate_branding(self, db: Session, *, company_id: int) -> bool:
        """Деактивировать все схемы брендинга компании"""
        updated_count = (
            db.query(self.model)
            .filter(self.model.company_id == company_id)
            .update({"is_active": False})
        )

        db.commit()
        return updated_count > 0

    def clone_branding(
        self, db: Session, *, source_branding_id: int, target_company_id: int
    ) -> Optional[CompanyBranding]:
        """Клонировать брендинг для другой компании"""
        source = self.get(db, id=source_branding_id)
        if not source:
            return None

        # Создать копию без ID и служебных полей
        clone_data = {}
        for column in source.__table__.columns:
            if column.name not in ["id", "company_id", "created_at", "updated_at"]:
                clone_data[column.name] = getattr(source, column.name)

        # Создать новую запись
        clone_obj = self.model(company_id=target_company_id, **clone_data)

        # Сбросить статусы для клона
        clone_obj.is_active = False
        clone_obj.is_default = False
        clone_obj.version = "1.0"

        db.add(clone_obj)
        db.commit()
        db.refresh(clone_obj)
        return clone_obj

    def update_color_palette(
        self, db: Session, *, company_id: int, colors: Dict[str, str]
    ) -> Optional[CompanyBranding]:
        """Обновить цветовую палитру"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        # Обновить цвета
        color_mapping = {
            "primary": "primary_color",
            "secondary": "secondary_color",
            "accent": "accent_color",
            "background": "background_color",
            "surface": "surface_color",
            "text": "text_color",
            "text_secondary": "text_secondary_color",
            "success": "success_color",
            "warning": "warning_color",
            "error": "error_color",
            "info": "info_color",
        }

        for color_key, color_value in colors.items():
            if color_key in color_mapping:
                field_name = color_mapping[color_key]
                setattr(branding, field_name, color_value)

        db.commit()
        db.refresh(branding)
        return branding

    def update_typography(
        self, db: Session, *, company_id: int, typography: Dict[str, Any]
    ) -> Optional[CompanyBranding]:
        """Обновить типографику"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        # Обновить шрифты
        font_families = typography.get("font_families", {})
        for font_type, font_family in font_families.items():
            field_name = f"{font_type}_font_family"
            if hasattr(branding, field_name):
                setattr(branding, field_name, font_family)

        # Обновить размеры шрифтов
        font_sizes = typography.get("font_sizes", {})
        for size_type, size_value in font_sizes.items():
            if size_type in ["h1", "h2", "h3"]:
                field_name = f"{size_type}_font_size"
            else:
                field_name = f"font_size_{size_type}"

            if hasattr(branding, field_name):
                setattr(branding, field_name, size_value)

        db.commit()
        db.refresh(branding)
        return branding

    def update_component_styles(
        self, db: Session, *, company_id: int, styles: Dict[str, Any]
    ) -> Optional[CompanyBranding]:
        """Обновить стили компонентов"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        # Обновить стили кнопок
        buttons = styles.get("buttons", {})
        if "border_radius" in buttons:
            branding.button_border_radius = buttons["border_radius"]
        if "padding" in buttons:
            branding.button_padding = buttons["padding"]

        # Обновить стили карточек
        cards = styles.get("cards", {})
        if "border_radius" in cards:
            branding.card_border_radius = cards["border_radius"]
        if "shadow" in cards:
            branding.card_shadow = cards["shadow"]

        # Обновить стили полей ввода
        inputs = styles.get("inputs", {})
        if "border_radius" in inputs:
            branding.input_border_radius = inputs["border_radius"]
        if "border_color" in inputs:
            branding.input_border_color = inputs["border_color"]

        db.commit()
        db.refresh(branding)
        return branding

    def update_social_links(
        self, db: Session, *, company_id: int, social_links: Dict[str, str]
    ) -> Optional[CompanyBranding]:
        """Обновить ссылки на социальные сети"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        if not branding.social_links:
            branding.social_links = {}

        branding.social_links.update(social_links)
        db.commit()
        db.refresh(branding)
        return branding

    def apply_preset_theme(
        self, db: Session, *, company_id: int, preset_name: str
    ) -> Optional[CompanyBranding]:
        """Применить предустановленную тему"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        branding.apply_preset_theme(preset_name)
        db.commit()
        db.refresh(branding)
        return branding

    def generate_css_for_company(
        self, db: Session, *, company_id: int
    ) -> Optional[str]:
        """Сгенерировать CSS для компании"""
        branding = self.get_active_branding(db, company_id=company_id)
        if not branding:
            return None

        return branding.generate_css_variables()

    def validate_branding(self, db: Session, *, company_id: int) -> Dict[str, Any]:
        """Валидировать брендинг компании"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return {"valid": False, "errors": ["Branding not found"]}

        errors = branding.validate_colors()
        warnings = []
        recommendations = []

        # Проверить наличие логотипа
        if not branding.logo_url:
            warnings.append("Logo is not set")

        # Проверить контрастность цветов
        if branding.text_color and branding.background_color:
            # Здесь можно добавить проверку контрастности
            pass

        # Рекомендации
        if not branding.company_slogan:
            recommendations.append("Consider adding a company slogan")

        if not branding.social_links:
            recommendations.append("Consider adding social media links")

        return {
            "valid": len(errors) == 0,
            "errors": errors,
            "warnings": warnings,
            "recommendations": recommendations,
        }

    def get_branding_statistics(self, db: Session) -> Dict[str, Any]:
        """Получить статистику брендинга"""
        total_branding = db.query(func.count(self.model.id)).scalar()

        active_branding = (
            db.query(func.count(self.model.id))
            .filter(self.model.is_active == True)
            .scalar()
        )

        dark_themes = (
            db.query(func.count(self.model.id))
            .filter(self.model.is_dark_theme == True)
            .scalar()
        )

        custom_themes = (
            db.query(func.count(self.model.id))
            .filter(self.model.theme_name == "custom")
            .scalar()
        )

        with_custom_css = (
            db.query(func.count(self.model.id))
            .filter(self.model.custom_css.isnot(None))
            .scalar()
        )

        # Статистика по темам
        theme_stats = (
            db.query(self.model.theme_name, func.count(self.model.id).label("count"))
            .group_by(self.model.theme_name)
            .all()
        )

        # Статистика по типам макета
        layout_stats = (
            db.query(self.model.layout_type, func.count(self.model.id).label("count"))
            .group_by(self.model.layout_type)
            .all()
        )

        return {
            "total_companies": total_branding,
            "active_branding": active_branding,
            "dark_themes": dark_themes,
            "custom_themes": custom_themes,
            "with_custom_css": with_custom_css,
            "theme_distribution": {theme: count for theme, count in theme_stats},
            "layout_distribution": {layout: count for layout, count in layout_stats},
            "customization_rate": (
                round((custom_themes / total_branding * 100), 2)
                if total_branding > 0
                else 0
            ),
            "dark_theme_adoption": (
                round((dark_themes / total_branding * 100), 2)
                if total_branding > 0
                else 0
            ),
        }

    def search_by_colors(
        self, db: Session, *, color_search: str, skip: int = 0, limit: int = 100
    ) -> List[CompanyBranding]:
        """Поиск по цветам"""
        return (
            db.query(self.model)
            .filter(
                or_(
                    self.model.primary_color.ilike(f"%{color_search}%"),
                    self.model.secondary_color.ilike(f"%{color_search}%"),
                    self.model.accent_color.ilike(f"%{color_search}%"),
                )
            )
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_similar_themes(
        self, db: Session, *, company_id: int, limit: int = 5
    ) -> List[CompanyBranding]:
        """Получить похожие темы"""
        source_branding = self.get_by_company(db, company_id=company_id)
        if not source_branding:
            return []

        # Поиск по похожим цветам и теме
        return (
            db.query(self.model)
            .filter(
                and_(
                    self.model.company_id != company_id,
                    or_(
                        self.model.theme_name == source_branding.theme_name,
                        self.model.primary_color == source_branding.primary_color,
                        self.model.is_dark_theme == source_branding.is_dark_theme,
                    ),
                )
            )
            .limit(limit)
            .all()
        )

    def backup_branding(
        self, db: Session, *, company_id: int
    ) -> Optional[Dict[str, Any]]:
        """Создать резервную копию брендинга"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        # Исключаем служебные поля
        backup_data = {
            column.name: getattr(branding, column.name)
            for column in branding.__table__.columns
            if column.name not in ["id", "company_id", "created_at", "updated_at"]
        }

        return {
            "company_id": company_id,
            "backup_date": func.now(),
            "branding": backup_data,
        }

    def restore_branding(
        self, db: Session, *, company_id: int, backup_data: Dict[str, Any]
    ) -> Optional[CompanyBranding]:
        """Восстановить брендинг из резервной копии"""
        branding = self.get_by_company(db, company_id=company_id)
        if not branding:
            return None

        # Восстанавливаем только безопасные поля
        safe_fields = backup_data.get("branding", {})

        for field, value in safe_fields.items():
            if hasattr(branding, field) and field not in [
                "id",
                "company_id",
                "created_at",
                "updated_at",
            ]:
                setattr(branding, field, value)

        db.commit()
        db.refresh(branding)
        return branding


# Создаем экземпляр CRUD
company_branding = CRUDCompanyBranding(CompanyBranding)
