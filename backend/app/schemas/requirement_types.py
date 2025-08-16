"""
Схемы для модели RequirementType (типы требований).
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class RequirementTypeBase(BaseModel):
    """Базовая схема типа требования."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название типа требования"
    )
    description: Optional[str] = Field(None, description="Описание типа требования")

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия типа требования"""
        if not v or not v.strip():
            raise ValueError("Requirement type name cannot be empty")

        v = v.strip()

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Requirement type name contains forbidden characters: {forbidden_chars}"
            )

        # Предопределенные типы требований
        reserved_names = [
            "function",
            "nonfunctional",
            "business",
            "technical",
            "legal",
            "performance",
            "security",
            "usability",
        ]

        # Проверяем, что название соответствует одному из стандартных типов
        if v.lower() not in reserved_names:
            # Можно либо добавить в список, либо предупредить
            # В данном случае разрешаем любые названия, но логируем
            pass

        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания типа требования"""
        if v is not None:
            v = v.strip()
            if len(v) > 500:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 500 characters")
            return v if v else None
        return v


class RequirementTypeCreate(RequirementTypeBase):
    """Схема для создания типа требования."""

    pass


class RequirementTypeUpdate(BaseModel):
    """Схема для обновления типа требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название типа требования"
    )
    description: Optional[str] = Field(None, description="Описание типа требования")

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Requirement type name cannot be empty")

            v = v.strip()

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Requirement type name contains forbidden characters: {forbidden_chars}"
                )

            return v
        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания при обновлении"""
        if v is not None:
            v = v.strip()
            if len(v) > 500:
                raise ValueError("Description cannot exceed 500 characters")
            return v if v else None
        return v


class RequirementTypeInDBBase(RequirementTypeBase):
    """Базовая схема типа требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementType(RequirementTypeInDBBase):
    """Схема типа требования для ответов API."""

    pass


class RequirementTypeInDB(RequirementTypeInDBBase):
    """Схема типа требования в БД."""

    pass
