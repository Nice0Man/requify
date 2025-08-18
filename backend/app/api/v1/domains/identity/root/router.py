"""
Role Management Router.

Handles role-related operations including CRUD operations,
role assignments, and permission management.
"""

from typing import Optional
from fastapi import APIRouter

router = APIRouter()

# # Utility Endpoints
# 
from .schemas import TimezoneListResponse, LanguageListResponse

@router.get(
    "/timezones",
    summary="Get Available Timezones",
    description="Get list of available timezones for user profiles",
    response_model=TimezoneListResponse,
)
async def get_available_timezones():
    """
    Получение списка доступных часовых поясов.
    """
    # Возвращаем основные часовые пояса
    timezones = [
        {"code": "UTC", "name": "Coordinated Universal Time", "offset": "+00:00"},
        {"code": "US/Eastern", "name": "Eastern Time", "offset": "-05:00"},
        {"code": "US/Central", "name": "Central Time", "offset": "-06:00"},
        {"code": "US/Mountain", "name": "Mountain Time", "offset": "-07:00"},
        {"code": "US/Pacific", "name": "Pacific Time", "offset": "-08:00"},
        {"code": "Europe/London", "name": "Greenwich Mean Time", "offset": "+00:00"},
        {"code": "Europe/Berlin", "name": "Central European Time", "offset": "+01:00"},
        {"code": "Europe/Moscow", "name": "Moscow Time", "offset": "+03:00"},
        {"code": "Asia/Tokyo", "name": "Japan Standard Time", "offset": "+09:00"},
        {"code": "Asia/Shanghai", "name": "China Standard Time", "offset": "+08:00"},
        {
            "code": "Australia/Sydney",
            "name": "Australian Eastern Time",
            "offset": "+10:00",
        },
    ]
    return {"timezones": timezones}

@router.get(
    "/languages",
    summary="Get Available Languages",
    description="Get list of supported languages",
    response_model=LanguageListResponse,
)
async def get_available_languages():
    """
    Получение списка поддерживаемых языков.
    """
    # Возвращаем поддерживаемые языки
    languages = [
        {"code": "en", "name": "English", "native_name": "English"},
        {"code": "ru", "name": "Russian", "native_name": "Русский"},
        {"code": "es", "name": "Spanish", "native_name": "Español"},
        {"code": "fr", "name": "French", "native_name": "Français"},
        {"code": "de", "name": "German", "native_name": "Deutsch"},
        {"code": "zh", "name": "Chinese", "native_name": "中文"},
        {"code": "ja", "name": "Japanese", "native_name": "日本語"},
        {"code": "ko", "name": "Korean", "native_name": "한국어"},
    ]
    return {"languages": languages}
