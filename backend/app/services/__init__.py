"""
Сервисы приложения.

Модуль содержит различные сервисы для работы с внешними системами,
уведомлениями, отчетами и другой бизнес-логикой.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
Все legacy классы и методы удалены.
"""

# Базовые классы и фабрика
from .base import (
    BaseService,
    ServiceFactory,
    ServiceError,
    ValidationError,
    NotFoundError,
    PermissionError,
    event_dispatcher,
    service_config,
)

# Рефакторенные сервисы - только основные классы
from .admin_service import (
    AdminService,
    admin_service,
)
from .auth_service import (
    AuthenticationService,
    AuthenticationError,
    InvalidCredentialsError,
    InactiveUserError,
    TokenValidationError,
)
from .user_profile_service import (
    UserProfileService,
    user_profile_service,
)
from .user_registration_service import (
    UserRegistrationService,
    user_registration_service,
    UserRegistrationError,
    UserAlreadyExistsError,
    EmailVerificationError,
)
from .company_management_service import (
    CompanyManagementService,
    company_management_service,
)
from .test_case_service import (
    TestCaseManagementService,
    test_case_service,
)
from .analytics_service import (
    AnalyticsService,
    analytics_service,
)
from .notification_service import (
    NotificationService,
    notification_service,
)
from .email_service import (
    EmailService,
    email_service,
)
from .password_service import (
    PasswordService,
    password_service,
)
from .session_service import (
    SessionService,
    session_service,
)

# Существующие сервисы (пока не рефакторены)
from .auth0_service import Auth0UserInfo, auth0_service
from .reporting_service import reporting_service
from .dashboard_service import dashboard_service
from .team_service import team_service
from .token_service import token_service

# Импорт других существующих сервисов с проверкой
try:
    from .comment_service import comment_service
except ImportError:
    comment_service = None

try:
    from .relationship_service import relationship_service
except ImportError:
    relationship_service = None

try:
    from .activity_service import activity_service, ActivityType
except ImportError:
    activity_service = None
    ActivityType = None

__all__ = [
    # Base infrastructure
    "BaseService",
    "ServiceFactory",
    "ServiceError",
    "ValidationError",
    "NotFoundError",
    "PermissionError",
    "event_dispatcher",
    "service_config",
    
    # Refactored services (classes)
    "AdminService",
    "AuthenticationService", 
    "UserProfileService",
    "UserRegistrationService",
    "CompanyManagementService",
    "TestCaseManagementService",
    "AnalyticsService",
    "NotificationService",
    "EmailService",
    "PasswordService",
    "SessionService",
    
    # Core service instances
    "admin_service",
    "user_profile_service",
    "user_registration_service",
    "company_management_service",
    "test_case_service",
    "analytics_service",
    "notification_service",
    "email_service",
    "password_service",
    "session_service",
    
    # Core services (non-refactored)
    "token_service",
    "reporting_service",
    "dashboard_service",
    "team_service",
    
    # Collaboration services (if available)
    "comment_service",
    "relationship_service",
    "activity_service",
    "ActivityType",
    
    # Exception classes
    "AuthenticationError",
    "InvalidCredentialsError",
    "InactiveUserError",
    "TokenValidationError",
    "UserRegistrationError",
    "UserAlreadyExistsError", 
    "EmailVerificationError",
    
    # External services
    "auth0_service",
    "Auth0UserInfo",
]