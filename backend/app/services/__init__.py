"""
Сервисы приложения.

Модуль содержит различные сервисы для работы с внешними системами,
уведомлениями, отчетами и другой бизнес-логикой.
"""

from .auth0_service import Auth0UserInfo, auth0_service
from .email_service import EmailService, email_service
from .notification_service import notification_service
from .reporting_service import reporting_service
from .dashboard_service import dashboard_service
from .team_service import team_service

__all__ = [
    "EmailService",
    "email_service",
    "notification_service",
    "reporting_service",
    "auth0_service",
    "dashboard_service",
    "team_service",
]
