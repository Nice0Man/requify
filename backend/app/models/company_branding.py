"""
Модель брендинга компании (4NF декомпозиция).
Содержит всю информацию о визуальной идентичности, вынесенную из основной модели Company.
"""

from typing import TYPE_CHECKING, Optional

from sqlalchemy import String, Boolean, Integer, Index, ForeignKey, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company

class CompanyBranding(Base, TimestampedMixin):
    """
    Брендинг и визуальная идентичность компании.

    Вынесены из Company согласно 4NF для устранения многозначных зависимостей.
    Содержит все настройки, связанные с внешним видом и брендингом.
    """

    __tablename__ = "company_branding"
    __table_args__ = (
        Index("ix_company_branding_company_id", "company_id"),
        Index("ix_company_branding_is_active", "is_active"),
        Index("ix_company_branding_theme_name", "theme_name"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    #     # Логотип и изображения
    # 
    logo_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL основного логотипа"
    )
    logo_dark_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL логотипа для темной темы"
    )
    logo_light_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL логотипа для светлой темы"
    )
    favicon_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL favicon"
    )

    # Дополнительные изображения
    banner_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL баннера компании"
    )
    background_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL фонового изображения"
    )
    watermark_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL водяного знака"
    )

    #     # Цветовая схема
    # 
    # Основные цвета
    primary_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Основной цвет (hex, например #007bff)"
    )
    secondary_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Дополнительный цвет (hex)"
    )
    accent_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Акцентный цвет (hex)"
    )

    # Нейтральные цвета
    background_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Цвет фона (hex)"
    )
    surface_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Цвет поверхности (hex)"
    )
    text_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Основной цвет текста (hex)"
    )
    text_secondary_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, comment="Дополнительный цвет текста (hex)"
    )

    # Статусные цвета
    success_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, default="#28a745", comment="Цвет успеха (hex)"
    )
    warning_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, default="#ffc107", comment="Цвет предупреждения (hex)"
    )
    error_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, default="#dc3545", comment="Цвет ошибки (hex)"
    )
    info_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, default="#17a2b8", comment="Информационный цвет (hex)"
    )

    #     # Типографика
    # 
    # Шрифты
    primary_font_family: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        default="Inter, sans-serif",
        comment="Основное семейство шрифтов",
    )
    secondary_font_family: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        default="Roboto, sans-serif",
        comment="Дополнительное семейство шрифтов",
    )
    monospace_font_family: Mapped[Optional[str]] = mapped_column(
        String(200),
        nullable=True,
        default="Fira Code, monospace",
        comment="Моноширинный шрифт",
    )

    # Размеры шрифтов
    font_size_base: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="14px", comment="Базовый размер шрифта"
    )
    font_size_small: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="12px", comment="Малый размер шрифта"
    )
    font_size_large: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="16px", comment="Большой размер шрифта"
    )

    # Заголовки
    h1_font_size: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="32px", comment="Размер шрифта H1"
    )
    h2_font_size: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="24px", comment="Размер шрифта H2"
    )
    h3_font_size: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="20px", comment="Размер шрифта H3"
    )

    #     # UI компоненты
    # 
    # Кнопки
    button_border_radius: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="4px", comment="Радиус границ кнопок"
    )
    button_padding: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, default="8px 16px", comment="Отступы кнопок"
    )

    # Карточки и панели
    card_border_radius: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="8px", comment="Радиус границ карточек"
    )
    card_shadow: Mapped[Optional[str]] = mapped_column(
        String(50),
        nullable=True,
        default="0 2px 4px rgba(0,0,0,0.1)",
        comment="Тень карточек",
    )

    # Поля ввода
    input_border_radius: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="4px", comment="Радиус границ полей ввода"
    )
    input_border_color: Mapped[Optional[str]] = mapped_column(
        String(7), nullable=True, default="#ddd", comment="Цвет границ полей ввода"
    )

    #     # Тема и стиль
    # 
    theme_name: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="default",
        comment="Название темы (default, dark, light, custom)",
    )
    is_dark_theme: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Темная ли тема"
    )

    # Кастомные CSS стили
    custom_css: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Кастомные CSS стили"
    )
    custom_js: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Кастомный JavaScript код"
    )

    #     # Настройки отображения
    # 
    # Макет
    layout_type: Mapped[str] = mapped_column(
        String(20),
        nullable=False,
        default="full_width",
        comment="Тип макета (full_width, boxed, fluid)",
    )
    sidebar_width: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="250px", comment="Ширина сайдбара"
    )
    header_height: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="60px", comment="Высота заголовка"
    )

    # Анимации
    enable_animations: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Включить анимации"
    )
    animation_duration: Mapped[Optional[str]] = mapped_column(
        String(10), nullable=True, default="0.3s", comment="Длительность анимаций"
    )

    #     # Брендинг компании
    # 
    # Слоган и описание
    company_slogan: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Слоган компании"
    )
    brand_description: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Описание бренда"
    )

    # Социальные сети
    social_links: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Ссылки на социальные сети (JSON)"
    )

    #     # White Label настройки
    # 
    # Кастомизация названий
    product_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Кастомное название продукта"
    )
    login_page_title: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Заголовок страницы входа"
    )
    dashboard_title: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Заголовок дашборда"
    )

    # Скрытие брендинга
    hide_powered_by: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Скрыть 'Powered by'"
    )
    hide_help_links: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Скрыть ссылки на помощь"
    )

    #     # Статус и метаданные
    # 
    is_active: Mapped[bool] = mapped_column(
        Boolean, default=True, nullable=False, comment="Активна ли схема брендинга"
    )
    is_default: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Схема по умолчанию"
    )
    version: Mapped[str] = mapped_column(
        String(10), nullable=False, default="1.0", comment="Версия схемы брендинга"
    )

    # Дополнительные настройки
    advanced_settings: Mapped[Optional[dict]] = mapped_column(
        JSON, nullable=True, comment="Дополнительные настройки брендинга (JSON)"
    )

    #     # Отношения
    # 
    company: Mapped["Company"] = relationship(
        "Company", back_populates="branding", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<CompanyBranding(id={self.id}, company_id={self.company_id}, theme='{self.theme_name}')>"

    #     # Business Logic Methods
    # 
    def get_color_palette(self) -> dict:
        """Получить полную цветовую палитру"""
        return {
            "primary": self.primary_color or "#007bff",
            "secondary": self.secondary_color or "#6c757d",
            "accent": self.accent_color or "#fd7e14",
            "background": self.background_color or "#ffffff",
            "surface": self.surface_color or "#f8f9fa",
            "text": self.text_color or "#212529",
            "text_secondary": self.text_secondary_color or "#6c757d",
            "success": self.success_color or "#28a745",
            "warning": self.warning_color or "#ffc107",
            "error": self.error_color or "#dc3545",
            "info": self.info_color or "#17a2b8",
        }

    def get_typography_config(self) -> dict:
        """Получить конфигурацию типографики"""
        return {
            "font_families": {
                "primary": self.primary_font_family or "Inter, sans-serif",
                "secondary": self.secondary_font_family or "Roboto, sans-serif",
                "monospace": self.monospace_font_family or "Fira Code, monospace",
            },
            "font_sizes": {
                "base": self.font_size_base or "14px",
                "small": self.font_size_small or "12px",
                "large": self.font_size_large or "16px",
                "h1": self.h1_font_size or "32px",
                "h2": self.h2_font_size or "24px",
                "h3": self.h3_font_size or "20px",
            },
        }

    def get_component_styles(self) -> dict:
        """Получить стили UI компонентов"""
        return {
            "buttons": {
                "border_radius": self.button_border_radius or "4px",
                "padding": self.button_padding or "8px 16px",
            },
            "cards": {
                "border_radius": self.card_border_radius or "8px",
                "shadow": self.card_shadow or "0 2px 4px rgba(0,0,0,0.1)",
            },
            "inputs": {
                "border_radius": self.input_border_radius or "4px",
                "border_color": self.input_border_color or "#ddd",
            },
        }

    def get_layout_config(self) -> dict:
        """Получить конфигурацию макета"""
        return {
            "type": self.layout_type or "full_width",
            "sidebar_width": self.sidebar_width or "250px",
            "header_height": self.header_height or "60px",
            "animations": {
                "enabled": self.enable_animations,
                "duration": self.animation_duration or "0.3s",
            },
        }

    def get_social_links(self) -> dict:
        """Получить ссылки на социальные сети"""
        default_links = {
            "website": None,
            "linkedin": None,
            "twitter": None,
            "facebook": None,
            "instagram": None,
            "youtube": None,
            "github": None,
        }

        if self.social_links:
            default_links.update(self.social_links)

        return default_links

    def generate_css_variables(self) -> str:
        """Сгенерировать CSS переменные для темы"""
        colors = self.get_color_palette()
        typography = self.get_typography_config()
        components = self.get_component_styles()

        css_vars = [":root {"]

        # Цвета
        for name, color in colors.items():
            css_vars.append(f"  --color-{name.replace('_', '-')}: {color};")

        # Шрифты
        for category, fonts in typography["font_families"].items():
            css_vars.append(f"  --font-{category}: {fonts};")

        for size_name, size in typography["font_sizes"].items():
            css_vars.append(f"  --font-size-{size_name.replace('_', '-')}: {size};")

        # Компоненты
        for component, styles in components.items():
            for style_name, value in styles.items():
                css_vars.append(
                    f"  --{component}-{style_name.replace('_', '-')}: {value};"
                )

        css_vars.append("}")

        return "\n".join(css_vars)

    def get_logo_for_theme(self, is_dark_context: bool = False) -> Optional[str]:
        """Получить подходящий логотип для контекста"""
        if is_dark_context and self.logo_dark_url:
            return self.logo_dark_url
        elif not is_dark_context and self.logo_light_url:
            return self.logo_light_url
        else:
            return self.logo_url

    def validate_colors(self) -> list:
        """Валидация цветов (проверка hex формата)"""
        color_fields = [
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
        ]

        errors = []
        hex_pattern = r"^#[0-9A-Fa-f]{6}$"

        import re

        for field in color_fields:
            value = getattr(self, field)
            if value and not re.match(hex_pattern, value):
                errors.append(f"Invalid hex color format for {field}: {value}")

        return errors

    def apply_preset_theme(self, preset: str) -> None:
        """Применить предустановленную тему"""
        presets = {
            "default": {
                "primary_color": "#007bff",
                "secondary_color": "#6c757d",
                "theme_name": "default",
                "is_dark_theme": False,
            },
            "dark": {
                "primary_color": "#375a7f",
                "secondary_color": "#495057",
                "background_color": "#212529",
                "surface_color": "#343a40",
                "text_color": "#ffffff",
                "theme_name": "dark",
                "is_dark_theme": True,
            },
            "corporate": {
                "primary_color": "#2c3e50",
                "secondary_color": "#34495e",
                "accent_color": "#3498db",
                "theme_name": "corporate",
                "is_dark_theme": False,
            },
            "modern": {
                "primary_color": "#6f42c1",
                "secondary_color": "#e83e8c",
                "accent_color": "#fd7e14",
                "theme_name": "modern",
                "is_dark_theme": False,
            },
        }

        if preset in presets:
            preset_config = presets[preset]
            for key, value in preset_config.items():
                setattr(self, key, value)

    def clone_from_template(self, template_id: int) -> None:
        """Клонировать настройки из шаблона"""
        # Логика клонирования из другой схемы брендинга
        # В реальной реализации здесь была бы загрузка из БД
        pass
