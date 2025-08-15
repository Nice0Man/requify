"""
Role Management Schemas.

Schemas for role-related operations including role creation,
updates, permission assignments, and user-role relationships.
"""

from typing import List, Set


from pydantic import Field

from app.api.v1.common.schemas import BaseSchema

# === Utility Response Schemas ===


class TimezoneResponse(BaseSchema):
    """Timezone information."""

    code: str = Field(..., description="Timezone code")
    name: str = Field(..., description="Timezone name")
    offset: str = Field(..., description="UTC offset")


class LanguageResponse(BaseSchema):
    """Language information."""

    code: str = Field(..., description="Language code")
    name: str = Field(..., description="Language name")
    native_name: str = Field(..., description="Native language name")


class TimezoneListResponse(BaseSchema):
    """List of available timezones."""

    timezones: List[TimezoneResponse] = Field(..., description="Available timezones")


class LanguageListResponse(BaseSchema):
    """List of supported languages."""

    languages: List[LanguageResponse] = Field(..., description="Supported languages")
