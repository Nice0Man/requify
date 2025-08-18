"""
Модель профиля пользователя (1-к-1 с User).
Выделена в отдельную модель для лучшей организации данных.
"""

from datetime import UTC, datetime
from typing import TYPE_CHECKING, Optional

from sqlalchemy import Foreig, ForeignKeynKey, Integer, String, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampedMixin

if TYPE_CHECKING:
    from .user import User

class UserProfile(Base, TimestampedMixin):
    """
    Профиль пользователя (1-к-1 с User).

    Содержит расширенную информацию о пользователе:
    - Персональные данные
    - Профессиональную информацию
    - Настройки отображения

    Отделена от User для:
    - Лучшей производительности (User загружается без профиля)
    - Более чистой архитектуры
    - Возможности кэширования
    """

    __tablename__ = "user_profiles"
    __table_args__ = (
        Index("ix_user_profiles_user_id", "user_id", unique=True),
        Index("ix_user_profiles_display_name", "display_name"),
        Index("ix_user_profiles_department", "department"),
        Index("ix_user_profiles_position", "position"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        comment="ID пользователя (1-к-1)",
    )

    #     # Персональная информация
    # 
    first_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Имя"
    )
    last_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Фамилия"
    )
    middle_name: Mapped[Optional[str]] = mapped_column(
        String(100), nullable=True, comment="Отчество"
    )
    display_name: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Отображаемое имя"
    )

    # Контактная информация
    phone: Mapped[Optional[str]] = mapped_column(
        String(20), nullable=True, comment="Телефон"
    )
    phone_verified: Mapped[bool] = mapped_column(
        default=False, nullable=False, comment="Подтвержден ли телефон"
    )

    #     # Профессиональная информация
    # 
    position: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Должность"
    )
    department: Mapped[Optional[str]] = mapped_column(
        String(200), nullable=True, comment="Отдел"
    )
    employee_id: Mapped[Optional[str]] = mapped_column(
        String(50), nullable=True, comment="Табельный номер"
    )
    hire_date: Mapped[Optional[datetime]] = mapped_column(
        nullable=True, comment="Дата найма"
    )

    #     # Дополнительная информация
    # 
    bio: Mapped[Optional[str]] = mapped_column(Text, nullable=True, comment="О себе")
    avatar_url: Mapped[Optional[str]] = mapped_column(
        String(500), nullable=True, comment="URL аватара"
    )

    # Локализация
    timezone: Mapped[str] = mapped_column(
        String(50), nullable=False, default="Europe/Moscow", comment="Часовой пояс"
    )
    language: Mapped[str] = mapped_column(
        String(10), nullable=False, default="ru", comment="Язык интерфейса"
    )

    #     # Метаданные
    # 
    profile_completed: Mapped[bool] = mapped_column(
        default=False, nullable=False, comment="Заполнен ли профиль"
    )
    profile_completion_percentage: Mapped[int] = mapped_column(
        default=0, nullable=False, comment="Процент заполненности профиля"
    )

    #     # Отношения
    # 
    user: Mapped["User"] = relationship(
        "User", back_populates="profile", uselist=False, lazy="select"
    )

    def __repr__(self) -> str:
        return (
            f"<UserProfile(user_id={self.user_id}, display_name='{self.display_name}')>"
        )

    #     # Business Logic Methods
    # 
    @property
    def full_name(self) -> str:
        """Полное имя пользователя"""
        parts = []
        if self.last_name:
            parts.append(self.last_name)
        if self.first_name:
            parts.append(self.first_name)
        if self.middle_name:
            parts.append(self.middle_name)

        if parts:
            return " ".join(parts)
        return self.display_name or "Unknown"

    @property
    def short_name(self) -> str:
        """Краткое имя (Фамилия И.О.)"""
        if not self.last_name:
            return self.display_name or "Unknown"

        parts = [self.last_name]
        if self.first_name:
            parts.append(f"{self.first_name[0]}.")
        if self.middle_name:
            parts.append(f"{self.middle_name[0]}.")

        return " ".join(parts)

    def calculate_completion_percentage(self) -> int:
        """Вычислить процент заполненности профиля"""
        total_fields = 10  # Количество основных полей
        filled_fields = 0

        # Основные поля
        if self.first_name:
            filled_fields += 1
        if self.last_name:
            filled_fields += 1
        if self.display_name:
            filled_fields += 1
        if self.phone:
            filled_fields += 1
        if self.position:
            filled_fields += 1
        if self.department:
            filled_fields += 1
        if self.bio:
            filled_fields += 1
        if self.avatar_url:
            filled_fields += 1
        if self.timezone != "Europe/Moscow":  # Изменен с дефолта
            filled_fields += 1
        if self.language != "ru":  # Изменен с дефолта
            filled_fields += 1

        return int((filled_fields / total_fields) * 100)

    def update_completion_status(self) -> None:
        """Обновить статус заполненности профиля"""
        self.profile_completion_percentage = self.calculate_completion_percentage()
        self.profile_completed = (
            self.profile_completion_percentage >= 70
        )  # 70% считается заполненным

    def get_avatar_or_default(self, size: int = 256) -> str:
        """Получить URL аватара или сгенерировать дефолтный"""
        if self.avatar_url:
            return self.avatar_url

        # Генерируем аватар по имени (например, через Gravatar или подобный сервис)
        name = self.display_name or self.full_name or "User"
        initials = "".join([word[0].upper() for word in name.split()[:2] if word])
        return (
            f"https://ui-avatars.com/api/?name={initials}&size={size}&background=random"
        )
