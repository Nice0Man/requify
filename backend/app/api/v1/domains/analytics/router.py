"""
Analytics & Reporting Domain Router.

Современный роутер для аналитики и отчетности.
"""

from fastapi import APIRouter

from .dashboard.router import router as dashboard_router
from .reports.router import router as reports_router
from .metrics.router import router as metrics_router

# Создаем главный роутер для analytics домена
router = APIRouter()

# Аналитика дашборда
router.include_router(
    dashboard_router,
    prefix="/dashboard",
    tags=["Analytics - Dashboard"],
)

# Аналитические отчеты
router.include_router(
    reports_router,
    prefix="/reports",
    tags=["Analytics - Reports"],
)

# Метрики и показатели
router.include_router(
    metrics_router,
    prefix="/metrics",
    tags=["Analytics - Metrics"],
)
