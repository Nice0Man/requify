"""
Main System Administration Domain Router.

Главный роутер для домена системного администрирования, объединяющий все поддомены.
"""

from fastapi import APIRouter

from .health import router as health_router
from .admin import router as admin_router
from .audit import router as audit_router
from .backup import router as backup_router
from .metrics import router as metrics_router

# Создаем главный роутер для system домена
router = APIRouter()

# Мониторинг здоровья системы
router.include_router(
    health_router,
    prefix="/health",
    tags=["System - Health"],
)

# Административные операции
router.include_router(
    admin_router,
    prefix="/admin",
    tags=["System - Administration"],
)

# Аудит и логирование
router.include_router(
    audit_router,
    prefix="/audit",
    tags=["System - Audit"],
)

# Резервное копирование и обслуживание
router.include_router(
    backup_router,
    prefix="/backup",
    tags=["System - Backup"],
)

# Метрики и статистика
router.include_router(
    metrics_router,
    prefix="/metrics",
    tags=["System - Metrics"],
)
