"""
Модель контактной информации компании (4NF декомпозиция).
Содержит все контактные данные, вынесенные из основной модели Company.
"""

from typing import TYPE_CHECKING, Optional, List

from sqlalchemy import String, Text, Boolean, Integer, Index, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .company import Company

class CompanyContact(Base, TimestampedMixin):
    """
    Контактная информация компании.

    Вынесена из Company согласно 4NF для устранения многозначных зависимостей.
    Компания может иметь несколько контактных данных (офисы, филиалы).
    """

    __tablename__ = "company_contacts"
    __table_args__ = (
        Index("ix_company_contacts_company_id", "company_id"),
        Index("ix_company_contacts_is_primary", "is_primary"),
        Index("ix_company_contacts_contact_type", "contact_type"),
        Index("ix_company_contacts_country_city", "country", "city"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id", ondelete="CASCADE"),
        nullable=False,
        comment="ID компании",
    )

    #     # Типизация контакта
    # 
    contact_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="main",
        comment="Тип контакта (main, branch, billing, support, legal)",
    )
    is_primary: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False, comment="Основной контакт компании"
    )
    label: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
        comment="Название контакта (Головной офис, Филиал в Москве и т.д.)",
    )

    #     # Email контакты
    # 
    email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Основной email"
    )
    support_email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Email поддержки"
    )
    billing_email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Email для счетов"
    )
    sales_email: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Email отдела продаж"
    )

    #     # Телефонные контакты
    # 
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Основной телефон"
    )
    mobile: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Мобильный телефон"
    )
    fax: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Факс"
    )
    support_phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Телефон поддержки"
    )

    #     # Физический адрес
    # 
    # Страна и регион
    country: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Страна"
    )
    region: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Регион/область"
    )
    city: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Город"
    )

    # Детальный адрес
    street_address: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Адрес (улица, дом, офис)"
    )
    postal_code: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Почтовый индекс"
    )

    # Дополнительная информация
    building: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Здание/корпус"
    )
    floor: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Этаж"
    )
    office: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Офис/кабинет"
    )

    #     # Онлайн присутствие
    # 
    website: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="Основной веб-сайт"
    )
    social_media: Mapped[Optional[str]] = mapped_column(
        Text, nullable=True, comment="Социальные сети (JSON)"
    )

    #     # Часовой пояс и рабочее время
    # 
    timezone: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="Europe/Moscow",
        comment="Часовой пояс офиса",
    )
    working_hours: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Рабочие часы (пн-пт 9:00-18:00)"
    )

    #     # Отношения
    # 
    company: Mapped["Company"] = relationship(
        "Company", back_populates="contacts", lazy="select"
    )

    def __repr__(self) -> str:
        return f"<CompanyContact(id={self.id}, company_id={self.company_id}, type='{self.contact_type}')>"

    #     # Business Logic Methods
    # 
    @property
    def full_address(self) -> str:
        """Полный адрес в одну строку"""
        parts = []

        if self.street_address:
            parts.append(self.street_address)
        if self.city:
            parts.append(self.city)
        if self.region:
            parts.append(self.region)
        if self.country:
            parts.append(self.country)
        if self.postal_code:
            parts.append(self.postal_code)

        return ", ".join(parts) if parts else ""

    @property
    def location_string(self) -> str:
        """Строка местоположения (город, страна)"""
        parts = []
        if self.city:
            parts.append(self.city)
        if self.country:
            parts.append(self.country)
        return ", ".join(parts) if parts else ""

    @property
    def office_location(self) -> str:
        """Детальное расположение офиса"""
        parts = []
        if self.building:
            parts.append(f"Здание {self.building}")
        if self.floor:
            parts.append(f"Этаж {self.floor}")
        if self.office:
            parts.append(f"Офис {self.office}")
        return ", ".join(parts) if parts else ""

    def get_primary_email(self) -> Optional[str]:
        """Получить основной email"""
        return self.email or self.support_email or self.billing_email

    def get_primary_phone(self) -> Optional[str]:
        """Получить основной телефон"""
        return self.phone or self.mobile or self.support_phone

    def has_complete_address(self) -> bool:
        """Проверить, заполнен ли полный адрес"""
        required_fields = [self.street_address, self.city, self.country]
        return all(field for field in required_fields)

    def set_as_primary(self) -> None:
        """Установить как основной контакт"""
        self.is_primary = True
        self.contact_type = "main"

    def get_contact_summary(self) -> dict:
        """Получить краткую сводку контактов"""
        return {
            "email": self.get_primary_email(),
            "phone": self.get_primary_phone(),
            "location": self.location_string,
            "website": self.website,
            "timezone": self.timezone,
            "working_hours": self.working_hours,
        }
