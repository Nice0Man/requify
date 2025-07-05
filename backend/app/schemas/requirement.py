"""
Схемы для модели Requirement.
"""

from datetime import datetime, UTC
from typing import Optional

from pydantic import BaseModel, Field, field_validator, model_validator

# Удаляем импорт enum'ов, так как теперь используем ID


class RequirementBase(BaseModel):
    """Базовая схема требования."""

    title: str = Field(
        ..., min_length=3, max_length=200, description="Заголовок требования"
    )
    description: Optional[str] = Field(None, description="Описание требования")
    deadline: Optional[datetime] = None
    progress: float = Field(
        default=0.0, 
        ge=0.0, 
        le=100.0, 
        description="Прогресс выполнения требования (0.0-100.0)"
    )

    @field_validator("title")
    def validate_title(cls, v):
        """Валидация заголовка требования"""
        if not v or not v.strip():
            raise ValueError("Title cannot be empty or contain only whitespace")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(f"Title contains forbidden characters: {forbidden_chars}")

        return v.strip()

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания требования"""
        if v is not None:
            v = v.strip()
            if len(v) > 5000:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 5000 characters")
            # Возвращаем None для пустых строк
            return v if v else None
        return v

    @field_validator("deadline")
    def validate_deadline(cls, v):
        """Валидация дедлайна"""
        if v is not None:
            # Если дата naive (без timezone), считаем её UTC
            if v.tzinfo is None:
                v = v.replace(tzinfo=UTC)
            
            # Получаем текущее время в UTC
            now_utc = datetime.now(UTC)
            
            # Дедлайн не может быть в прошлом
            if v < now_utc:
                raise ValueError("Deadline cannot be in the past")

            # Дедлайн не может быть слишком далеко в будущем (например, больше 10 лет)
            max_future = now_utc.replace(year=now_utc.year + 10)
            if v > max_future:
                raise ValueError("Deadline cannot be more than 10 years in the future")

        return v

    @field_validator("progress")
    def validate_progress(cls, v):
        """Валидация прогресса"""
        if v < 0.0:
            raise ValueError("Progress cannot be negative")
        if v > 100.0:
            raise ValueError("Progress cannot exceed 100%")
        return round(v, 2)  # Округляем до 2 знаков после запятой


class RequirementCreate(RequirementBase):
    """Схема для создания требования."""

    type_id: int = Field(..., gt=0, description="ID типа требования")
    priority_id: int = Field(..., gt=0, description="ID приоритета требования")
    status_id: int = Field(..., gt=0, description="ID статуса требования")
    project_id: int = Field(..., gt=0, description="ID проекта")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")

    @field_validator("type_id", "priority_id", "status_id", "project_id")
    def validate_required_ids(cls, v):
        """Валидация обязательных ID"""
        if v <= 0:
            raise ValueError("ID must be a positive integer")
        return v

    @field_validator("release_id", "spec_id")
    def validate_optional_ids(cls, v):
        """Валидация опциональных ID"""
        if v is not None and v <= 0:
            raise ValueError("ID must be a positive integer when provided")
        return v


class RequirementUpdate(BaseModel):
    """Схема для обновления требования."""

    title: Optional[str] = Field(
        None, min_length=3, max_length=200, description="Заголовок требования"
    )
    description: Optional[str] = Field(None, description="Описание требования")
    progress: Optional[float] = Field(
        None, 
        ge=0.0, 
        le=100.0, 
        description="Прогресс выполнения требования (0.0-100.0)"
    )
    type_id: Optional[int] = Field(None, gt=0, description="ID типа требования")
    priority_id: Optional[int] = Field(
        None, gt=0, description="ID приоритета требования"
    )
    status_id: Optional[int] = Field(None, gt=0, description="ID статуса требования")
    release_id: Optional[int] = Field(None, gt=0, description="ID релиза")
    spec_id: Optional[int] = Field(None, gt=0, description="ID спецификации")

    @field_validator("title")
    def validate_title(cls, v):
        """Валидация заголовка при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Title cannot be empty or contain only whitespace")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Title contains forbidden characters: {forbidden_chars}"
                )

            return v.strip()
        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания при обновлении"""
        if v is not None:
            v = v.strip()
            if len(v) > 5000:
                raise ValueError("Description cannot exceed 5000 characters")
            return v if v else None
        return v

    @field_validator("progress")
    def validate_progress(cls, v):
        """Валидация прогресса при обновлении"""
        if v is not None:
            if v < 0.0:
                raise ValueError("Progress cannot be negative")
            if v > 100.0:
                raise ValueError("Progress cannot exceed 100%")
            return round(v, 2)  # Округляем до 2 знаков после запятой
        return v

    @field_validator("release_id", "spec_id")
    def validate_optional_ids_update(cls, v):
        """Валидация опциональных ID при обновлении"""
        # Если передан некорректный ID (например, 0 или 1 которых нет в БД), очищаем его
        if v is not None and v <= 0:
            return None
        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data):
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class RequirementInDBBase(RequirementBase):
    """Базовая схема требования с данными из БД."""

    id: int
    type_id: int
    priority_id: int
    status_id: int
    project_id: int
    author_id: int
    last_modified_by: int
    release_id: Optional[int] = None
    spec_id: Optional[int] = None
    progress: float = 0.0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Requirement(RequirementInDBBase):
    """Схема требования для ответов API."""

    pass


class RequirementWithDetails(Requirement):
    """Схема требования с подробной информацией."""

    type_name: Optional[str] = None
    priority_name: Optional[str] = None
    status_name: Optional[str] = None
    project_name: Optional[str] = None
    author_name: Optional[str] = None
    last_modifier_name: Optional[str] = None
    release_version: Optional[str] = None
    spec_name: Optional[str] = None

    @field_validator(
        "type_name",
        "priority_name",
        "status_name",
        "project_name",
        "author_name",
        "last_modifier_name",
        "release_version",
        "spec_name",
    )
    def validate_names(cls, v):
        """Валидация имен связанных сущностей"""
        if v is not None:
            v = v.strip()
            return v if v else None
        return v


class RequirementWithTestResults(Requirement):
    """Схема требования с результатами тестирования."""

    latest_test_status: Optional[str] = None
    test_count: int = 0
    tests_passed: int = 0

    @field_validator("test_count", "tests_passed")
    def validate_test_counts(cls, v):
        """Валидация счетчиков тестов"""
        if v < 0:
            raise ValueError("Test counts cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_tests_passed(self):
        """Проверка, что количество пройденных тестов не превышает общее количество"""
        if self.tests_passed > self.test_count:
            raise ValueError("Tests passed cannot exceed total test count")
        return self


class RequirementInDB(RequirementInDBBase):
    """Схема требования в БД."""

    pass
