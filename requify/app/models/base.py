import re
from typing import Any
from sqlalchemy.orm import DeclarativeBase, declared_attr


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

    id: Any
    __name__: str

    @declared_attr.directive  # Важно для SQLAlchemy 2.0+
    def __tablename__(cls) -> str:
        return camel_to_snake(cls.__name__)
