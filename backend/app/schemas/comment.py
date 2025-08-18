"""
Улучшенные схемы для модели Comment.
Пример правильной организации согласно лучшим практикам SQLModel.
"""

from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field

# === Базовые схемы ===


class CommentBase(BaseSchema, ValidationMixin):
    """
    Базовая схема комментария.
    Содержит только основные поля без служебных данных.
    """

    content: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.TEXT_MAX,
        description="Содержание комментария",
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: str) -> str:
        """Валидация содержания комментария"""
        return cls.validate_non_empty_string(v, "content")


# === CRUD схемы ===


class CommentCreate(CommentBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания комментария.
    Включает связь с требованием и автором.
    """

    requirement_id: int = Field(
        ..., gt=0, description=StandardDescriptions.ID + " требования"
    )
    # author_id будет заполняться автоматически из токена пользователя
    # поэтому делаем его опциональным для API
    author_id: Optional[int] = Field(None, gt=0, description="ID автора комментария")


class CommentUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления комментария.
    Позволяет изменить только содержание.
    """

    content: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.TEXT_MAX,
        description="Новое содержание комментария",
    )

    @field_validator("content")
    @classmethod
    def validate_content(cls, v: Optional[str]) -> Optional[str]:
        """Валидация содержания комментария"""
        if v is not None:
            return cls.validate_non_empty_string(v, "content")
        return v


class CommentResponse(CommentBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для комментария.
    Включает все данные из БД.
    """

    requirement_id: int = Field(..., description="ID связанного требования")
    author_id: int = Field(..., description="ID автора комментария")


# === Расширенные схемы ===


class CommentWithAuthor(CommentResponse):
    """
    Схема комментария с информацией об авторе.
    Используется когда нужны данные автора.
    """

    author_name: Optional[str] = Field(None, description="Имя автора")
    author_email: Optional[str] = Field(None, description="Email автора")
    author_avatar: Optional[str] = Field(None, description="Аватар автора")


class CommentWithRequirement(CommentResponse):
    """
    Схема комментария с информацией о требовании.
    """

    requirement_title: Optional[str] = Field(None, description="Заголовок требования")
    requirement_status: Optional[str] = Field(None, description="Статус требования")


class CommentDetailed(CommentWithAuthor):
    """
    Детальная схема комментария с полной информацией.
    """

    requirement_title: Optional[str] = Field(None, description="Заголовок требования")
    requirement_status: Optional[str] = Field(None, description="Статус требования")
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")


# === Списки и пагинация ===


class CommentListResponse(ListResponseSchema[CommentWithAuthor]):
    """Список комментариев с пагинацией"""

    pass


class CommentDetailedListResponse(ListResponseSchema[CommentDetailed]):
    """Детальный список комментариев с пагинацией"""

    pass


# === Поиск и фильтрация ===


class CommentSearchRequest(SearchRequest):
    """
    Запрос поиска комментариев.
    """

    requirement_id: Optional[int] = Field(
        None, gt=0, description="Фильтр по требованию"
    )
    author_id: Optional[int] = Field(None, gt=0, description="Фильтр по автору")
    date_range: Optional[DateRangeFilter] = Field(
        None, description="Фильтр по диапазону дат"
    )


class CommentFilter(BaseSchema):
    """
    Расширенный фильтр для комментариев.
    """

    requirement_ids: Optional[List[int]] = Field(
        None, description="Список ID требований"
    )
    author_ids: Optional[List[int]] = Field(None, description="Список ID авторов")
    content_contains: Optional[str] = Field(
        None, min_length=3, description="Поиск по содержанию"
    )
    created_after: Optional[datetime] = Field(None, description="Созданы после даты")
    created_before: Optional[datetime] = Field(None, description="Созданы до даты")


# === Статистика ===


class CommentStatistics(StatisticsSchema):
    """
    Схема статистики комментариев.
    """

    total_comments: int = Field(0, ge=0, description="Общее количество комментариев")
    comments_today: int = Field(0, ge=0, description="Комментариев сегодня")
    comments_this_week: int = Field(0, ge=0, description="Комментариев за неделю")
    comments_this_month: int = Field(0, ge=0, description="Комментариев за месяц")

    # Топ авторов
    top_authors: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые активные авторы"
    )

    # Топ требований по комментариям
    most_commented_requirements: List[Dict[str, Any]] = Field(
        default_factory=list, description="Наиболее комментируемые требования"
    )

    # Метрики
    average_comments_per_requirement: float = Field(
        0.0, ge=0, description="Среднее количество комментариев на требование"
    )
    average_comment_length: float = Field(
        0.0, ge=0, description="Средняя длина комментария"
    )

    # Динамика по времени
    comments_by_day: List[Dict[str, Any]] = Field(
        default_factory=list, description="Комментарии по дням"
    )


class CommentAuthorStatistics(BaseSchema):
    """
    Статистика по авторам комментариев.
    """

    author_id: int = Field(..., description="ID автора")
    author_name: str = Field(..., description="Имя автора")
    total_comments: int = Field(0, ge=0, description="Всего комментариев")
    avg_comment_length: float = Field(
        0.0, ge=0, description="Средняя длина комментария"
    )
    most_active_day: Optional[str] = Field(None, description="Самый активный день")
    first_comment_date: Optional[datetime] = Field(
        None, description="Дата первого комментария"
    )
    last_comment_date: Optional[datetime] = Field(
        None, description="Дата последнего комментария"
    )


# === Массовые операции ===


class CommentBulkCreate(BaseSchema):
    """
    Схема для массового создания комментариев.
    """

    comments: List[CommentCreate] = Field(
        ...,
        min_length=1,
        max_length=100,
        description="Список комментариев для создания",
    )


class CommentBulkUpdate(BaseSchema):
    """
    Схема для массового обновления комментариев.
    """

    comment_ids: List[int] = Field(
        ..., min_length=1, description="Список ID комментариев"
    )
    update_data: CommentUpdate = Field(..., description="Данные для обновления")


class CommentBulkDelete(BaseSchema):
    """
    Схема для массового удаления комментариев.
    """

    comment_ids: List[int] = Field(
        ..., min_length=1, description="Список ID комментариев для удаления"
    )
    reason: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Причина удаления"
    )


# === Экспорт и импорт ===


class CommentExportRequest(BaseSchema):
    """
    Запрос на экспорт комментариев.
    """

    format: str = Field(
        "json", regex="^(json|csv|xlsx)$", description="Формат экспорта"
    )
    filter: Optional[CommentFilter] = Field(None, description="Фильтр для экспорта")
    include_author_info: bool = Field(
        True, description="Включить информацию об авторах"
    )
    include_requirement_info: bool = Field(
        True, description="Включить информацию о требованиях"
    )


class CommentImportRequest(BaseSchema):
    """
    Запрос на импорт комментариев.
    """

    file_path: str = Field(..., description="Путь к файлу для импорта")
    format: str = Field("json", regex="^(json|csv|xlsx)$", description="Формат импорта")
    validate_only: bool = Field(False, description="Только валидация, без сохранения")
    skip_duplicates: bool = Field(True, description="Пропускать дубликаты")


# === Активность и уведомления ===


class CommentActivity(BaseSchema):
    """
    Схема активности по комментариям.
    """

    action: str = Field(..., description="Тип действия (created, updated, deleted)")
    comment_id: int = Field(..., description="ID комментария")
    requirement_id: int = Field(..., description="ID требования")
    author_id: int = Field(..., description="ID автора действия")
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Optional[Dict[str, Any]] = Field(None, description="Дополнительные детали")


class CommentNotification(BaseSchema):
    """
    Схема уведомления о комментарии.
    """

    type: str = Field(..., description="Тип уведомления")
    comment_id: int = Field(..., description="ID комментария")
    requirement_id: int = Field(..., description="ID требования")
    author_id: int = Field(..., description="ID автора комментария")
    recipient_id: int = Field(..., description="ID получателя уведомления")
    message: str = Field(..., description="Текст уведомления")
    read_at: Optional[datetime] = Field(None, description="Время прочтения")


# === Валидация и проверки ===


class CommentValidationResult(BaseSchema):
    """
    Результат валидации комментария.
    """

    is_valid: bool = Field(..., description="Результат валидации")
    errors: List[str] = Field(default_factory=list, description="Список ошибок")
    warnings: List[str] = Field(
        default_factory=list, description="Список предупреждений"
    )
    suggestions: List[str] = Field(default_factory=list, description="Рекомендации")


# === Конфигурация для различных контекстов ===


class CommentConfig:
    """
    Конфигурация схем комментариев для различных контекстов API.
    """

    # Минимальная схема для быстрых ответов
    MINIMAL = CommentResponse

    # Стандартная схема с автором
    STANDARD = CommentWithAuthor

    # Детальная схема для полных данных
    DETAILED = CommentDetailed

    # Схема для списков
    LIST = CommentListResponse

    # Схема для поиска
    SEARCH = CommentSearchRequest


# === Псевдонимы для обратной совместимости ===

Comment = CommentResponse  # Базовый комментарий
CommentCreateForRequirement = CommentCreate  # Создание комментария для требования
