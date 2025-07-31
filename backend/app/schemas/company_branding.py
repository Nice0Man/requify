"""
Схемы для модели CompanyBranding.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, field_validator, HttpUrl
from datetime import datetime
from enum import Enum
import re


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


class CompanyBrandingBase(BaseModel):
    """Базовая схема для брендинга компании"""

    # Логотип и изображения
    logo_url: Optional[str] = None
    logo_dark_url: Optional[str] = None
    logo_light_url: Optional[str] = None
    favicon_url: Optional[str] = None

    # Дополнительные изображения
    banner_url: Optional[str] = None
    background_url: Optional[str] = None
    watermark_url: Optional[str] = None

    # Основные цвета
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None

    # Нейтральные цвета
    background_color: Optional[str] = None
    surface_color: Optional[str] = None
    text_color: Optional[str] = None
    text_secondary_color: Optional[str] = None

    # Статусные цвета
    success_color: Optional[str] = "#28a745"
    warning_color: Optional[str] = "#ffc107"
    error_color: Optional[str] = "#dc3545"
    info_color: Optional[str] = "#17a2b8"

    # Шрифты
    primary_font_family: Optional[str] = "Inter, sans-serif"
    secondary_font_family: Optional[str] = "Roboto, sans-serif"
    monospace_font_family: Optional[str] = "Fira Code, monospace"

    # Размеры шрифтов
    font_size_base: Optional[str] = "14px"
    font_size_small: Optional[str] = "12px"
    font_size_large: Optional[str] = "16px"

    # Заголовки
    h1_font_size: Optional[str] = "32px"
    h2_font_size: Optional[str] = "24px"
    h3_font_size: Optional[str] = "20px"

    # UI компоненты - кнопки
    button_border_radius: Optional[str] = "4px"
    button_padding: Optional[str] = "8px 16px"

    # UI компоненты - карточки
    card_border_radius: Optional[str] = "8px"
    card_shadow: Optional[str] = "0 2px 4px rgba(0,0,0,0.1)"

    # UI компоненты - поля ввода
    input_border_radius: Optional[str] = "4px"
    input_border_color: Optional[str] = "#ddd"

    # Тема и стиль
    theme_name: ThemeName = ThemeName.DEFAULT
    is_dark_theme: bool = False

    # Кастомные стили
    custom_css: Optional[str] = None
    custom_js: Optional[str] = None

    # Макет
    layout_type: LayoutType = LayoutType.FULL_WIDTH
    sidebar_width: Optional[str] = "250px"
    header_height: Optional[str] = "60px"

    # Анимации
    enable_animations: bool = True
    animation_duration: Optional[str] = "0.3s"

    # Брендинг компании
    company_slogan: Optional[str] = None
    brand_description: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None

    # White Label настройки
    product_name: Optional[str] = None
    login_page_title: Optional[str] = None
    dashboard_title: Optional[str] = None
    hide_powered_by: bool = False
    hide_help_links: bool = False

    # Статус и метаданные
    is_active: bool = True
    is_default: bool = False
    version: str = "1.0"
    advanced_settings: Optional[Dict[str, Any]] = None

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


class CompanyBrandingCreate(CompanyBrandingBase):
    """Схема для создания брендинга компании"""

    pass


class CompanyBrandingUpdate(BaseModel):
    """Схема для обновления брендинга компании"""

    # Все поля опциональны для обновления
    logo_url: Optional[str] = None
    logo_dark_url: Optional[str] = None
    logo_light_url: Optional[str] = None
    favicon_url: Optional[str] = None

    banner_url: Optional[str] = None
    background_url: Optional[str] = None
    watermark_url: Optional[str] = None

    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    accent_color: Optional[str] = None

    background_color: Optional[str] = None
    surface_color: Optional[str] = None
    text_color: Optional[str] = None
    text_secondary_color: Optional[str] = None

    success_color: Optional[str] = None
    warning_color: Optional[str] = None
    error_color: Optional[str] = None
    info_color: Optional[str] = None

    primary_font_family: Optional[str] = None
    secondary_font_family: Optional[str] = None
    monospace_font_family: Optional[str] = None

    font_size_base: Optional[str] = None
    font_size_small: Optional[str] = None
    font_size_large: Optional[str] = None

    h1_font_size: Optional[str] = None
    h2_font_size: Optional[str] = None
    h3_font_size: Optional[str] = None

    button_border_radius: Optional[str] = None
    button_padding: Optional[str] = None

    card_border_radius: Optional[str] = None
    card_shadow: Optional[str] = None

    input_border_radius: Optional[str] = None
    input_border_color: Optional[str] = None

    theme_name: Optional[ThemeName] = None
    is_dark_theme: Optional[bool] = None

    custom_css: Optional[str] = None
    custom_js: Optional[str] = None

    layout_type: Optional[LayoutType] = None
    sidebar_width: Optional[str] = None
    header_height: Optional[str] = None

    enable_animations: Optional[bool] = None
    animation_duration: Optional[str] = None

    company_slogan: Optional[str] = None
    brand_description: Optional[str] = None
    social_links: Optional[Dict[str, Any]] = None

    product_name: Optional[str] = None
    login_page_title: Optional[str] = None
    dashboard_title: Optional[str] = None
    hide_powered_by: Optional[bool] = None
    hide_help_links: Optional[bool] = None

    is_active: Optional[bool] = None
    is_default: Optional[bool] = None
    version: Optional[str] = None
    advanced_settings: Optional[Dict[str, Any]] = None


class CompanyBrandingInDB(CompanyBrandingBase):
    """Схема для данных из базы данных"""

    id: int
    company_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CompanyBrandingResponse(CompanyBrandingInDB):
    """Схема для ответа API"""

    # Добавляем вычисляемые поля
    color_palette: Optional[Dict[str, str]] = None
    typography_config: Optional[Dict[str, Any]] = None
    component_styles: Optional[Dict[str, Any]] = None
    layout_config: Optional[Dict[str, Any]] = None
    css_variables: Optional[str] = None


class CompanyBrandingProfile(BaseModel):
    """Схема для профиля брендинга (упрощенная)"""

    logo_url: Optional[str]
    primary_color: Optional[str]
    secondary_color: Optional[str]
    theme_name: ThemeName
    is_dark_theme: bool
    company_slogan: Optional[str]
    product_name: Optional[str]
    is_active: bool


class ColorPalette(BaseModel):
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


class TypographyConfig(BaseModel):
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


class ComponentStyles(BaseModel):
    """Схема для стилей UI компонентов"""

    buttons: Dict[str, str] = {"border_radius": "4px", "padding": "8px 16px"}
    cards: Dict[str, str] = {
        "border_radius": "8px",
        "shadow": "0 2px 4px rgba(0,0,0,0.1)",
    }
    inputs: Dict[str, str] = {"border_radius": "4px", "border_color": "#ddd"}


class LayoutConfig(BaseModel):
    """Схема для конфигурации макета"""

    type: LayoutType = LayoutType.FULL_WIDTH
    sidebar_width: str = "250px"
    header_height: str = "60px"
    animations: Dict[str, Any] = {"enabled": True, "duration": "0.3s"}


class SocialLinks(BaseModel):
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


class ThemePreset(BaseModel):
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


class BrandingValidation(BaseModel):
    """Схема для валидации брендинга"""

    is_valid: bool
    errors: List[str] = []
    warnings: List[str] = []
    recommendations: List[str] = []
    color_contrast_score: Optional[float] = None
    accessibility_score: Optional[float] = None


class BrandingTemplate(BaseModel):
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


class AssetUpload(BaseModel):
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


class BrandingExport(BaseModel):
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


class BrandingImport(BaseModel):
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
