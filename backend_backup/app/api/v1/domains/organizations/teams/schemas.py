"""
Teams Management Schemas.

Pydantic models для операций с командами.
"""

from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TeamType(str, Enum):
    """Типы команд."""

    DEVELOPMENT = "development"
    QA = "qa"
    DEVOPS = "devops"
    DESIGN = "design"
    PRODUCT = "product"
    ANALYSIS = "analysis"
    SUPPORT = "support"
    MANAGEMENT = "management"
    CROSS_FUNCTIONAL = "cross_functional"
    OTHER = "other"

class TeamStatus(str, Enum):
    """Статусы команд."""

    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"
    FORMING = "forming"

# # Base Schemas
# 

class TeamBase(BaseModel):
    """Базовая схема команды."""

    name: str = Field(..., min_length=1, max_length=255, description="Название команды")
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание команды"
    )
    team_type: TeamType = Field(TeamType.OTHER, description="Тип команды")
    max_members: Optional[int] = Field(
        None, ge=1, le=100, description="Максимальное количество участников"
    )

    model_config = ConfigDict(
        json_schema_extra={
            "examples": [
                {
                    "name": "Backend Team",
                    "description": "Backend development team",
                    "team_type": "development",
                    "max_members": 10,
                }
            ]
        }
    )

class TeamCreate(TeamBase):
    """Схема для создания команды."""

    department_id: int = Field(..., description="ID департамента")
    lead_user_id: Optional[int] = Field(None, description="ID лидера команды")

class TeamUpdate(BaseModel):
    """Схема для обновления команды."""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = Field(None, max_length=1000)
    team_type: Optional[TeamType] = Field(None)
    max_members: Optional[int] = Field(None, ge=1, le=100)
    status: Optional[TeamStatus] = Field(None)
    lead_user_id: Optional[int] = Field(None)

# # Response Schemas
# 

class TeamRead(TeamBase):
    """Схема для чтения информации о команде."""

    id: int = Field(..., description="ID команды")
    department_id: int = Field(..., description="ID департамента")
    lead_user_id: Optional[int] = Field(None, description="ID лидера команды")
    status: TeamStatus = Field(..., description="Статус команды")
    created_at: datetime = Field(..., description="Дата создания")
    updated_at: Optional[datetime] = Field(None, description="Дата обновления")

    # Статистика
    members_count: int = Field(0, description="Количество участников")
    projects_count: int = Field(0, description="Количество проектов")

    # Department info
    department_name: str = Field(..., description="Название департамента")

    model_config = ConfigDict(from_attributes=True)

class TeamListResponse(BaseModel):
    """Схема для списка команд."""

    teams: List[TeamRead] = Field(..., description="Список команд")
    total: int = Field(..., description="Общее количество")
    skip: int = Field(..., description="Пропущено записей")
    limit: int = Field(..., description="Лимит записей")

# # Team Members Schemas
# 

class TeamMemberRole(str, Enum):
    """Роли участников команды."""

    OWNER = "owner"
    ADMIN = "admin"
    TEAM_LEAD = "team_lead"
    TECH_LEAD = "tech_lead"
    SCRUM_MASTER = "scrum_master"
    PRODUCT_OWNER = "product_owner"
    SENIOR_DEVELOPER = "senior_developer"
    DEVELOPER = "developer"
    ANALYST = "analyst"
    TESTER = "tester"
    DESIGNER = "designer"
    MEMBER = "member"
    VIEWER = "viewer"

class TeamMemberBase(BaseModel):
    """Базовая схема участника команды."""

    user_id: int = Field(..., description="ID пользователя")
    role: TeamMemberRole = Field(TeamMemberRole.MEMBER, description="Роль в команде")
    joined_at: Optional[datetime] = Field(None, description="Дата присоединения")

class TeamMemberAdd(BaseModel):
    """Схема для добавления участника в команду."""

    user_id: int = Field(..., description="ID пользователя")
    role: TeamMemberRole = Field(TeamMemberRole.MEMBER, description="Роль")

class TeamMemberRoleUpdate(BaseModel):
    """Схема для обновления роли участника команды."""

    role: TeamMemberRole = Field(..., description="Новая роль")

class TeamMemberRead(TeamMemberBase):
    """Схема для чтения информации об участнике команды."""

    id: int = Field(..., description="ID записи")
    team_id: int = Field(..., description="ID команды")

    # User info (joined from user table)
    user_name: str = Field(..., description="Имя пользователя")
    user_email: str = Field(..., description="Email пользователя")
    user_avatar_url: Optional[str] = Field(None, description="URL аватара")
    user_title: Optional[str] = Field(None, description="Должность")

    created_at: datetime = Field(..., description="Дата создания записи")

    model_config = ConfigDict(from_attributes=True)

class TeamMembersResponse(BaseModel):
    """Схема для списка участников команды."""

    members: List[TeamMemberRead] = Field(..., description="Список участников")
    team_id: int = Field(..., description="ID команды")
    total: int = Field(..., description="Общее количество")
    skip: int = Field(..., description="Пропущено записей")
    limit: int = Field(..., description="Лимит записей")

# # Team Statistics Schemas
# 

class TeamStats(BaseModel):
    """Схема статистики команды."""

    team_id: int = Field(..., description="ID команды")
    members_count: int = Field(0, description="Количество участников")
    projects_count: int = Field(0, description="Количество проектов")

    # Requirements statistics
    active_requirements: int = Field(0, description="Активные требования")
    completed_requirements: int = Field(0, description="Завершенные требования")
    in_review_requirements: int = Field(0, description="Требования на проверке")

    # Activity statistics
    last_activity_date: Optional[datetime] = Field(
        None, description="Дата последней активности"
    )
    weekly_commits: int = Field(0, description="Коммиты за неделю")
    monthly_tasks_completed: int = Field(0, description="Завершенные задачи за месяц")

    model_config = ConfigDict(from_attributes=True)

class TeamStatsResponse(BaseModel):
    """Схема ответа статистики команды."""

    stats: TeamStats = Field(..., description="Статистика команды")
    period: str = Field("current", description="Период статистики")
