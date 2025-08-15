"""
Main Identity Management Domain Router.

Главный роутер для домена управления идентификацией, объединяющий все поддомены.
"""

from fastapi import APIRouter

from .users import router as users_router
from .profiles import router as profiles_router
from .roles import router as roles_router
from .permissions import router as permissions_router

# Создаем главный роутер для identity домена
router = APIRouter()

# Управление пользователями
router.include_router(
    users_router,
    prefix="/users",
    tags=["Identity - Users"],
)

# Управление профилями
router.include_router(
    profiles_router,
    prefix="/profiles",
    tags=["Identity - Profiles"],
)

# Управление ролями
router.include_router(
    roles_router,
    prefix="/roles",
    tags=["Identity - Roles"],
)

# Управление разрешениями
router.include_router(
    permissions_router,
    prefix="/permissions",
    tags=["Identity - Permissions"],
)
