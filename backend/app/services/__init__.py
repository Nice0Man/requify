"""
Сервисы приложения.

Модуль содержит различные сервисы для работы с внешними системами,
уведомлениями, отчетами и другой бизнес-логикой.
"""

from .admin_service import (
    admin_service,
    system_info_service,
    user_management_service,
    backup_service,
)
from .auth0_service import Auth0UserInfo, auth0_service
from .auth_service import (
    authentication_service,
    AuthenticationError,
    InvalidCredentialsError,
    InactiveUserError,
)
from .email_service import EmailService, email_service
from .notification_service import notification_service
from .password_service import password_service
from .reporting_service import reporting_service
from .dashboard_service import dashboard_service
from .session_service import session_service
from .team_service import team_service
from .token_service import token_service, TokenValidationError
from .user_registration_service import user_registration_service

__all__ = [
    # Core services
    "authentication_service",
    "token_service",
    "user_registration_service",
    "password_service",
    "session_service",
    # Admin services
    "admin_service",
    "system_info_service",
    "user_management_service",
    "backup_service",
    # Exception classes
    "AuthenticationError",
    "InvalidCredentialsError",
    "InactiveUserError",
    "TokenValidationError",
    # Existing services
    "EmailService",
    "email_service",
    "notification_service",
    "reporting_service",
    "auth0_service",
    "Auth0UserInfo",
    "dashboard_service",
    "team_service",
]
