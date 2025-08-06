"""
Схемы для модели TestCase и связанных сущностей.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from sqlmodel import Field
from datetime import datetime
from typing import Optional, List

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)


class TestCaseBase(BaseSchema):
    """Базовая схема тестового случая."""

    name: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Название тестового случая",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание тестового случая"
    )
    status: str = Field(
        default="active",
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Статус тестового случая",
    )


class TestCaseCreate(CreateSchema, TestCaseBase):
    """Схема для создания тестового случая."""

    test_plan_id: int = Field(..., gt=0, description="ID тестового плана")


class TestCaseUpdate(UpdateSchema):
    """Схема для обновления тестового случая."""

    name: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Название тестового случая",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание тестового случая"
    )
    status: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Статус тестового случая",
    )


class TestCase(ResponseSchema, TestCaseBase):
    """Схема тестового случая для ответов API."""

    test_plan_id: int = Field(..., description="ID тестового плана")


class TestExecution(BaseSchema):
    """Схема выполнения тестового случая."""

    id: int = Field(..., description=StandardDescriptions.ID)
    test_case_id: int = Field(..., description="ID тестового случая")
    status: str = Field(
        ..., max_length=FieldLimits.SHORT_STRING_MAX, description="Статус выполнения"
    )
    started_at: Optional[datetime] = Field(None, description="Время начала выполнения")
    completed_at: Optional[datetime] = Field(None, description="Время завершения")
    duration: Optional[int] = Field(
        None, description="Длительность выполнения в секундах"
    )
    logs: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Логи выполнения"
    )


class TestingSummary(BaseSchema):
    """Схема сводных данных по тестированию."""

    total_tests: int = Field(default=0, ge=0, description="Общее количество тестов")
    passed_tests: int = Field(
        default=0, ge=0, description="Количество пройденных тестов"
    )
    failed_tests: int = Field(
        default=0, ge=0, description="Количество проваленных тестов"
    )
    skipped_tests: Optional[int] = Field(
        default=0, ge=0, description="Количество пропущенных тестов"
    )
    pass_rate: Optional[float] = Field(
        default=0.0, ge=0, le=100, description="Процент успешности"
    )

    # Поля для группировки по проектам
    project_id: Optional[int] = Field(None, description=StandardDescriptions.PROJECT_ID)
    project_name: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Название проекта"
    )
    summary: Optional[dict] = Field(None, description="Детальная сводка")

    # Поля для общей сводки
    overall_summary: Optional["TestingSummary"] = Field(
        None, description="Общая сводка"
    )
    projects: Optional[List["TestingSummary"]] = Field(
        None, description="Сводки по проектам"
    )
    total_projects: Optional[int] = Field(
        None, ge=0, description="Общее количество проектов"
    )

    errors: Optional[List[str]] = Field(None, description="Ошибки")


# Обновляем TestingSummary для поддержки рекурсивных ссылок
TestingSummary.model_rebuild()
