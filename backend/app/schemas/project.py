"""
Схемы для модели Project.
"""

import re
from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class ProjectBase(BaseModel):
    """Базовая схема проекта."""

    code: str = Field(..., min_length=1, max_length=50, description="Кодировка проекта")
    name: str = Field(..., min_length=2, max_length=100, description="Название проекта")
    description: Optional[str] = Field(None, description="Описание проекта")
    status: str = Field(..., min_length=1, max_length=50, description="Статус проекта")

    @field_validator("code")
    def validate_code(cls, v):
        """Валидация кода проекта"""
        if not v or not v.strip():
            raise ValueError("Project code cannot be empty")

        v = v.strip().upper()  # Приводим к верхнему регистру

        # Код проекта должен содержать только буквы, цифры и дефисы
        if not re.match(r"^[A-Z0-9\-_]+$", v):
            raise ValueError(
                "Project code can only contain letters, numbers, hyphens and underscores"
            )

        # Код не должен начинаться или заканчиваться дефисом/подчеркиванием
        if v.startswith(("-", "_")) or v.endswith(("-", "_")):
            raise ValueError(
                "Project code cannot start or end with hyphen or underscore"
            )

        return v

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия проекта"""
        if not v or not v.strip():
            raise ValueError("Project name cannot be empty")

        v = v.strip()

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Project name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания проекта"""
        if v is not None:
            v = v.strip()
            if len(v) > 2000:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 2000 characters")
            return v if v else None
        return v

    @field_validator("status")
    def validate_status(cls, v):
        """Валидация статуса проекта"""
        if not v or not v.strip():
            raise ValueError("Project status cannot be empty")

        v = v.strip().lower()

        # Предопределенные допустимые статусы
        valid_statuses = [
            "active",
            "inactive",
            "archived",
            "planning",
            "development",
            "testing",
            "completed",
            "cancelled",
        ]

        if v not in valid_statuses:
            raise ValueError(
                f"Invalid project status. Must be one of: {valid_statuses}"
            )

        return v


class ProjectCreate(ProjectBase):
    """Схема для создания проекта."""

    # owner_id will be set automatically by the API endpoint
    # from the current user, so it's not required in the request body

    @model_validator(mode="before")
    @classmethod
    def validate_project_creation(cls, data):
        """Дополнительная валидация при создании проекта"""
        if isinstance(data, dict):
            code = data.get("code")
            name = data.get("name")

            # Проверяем уникальность кода и названия (базовая проверка)
            if code and name and code.upper() in name.upper():
                # Предупреждение, если код содержится в названии (возможная ошибка)
                pass  # В реальной системе можно добавить логику проверки уникальности

        return data


class ProjectUpdate(BaseModel):
    """Схема для обновления проекта."""

    code: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Кодировка проекта"
    )
    name: Optional[str] = Field(
        None, min_length=2, max_length=100, description="Название проекта"
    )
    description: Optional[str] = Field(None, description="Описание проекта")
    status: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Статус проекта"
    )

    @field_validator("code")
    def validate_code(cls, v):
        """Валидация кода проекта при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Project code cannot be empty")

            v = v.strip().upper()

            if not re.match(r"^[A-Z0-9\-_]+$", v):
                raise ValueError(
                    "Project code can only contain letters, numbers, hyphens and underscores"
                )

            if v.startswith(("-", "_")) or v.endswith(("-", "_")):
                raise ValueError(
                    "Project code cannot start or end with hyphen or underscore"
                )

            return v
        return v

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия проекта при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Project name cannot be empty")

            v = v.strip()

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Project name contains forbidden characters: {forbidden_chars}"
                )

            return v
        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания проекта при обновлении"""
        if v is not None:
            v = v.strip()
            if len(v) > 2000:
                raise ValueError("Description cannot exceed 2000 characters")
            return v if v else None
        return v

    @field_validator("status")
    def validate_status(cls, v):
        """Валидация статуса проекта при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Project status cannot be empty")

            v = v.strip().lower()

            valid_statuses = [
                "active",
                "inactive",
                "archived",
                "planning",
                "development",
                "testing",
                "completed",
                "cancelled",
            ]

            if v not in valid_statuses:
                raise ValueError(
                    f"Invalid project status. Must be one of: {valid_statuses}"
                )

            return v
        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data):
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class ProjectInDBBase(ProjectBase):
    """Базовая схема проекта с данными из БД."""

    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


class Project(ProjectInDBBase):
    """Схема проекта для ответов API."""

    pass


class ProjectWithStats(Project):
    """Схема проекта с дополнительной статистикой."""

    total_requirements: int = 0
    requirements_completed: int = 0
    active_releases: int = 0
    specs_count: int = 0
    requirement_groups_count: int = 0

    @field_validator(
        "total_requirements",
        "requirements_completed",
        "active_releases",
        "specs_count",
        "requirement_groups_count",
    )
    def validate_counts(cls, v):
        """Валидация счетчиков статистики"""
        if v < 0:
            raise ValueError("Statistical counts cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_requirements_completed(self):
        """Проверка, что количество завершенных требований не превышает общее количество"""
        if self.requirements_completed > self.total_requirements:
            raise ValueError("Completed requirements cannot exceed total requirements")
        return self

    @property
    def completion_percentage(self) -> float:
        """Вычисляет процент завершения проекта"""
        if self.total_requirements == 0:
            return 0.0
        return round((self.requirements_completed / self.total_requirements) * 100, 2)

    @property
    def is_completed(self) -> bool:
        """Проверяет, завершен ли проект"""
        return (
            self.status == "completed"
            and self.total_requirements > 0
            and self.requirements_completed == self.total_requirements
        )


class ProjectInDB(ProjectInDBBase):
    """Схема проекта в БД."""

    pass
