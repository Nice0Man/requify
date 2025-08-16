"""
Team schemas for API serialization and validation.
"""

from datetime import datetime
from typing import List, Optional, Union

from pydantic import BaseModel, ConfigDict, Field, field_validator
from pydantic.types import constr

from app.models.constants import TeamRole, TeamStatus


# Base schemas
class TeamBase(BaseModel):
    """Base team schema with common fields"""

    name: str = Field(..., min_length=1, max_length=100, description="Название команды")
    code: str = Field(
        ..., min_length=1, max_length=50, description="Уникальный код команды"
    )
    description: Optional[str] = Field(
        None, max_length=1000, description="Описание команды"
    )
    is_public: bool = Field(False, description="Публичная ли команда")
    max_members: Optional[int] = Field(
        None, ge=1, le=100, description="Максимальное количество участников"
    )

    @field_validator("code")
    def validate_code(cls, v):
        if not v.replace("_", "").replace("-", "").isalnum():
            raise ValueError(
                "Код команды должен содержать только буквы, цифры, дефисы и подчеркивания"
            )
        return v.lower()

    @field_validator("name")
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError("Название команды не может быть пустым")
        return v.strip()


class TeamCreate(TeamBase):
    """Schema for creating a new team"""

    pass


class TeamUpdate(BaseModel):
    """Schema for updating an existing team"""

    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=1000)
    is_public: Optional[bool] = None
    max_members: Optional[int] = Field(None, ge=1, le=100)
    status: Optional[TeamStatus] = None

    @field_validator("name")
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError("Название команды не может быть пустым")
        return v.strip() if v else v


class TeamMemberBase(BaseModel):
    """Base team member schema"""

    role: TeamRole = Field(TeamRole.DEVELOPER, description="Роль участника в команде")
    title: Optional[str] = Field(
        None, max_length=100, description="Должность участника"
    )
    hourly_rate: Optional[float] = Field(None, ge=0, description="Почасовая ставка")
    notes: Optional[str] = Field(
        None, max_length=500, description="Заметки о участнике"
    )


class TeamMemberCreate(TeamMemberBase):
    """Schema for adding a member to a team"""

    user_id: int = Field(..., description="ID пользователя")


class TeamMemberUpdate(BaseModel):
    """Schema for updating a team member"""

    role: Optional[TeamRole] = None
    title: Optional[str] = Field(None, max_length=100)
    hourly_rate: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = Field(None, max_length=500)
    is_active: Optional[bool] = None


class TeamMemberResponse(TeamMemberBase):
    """Schema for team member response"""

    id: int
    user_id: int
    team_id: int
    is_active: bool
    joined_at: datetime
    left_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    # User information
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_username: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class TeamResponse(TeamBase):
    """Schema for team response"""

    id: int
    status: TeamStatus
    owner_id: int
    created_at: datetime
    updated_at: datetime

    # Owner information
    owner_name: Optional[str] = None
    owner_username: Optional[str] = None

    # Computed fields
    member_count: int = 0
    is_full: bool = False

    model_config = ConfigDict(from_attributes=True)


class TeamDetailResponse(TeamResponse):
    """Schema for detailed team response with members"""

    members: List[TeamMemberResponse] = []

    # Additional computed fields
    active_members_count: int = 0
    roles_distribution: dict = {}


class TeamListResponse(BaseModel):
    """Schema for team list response"""

    teams: List[TeamResponse]
    total: int
    page: int
    per_page: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# Bulk operations schemas
class TeamBulkCreate(BaseModel):
    """Schema for bulk team creation"""

    teams: List[TeamCreate] = Field(..., min_items=1, max_items=10)


class TeamBulkUpdate(BaseModel):
    """Schema for bulk team updates"""

    team_ids: List[int] = Field(..., min_items=1, max_items=50)
    updates: TeamUpdate


class TeamBulkDelete(BaseModel):
    """Schema for bulk team deletion"""

    team_ids: List[int] = Field(..., min_items=1, max_items=50)
    confirm: bool = Field(True, description="Подтверждение удаления")


# Member management schemas
class TeamMemberBulkAdd(BaseModel):
    """Schema for bulk adding members to team"""

    user_ids: List[int] = Field(..., min_items=1, max_items=20)
    role: TeamRole = TeamRole.DEVELOPER
    title: Optional[str] = None


class TeamMemberBulkRemove(BaseModel):
    """Schema for bulk removing members from team"""

    user_ids: List[int] = Field(..., min_items=1, max_items=20)
    confirm: bool = Field(True, description="Подтверждение удаления")


class TeamMemberBulkUpdate(BaseModel):
    """Schema for bulk updating team members"""

    member_ids: List[int] = Field(..., min_items=1, max_items=50)
    updates: TeamMemberUpdate


# Search and filter schemas
class TeamSearchRequest(BaseModel):
    """Schema for team search request"""

    query: Optional[str] = Field(None, min_length=1, max_length=100)
    status: Optional[TeamStatus] = None
    is_public: Optional[bool] = None
    owner_id: Optional[int] = None
    has_member: Optional[int] = None  # user_id
    min_members: Optional[int] = Field(None, ge=0)
    max_members: Optional[int] = Field(None, ge=0)

    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

    # Sorting
    sort_by: Optional[str] = Field(
        "created_at", pattern=r"^(name|code|created_at|updated_at|member_count)$"
    )
    sort_order: Optional[str] = Field("desc", pattern=r"^(asc|desc)$")


# Statistics schemas
class TeamStats(BaseModel):
    """Schema for team statistics"""

    total_teams: int = 0
    active_teams: int = 0
    inactive_teams: int = 0
    archived_teams: int = 0
    total_members: int = 0
    average_team_size: float = 0.0
    teams_by_role: dict = {}
    teams_by_status: dict = {}

    model_config = ConfigDict(from_attributes=True)


class TeamMemberStats(BaseModel):
    """Schema for team member statistics"""

    total_members: int = 0
    active_members: int = 0
    inactive_members: int = 0
    members_by_role: dict = {}
    average_tenure_days: float = 0.0

    model_config = ConfigDict(from_attributes=True)


# Permission schemas
class TeamPermissionCheck(BaseModel):
    """Schema for checking team permissions"""

    user_id: int
    team_id: int
    permission: str = Field(..., description="Разрешение для проверки")


class TeamPermissionResponse(BaseModel):
    """Schema for team permission response"""

    has_permission: bool
    user_role: Optional[TeamRole] = None
    is_member: bool = False
    is_owner: bool = False
