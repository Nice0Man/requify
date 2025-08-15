"""
Main Authentication Domain Router.

Главный роутер для домена аутентификации, объединяющий все поддомены.
"""

from fastapi import APIRouter

from .root import router as root_router
from .password import router as password_router
from .sessions import router as sessions_router
from .email import router as email_router
from .oauth2 import router as oauth2_router
from .me import router as me_router

# Создаем главный роутер для auth домена
router = APIRouter()

# Корневые операции аутентификации (login, register, logout, refresh)
router.include_router(
    root_router,
    tags=["Authentication - Core"],
)

# Управление паролями
router.include_router(
    password_router,
    prefix="/password",
    tags=["Authentication - Password"],
)

# Управление сессиями
router.include_router(
    sessions_router,
    prefix="/sessions",
    tags=["Authentication - Sessions"],
)

# Верификация email
router.include_router(
    email_router,
    prefix="/email",
    tags=["Authentication - Email"],
)

# OAuth2 интеграция
router.include_router(
    oauth2_router,
    prefix="/oauth2",
    tags=["Authentication - OAuth2"],
)

# Информация о текущем пользователе
router.include_router(
    me_router,
    prefix="/me",
    tags=["Authentication - Me"],
)
