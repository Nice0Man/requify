from datetime import datetime, UTC
from typing import Optional, List

from pydantic import BaseModel, Field, field_validator, model_validator
import re


class ReleaseBase(BaseModel):
    """
    Базовая схема релиза.
    """

    name: str = Field(..., min_length=2, max_length=100)
    version: str = Field(
        ..., min_length=1, max_length=50, description="Версия релиза в формате SemVer"
    )
    description: Optional[str] = None
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = None

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия релиза"""
        if not v or not v.strip():
            raise ValueError("Release name cannot be empty")

        v = v.strip()

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Release name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("version")
    def validate_version(cls, v):
        """Валидация версии релиза"""
        if not v or not v.strip():
            raise ValueError("Release version cannot be empty")

        v = v.strip()

        # Проверяем формат версии (например, 1.0.0, 2.1.3, v1.0.0)
        version_patterns = [
            r"^\d+\.\d+\.\d+$",  # 1.0.0
            r"^v\d+\.\d+\.\d+$",  # v1.0.0
            r"^\d+\.\d+$",  # 1.0
            r"^v\d+\.\d+$",  # v1.0
            r"^\d+\.\d+\.\d+-\w+$",  # 1.0.0-alpha
            r"^v\d+\.\d+\.\d+-\w+$",  # v1.0.0-beta
        ]

        if not any(re.match(pattern, v) for pattern in version_patterns):
            raise ValueError(
                "Invalid version format. Use formats like 1.0.0, v1.0.0, 1.0.0-alpha, etc."
            )

        return v

    @field_validator("description")
    def validate_description(cls, v):
        """Валидация описания релиза"""
        if v is not None:
            v = v.strip()
            if len(v) > 2000:  # Максимальная длина описания
                raise ValueError("Description cannot exceed 2000 characters")
            return v if v else None
        return v

    @field_validator("planned_date", "release_date")
    def validate_dates(cls, v):
        """Валидация дат релиза"""
        if v is not None:
            # Convert timezone-aware datetime to timezone-naive for database compatibility
            if v.tzinfo is not None:
                # Convert to UTC first, then strip timezone info
                v = v.astimezone(UTC).replace(tzinfo=None)

            # Дата не может быть слишком далеко в прошлом (больше 5 лет назад)
            five_years_ago = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year - 5
            )
            if v < five_years_ago:
                raise ValueError("Date cannot be more than 5 years in the past")

            # Дата не может быть слишком далеко в будущем (больше 10 лет)
            max_future = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year + 10
            )
            if v > max_future:
                raise ValueError("Date cannot be more than 10 years in the future")

        return v


class ReleaseCreate(ReleaseBase):
    """
    Схема для создания релиза.
    """

    project_id: int = Field(..., gt=0, description="ID проекта")
    status: str = Field("planned", description="Статус релиза")
    release_date: Optional[datetime] = Field(None, description="Дата релиза")


class ReleaseUpdate(BaseModel):
    """
    Схема для обновления релиза.
    """

    name: Optional[str] = Field(None, min_length=2, max_length=100)
    version: Optional[str] = Field(
        None, min_length=1, max_length=50, description="Версия релиза в формате SemVer"
    )
    description: Optional[str] = None
    status: Optional[str] = Field(None, description="Статус релиза")
    planned_date: Optional[datetime] = None
    release_date: Optional[datetime] = Field(None, description="Дата релиза")

    @field_validator("planned_date", "release_date")
    def validate_dates(cls, v):
        """Валидация дат релиза при обновлении"""
        if v is not None:
            # Convert timezone-aware datetime to timezone-naive for database compatibility
            if v.tzinfo is not None:
                # Convert to UTC first, then strip timezone info
                v = v.astimezone(UTC).replace(tzinfo=None)

            # Дата не может быть слишком далеко в прошлом (больше 5 лет назад)
            five_years_ago = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year - 5
            )
            if v < five_years_ago:
                raise ValueError("Date cannot be more than 5 years in the past")

            # Дата не может быть слишком далеко в будущем (больше 10 лет)
            max_future = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year + 10
            )
            if v > max_future:
                raise ValueError("Date cannot be more than 10 years in the future")

        return v


class ReleaseInDBBase(ReleaseBase):
    """
    Базовая схема релиза с данными из БД.
    """

    id: int
    project_id: int
    status: str
    created_at: datetime
    updated_at: datetime
    release_date: Optional[datetime] = None

    class Config:
        from_attributes = True


class Release(ReleaseInDBBase):
    """
    Схема релиза для API.
    """

    @property
    def is_released(self) -> bool:
        """Проверяет, выпущен ли релиз"""
        return self.status == "released" and self.release_date is not None

    @property
    def is_overdue(self) -> bool:
        """Проверяет, просрочен ли релиз"""
        if self.planned_date and not self.is_released:
            return datetime.now(UTC).replace(tzinfo=None) > self.planned_date
        return False


class ReleaseWithRequirements(Release):
    """
    Схема релиза с требованиями.
    """

    total_requirements: int = 0
    completed_requirements: int = 0
    requirements_in_testing: int = 0

    @field_validator(
        "total_requirements", "completed_requirements", "requirements_in_testing"
    )
    def validate_counts(cls, v):
        """Валидация счетчиков требований"""
        if v < 0:
            raise ValueError("Requirement counts cannot be negative")
        return v

    @model_validator(mode="after")
    def validate_partial_counts(self):
        """Проверка, что частичные счетчики не превышают общее количество"""
        if self.completed_requirements > self.total_requirements:
            raise ValueError("Completed requirements cannot exceed total requirements")
        if self.requirements_in_testing > self.total_requirements:
            raise ValueError("Requirements in testing cannot exceed total requirements")
        return self

    @property
    def completion_percentage(self) -> float:
        """Вычисляет процент завершения релиза"""
        if self.total_requirements == 0:
            return 0.0
        return round((self.completed_requirements / self.total_requirements) * 100, 2)

    @property
    def testing_percentage(self) -> float:
        """Вычисляет процент требований в тестировании"""
        if self.total_requirements == 0:
            return 0.0
        return round((self.requirements_in_testing / self.total_requirements) * 100, 2)


class ReleaseWithDetails(Release):
    """
    Схема релиза с подробной информацией.
    """

    project_name: Optional[str] = None


class ReleaseInDB(ReleaseInDBBase):
    """
    Схема релиза в БД.
    """

    pass


class ReleaseFromRequirementsCreate(BaseModel):
    """
    Схема для создания релиза на основе требований.

    Функция 11 из ТЗ: Создание релиза с учетом связей требований.
    """

    name: str = Field(..., min_length=2, max_length=100, description="Название релиза")
    version: str = Field(
        ..., min_length=1, max_length=50, description="Версия релиза в формате SemVer"
    )
    description: Optional[str] = Field(None, description="Описание релиза")
    project_id: int = Field(..., gt=0, description="ID проекта")
    requirement_ids: List[int] = Field(
        ..., min_length=1, description="Список ID требований для включения в релиз"
    )
    status: str = Field("planning", description="Статус релиза")
    planned_date: Optional[datetime] = Field(
        None, description="Планируемая дата релиза"
    )
    release_date: Optional[datetime] = Field(
        None, description="Фактическая дата релиза"
    )
    auto_description: bool = Field(
        True, description="Автоматически генерировать описание на основе требований"
    )
    include_requirement_details: bool = Field(
        True, description="Включать детали требований в описание релиза"
    )
    analyze_dependencies: bool = Field(
        True, description="Анализировать зависимости между требованиями"
    )
    auto_include_dependencies: bool = Field(
        False, description="Автоматически включать недостающие зависимости"
    )

    @field_validator("requirement_ids")
    def validate_requirement_ids(cls, v):
        """Валидация списка ID требований"""
        if not v:
            raise ValueError("At least one requirement ID must be provided")

        # Проверяем уникальность ID
        if len(v) != len(set(v)):
            raise ValueError("Requirement IDs must be unique")

        # Проверяем, что все ID положительные
        for req_id in v:
            if req_id <= 0:
                raise ValueError("All requirement IDs must be positive integers")

        return v

    @field_validator("name")
    def validate_name(cls, v):
        """Валидация названия релиза"""
        if not v or not v.strip():
            raise ValueError("Release name cannot be empty")

        v = v.strip()

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|", "\n", "\r"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Release name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("version")
    def validate_version(cls, v):
        """Валидация версии релиза"""
        if not v or not v.strip():
            raise ValueError("Release version cannot be empty")

        v = v.strip()

        # Проверяем формат версии (например, 1.0.0, 2.1.3, v1.0.0)
        version_patterns = [
            r"^\d+\.\d+\.\d+$",  # 1.0.0
            r"^v\d+\.\d+\.\d+$",  # v1.0.0
            r"^\d+\.\d+$",  # 1.0
            r"^v\d+\.\d+$",  # v1.0
            r"^\d+\.\d+\.\d+-\w+$",  # 1.0.0-alpha
            r"^v\d+\.\d+\.\d+-\w+$",  # v1.0.0-beta
        ]

        if not any(re.match(pattern, v) for pattern in version_patterns):
            raise ValueError(
                "Invalid version format. Use formats like 1.0.0, v1.0.0, 1.0.0-alpha, etc."
            )

        return v

    @field_validator("planned_date", "release_date")
    def validate_dates(cls, v):
        """Валидация дат релиза"""
        if v is not None:
            # Convert timezone-aware datetime to timezone-naive for database compatibility
            if v.tzinfo is not None:
                v = v.astimezone(UTC).replace(tzinfo=None)

            # Дата не может быть слишком далеко в прошлом (больше 5 лет назад)
            five_years_ago = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year - 5
            )
            if v < five_years_ago:
                raise ValueError("Date cannot be more than 5 years in the past")

            # Дата не может быть слишком далеко в будущем (больше 10 лет)
            max_future = datetime.now(UTC).replace(
                tzinfo=None, year=datetime.now(UTC).year + 10
            )
            if v > max_future:
                raise ValueError("Date cannot be more than 10 years in the future")

        return v


class RequirementSummary(BaseModel):
    """
    Краткая информация о требовании для релиза.
    """

    id: int
    title: str
    description: Optional[str] = None
    type_name: Optional[str] = None
    priority_name: Optional[str] = None
    status_name: Optional[str] = None


class ReleaseWithLinkedRequirements(Release):
    """
    Схема релиза с привязанными требованиями.

    Расширенный ответ для создания релиза на основе требований.
    """

    linked_requirements: List[RequirementSummary] = Field(
        default_factory=list, description="Список требований, привязанных к релизу"
    )
    requirements_count: int = Field(0, description="Количество привязанных требований")
    auto_generated_description: bool = Field(
        False, description="Было ли описание сгенерировано автоматически"
    )

    @field_validator("requirements_count")
    def validate_requirements_count(cls, v):
        """Валидация количества требований"""
        if v < 0:
            raise ValueError("Requirements count cannot be negative")
        return v


class ReleaseCreationSummary(BaseModel):
    """
    Итоговая информация о создании релиза.
    """

    release: ReleaseWithLinkedRequirements
    operation_summary: dict = Field(
        default_factory=dict, description="Сводка операции создания релиза"
    )

    @model_validator(mode="after")
    def validate_summary_consistency(self):
        """Проверка согласованности данных в итоговой информации"""
        if self.release.requirements_count != len(self.release.linked_requirements):
            raise ValueError(
                "Requirements count must match linked requirements list length"
            )
        return self


# === Function 12 Schemas: Specification Generation ===


class SpecificationGenerationOptions(BaseModel):
    """
    Опции генерации спецификации релиза.

    Функция 12 из ТЗ: Автоматическая генерация спецификаций.
    """

    format: str = Field(
        "pdf",
        description="Формат документа спецификации",
        pattern="^(pdf|html|docx|markdown)$",
    )
    language: str = Field("ru", description="Язык спецификации", pattern="^(ru|en)$")
    include_requirements: bool = Field(
        True, description="Включать подробности требований в спецификацию"
    )
    include_relationships: bool = Field(
        True, description="Включать информацию о связях между требованиями"
    )
    include_test_cases: bool = Field(False, description="Включать связанные тест-кейсы")
    include_changelog: bool = Field(
        True, description="Включать журнал изменений релиза"
    )
    include_statistics: bool = Field(True, description="Включать статистику требований")
    custom_sections: Optional[List[str]] = Field(
        None, description="Пользовательские разделы спецификации"
    )
    template_style: str = Field(
        "standard",
        description="Стиль шаблона спецификации",
        pattern="^(standard|detailed|compact|technical)$",
    )
    auto_numbering: bool = Field(
        True, description="Автоматическая нумерация разделов и требований"
    )

    @field_validator("custom_sections")
    def validate_custom_sections(cls, v):
        """Валидация пользовательских разделов"""
        if v is not None:
            if len(v) > 20:
                raise ValueError("Cannot have more than 20 custom sections")
            for section in v:
                if not section or len(section.strip()) == 0:
                    raise ValueError("Section names cannot be empty")
                if len(section) > 100:
                    raise ValueError("Section names cannot exceed 100 characters")
        return v


class SpecificationGenerationResponse(BaseModel):
    """
    Ответ генерации спецификации релиза.

    Результат выполнения Function 12.
    """

    release_id: int = Field(..., description="ID релиза")
    specification_id: int = Field(..., description="ID созданной спецификации")
    specification_name: str = Field(..., description="Название спецификации")
    format: str = Field(..., description="Формат документа")
    language: str = Field(..., description="Язык спецификации")
    status: str = Field(..., description="Статус генерации")
    generated_at: str = Field(..., description="Время генерации в ISO формате")
    generated_by: Optional[int] = Field(
        None, description="ID пользователя, создавшего спецификацию"
    )

    # Содержимое спецификации
    sections: List[str] = Field(
        default_factory=list, description="Список разделов спецификации"
    )
    requirements_count: int = Field(0, description="Количество включенных требований")
    relationships_count: int = Field(0, description="Количество анализируемых связей")

    # Ссылки и доступ
    download_url: str = Field(..., description="URL для скачивания спецификации")
    preview_url: Optional[str] = Field(
        None, description="URL для предварительного просмотра"
    )

    # Статистика генерации
    generation_stats: dict = Field(
        default_factory=dict, description="Статистика процесса генерации"
    )

    @field_validator("status")
    def validate_status(cls, v):
        """Валидация статуса генерации"""
        allowed_statuses = ["generated", "processing", "failed", "pending"]
        if v not in allowed_statuses:
            raise ValueError(f"Status must be one of: {allowed_statuses}")
        return v

    @field_validator("requirements_count", "relationships_count")
    def validate_counts(cls, v):
        """Валидация счетчиков"""
        if v < 0:
            raise ValueError("Counts cannot be negative")
        return v


class SpecificationGenerationSummary(BaseModel):
    """
    Подробная сводка генерации спецификации.

    Расширенная информация о процессе создания спецификации.
    """

    specification: SpecificationGenerationResponse
    processing_details: dict = Field(
        default_factory=dict, description="Детали обработки и генерации"
    )
    validation_results: dict = Field(
        default_factory=dict, description="Результаты валидации данных"
    )
    warnings: List[str] = Field(
        default_factory=list, description="Предупреждения в процессе генерации"
    )

    @model_validator(mode="after")
    def validate_consistency(self):
        """Проверка согласованности данных сводки"""
        if len(self.warnings) > 50:
            raise ValueError("Too many warnings - possible generation issues")
        return self
