"""
Схемы для модели Team и TeamMember.
Мигрировано на новую архитектуру SQLModel с базовыми классами.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
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
from app.core.constants import TeamRole


# === Перечисления ===


class TeamStatus(str, Enum):
    """Статусы команды"""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    DISBANDED = "disbanded"
    ON_HOLD = "on_hold"


# TeamRole импортирована из app.core.constants


class TeamType(str, Enum):
    """Типы команд"""

    DEVELOPMENT = "development"
    RESEARCH = "research"
    SUPPORT = "support"
    TESTING = "testing"
    DESIGN = "design"
    OPERATIONS = "operations"
    CROSS_FUNCTIONAL = "cross_functional"


class TeamVisibility(str, Enum):
    """Видимость команды"""

    PUBLIC = "public"
    PRIVATE = "private"
    INTERNAL = "internal"
    RESTRICTED = "restricted"


# === Базовые схемы для команды ===


class TeamBase(BaseSchema, ValidationMixin):
    """
    Базовая схема команды.
    Содержит основные поля без служебных данных.
    """

    name: str = Field(
        ...,
        min_length=1,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " команды",
    )
    code: str = Field(
        ...,
        min_length=2,
        max_length=FieldLimits.CODE_MAX,
        description="Уникальный код команды",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " команды",
    )
    team_type: Optional[TeamType] = Field(
        TeamType.DEVELOPMENT, description="Тип команды"
    )
    visibility: TeamVisibility = Field(
        TeamVisibility.PRIVATE, description="Видимость команды"
    )
    status: TeamStatus = Field(TeamStatus.ACTIVE, description="Статус команды")
    max_members: Optional[int] = Field(
        None,
        ge=1,
        le=FieldLimits.TEAM_MAX_MEMBERS,
        description="Максимальное количество участников",
    )
    location: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Местоположение команды",
    )
    timezone: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Часовой пояс команды",
    )
    tags: Optional[List[str]] = Field(default_factory=list, description="Теги команды")
    is_active: bool = Field(True, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        """Валидация названия команды"""
        v = cls.validate_non_empty_string(v, "name")

        # Проверяем на недопустимые символы
        forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
        if any(char in v for char in forbidden_chars):
            raise ValueError(
                f"Team name contains forbidden characters: {forbidden_chars}"
            )

        return v

    @field_validator("code")
    @classmethod
    def validate_code(cls, v: str) -> str:
        """Валидация кода команды"""
        v = cls.validate_non_empty_string(v, "code")
        v = v.lower().strip()

        # Код должен содержать только буквы, цифры, дефисы и подчеркивания
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError(
                "Team code can only contain letters, numbers, hyphens and underscores"
            )

        return v

    @field_validator("description")
    @classmethod
    def validate_description(cls, v: Optional[str]) -> Optional[str]:
        """Валидация описания команды"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
            if len(v) > FieldLimits.TEXT_MAX:
                raise ValueError(
                    f"Description cannot exceed {FieldLimits.TEXT_MAX} characters"
                )
        return v

    @field_validator("tags")
    @classmethod
    def validate_tags(cls, v: Optional[List[str]]) -> List[str]:
        """Валидация тегов"""
        if v is None:
            return []

        validated_tags = []
        for tag in v:
            if isinstance(tag, str) and tag.strip():
                clean_tag = tag.strip().lower()
                if len(clean_tag) <= 30 and clean_tag not in validated_tags:
                    validated_tags.append(clean_tag)

        return validated_tags[:10]  # Максимум 10 тегов


# === CRUD схемы для команды ===


class TeamCreate(TeamBase, CreateSchema, UserRelatedSchema):
    """
    Схема для создания команды.
    Автоматически добавляет создателя как владельца команды.
    """

    company_id: Optional[int] = Field(None, gt=0, description="ID компании")
    project_id: Optional[int] = Field(None, gt=0, description="ID связанного проекта")

    @field_validator("company_id", "project_id")
    @classmethod
    def validate_optional_ids(cls, v: Optional[int]) -> Optional[int]:
        """Валидация опциональных ID"""
        if v is not None and v <= 0:
            raise ValueError("ID must be a positive integer when provided")
        return v


class TeamUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления команды.
    Все поля опциональны для частичных обновлений.
    """

    name: Optional[str] = Field(
        None,
        min_length=1,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description=StandardDescriptions.NAME + " команды",
    )
    description: Optional[str] = Field(
        None,
        max_length=FieldLimits.TEXT_MAX,
        description=StandardDescriptions.DESCRIPTION + " команды",
    )
    team_type: Optional[TeamType] = Field(None, description="Тип команды")
    visibility: Optional[TeamVisibility] = Field(None, description="Видимость команды")
    status: Optional[TeamStatus] = Field(None, description="Статус команды")
    max_members: Optional[int] = Field(
        None,
        ge=1,
        le=FieldLimits.TEAM_MAX_MEMBERS,
        description="Максимальное количество участников",
    )
    location: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Местоположение команды",
    )
    timezone: Optional[str] = Field(
        None,
        max_length=FieldLimits.SHORT_STRING_MAX,
        description="Часовой пояс команды",
    )
    tags: Optional[List[str]] = Field(None, description="Теги команды")
    is_active: Optional[bool] = Field(None, description=StandardDescriptions.IS_ACTIVE)

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        """Валидация названия при обновлении"""
        if v is not None:
            v = cls.validate_non_empty_string(v, "name")

            forbidden_chars = ["<", ">", "&", '"', "'", ";", "|"]
            if any(char in v for char in forbidden_chars):
                raise ValueError(
                    f"Team name contains forbidden characters: {forbidden_chars}"
                )

        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data: Dict[str, Any]) -> Dict[str, Any]:
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class TeamResponse(TeamBase, ResponseSchema, UserRelatedSchema):
    """
    Схема ответа для команды.
    Включает все данные из БД включая связи.
    """

    company_id: Optional[int] = None
    project_id: Optional[int] = None


# === Базовые схемы для участника команды ===


class TeamMemberBase(BaseSchema, ValidationMixin):
    """
    Базовая схема участника команды.
    """

    role: TeamRole = Field(TeamRole.DEVELOPER, description="Роль участника в команде")
    title: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Должность участника",
    )
    hourly_rate: Optional[float] = Field(None, ge=0, description="Почасовая ставка")
    workload_percentage: Optional[int] = Field(
        None, ge=0, le=100, description="Процент загрузки (0-100%)"
    )
    notes: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Заметки о участнике",
    )
    start_date: Optional[datetime] = Field(
        None, description="Дата начала работы в команде"
    )
    end_date: Optional[datetime] = Field(
        None, description="Планируемая дата окончания работы"
    )
    is_active: bool = Field(True, description="Активен ли участник")

    @field_validator("title", "notes")
    @classmethod
    def validate_text_fields(cls, v: Optional[str]) -> Optional[str]:
        """Валидация текстовых полей"""
        if v is not None:
            v = v.strip()
            if not v:
                return None
        return v

    @model_validator(mode="after")
    def validate_date_range(self):
        """Валидация диапазона дат"""
        if self.start_date and self.end_date:
            if self.start_date >= self.end_date:
                raise ValueError("End date must be after start date")

        return self


# === CRUD схемы для участника команды ===


class TeamMemberCreate(TeamMemberBase, CreateSchema):
    """
    Схема для добавления участника в команду.
    """

    user_id: int = Field(..., gt=0, description="ID пользователя")
    team_id: int = Field(..., gt=0, description="ID команды")

    @field_validator("user_id", "team_id")
    @classmethod
    def validate_required_ids(cls, v: int) -> int:
        """Валидация обязательных ID"""
        if v <= 0:
            raise ValueError("ID must be a positive integer")
        return v


class TeamMemberUpdate(UpdateSchema, ValidationMixin):
    """
    Схема для обновления участника команды.
    """

    role: Optional[TeamRole] = Field(None, description="Роль участника")
    title: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Должность участника",
    )
    hourly_rate: Optional[float] = Field(None, ge=0, description="Почасовая ставка")
    workload_percentage: Optional[int] = Field(
        None, ge=0, le=100, description="Процент загрузки"
    )
    notes: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Заметки"
    )
    start_date: Optional[datetime] = Field(None, description="Дата начала работы")
    end_date: Optional[datetime] = Field(None, description="Дата окончания работы")
    is_active: Optional[bool] = Field(None, description="Активен ли участник")


class TeamMemberResponse(TeamMemberBase, ResponseSchema):
    """
    Схема ответа для участника команды.
    """

    user_id: int
    team_id: int
    joined_at: datetime
    left_at: Optional[datetime] = None


# === Расширенные схемы ===


class TeamWithRelations(TeamResponse):
    """
    Схема команды с информацией о связанных сущностях.
    """

    owner_name: Optional[str] = Field(None, description="Имя владельца команды")
    company_name: Optional[str] = Field(None, description="Название компании")
    project_name: Optional[str] = Field(None, description="Название проекта")


class TeamMemberWithRelations(TeamMemberResponse):
    """
    Схема участника команды с информацией о пользователе.
    """

    user_name: Optional[str] = Field(None, description="Имя пользователя")
    user_email: Optional[str] = Field(None, description="Email пользователя")
    user_username: Optional[str] = Field(None, description="Username пользователя")
    team_name: Optional[str] = Field(None, description="Название команды")


class TeamDetailed(TeamWithRelations):
    """
    Детальная схема команды с полной информацией.
    """

    members: List[TeamMemberWithRelations] = Field(
        default_factory=list, description="Участники команды"
    )

    # Статистика участников
    member_count: int = Field(0, ge=0, description="Общее количество участников")
    active_member_count: int = Field(0, ge=0, description="Активных участников")

    # Распределение по ролям
    roles_distribution: Dict[str, int] = Field(
        default_factory=dict, description="Распределение участников по ролям"
    )

    # Загруженность команды
    average_workload: float = Field(
        0.0, ge=0, le=100, description="Средняя загрузка команды"
    )
    total_hourly_cost: Optional[float] = Field(
        None, ge=0, description="Общая почасовая стоимость"
    )

    # Права доступа для текущего пользователя
    can_edit: bool = Field(False, description="Можно ли редактировать")
    can_delete: bool = Field(False, description="Можно ли удалить")
    can_manage_members: bool = Field(
        False, description="Можно ли управлять участниками"
    )
    can_invite: bool = Field(False, description="Можно ли приглашать участников")


# === Списки и пагинация ===


class TeamListResponse(ListResponseSchema[TeamWithRelations]):
    """Список команд с пагинацией"""

    pass


class TeamMemberListResponse(ListResponseSchema[TeamMemberWithRelations]):
    """Список участников команды с пагинацией"""

    pass


class TeamDetailedListResponse(ListResponseSchema[TeamDetailed]):
    """Детальный список команд с пагинацией"""

    pass


# === Поиск и фильтрация ===


class TeamSearchRequest(SearchRequest):
    """
    Запрос поиска команд.
    """

    statuses: Optional[List[TeamStatus]] = Field(None, description="Фильтр по статусам")
    types: Optional[List[TeamType]] = Field(None, description="Фильтр по типам команд")
    visibility: Optional[List[TeamVisibility]] = Field(
        None, description="Фильтр по видимости"
    )
    owner_ids: Optional[List[int]] = Field(None, description="Фильтр по владельцам")
    company_ids: Optional[List[int]] = Field(None, description="Фильтр по компаниям")
    project_ids: Optional[List[int]] = Field(None, description="Фильтр по проектам")
    is_active: Optional[bool] = Field(None, description="Активные/неактивные команды")
    tags: Optional[List[str]] = Field(None, description="Фильтр по тегам")
    has_space: Optional[bool] = Field(None, description="Есть ли свободные места")


class TeamFilter(BaseSchema):
    """
    Расширенный фильтр для команд.
    """

    member_count_min: Optional[int] = Field(
        None, ge=0, description="Минимальное количество участников"
    )
    member_count_max: Optional[int] = Field(
        None, ge=0, description="Максимальное количество участников"
    )
    workload_min: Optional[float] = Field(
        None, ge=0, le=100, description="Минимальная загрузка команды"
    )
    workload_max: Optional[float] = Field(
        None, ge=0, le=100, description="Максимальная загрузка команды"
    )
    hourly_cost_min: Optional[float] = Field(
        None, ge=0, description="Минимальная почасовая стоимость"
    )
    hourly_cost_max: Optional[float] = Field(
        None, ge=0, description="Максимальная почасовая стоимость"
    )
    location: Optional[str] = Field(None, description="Местоположение")
    timezone: Optional[str] = Field(None, description="Часовой пояс")
    date_range: Optional[DateRangeFilter] = Field(
        None, description="Диапазон дат создания"
    )


# === Статистика ===


class TeamStatistics(StatisticsSchema):
    """
    Схема статистики команд.
    """

    total_teams: int = Field(0, ge=0, description="Общее количество команд")
    active_teams: int = Field(0, ge=0, description="Активных команд")
    total_members: int = Field(0, ge=0, description="Общее количество участников")
    average_team_size: float = Field(0.0, ge=0, description="Средний размер команды")

    by_status: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по статусам"
    )
    by_type: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по типам"
    )
    by_visibility: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение по видимости"
    )
    by_role: List[Dict[str, Any]] = Field(
        default_factory=list, description="Распределение участников по ролям"
    )

    team_growth: List[Dict[str, Any]] = Field(
        default_factory=list, description="Рост количества команд"
    )
    workload_trends: List[Dict[str, Any]] = Field(
        default_factory=list, description="Тренды загрузки команд"
    )
    most_used_tags: List[Dict[str, Any]] = Field(
        default_factory=list, description="Самые популярные теги"
    )


# === Управление участниками ===


class TeamInvitation(BaseSchema):
    """
    Схема приглашения в команду.
    """

    email: str = Field(..., description="Email приглашаемого пользователя")
    role: TeamRole = Field(TeamRole.DEVELOPER, description="Предлагаемая роль")
    message: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Персональное сообщение",
    )
    expires_at: Optional[datetime] = Field(
        None, description="Дата истечения приглашения"
    )


class TeamInvitationResponse(TeamInvitation, ResponseSchema):
    """Схема ответа для приглашения в команду"""

    team_id: int
    invited_by_id: int
    status: str = "pending"
    invited_by_name: Optional[str] = None
    team_name: Optional[str] = None


class TeamMemberTransfer(BaseSchema):
    """
    Схема перевода участника между командами.
    """

    source_team_id: int = Field(..., gt=0, description="Исходная команда")
    target_team_id: int = Field(..., gt=0, description="Целевая команда")
    new_role: Optional[TeamRole] = Field(None, description="Новая роль")
    transfer_date: Optional[datetime] = Field(None, description="Дата перевода")
    reason: Optional[str] = Field(
        None, max_length=FieldLimits.MEDIUM_STRING_MAX, description="Причина перевода"
    )


# === Массовые операции ===


class TeamBulkUpdate(BaseSchema):
    """
    Схема для массового обновления команд.
    """

    team_ids: List[int] = Field(..., min_length=1, description="Список ID команд")
    update_data: TeamUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


class TeamMemberBulkUpdate(BaseSchema):
    """
    Схема для массового обновления участников команды.
    """

    member_ids: List[int] = Field(..., min_length=1, description="Список ID участников")
    update_data: TeamMemberUpdate = Field(..., description="Данные для обновления")
    reason: Optional[str] = Field(
        None,
        max_length=FieldLimits.MEDIUM_STRING_MAX,
        description="Причина массового обновления",
    )


# === Экспорт и импорт ===


class TeamExportRequest(BaseSchema):
    """
    Запрос на экспорт команд.
    """

    format: str = Field(
        "xlsx", regex="^(xlsx|csv|pdf|json)$", description="Формат экспорта"
    )
    filter: Optional[TeamFilter] = Field(None, description="Фильтр для экспорта")
    include_members: bool = Field(False, description="Включить участников команды")
    include_statistics: bool = Field(False, description="Включить статистику")
    include_inactive: bool = Field(False, description="Включить неактивных участников")


# === Статистика ===


class TeamStats(BaseSchema):
    """Статистика команды."""

    total_teams: int = Field(0, ge=0, description="Общее количество команд")
    active_teams: int = Field(0, ge=0, description="Активные команды")
    total_members: int = Field(0, ge=0, description="Общее количество участников")
    average_team_size: float = Field(0.0, ge=0, description="Средний размер команды")


class TeamMemberStats(BaseSchema):
    """Статистика участника команды."""

    total_members: int = Field(0, ge=0, description="Общее количество участников")
    active_members: int = Field(0, ge=0, description="Активные участники")
    team_leaders: int = Field(0, ge=0, description="Лидеры команд")
    team_owners: int = Field(0, ge=0, description="Владельцы команд")


# === Константы и утилиты ===


class TeamConfig:
    """
    Конфигурация схем команд.
    """

    # Схемы для различных контекстов
    MINIMAL = TeamResponse
    STANDARD = TeamWithRelations
    DETAILED = TeamDetailed
    LIST = TeamListResponse
    SEARCH = TeamSearchRequest

    # Ограничения
    MAX_TAGS_PER_TEAM = 10
    MAX_TAG_LENGTH = 30
    MAX_TEAM_MEMBERS = 100
    DEFAULT_MAX_MEMBERS = 20

    # Права по ролям
    ROLE_PERMISSIONS = {
        TeamRole.OWNER: [
            "edit_team",
            "delete_team",
            "manage_members",
            "invite_members",
            "remove_members",
            "change_roles",
            "view_statistics",
        ],
        TeamRole.ADMIN: [
            "edit_team",
            "manage_members",
            "invite_members",
            "remove_members",
            "view_statistics",
        ],
        TeamRole.TEAM_LEAD: ["invite_members", "view_statistics"],
        TeamRole.DEVELOPER: ["view_team"],
        TeamRole.OBSERVER: ["view_team"],
    }

    # Иерархия ролей (для автоматического назначения прав)
    ROLE_HIERARCHY = [
        TeamRole.OWNER,
        TeamRole.ADMIN,
        TeamRole.TEAM_LEAD,
        TeamRole.SENIOR_DEVELOPER,
        TeamRole.DEVELOPER,
        TeamRole.JUNIOR_DEVELOPER,
        TeamRole.ANALYST,
        TeamRole.DESIGNER,
        TeamRole.TESTER,
        TeamRole.DEVOPS,
        TeamRole.CONSULTANT,
        TeamRole.OBSERVER,
    ]


# === Дополнительные схемы для сервиса команд ===


class TeamDetailResponse(TeamResponse):
    """Детальная схема ответа для команды с дополнительной информацией."""

    members: List[TeamMemberResponse] = Field(default_factory=list, description="Список участников")
    statistics: Optional[TeamStats] = Field(None, description="Статистика команды")
    permissions: List[str] = Field(default_factory=list, description="Права текущего пользователя")


class TeamBulkCreate(BaseSchema):
    """Схема для массового создания команд."""

    teams: List[TeamCreate] = Field(..., min_length=1, max_length=50, description="Список команд для создания")
    assign_creator_as_owner: bool = Field(True, description="Назначить создателя владельцем")


class TeamMemberBulkAdd(BaseSchema):
    """Схема для массового добавления участников в команду."""

    team_id: int = Field(..., gt=0, description="ID команды")
    members: List[TeamMemberCreate] = Field(..., min_length=1, max_length=100, description="Список участников")
    send_invitations: bool = Field(True, description="Отправить приглашения")


class TeamPermissionCheck(BaseSchema):
    """Схема для проверки прав доступа к команде."""

    team_id: int = Field(..., gt=0, description="ID команды")
    user_id: int = Field(..., gt=0, description="ID пользователя")
    permission: str = Field(..., description="Проверяемое право")


class TeamPermissionResponse(BaseSchema):
    """Схема ответа на проверку прав доступа."""

    has_permission: bool = Field(..., description="Есть ли право доступа")
    user_role: Optional[TeamRole] = Field(None, description="Роль пользователя в команде")
    reason: Optional[str] = Field(None, description="Причина отказа в доступе")
    available_permissions: List[str] = Field(default_factory=list, description="Доступные права")
