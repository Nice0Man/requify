"""
Схемы для модели RequirementStatus (статусы требований).
"""

from typing import Optional
from pydantic import BaseModel, Field, field_validator


class RequirementStatusBase(BaseModel):
    """Базовая схема статуса требования."""

    name: str = Field(
        ..., min_length=1, max_length=100, description="Название статуса требования"
    )
    description: Optional[str] = Field(None, description="Описание статуса требования")

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия статуса требования"""
        if not v or not v.strip():
            raise ValueError("Requirement status name cannot be empty")

        # Allow any reasonable status name (remove strict validation)
        v = v.strip()

        # Basic validation for security
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "script"]
        if any(char in v.lower() for char in forbidden_chars):
            raise ValueError("Status name contains forbidden characters")

        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания статуса требования"""
        if v is not None:
            v = v.strip()
            if len(v) > 500:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 500 characters")
            return v if v else None
        return v


class RequirementStatusCreate(RequirementStatusBase):
    """Схема для создания статуса требования."""

    pass


class RequirementStatusUpdate(BaseModel):
    """Схема для обновления статуса требования."""

    name: Optional[str] = Field(
        None, min_length=1, max_length=100, description="Название статуса требования"
    )
    description: Optional[str] = Field(None, description="Описание статуса требования")

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Requirement status name cannot be empty")

            # Allow any reasonable status name (remove strict validation)
            v = v.strip()

            # Basic validation for security
            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "script"]
            if any(char in v.lower() for char in forbidden_chars):
                raise ValueError("Status name contains forbidden characters")

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


class RequirementStatusInDBBase(RequirementStatusBase):
    """Базовая схема статуса требования с данными из БД."""

    id: int

    class Config:
        from_attributes = True


class RequirementStatus(RequirementStatusInDBBase):
    """Схема статуса требования для ответов API."""

    pass


class RequirementStatusInDB(RequirementStatusInDBBase):
    """Схема статуса требования в БД."""

    pass
