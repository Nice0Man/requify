"""
Main Collaboration Domain Router.

Главный роутер для домена совместной работы, объединяющий все поддомены.
"""

from fastapi import APIRouter

from .comments import router as comments_router
from .relationships import router as relationships_router
from .activity import router as activity_router
from .notifications import router as notifications_router

# Создаем главный роутер для collaboration домена
router = APIRouter()

# Управление комментариями
router.include_router(
    comments_router,
    prefix="/comments",
    tags=["Collaboration - Comments"],
)

# Управление отношениями между требованиями
router.include_router(
    relationships_router,
    prefix="/relationships",
    tags=["Collaboration - Relationships"],
)

# Отслеживание активности
router.include_router(
    activity_router,
    prefix="/activity",
    tags=["Collaboration - Activity"],
)

# Управление уведомлениями
router.include_router(
    notifications_router,
    prefix="/notifications",
    tags=["Collaboration - Notifications"],
)
