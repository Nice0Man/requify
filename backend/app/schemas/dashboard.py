"""
Схемы для Dashboard.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
Поддерживает полную функциональность дашборда с виджетами, уведомлениями и аналитикой.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union, Literal
from sqlmodel import SQLModel, Field
from pydantic import field_validator, model_validator
from enum import Enum

from .base import (
    BaseSchema,
    CreateSchema,
    UpdateSchema,
    ResponseSchema,
    ListResponseSchema,
    StatisticsSchema,
    UserRelatedSchema,
    ValidationMixin,
    FieldLimits,
    StandardDescriptions,
)
from .common import SearchRequest, DateRangeFilter


# === Перечисления ===


class ActivityType(str, Enum):
    """Типы активности"""

    PROJECT_CREATED = "project_created"
    PROJECT_UPDATED = "project_updated"
    PROJECT_COMPLETED = "project_completed"
    REQUIREMENT_ADDED = "requirement_added"
    REQUIREMENT_UPDATED = "requirement_updated"
    REQUIREMENT_APPROVED = "requirement_approved"
    TASK_COMPLETED = "task_completed"
    RELEASE_PUBLISHED = "release_published"
    REVIEW_SUBMITTED = "review_submitted"
    COMMENT_ADDED = "comment_added"
    STATUS_CHANGED = "status_changed"
    USER_INVITED = "user_invited"
    TEAM_JOINED = "team_joined"
    INTEGRATION_CONFIGURED = "integration_configured"
    BACKUP_CREATED = "backup_created"


class NotificationType(str, Enum):
    """Типы уведомлений"""

    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    REMINDER = "reminder"
    INVITATION = "invitation"
    DEADLINE = "deadline"
    APPROVAL_REQUEST = "approval_request"


class NotificationPriority(str, Enum):
    """Приоритеты уведомлений"""

    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class WidgetType(str, Enum):
    """Типы виджетов дашборда"""

    STATS_OVERVIEW = "stats_overview"
    PROJECT_LIST = "project_list"
    REQUIREMENT_LIST = "requirement_list"
    ACTIVITY_FEED = "activity_feed"
    CHART_LINE = "chart_line"
    CHART_BAR = "chart_bar"
    CHART_PIE = "chart_pie"
    CHART_DONUT = "chart_donut"
    CALENDAR = "calendar"
    TEAM_PERFORMANCE = "team_performance"
    NOTIFICATIONS = "notifications"
    QUICK_ACTIONS = "quick_actions"
    RECENT_DOCUMENTS = "recent_documents"
    PROGRESS_TRACKER = "progress_tracker"
    KPI_METRICS = "kpi_metrics"


class DashboardLayout(str, Enum):
    """Макеты дашборда"""

    GRID_2x2 = "grid_2x2"
    GRID_3x3 = "grid_3x3"
    GRID_4x4 = "grid_4x4"
    COLUMNS_2 = "columns_2"
    COLUMNS_3 = "columns_3"
    SIDEBAR_LEFT = "sidebar_left"
    SIDEBAR_RIGHT = "sidebar_right"
    FLEXIBLE = "flexible"


class Theme(str, Enum):
    """Темы дашборда"""

    LIGHT = "light"
    DARK = "dark"
    AUTO = "auto"
    BLUE = "blue"
    GREEN = "green"
    PURPLE = "purple"


class ChartType(str, Enum):
    """Типы графиков"""

    LINE = "line"
    BAR = "bar"
    COLUMN = "column"
    PIE = "pie"
    DONUT = "donut"
    AREA = "area"
    SCATTER = "scatter"
    HEATMAP = "heatmap"
    GAUGE = "gauge"
    FUNNEL = "funnel"


# === Базовые схемы статистики ===


class DashboardOverviewStats(BaseSchema):
    """
    Общая статистика дашборда.
    """

    total_projects: int = Field(0, ge=0, description="Общее количество проектов")
    active_projects: int = Field(0, ge=0, description="Активных проектов")
    completed_projects: int = Field(0, ge=0, description="Завершенных проектов")
    overdue_projects: int = Field(0, ge=0, description="Просроченных проектов")

    total_requirements: int = Field(0, ge=0, description="Общее количество требований")
    pending_requirements: int = Field(0, ge=0, description="Требований в ожидании")
    approved_requirements: int = Field(0, ge=0, description="Одобренных требований")
    rejected_requirements: int = Field(0, ge=0, description="Отклоненных требований")

    total_releases: int = Field(0, ge=0, description="Общее количество релизов")
    planned_releases: int = Field(0, ge=0, description="Запланированных релизов")
    published_releases: int = Field(0, ge=0, description="Опубликованных релизов")

    total_users: int = Field(0, ge=0, description="Общее количество пользователей")
    active_users: int = Field(0, ge=0, description="Активных пользователей")
    teams_count: int = Field(0, ge=0, description="Количество команд")

    # Производительность
    completion_rate: float = Field(
        0.0, ge=0, le=100, description="Процент завершения (%)"
    )
    on_time_delivery: float = Field(
        0.0, ge=0, le=100, description="Процент своевременной доставки (%)"
    )
    quality_score: float = Field(0.0, ge=0, le=100, description="Оценка качества (%)")
    team_productivity: float = Field(
        0.0, ge=0, le=100, description="Продуктивность команды (%)"
    )


class TrendingMetrics(BaseSchema):
    """
    Трендовые метрики.
    """

    # Недельные тренды
    requirements_this_week: int = Field(0, ge=0, description="Требований за эту неделю")
    requirements_last_week: int = Field(
        0, ge=0, description="Требований за прошлую неделю"
    )
    requirements_week_change: float = Field(
        0.0, description="Изменение требований за неделю (%)"
    )

    # Месячные тренды
    projects_this_month: int = Field(0, ge=0, description="Проектов за этот месяц")
    projects_last_month: int = Field(0, ge=0, description="Проектов за прошлый месяц")
    projects_month_change: float = Field(
        0.0, description="Изменение проектов за месяц (%)"
    )

    releases_this_month: int = Field(0, ge=0, description="Релизов за этот месяц")
    releases_last_month: int = Field(0, ge=0, description="Релизов за прошлый месяц")
    releases_month_change: float = Field(
        0.0, description="Изменение релизов за месяц (%)"
    )

    # Средние показатели
    avg_project_duration: float = Field(
        0.0, ge=0, description="Средняя длительность проекта (дней)"
    )
    avg_requirements_per_project: float = Field(
        0.0, ge=0, description="Среднее количество требований на проект"
    )
    avg_team_size: float = Field(0.0, ge=0, description="Средний размер команды")


# === Активность ===


class DashboardActivity(UserRelatedSchema):
    """
    Активность на дашборде.
    """

    activity_type: ActivityType = Field(..., description="Тип активности")
    title: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Заголовок активности",
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание активности"
    )
    entity_type: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Тип связанной сущности",
    )
    entity_id: Optional[int] = Field(None, gt=0, description="ID связанной сущности")
    activity_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Дополнительные данные активности"
    )
    occurred_at: datetime = Field(
        default_factory=datetime.utcnow, description="Время активности"
    )


class DashboardActivityResponse(DashboardActivity, ResponseSchema):
    """Схема ответа для активности"""

    user_name: Optional[str] = Field(None, description="Имя пользователя")
    user_avatar: Optional[str] = Field(None, description="Аватар пользователя")
    entity_name: Optional[str] = Field(None, description="Название связанной сущности")


# === Уведомления ===


class DashboardNotification(UserRelatedSchema):
    """
    Уведомление дашборда.
    """

    title: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Заголовок уведомления",
    )
    message: str = Field(
        ..., max_length=FieldLimits.TEXT_MAX, description="Текст уведомления"
    )
    notification_type: NotificationType = Field(
        NotificationType.INFO, description="Тип уведомления"
    )
    priority: NotificationPriority = Field(
        NotificationPriority.MEDIUM, description="Приоритет уведомления"
    )
    is_read: bool = Field(False, description="Прочитано ли уведомление")
    is_dismissed: bool = Field(False, description="Отклонено ли уведомление")
    action_url: Optional[str] = Field(
        None,
        max_length=FieldLimits.URL_MAX,
        description="URL для действия по уведомлению",
    )
    action_text: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Текст кнопки действия",
    )
    expires_at: Optional[datetime] = Field(
        None, description="Дата истечения уведомления"
    )
    activity_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Дополнительные данные уведомления"
    )


class DashboardNotificationResponse(DashboardNotification, ResponseSchema):
    """Схема ответа для уведомления"""

    pass


class NotificationUpdate(UpdateSchema):
    """Схема обновления уведомления"""

    is_read: Optional[bool] = Field(None, description="Прочитано ли")
    is_dismissed: Optional[bool] = Field(None, description="Отклонено ли")


# === Виджеты ===


class DashboardWidget(UserRelatedSchema, ValidationMixin):
    """
    Виджет дашборда.
    """

    widget_type: WidgetType = Field(..., description="Тип виджета")
    title: str = Field(
        ..., max_length=FieldLimits.MEDIUM_STRING_MAX, description="Заголовок виджета"
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание виджета"
    )
    position_x: int = Field(0, ge=0, description="Позиция X в сетке")
    position_y: int = Field(0, ge=0, description="Позиция Y в сетке")
    width: int = Field(1, ge=1, le=12, description="Ширина виджета (1-12)")
    height: int = Field(1, ge=1, le=12, description="Высота виджета (1-12)")
    order_index: int = Field(0, ge=0, description="Порядок отображения")
    is_visible: bool = Field(True, description="Видимость виджета")
    is_resizable: bool = Field(True, description="Можно ли изменять размер")
    is_movable: bool = Field(True, description="Можно ли перемещать")
    refresh_interval: Optional[int] = Field(
        None, ge=0, description="Интервал обновления (секунды)"
    )
    config: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Конфигурация виджета"
    )
    data_source: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Источник данных"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Фильтры данных"
    )

    @field_validator("title")
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Валидация заголовка виджета"""
        return cls.validate_non_empty_string(v, "title")

    @model_validator(mode="after")
    def validate_widget_config(self):
        """Валидация конфигурации виджета"""
        # Проверяем обязательные поля для графиков
        if self.widget_type in [
            WidgetType.CHART_LINE,
            WidgetType.CHART_BAR,
            WidgetType.CHART_PIE,
        ]:
            if not self.config.get("chart_type"):
                self.config["chart_type"] = ChartType.LINE.value

        # Проверяем размеры
        if self.width + self.position_x > 12:
            raise ValueError("Widget width + position_x cannot exceed 12")

        if self.height + self.position_y > 12:
            raise ValueError("Widget height + position_y cannot exceed 12")

        return self


class DashboardWidgetCreate(DashboardWidget, CreateSchema):
    """Схема создания виджета"""

    dashboard_id: Optional[int] = Field(None, gt=0, description="ID дашборда")


class DashboardWidgetUpdate(UpdateSchema, ValidationMixin):
    """Схема обновления виджета"""

    title: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Заголовок"
    )
    description: Optional[str] = Field(
        None, max_length=FieldLimits.TEXT_MAX, description="Описание"
    )
    position_x: Optional[int] = Field(None, ge=0, description="Позиция X")
    position_y: Optional[int] = Field(None, ge=0, description="Позиция Y")
    width: Optional[int] = Field(None, ge=1, le=12, description="Ширина")
    height: Optional[int] = Field(None, ge=1, le=12, description="Высота")
    order_index: Optional[int] = Field(None, ge=0, description="Порядок")
    is_visible: Optional[bool] = Field(None, description="Видимость")
    refresh_interval: Optional[int] = Field(
        None, ge=0, description="Интервал обновления"
    )
    config: Optional[Dict[str, Any]] = Field(None, description="Конфигурация")
    filters: Optional[Dict[str, Any]] = Field(None, description="Фильтры")


class DashboardWidgetResponse(DashboardWidget, ResponseSchema):
    """Схема ответа для виджета"""

    dashboard_id: Optional[int] = None
    data: Optional[Dict[str, Any]] = Field(None, description="Данные виджета")


# === Дашборд ===


class DashboardBase(UserRelatedSchema, ValidationMixin):
    """
    Базовая схема дашборда.
    """

    name: str = Field(
        ...,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " дашборда",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " дашборда",
    )
    layout: DashboardLayout = Field(
        DashboardLayout.GRID_3x3, description="Макет дашборда"
    )
    theme: Theme = Field(Theme.LIGHT, description="Тема дашборда")
    is_default: bool = Field(False, description="Дашборд по умолчанию")
    is_public: bool = Field(False, description="Публичный дашборд")
    is_template: bool = Field(False, description="Шаблон дашборда")
    auto_refresh: bool = Field(True, description="Автоматическое обновление")
    refresh_interval: int = Field(
        300, ge=30, le=3600, description="Интервал обновления (секунды)"
    )
    settings: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Настройки дашборда"
    )
    activity_metadata: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Дополнительные метаданные"
    )
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия дашборда"""
        return cls.validate_non_empty_string(v, "name")


class DashboardCreate(DashboardBase, CreateSchema):
    """Схема создания дашборда"""

    copy_from_template: Optional[int] = Field(
        None, gt=0, description="ID шаблона для копирования"
    )
    include_sample_widgets: bool = Field(True, description="Включить примеры виджетов")


class DashboardUpdate(UpdateSchema, ValidationMixin):
    """Схема обновления дашборда"""

    name: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME,
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION,
    )
    layout: Optional[DashboardLayout] = Field(None, description="Макет")
    theme: Optional[Theme] = Field(None, description="Тема")
    is_default: Optional[bool] = Field(None, description="По умолчанию")
    is_public: Optional[bool] = Field(None, description="Публичный")
    auto_refresh: Optional[bool] = Field(None, description="Автообновление")
    refresh_interval: Optional[int] = Field(
        None, ge=30, le=3600, description="Интервал обновления"
    )
    settings: Optional[Dict[str, Any]] = Field(None, description="Настройки")
    activity_metadata: Optional[Dict[str, Any]] = Field(None, description="Метаданные")
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)


class DashboardResponse(DashboardBase, ResponseSchema):
    """Схема ответа для дашборда"""

    pass


class DashboardDetailed(DashboardResponse):
    """
    Детальная схема дашборда с виджетами.
    """

    widgets: List[DashboardWidgetResponse] = Field(
        default_factory=list, description="Виджеты дашборда"
    )
    widgets_count: int = Field(0, ge=0, description="Количество виджетов")
    last_accessed_at: Optional[datetime] = Field(
        None, description="Дата последнего доступа"
    )
    access_count: int = Field(0, ge=0, description="Количество обращений")

    # Права доступа
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_share: bool = Field(False, description="Можно ли делиться")


# === Пользовательские настройки ===


class UserDashboardPreferences(UserRelatedSchema):
    """
    Пользовательские настройки дашборда.
    """

    default_dashboard_id: Optional[int] = Field(
        None, gt=0, description="ID дашборда по умолчанию"
    )
    theme: Theme = Field(Theme.AUTO, description="Предпочитаемая тема")
    layout: DashboardLayout = Field(
        DashboardLayout.GRID_3x3, description="Предпочитаемый макет"
    )
    auto_refresh: bool = Field(True, description="Автообновление по умолчанию")
    refresh_interval: int = Field(
        300, ge=30, le=3600, description="Интервал обновления по умолчанию"
    )
    notifications_enabled: bool = Field(True, description="Включены ли уведомления")
    email_notifications: bool = Field(False, description="Email уведомления")
    sound_notifications: bool = Field(False, description="Звуковые уведомления")
    compact_mode: bool = Field(False, description="Компактный режим")
    sidebar_collapsed: bool = Field(False, description="Свернута ли боковая панель")
    show_tooltips: bool = Field(True, description="Показывать подсказки")
    language: str = Field("en", max_length=10, description="Язык интерфейса")
    timezone: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Часовой пояс"
    )
    date_format: str = Field("YYYY-MM-DD", max_length=20, description="Формат даты")
    time_format: str = Field("HH:mm", max_length=10, description="Формат времени")
    custom_settings: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="Пользовательские настройки"
    )


class UserDashboardPreferencesUpdate(UpdateSchema):
    """Схема обновления настроек дашборда пользователя"""

    default_dashboard_id: Optional[int] = Field(
        None, gt=0, description="ID дашборда по умолчанию"
    )
    theme: Optional[Theme] = Field(None, description="Тема")
    layout: Optional[DashboardLayout] = Field(None, description="Макет")
    auto_refresh: Optional[bool] = Field(None, description="Автообновление")
    refresh_interval: Optional[int] = Field(
        None, ge=30, le=3600, description="Интервал обновления"
    )
    notifications_enabled: Optional[bool] = Field(None, description="Уведомления")
    email_notifications: Optional[bool] = Field(None, description="Email уведомления")
    sound_notifications: Optional[bool] = Field(
        None, description="Звуковые уведомления"
    )
    compact_mode: Optional[bool] = Field(None, description="Компактный режим")
    sidebar_collapsed: Optional[bool] = Field(
        None, description="Боковая панель свернута"
    )
    show_tooltips: Optional[bool] = Field(None, description="Показывать подсказки")
    language: Optional[str] = Field(None, max_length=10, description="Язык")
    timezone: Optional[str] = Field(
        None, max_length=FieldLimits.SHORT_STRING_MAX, description="Часовой пояс"
    )
    date_format: Optional[str] = Field(None, max_length=20, description="Формат даты")
    time_format: Optional[str] = Field(
        None, max_length=10, description="Формат времени"
    )
    custom_settings: Optional[Dict[str, Any]] = Field(
        None, description="Пользовательские настройки"
    )


# === Списки и пагинация ===


class DashboardListResponse(ListResponseSchema[DashboardResponse]):
    """Список дашбордов с пагинацией"""

    pass


class DashboardWidgetListResponse(ListResponseSchema[DashboardWidgetResponse]):
    """Список виджетов с пагинацией"""

    pass


class DashboardActivityListResponse(ListResponseSchema[DashboardActivityResponse]):
    """Список активности с пагинацией"""

    pass


class DashboardNotificationListResponse(
    ListResponseSchema[DashboardNotificationResponse]
):
    """Список уведомлений с пагинацией"""

    pass


# === Поиск и фильтрация ===


class DashboardSearchRequest(SearchRequest):
    """Запрос поиска дашбордов"""

    layouts: Optional[List[DashboardLayout]] = Field(
        None, description="Фильтр по макетам"
    )
    themes: Optional[List[Theme]] = Field(None, description="Фильтр по темам")
    is_public: Optional[bool] = Field(None, description="Публичные дашборды")
    is_template: Optional[bool] = Field(None, description="Шаблоны дашбордов")
    is_active: Optional[bool] = Field(None, description="Активные дашборды")
    user_ids: Optional[List[int]] = Field(None, description="Фильтр по пользователям")


class ActivityFilter(BaseSchema):
    """Фильтр активности"""

    activity_types: Optional[List[ActivityType]] = Field(
        None, description="Типы активности"
    )
    user_ids: Optional[List[int]] = Field(None, description="ID пользователей")
    entity_types: Optional[List[str]] = Field(None, description="Типы сущностей")
    date_range: Optional[DateRangeFilter] = Field(None, description="Диапазон дат")


class NotificationFilter(BaseSchema):
    """Фильтр уведомлений"""

    types: Optional[List[NotificationType]] = Field(
        None, description="Типы уведомлений"
    )
    priorities: Optional[List[NotificationPriority]] = Field(
        None, description="Приоритеты"
    )
    is_read: Optional[bool] = Field(None, description="Прочитанные")
    is_dismissed: Optional[bool] = Field(None, description="Отклоненные")
    date_range: Optional[DateRangeFilter] = Field(None, description="Диапазон дат")


# === Аналитика и отчеты ===


class DashboardAnalytics(StatisticsSchema):
    """
    Аналитика дашборда.
    """

    total_dashboards: int = Field(0, ge=0, description="Общее количество дашбордов")
    public_dashboards: int = Field(0, ge=0, description="Публичных дашбордов")
    template_dashboards: int = Field(0, ge=0, description="Шаблонов дашбордов")

    total_widgets: int = Field(0, ge=0, description="Общее количество виджетов")
    active_widgets: int = Field(0, ge=0, description="Активных виджетов")

    total_activities: int = Field(0, ge=0, description="Общее количество активностей")
    activities_today: int = Field(0, ge=0, description="Активностей сегодня")

    total_notifications: int = Field(
        0, ge=0, description="Общее количество уведомлений"
    )
    unread_notifications: int = Field(0, ge=0, description="Непрочитанных уведомлений")

    # Статистика использования
    most_used_layouts: List[Dict[str, Any]] = Field(
        default_factory=list, description="Наиболее используемые макеты"
    )
    most_used_themes: List[Dict[str, Any]] = Field(
        default_factory=list, description="Наиболее используемые темы"
    )
    most_used_widgets: List[Dict[str, Any]] = Field(
        default_factory=list, description="Наиболее используемые виджеты"
    )

    # Тренды
    dashboard_creation_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды создания дашбордов"
    )
    activity_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды активности"
    )
    user_engagement: List[Dict[str, Any]] = Field(
        default_factory=list, description="Вовлеченность пользователей"
    )


# === Массовые операции ===


class DashboardBulkUpdate(BaseSchema):
    """Массовое обновление дашбордов"""

    dashboard_ids: List[int] = Field(..., min_length=1, description="ID дашбордов")
    update_data: DashboardUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Причина обновления"
    )


class WidgetBulkUpdate(BaseSchema):
    """Массовое обновление виджетов"""

    widget_ids: List[int] = Field(..., min_length=1, description="ID виджетов")
    update_data: DashboardWidgetUpdate = Field(..., description="Данные для обновления")


class NotificationBulkUpdate(BaseSchema):
    """Массовое обновление уведомлений"""

    notification_ids: List[int] = Field(..., min_length=1, description="ID уведомлений")
    update_data: NotificationUpdate = Field(..., description="Данные для обновления")


# === Экспорт и импорт ===


class DashboardExportRequest(BaseSchema):
    """Запрос экспорта дашборда"""

    dashboard_id: int = Field(..., gt=0, description="ID дашборда")
    include_widgets: bool = Field(True, description="Включить виджеты")
    include_data: bool = Field(False, description="Включить данные")
    format: str = Field(
        "json", regex="^(json|yaml|xml)$", description="Формат экспорта"
    )


class DashboardImportRequest(BaseSchema):
    """Запрос импорта дашборда"""

    data: Dict[str, Any] = Field(..., description="Данные дашборда")
    overwrite_existing: bool = Field(False, description="Перезаписать существующий")
    import_widgets: bool = Field(True, description="Импортировать виджеты")


# === Константы и утилиты ===


class DashboardConfig:
    """
    Конфигурация схем дашборда.
    """

    # Схемы для различных контекстов
    MINIMAL = DashboardResponse
    STANDARD = DashboardDetailed
    LIST = DashboardListResponse
    SEARCH = DashboardSearchRequest

    # Лимиты
    MAX_WIDGETS_PER_DASHBOARD = 50
    MAX_DASHBOARDS_PER_USER = 20
    MAX_NOTIFICATIONS_PER_USER = 1000
    MAX_ACTIVITIES_PER_PAGE = 100

    # Настройки по умолчанию
    DEFAULT_REFRESH_INTERVAL = 300  # 5 минут
    DEFAULT_GRID_SIZE = 12
    DEFAULT_WIDGET_WIDTH = 4
    DEFAULT_WIDGET_HEIGHT = 3

    # Типы виджетов по категориям
    WIDGET_CATEGORIES = {
        "analytics": [
            WidgetType.STATS_OVERVIEW,
            WidgetType.KPI_METRICS,
            WidgetType.PROGRESS_TRACKER,
        ],
        "charts": [
            WidgetType.CHART_LINE,
            WidgetType.CHART_BAR,
            WidgetType.CHART_PIE,
            WidgetType.CHART_DONUT,
        ],
        "lists": [
            WidgetType.PROJECT_LIST,
            WidgetType.REQUIREMENT_LIST,
            WidgetType.RECENT_DOCUMENTS,
        ],
        "interactive": [
            WidgetType.QUICK_ACTIONS,
            WidgetType.CALENDAR,
            WidgetType.NOTIFICATIONS,
        ],
        "feeds": [WidgetType.ACTIVITY_FEED, WidgetType.TEAM_PERFORMANCE],
    }

    # Размеры виджетов по типам
    WIDGET_DEFAULT_SIZES = {
        WidgetType.STATS_OVERVIEW: {"width": 6, "height": 3},
        WidgetType.CHART_LINE: {"width": 8, "height": 4},
        WidgetType.CHART_PIE: {"width": 4, "height": 4},
        WidgetType.PROJECT_LIST: {"width": 6, "height": 6},
        WidgetType.ACTIVITY_FEED: {"width": 4, "height": 8},
        WidgetType.QUICK_ACTIONS: {"width": 3, "height": 2},
        WidgetType.NOTIFICATIONS: {"width": 4, "height": 5},
    }


# === Быстрые схемы для CRUD ===


class ActivityItem(BaseSchema):
    """Элемент активности для быстрого доступа."""

    id: int = Field(..., description="ID активности")
    title: str = Field(..., description="Заголовок")
    activity_type: str = Field(..., description="Тип активности")
    created_at: datetime = Field(..., description="Время создания")


class QuickProject(BaseSchema):
    """Быстрая схема проекта для дашборда."""

    id: int = Field(..., description="ID проекта")
    name: str = Field(..., description="Название")
    status: str = Field(..., description="Статус")


class QuickRequirement(BaseSchema):
    """Быстрая схема требования для дашборда."""

    id: int = Field(..., description="ID требования")
    title: str = Field(..., description="Заголовок")
    status: str = Field(..., description="Статус")
    priority: str = Field(..., description="Приоритет")


# === Дополнительные схемы для дашборда ===


class ProjectPerformanceStats(BaseSchema):
    """Статистика производительности проектов."""

    projects_total: int = Field(0, ge=0, description="Общее количество проектов")
    projects_active: int = Field(0, ge=0, description="Активные проекты")
    completion_rate: float = Field(0.0, ge=0, le=100, description="Процент завершения")
    average_duration: Optional[int] = Field(None, description="Средняя длительность в днях")


class TrendingMetricsData(BaseSchema):
    """Данные трендинговых метрик."""

    requirements_trend: List[Dict[str, Any]] = Field(default_factory=list, description="Тренд требований")
    projects_trend: List[Dict[str, Any]] = Field(default_factory=list, description="Тренд проектов")
    activity_trend: List[Dict[str, Any]] = Field(default_factory=list, description="Тренд активности")


class QuickAccess(BaseSchema):
    """Быстрый доступ к данным."""

    recent_projects: List[QuickProject] = Field(default_factory=list, description="Недавние проекты")
    recent_requirements: List[QuickRequirement] = Field(default_factory=list, description="Недавние требования")
    pinned_items: List[Dict[str, Any]] = Field(default_factory=list, description="Закрепленные элементы")


class SystemMetrics(BaseSchema):
    """Системные метрики."""

    cpu_usage: float = Field(0.0, ge=0, le=100, description="Использование CPU")
    memory_usage: float = Field(0.0, ge=0, le=100, description="Использование памяти")
    disk_usage: float = Field(0.0, ge=0, le=100, description="Использование диска")
    uptime: int = Field(0, ge=0, description="Время работы системы в секундах")


class TimelineDataPoint(BaseSchema):
    """Точка данных временной шкалы."""

    timestamp: datetime = Field(..., description="Временная метка")
    value: float = Field(..., description="Значение")
    label: Optional[str] = Field(None, description="Метка")


class DistributionDataPoint(BaseSchema):
    """Точка данных распределения."""

    label: str = Field(..., description="Метка")
    value: float = Field(..., description="Значение")
    percentage: float = Field(..., ge=0, le=100, description="Процент")


class ProjectTrendDataPoint(BaseSchema):
    """Точка данных тренда проекта."""

    project_id: int = Field(..., gt=0, description="ID проекта")
    project_name: str = Field(..., description="Название проекта")
    trend_data: List[TimelineDataPoint] = Field(default_factory=list, description="Данные тренда")


class TimelineQueryParams(BaseSchema):
    """Параметры запроса временной шкалы."""

    start_date: Optional[datetime] = Field(None, description="Дата начала")
    end_date: Optional[datetime] = Field(None, description="Дата окончания")
    granularity: str = Field("day", description="Гранулярность (day, week, month)")


class DistributionQueryParams(BaseSchema):
    """Параметры запроса распределения."""

    entity_type: str = Field(..., description="Тип сущности")
    field_name: str = Field(..., description="Имя поля")
    limit: int = Field(10, ge=1, le=50, description="Лимит результатов")


class ProjectTrendsQueryParams(BaseSchema):
    """Параметры запроса трендов проектов."""

    project_ids: Optional[List[int]] = Field(None, description="Список ID проектов")
    start_date: Optional[datetime] = Field(None, description="Дата начала")
    end_date: Optional[datetime] = Field(None, description="Дата окончания")
    metric: str = Field("progress", description="Метрика для анализа")


class MyDashboardResponse(BaseSchema):
    """Ответ пользовательского дашборда."""

    user_preferences: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Настройки пользователя")
    widgets: List[Dict[str, Any]] = Field(default_factory=list, description="Виджеты")
    layout: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Макет дашборда")


class DashboardStats(BaseSchema):
    """Комплексная статистика дашборда."""

    overview: DashboardOverviewStats = Field(..., description="Обзорная статистика")
    recent_activity: List[ActivityItem] = Field(default_factory=list, description="Недавняя активность")
    project_performance: ProjectPerformanceStats = Field(..., description="Производительность проектов")
    trending_metrics: TrendingMetricsData = Field(..., description="Трендинговые метрики")
    quick_access: QuickAccess = Field(..., description="Быстрый доступ")


# === Псевдонимы для обратной совместимости ===

UserPreferences = UserDashboardPreferences  # Пользовательские настройки
