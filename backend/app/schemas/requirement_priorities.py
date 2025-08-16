"""
Схемы для модели RequirementPriority (приоритеты требований).
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class RequirementPriorityBase(BaseModel):
    """Базовая схема приоритета требования."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название приоритета требования"
    )
    description: Optional[str] = Field(
        None, description="Описание приоритета требования"
    )
    level: Optional[int] = Field(
        None,
        ge=1,
        le=10,
        description="Уровень приоритета (1-10, где 1 - самый высокий)",
    )

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия приоритета требования"""
        if not v or not v.strip():
            raise ValueError("Requirement priority name cannot be empty")

        # Allow any reasonable priority name (remove strict validation)
        v = v.strip()

        # Basic validation for security
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "script"]
        if any(char in v.lower() for char in forbidden_chars):
            raise ValueError("Priority name contains forbidden characters")

        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания приоритета требования"""
        if v is not None:
            v = v.strip()
            if len(v) > 500:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 500 characters")
            return v if v else None
        return v

    @model_validator(mode="after")
    def validate_level(self):
        """Валидация уровня приоритета в соответствии с названием"""
        # Skip validation if level is not provided
        if self.level is None:
            return self

        name = self.name.lower()

        # Соответствие названий и уровней приоритета
        priority_levels = {
            "critical": [1, 2],
            "high": [3, 4],
            "medium": [5, 6],
            "low": [7, 8],
            "minimal": [9, 10],
        }

        if name in priority_levels:
            if self.level not in priority_levels[name]:
                expected_levels = priority_levels[name]
                raise ValueError(
                    f'Priority level {self.level} does not match priority name "{name}". Expected levels: {expected_levels}'
                )

        return self


class RequirementPriorityCreate(RequirementPriorityBase):
    """Схема для создания приоритета требования."""

    pass


class RequirementPriorityUpdate(BaseModel):
    """Схема для обновления приоритета требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название приоритета требования"
    )
    description: Optional[str] = Field(
        None, description="Описание приоритета требования"
    )
    level: Optional[int] = Field(
        None, ge=1, le=10, description="Уровень приоритета (1-10)"
    )

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Requirement priority name cannot be empty")

            # Allow any reasonable priority name (remove strict validation)
            v = v.strip()

            # Basic validation for security
            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "script"]
            if any(char in v.lower() for char in forbidden_chars):
                raise ValueError("Priority name contains forbidden characters")

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


class RequirementPriorityInDBBase(RequirementPriorityBase):
    """Базовая схема приоритета требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementPriority(RequirementPriorityInDBBase):
    """Схема приоритета требования для ответов API."""

    pass


class RequirementPriorityInDB(RequirementPriorityInDBBase):
    """Схема приоритета требования в БД."""

    pass
