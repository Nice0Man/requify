import re
from typing import Any
from datetime import UTC, datetime
from sqlalchemy import MetaData, DateTime
from sqlalchemy.orm import DeclarativeBase, declared_attr, Mapped, mapped_column


def camel_to_snake(name: str) -> str:
    """
    Конвертирует CamelCase в snake_case.
    Пример:
        "UserProfile" → "user_profile"
        "HTTPRequest" → "http_request"
    """
    # Добавляем подчеркивание перед заглавными буквами, кроме первого символа
    name = re.sub(r"(?<!^)(?=[A-Z])", "_", name)
    return name.lower()


class Base(DeclarativeBase):
    """
    Базовый класс для всех моделей SQLAlchemy.
    Автоматически генерирует имя таблицы в snake_case на основе имени класса.
    """

    # Настройка метаданных для консистентного именования
    metadata = MetaData(
        naming_convention={
            "ix": "ix_%(column_0_label)s",
            "uq": "uq_%(table_name)s_%(column_0_name)s",
            "ck": "ck_%(table_name)s_%(constraint_name)s",
            "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
            "pk": "pk_%(table_name)s",
        }
    )
    
    id: Any
    __name__: str

    @declared_attr.directive
    def __tablename__(cls) -> str:
        """
        Автоматически генерирует имя таблицы в snake_case на основе имени класса,
        если не определено явно.
        """
        # Если __tablename__ уже определён, используем его
        if hasattr(cls, '__tablename__') and cls.__tablename__ is not None:
            return cls.__tablename__
        
        # Иначе генерируем автоматически
        return camel_to_snake(cls.__name__)

    def __repr__(self) -> str:
        """
        Стандартное представление модели для отладки.
        """
        attrs = []
        for key in self.__mapper__.columns.keys():
            value = getattr(self, key, None)
            if value is not None:
                if isinstance(value, str) and len(value) > 50:
                    value = f"{value[:47]}..."
                attrs.append(f"{key}={value!r}")
        
        return f"{self.__class__.__name__}({', '.join(attrs)})"


class TimestampedMixin:
    """
    Миксин для моделей с полями временных меток.
    Следует принципу DRY для общих полей created_at и updated_at.
    """
    
    created_at: Mapped[datetime] = mapped_column(
        DateTime, 
        default=lambda: datetime.now(UTC).replace(tzinfo=None), 
        nullable=False,
        comment="Время создания записи"
    )
    
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=lambda: datetime.now(UTC).replace(tzinfo=None),
        onupdate=lambda: datetime.now(UTC).replace(tzinfo=None),
        nullable=False,
        comment="Время последнего обновления записи"
    )
