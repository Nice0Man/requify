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
from .token_service import (
    TokenService,
    token_service,
)
from .role_service import (
    RoleService,
    role_service,
)
from .role_hierarchy_service import (
    RoleHierarchyService,
    role_hierarchy_service,
)
from .role_initialization_service import (
    RoleInitializationService,
    role_initialization_service,
)
from .comment_service import (
    CommentService,
    comment_service,
)
from .activity_service import (
    ActivityService,
    activity_service,
)
from .relationship_service import (
    RelationshipService,
    relationship_service,
)
from .permission_service import (
    PermissionService,
    permission_service,
)

# from .reporting_service import (
#     ReportingService,
#     reporting_service,
# )

from .team_service import (
    TeamService,
    team_service,
)
from .file_service import (
    FileService,
    file_service,
)

# Дополнительные рефакторенные сервисы (примеры)
from .company_subscription_service import (
    CompanySubscriptionService,
    company_subscription_service,
)

# Дополнительно рефакторенные сервисы
from .test_management_service import (
    TestManagementService,
    test_management_service,
)
from .specification_management_service import (
    SpecificationManagementService,
    specification_management_service,
)
from .department_service import (
    DepartmentService,
    department_service,
)
from .dashboard_service import (
    DashboardService,
    dashboard_service,
)
from .company_settings_service import (
    CompanySettingsService,
    company_settings_service,
)

# Существующие сервисы (не рефакторены)
from .auth0_service import Auth0UserInfo, auth0_service

# Импорт ActivityType для обратной совместимости
from .activity_service import ActivityType

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
    "TokenService",
    "RoleService",
    "RoleHierarchyService",
    "RoleInitializationService",
    "CommentService",
    "ActivityService",
    "RelationshipService",
    "PermissionService",
    "CompanySubscriptionService",
    # "ReportingService",
    "TeamService",
    "FileService",
    "TestManagementService",
    "SpecificationManagementService",
    "DepartmentService",
    "DashboardService",
    "CompanySettingsService",
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
    "token_service",
    "role_service",
    "role_hierarchy_service",
    "role_initialization_service",
    "comment_service",
    "activity_service",
    "relationship_service",
    "permission_service",
    # "reporting_service",
    "team_service",
    "file_service",
    "test_management_service",
    "specification_management_service",
    "department_service",
    "dashboard_service",
    "company_settings_service",
    company_subscription_service,
    # Core services (non-refactored)
    "dashboard_service",
    # Legacy services (if available)
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
