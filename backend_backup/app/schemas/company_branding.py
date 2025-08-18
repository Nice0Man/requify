"""
Схемы для модели CompanyBranding.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from typing import Optional, List, Dict, Any
from sqlmodel import Field
from pydantic import field_validator, HttpUrl
from datetime import datetime
from enum import Enum
import re

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    CompanyRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class ThemeName(str, Enum):
    """Названия тем"""

    DEFAULT = "default"
    DARK = "dark"
    LIGHT = "light"
    CORPORATE = "corporate"
    MODERN = "modern"
    CUSTOM = "custom"


class LayoutType(str, Enum):
    """Типы макета"""

    FULL_WIDTH = "full_width"
    BOXED = "boxed"
    FLUID = "fluid"


class CompanyBrandingBase(BaseSchema, ValidationMixin):
    """Базовая схема для брендинга компании"""

    # Логотип и изображения
    logo_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL логотипа"
    )
    logo_dark_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL темного логотипа"
    )
    logo_light_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL светлого логотипа"
    )
    favicon_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL favicon"
    )

    # Дополнительные изображения
    banner_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL баннера"
    )
    background_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL фона"
    )
    watermark_url: Optional[str] = Field(
        None, max_length=FieldLimits.URL_MAX, description="URL водяного знака"
    )

    # Основные цвета
    primary_color: Optional[str] = Field(
        None, max_length=7, description="Основной цвет"
    )
    secondary_color: Optional[str] = Field(
        None, max_length=7, description="Вторичный цвет"
    )
    accent_color: Optional[str] = Field(
        None, max_length=7, description="Акцентный цвет"
    )

    # Нейтральные цвета
    background_color: Optional[str] = Field(None, max_length=7, description="Цвет фона")
    surface_color: Optional[str] = Field(
        None, max_length=7, description="Цвет поверхности"
    )
    text_color: Optional[str] = Field(None, max_length=7, description="Цвет текста")
    text_secondary_color: Optional[str] = Field(
        None, max_length=7, description="Цвет вторичного текста"
    )

    # Статусные цвета
    success_color: Optional[str] = Field(
        "#28a745", max_length=7, description="Цвет успеха"
    )
    warning_color: Optional[str] = Field(
        "#ffc107", max_length=7, description="Цвет предупреждения"
    )
    error_color: Optional[str] = Field(
        "#dc3545", max_length=7, description="Цвет ошибки"
    )
    info_color: Optional[str] = Field(
        "#17a2b8", max_length=7, description="Цвет информации"
    )

    # Шрифты
    primary_font_family: Optional[str] = Field(
        "Inter, sans-serif",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Основной шрифт",
    )
    secondary_font_family: Optional[str] = Field(
        "Roboto, sans-serif",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Дополнительный шрифт",
    )
    monospace_font_family: Optional[str] = Field(
        "Fira Code, monospace",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Моноширинный шрифт",
    )

    # Размеры шрифтов
    font_size_base: Optional[str] = Field(
        "14px", max_length=10, description="Базовый размер шрифта"
    )
    font_size_small: Optional[str] = Field(
        "12px", max_length=10, description="Малый размер шрифта"
    )
    font_size_large: Optional[str] = Field(
        "16px", max_length=10, description="Большой размер шрифта"
    )

    # Заголовки
    h1_font_size: Optional[str] = Field("32px", max_length=10, description="Размер H1")
    h2_font_size: Optional[str] = Field("24px", max_length=10, description="Размер H2")
    h3_font_size: Optional[str] = Field("20px", max_length=10, description="Размер H3")

    # UI компоненты - кнопки
    button_border_radius: Optional[str] = Field(
        "4px", max_length=20, description="Радиус границы кнопки"
    )
    button_padding: Optional[str] = Field(
        "8px 16px", max_length=20, description="Отступы кнопки"
    )

    # UI компоненты - карточки
    card_border_radius: Optional[str] = Field(
        "8px", max_length=20, description="Радиус границы карточки"
    )
    card_shadow: Optional[str] = Field(
        "0 2px 4px rgba(0,0,0,0.1)", max_length=50, description="Тень карточки"
    )

    # UI компоненты - поля ввода
    input_border_radius: Optional[str] = Field(
        "4px", max_length=20, description="Радиус границы поля ввода"
    )
    input_border_color: Optional[str] = Field(
        "#ddd", max_length=7, description="Цвет границы поля ввода"
    )

    # Тема и стиль
    theme_name: ThemeName = Field(ThemeName.DEFAULT, description="Название темы")
    is_dark_theme: bool = Field(False, description="Темная тема")

    # Кастомные стили
    custom_css: Optional[str] = Field(
        None, max_length=10000, description="Пользовательский CSS"
    )
    custom_js: Optional[str] = Field(
        None, max_length=10000, description="Пользовательский JavaScript"
    )

    # Макет
    layout_type: LayoutType = Field(LayoutType.FULL_WIDTH, description="Тип макета")
    sidebar_width: Optional[str] = Field(
        "250px", max_length=20, description="Ширина бокового меню"
    )
    header_height: Optional[str] = Field(
        "60px", max_length=20, description="Высота заголовка"
    )

    # Анимации
    enable_animations: bool = Field(True, description="Включить анимации")
    animation_duration: Optional[str] = Field(
        "0.3s", max_length=10, description="Длительность анимации"
    )

    # Брендинг компании
    company_slogan: Optional[str] = Field(
        None, max_length=200, description="Слоган компании"
    )
    brand_description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание бренда"
    )
    social_links: Optional[Dict[str, Any]] = Field(None, description="Социальные сети")

    # White Label настройки
    product_name: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Название продукта"
    )
    login_page_title: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Заголовок страницы входа",
    )
    dashboard_title: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Заголовок дашборда"
    )
    hide_powered_by: bool = Field(False, description="Скрыть 'Powered by'")
    hide_help_links: bool = Field(False, description="Скрыть ссылки помощи")

    # Статус и метаданные
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)
    is_default: bool = Field(False, description="По умолчанию")
    version: str = Field(
        "1.0", max_length=FieldLimits.VERSION_MAX, description="Версия"
    )
    advanced_settings: Optional[Dict[str, Any]] = Field(
        None, description="Расширенные настройки"
    )

    @field_validator(
        "primary_color",
        "secondary_color",
        "accent_color",
        "background_color",
        "surface_color",
        "text_color",
        "text_secondary_color",
        "success_color",
        "warning_color",
        "error_color",
        "info_color",
        "input_border_color",
    )
    def validate_hex_color(cls, v):
        if v is not None and not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Color must be in hex format (#RRGGBB)")
        return v

    @field_validator("company_slogan")
    def validate_slogan(cls, v):
        if v and len(v) > 200:
            raise ValueError("Company slogan must be less than 200 characters")
        return v

    @field_validator("brand_description")
    def validate_brand_description(cls, v):
        if v and len(v) > 1000:
            raise ValueError("Brand description must be less than 1000 characters")
        return v

    @field_validator("custom_css")
    def validate_custom_css(cls, v):
        if v and len(v) > 10000:
            raise ValueError("Custom CSS must be less than 10000 characters")
        return v

    @field_validator("custom_js")
    def validate_custom_js(cls, v):
        if v and len(v) > 10000:
            raise ValueError("Custom JavaScript must be less than 10000 characters")
        return v


class CompanyBrandingCreate(CreateSchema, CompanyBrandingBase):
    """Схема для создания брендинга компании"""

    pass


class CompanyBrandingUpdate(UpdateSchema):
    """Схема для обновления брендинга компании"""

    # Все поля опциональны для обновления (с ограничениями)
    logo_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    logo_dark_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    logo_light_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    favicon_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)

    banner_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    background_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)
    watermark_url: Optional[str] = Field(None, max_length=FieldLimits.URL_MAX)

    primary_color: Optional[str] = Field(None, max_length=7)
    secondary_color: Optional[str] = Field(None, max_length=7)
    accent_color: Optional[str] = Field(None, max_length=7)

    background_color: Optional[str] = Field(None, max_length=7)
    surface_color: Optional[str] = Field(None, max_length=7)
    text_color: Optional[str] = Field(None, max_length=7)
    text_secondary_color: Optional[str] = Field(None, max_length=7)

    success_color: Optional[str] = Field(None, max_length=7)
    warning_color: Optional[str] = Field(None, max_length=7)
    error_color: Optional[str] = Field(None, max_length=7)
    info_color: Optional[str] = Field(None, max_length=7)

    primary_font_family: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )
    secondary_font_family: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )
    monospace_font_family: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )

    font_size_base: Optional[str] = Field(None, max_length=10)
    font_size_small: Optional[str] = Field(None, max_length=10)
    font_size_large: Optional[str] = Field(None, max_length=10)

    h1_font_size: Optional[str] = Field(None, max_length=10)
    h2_font_size: Optional[str] = Field(None, max_length=10)
    h3_font_size: Optional[str] = Field(None, max_length=10)

    button_border_radius: Optional[str] = Field(None, max_length=20)
    button_padding: Optional[str] = Field(None, max_length=20)

    card_border_radius: Optional[str] = Field(None, max_length=20)
    card_shadow: Optional[str] = Field(None, max_length=50)

    input_border_radius: Optional[str] = Field(None, max_length=20)
    input_border_color: Optional[str] = Field(None, max_length=7)

    theme_name: Optional[ThemeName] = None
    is_dark_theme: Optional[bool] = None

    custom_css: Optional[str] = Field(None, max_length=10000)
    custom_js: Optional[str] = Field(None, max_length=10000)

    layout_type: Optional[LayoutType] = None
    sidebar_width: Optional[str] = Field(None, max_length=20)
    header_height: Optional[str] = Field(None, max_length=20)

    enable_animations: Optional[bool] = None
    animation_duration: Optional[str] = Field(None, max_length=10)

    company_slogan: Optional[str] = Field(None, max_length=200)
    brand_description: Optional[str] = Field(None, max_length=FieldLimits.TEXT_MAX)
    social_links: Optional[Dict[str, Any]] = None

    product_name: Optional[str] = Field(None, max_length=FieldLimits.SHORT_STRING_MAX)
    login_page_title: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )
    dashboard_title: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX
    )
    hide_powered_by: Optional[bool] = None
    hide_help_links: Optional[bool] = None

    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    version: Optional[str] = Field(None, max_length=FieldLimits.VERSION_MAX)
    advanced_settings: Optional[Dict[str, Any]] = None


class CompanyBrandingResponse(
    ResponseSchema, CompanyBrandingBase, CompanyRelatedSchema
):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    color_palette: Optional[Dict[str, str]] = Field(
        None, description="Цветовая палитра"
    )
    typography_config: Optional[Dict[str, Any]] = Field(
        None, description="Конфигурация типографики"
    )
    component_styles: Optional[Dict[str, Any]] = Field(
        None, description="Стили компонентов"
    )
    layout_config: Optional[Dict[str, Any]] = Field(
        None, description="Конфигурация макета"
    )
    css_variables: Optional[str] = Field(None, description="CSS переменные")


class CompanyBrandingProfile(BaseSchema):
    """Схема для профиля брендинга (упрощенная)"""

    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
    theme_name: ThemeName
    is_dark_theme: bool
    company_slogan: Optional[str]
    product_name: Optional[str]
    is_active: bool


class ColorPalette(BaseSchema):
    """Схема для цветовой палитры"""

    primary: str = "#007bff"
    secondary: str = "#6c757d"
    accent: str = "#fd7e14"
    background: str = "#ffffff"
    surface: str = "#f8f9fa"
    text: str = "#212529"
    text_secondary: str = "#6c757d"
    success: str = "#28a745"
    warning: str = "#ffc107"
    error: str = "#dc3545"
    info: str = "#17a2b8"

    @field_validator("*")
    def validate_hex_color(cls, v):
        if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("Color must be in hex format (#RRGGBB)")
        return v


class TypographyConfig(BaseSchema):
    """Схема для конфигурации типографики"""

    font_families: Dict[str, str] = {
        "primary": "Inter, sans-serif",
        "secondary": "Roboto, sans-serif",
        "monospace": "Fira Code, monospace",
    }
    font_sizes: Dict[str, str] = {
        "base": "14px",
        "small": "12px",
        "large": "16px",
        "h1": "32px",
        "h2": "24px",
        "h3": "20px",
    }


class ComponentStyles(BaseSchema):
    """Схема для стилей UI компонентов"""

    buttons: Dict[str, str] = {"border_radius": "4px", "padding": "8px 16px"}
    cards: Dict[str, str] = {
        "border_radius": "8px",
        "shadow": "0 2px 4px rgba(0,0,0,0.1)",
    }
    inputs: Dict[str, str] = {"border_radius": "4px", "border_color": "#ddd"}


class LayoutConfig(BaseSchema):
    """Схема для конфигурации макета"""

    type: LayoutType = LayoutType.FULL_WIDTH
    sidebar_width: str = "250px"
    header_height: str = "60px"
    animations: Dict[str, Any] = {"enabled": True, "duration": "0.3s"}


class SocialLinks(BaseSchema):
    """Схема для ссылок на социальные сети"""

    website: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    youtube: Optional[str] = None
    github: Optional[str] = None

    @field_validator("*")
    def validate_url(cls, v):
        if v and not v.startswith(("http://", "https://")):
            raise ValueError("URL must start with http:// or https://")
        return v


class ThemePreset(BaseSchema):
    """Схема для предустановленных тем"""

    name: str
    display_name: str
    description: str
    primary_color: str
    secondary_color: str
    accent_color: Optional[str] = None
    background_color: Optional[str] = None
    surface_color: Optional[str] = None
    text_color: Optional[str] = None
    is_dark_theme: bool = False
    preview_image: Optional[str] = None

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Theme name must be at least 2 characters")
        return v.strip()


class BrandingValidation(BaseSchema):
    """Схема для валидации брендинга"""

    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    recommendations: List[str] = []
    color_contrast_score: Optional[float] = None
    accessibility_score: Optional[float] = None


class BrandingTemplate(BaseSchema):
    """Схема для шаблона брендинга"""

    id: int
    name: str
    description: str
    category: str
    preview_image: Optional[str] = None
    is_premium: bool = False
    branding_config: CompanyBrandingCreate

    @field_validator("name")
    def validate_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Template name must be at least 2 characters")
        return v.strip()

    @field_validator("category")
    def validate_category(cls, v):
        allowed_categories = [
            "business",
            "creative",
            "tech",
            "healthcare",
            "education",
            "finance",
            "retail",
            "other",
        ]
        if v not in allowed_categories:
            raise ValueError(
                f"Category must be one of: {', '.join(allowed_categories)}"
            )
        return v


class AssetUpload(BaseSchema):
    """Схема для загрузки ресурсов брендинга"""

    asset_type: str  # logo, favicon, banner, background, watermark
    file_name: str
    file_size: int
    file_type: str
    description: Optional[str] = None

    @field_validator("asset_type")
    def validate_asset_type(cls, v):
        allowed_types = ["logo", "favicon", "banner", "background", "watermark"]
        if v not in allowed_types:
            raise ValueError(f"Asset type must be one of: {', '.join(allowed_types)}")
        return v

    @field_validator("file_type")
    def validate_file_type(cls, v):
        allowed_types = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"]
        if v not in allowed_types:
            raise ValueError(f"File type must be one of: {', '.join(allowed_types)}")
        return v

    @field_validator("file_size")
    def validate_file_size(cls, v):
        # Максимум 5MB
        if v > 5 * 1024 * 1024:
            raise ValueError("File size must be less than 5MB")
        return v


class BrandingExport(BaseSchema):
    """Схема для экспорта брендинга"""

    format: str  # css, json, scss, less
    include_assets: bool = False
    minify: bool = False

    @field_validator("format")
    def validate_format(cls, v):
        allowed_formats = ["css", "json", "scss", "less"]
        if v not in allowed_formats:
            raise ValueError(f"Format must be one of: {', '.join(allowed_formats)}")
        return v


class BrandingImport(BaseSchema):
    """Схема для импорта брендинга"""

    source_format: str  # json, css
    data: str
    override_existing: bool = False

    @field_validator("source_format")
    def validate_source_format(cls, v):
        allowed_formats = ["json", "css"]
        if v not in allowed_formats:
            raise ValueError(
                f"Source format must be one of: {', '.join(allowed_formats)}"
            )
        return v

    @field_validator("data")
    def validate_data(cls, v):
        if not v or len(v.strip()) < 10:
            raise ValueError("Import data must be at least 10 characters")
        return v.strip()
