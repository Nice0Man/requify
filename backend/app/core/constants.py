from enum import Enum as PyEnum


class Permission(PyEnum):
    """Системные разрешения"""
    
    # Basic permissions
    USE_API = "use_api"
    
    # User management
    VIEW_COMPANY_USERS = "view_company_users"
    MANAGE_COMPANY_USERS = "manage_company_users"
    INVITE_USERS = "invite_users"
    REMOVE_USERS = "remove_users"
    
    # Company management
    MANAGE_COMPANY = "manage_company"
    VIEW_COMPANY_SETTINGS = "view_company_settings"
    MANAGE_COMPANY_SETTINGS = "manage_company_settings"
    VIEW_COMPANY_ANALYTICS = "view_company_analytics"
    EXPORT_COMPANY_DATA = "export_company_data"
    
    # Project management
    VIEW_PROJECT = "view_project"
    CREATE_PROJECT = "create_project"
    MANAGE_PROJECT = "manage_project"
    DELETE_PROJECT = "delete_project"
    ARCHIVE_PROJECT = "archive_project"
    MANAGE_PROJECT_SETTINGS = "manage_project_settings"
    MANAGE_PROJECT_MEMBERS = "manage_project_members"
    VIEW_PROJECT_MEMBERS = "view_project_members"
    VIEW_PROJECT_ANALYTICS = "view_project_analytics"
    
    # Requirements
    VIEW_REQUIREMENT = "view_requirement"
    CREATE_REQUIREMENT = "create_requirement"
    EDIT_REQUIREMENT = "edit_requirement"
    DELETE_REQUIREMENT = "delete_requirement"
    APPROVE_REQUIREMENT = "approve_requirement"
    REJECT_REQUIREMENT = "reject_requirement"
    LINK_REQUIREMENTS = "link_requirements"
    MANAGE_REQUIREMENT_VERSIONS = "manage_requirement_versions"
    EXPORT_REQUIREMENTS = "export_requirements"
    IMPORT_REQUIREMENTS = "import_requirements"
    
    # Releases
    VIEW_RELEASE = "view_release"
    CREATE_RELEASE = "create_release"
    MANAGE_RELEASE = "manage_release"
    DELETE_RELEASE = "delete_release"
    PUBLISH_RELEASE = "publish_release"
    DEPLOY_RELEASE = "deploy_release"
    
    # Testing
    VIEW_TEST_RESULTS = "view_test_results"
    CREATE_TEST = "create_test"
    EXECUTE_TEST = "execute_test"
    MANAGE_TEST_PLANS = "manage_test_plans"
    
    # System administration
    MANAGE_SYSTEM = "manage_system"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings"
    
    # Reports and analytics
    VIEW_REPORTS = "view_reports"
    CREATE_REPORTS = "create_reports"
    EXPORT_REPORTS = "export_reports"
    VIEW_ADVANCED_ANALYTICS = "view_advanced_analytics"


class RoleScope(PyEnum):
    """Области действия ролей"""

    SYSTEM = "system"  # Системный уровень (все компании)
    COMPANY = "company"  # Компания
    DEPARTMENT = "department"  # Департамент
    TEAM = "team"  # Команда
    PROJECT = "project"  # Проект
    RESOURCE = "resource"  # Ресурс (требование, релиз, тест)


class SystemRole(PyEnum):
    """Системные роли (глобальные)"""

    SYSTEM_ADMIN = "system_admin"  # Полный доступ ко всей системе
    PLATFORM_ADMIN = "platform_admin"  # Управление платформой
    SUPPORT_ADMIN = "support_admin"  # Продвинутая поддержка
    SUPPORT_AGENT = "support_agent"  # Базовая поддержка
    BILLING_ADMIN = "billing_admin"  # Управление биллингом
    SECURITY_AUDITOR = "security_auditor"  # Аудит безопасности
    COMPLIANCE_OFFICER = "compliance_officer"  # Соответствие требованиям
    DEVELOPER = "developer"  # Техническая поддержка
    DATA_ANALYST = "data_analyst"  # Аналитик данных


class CompanyRole(PyEnum):
    """Роли на уровне компании"""

    COMPANY_ADMIN = "company_admin"  # Админ компании
    COMPANY_OWNER = "company_owner"  # Владелец компании
    BILLING_MANAGER = "billing_manager"  # Менеджер по биллингу
    HR_MANAGER = "hr_manager"  # HR менеджер
    COMPLIANCE_MANAGER = "compliance_manager"  # Менеджер по соответствию
    SECURITY_MANAGER = "security_manager"  # Менеджер безопасности
    COMPANY_VIEWER = "company_viewer"  # Просмотр данных компании


class DepartmentRole(PyEnum):
    """Роли на уровне департамента"""

    DEPARTMENT_HEAD = "department_head"  # Руководитель департамента
    DEPARTMENT_ADMIN = "department_admin"  # Админ департамента
    DEPUTY_HEAD = "deputy_head"  # Заместитель руководителя
    SENIOR_MANAGER = "senior_manager"  # Старший менеджер
    MANAGER = "manager"  # Менеджер
    COORDINATOR = "coordinator"  # Координатор
    DEPARTMENT_VIEWER = "department_viewer"  # Просмотр данных департамента


class TeamRole(PyEnum):
    """Роли на уровне команды"""

    # Управленческие роли
    OWNER = "owner"  # Владелец команды
    ADMIN = "admin"  # Админ команды
    TEAM_LEAD = "team_lead"  # Лидер команды
    TECH_LEAD = "tech_lead"  # Технический лидер
    SCRUM_MASTER = "scrum_master"  # Скрам-мастер
    PRODUCT_OWNER = "product_owner"  # Владелец продукта

    # Участники разработки
    SENIOR_DEVELOPER = "senior_developer"  # Старший разработчик
    DEVELOPER = "developer"  # Разработчик
    JUNIOR_DEVELOPER = "junior_developer"  # Младший разработчик

    # Специализированные роли
    ANALYST = "analyst"  # Аналитик
    DESIGNER = "designer"  # Дизайнер
    TESTER = "tester"  # Тестировщик
    DEVOPS = "devops"  # DevOps инженер

    # Вспомогательные роли
    SENIOR_MEMBER = "senior_member"  # Старший участник
    MEMBER = "member"  # Участник команды
    MENTOR = "mentor"  # Ментор
    CONSULTANT = "consultant"  # Консультант
    OBSERVER = "observer"  # Наблюдатель
    TEAM_VIEWER = "team_viewer"  # Просмотр данных команды


class ProjectRole(PyEnum):
    """Роли на уровне проекта"""

    PROJECT_MANAGER = "project_manager"  # Менеджер проекта
    PROJECT_OWNER = "project_owner"  # Владелец проекта
    ARCHITECT = "architect"  # Архитектор
    SENIOR_DEVELOPER = "senior_developer"  # Старший разработчик
    DEVELOPER = "developer"  # Разработчик
    FRONTEND_DEVELOPER = "frontend_developer"  # Frontend разработчик
    BACKEND_DEVELOPER = "backend_developer"  # Backend разработчик
    MOBILE_DEVELOPER = "mobile_developer"  # Mobile разработчик
    DEVOPS_ENGINEER = "devops_engineer"  # DevOps инженер
    QA_ENGINEER = "qa_engineer"  # QA инженер
    TEST_AUTOMATION_ENGINEER = "test_automation_engineer"  # Автотестировщик
    BUSINESS_ANALYST = "business_analyst"  # Бизнес-аналитик
    PRODUCT_ANALYST = "product_analyst"  # Продуктовый аналитик
    DATA_ANALYST = "data_analyst"  # Аналитик данных
    UX_DESIGNER = "ux_designer"  # UX дизайнер
    UI_DESIGNER = "ui_designer"  # UI дизайнер
    TECHNICAL_WRITER = "technical_writer"  # Технический писатель
    PROJECT_VIEWER = "project_viewer"  # Просмотр данных проекта
    STAKEHOLDER = "stakeholder"  # Заинтересованная сторона
    CLIENT = "client"  # Клиент


class Permission(PyEnum):
    """Детализированные разрешения в системе"""

    # =============================================================================
    # Системные разрешения
    # =============================================================================
    MANAGE_SYSTEM = "manage_system"
    MANAGE_ALL_COMPANIES = "manage_all_companies"
    VIEW_SYSTEM_LOGS = "view_system_logs"
    MANAGE_SYSTEM_SETTINGS = "manage_system_settings"
    MANAGE_GLOBAL_BILLING = "manage_global_billing"
    AUDIT_SYSTEM = "audit_system"
    MANAGE_SECURITY_POLICIES = "manage_security_policies"

    # =============================================================================
    # Компанийные разрешения
    # =============================================================================
    MANAGE_COMPANY = "manage_company"
    VIEW_COMPANY_SETTINGS = "view_company_settings"
    MANAGE_COMPANY_SETTINGS = "manage_company_settings"
    MANAGE_COMPANY_USERS = "manage_company_users"
    VIEW_COMPANY_USERS = "view_company_users"
    INVITE_USERS = "invite_users"
    REMOVE_USERS = "remove_users"
    MANAGE_COMPANY_BILLING = "manage_company_billing"
    VIEW_COMPANY_BILLING = "view_company_billing"
    MANAGE_COMPANY_SUBSCRIPTION = "manage_company_subscription"
    VIEW_COMPANY_ANALYTICS = "view_company_analytics"
    EXPORT_COMPANY_DATA = "export_company_data"

    # =============================================================================
    # Департаментские разрешения
    # =============================================================================
    CREATE_DEPARTMENT = "create_department"
    MANAGE_DEPARTMENT = "manage_department"
    VIEW_DEPARTMENT = "view_department"
    DELETE_DEPARTMENT = "delete_department"
    MANAGE_DEPARTMENT_USERS = "manage_department_users"
    VIEW_DEPARTMENT_USERS = "view_department_users"
    MANAGE_DEPARTMENT_BUDGET = "manage_department_budget"
    VIEW_DEPARTMENT_ANALYTICS = "view_department_analytics"

    # =============================================================================
    # Командные разрешения
    # =============================================================================
    CREATE_TEAM = "create_team"
    MANAGE_TEAM = "manage_team"
    VIEW_TEAM = "view_team"
    DELETE_TEAM = "delete_team"
    MANAGE_TEAM_MEMBERS = "manage_team_members"
    VIEW_TEAM_MEMBERS = "view_team_members"
    ASSIGN_TEAM_ROLES = "assign_team_roles"
    VIEW_TEAM_PERFORMANCE = "view_team_performance"

    # =============================================================================
    # Проектные разрешения
    # =============================================================================
    CREATE_PROJECT = "create_project"
    MANAGE_PROJECT = "manage_project"
    VIEW_PROJECT = "view_project"
    DELETE_PROJECT = "delete_project"
    ARCHIVE_PROJECT = "archive_project"
    MANAGE_PROJECT_SETTINGS = "manage_project_settings"
    MANAGE_PROJECT_MEMBERS = "manage_project_members"
    VIEW_PROJECT_MEMBERS = "view_project_members"
    MANAGE_PROJECT_BUDGET = "manage_project_budget"
    VIEW_PROJECT_ANALYTICS = "view_project_analytics"

    # =============================================================================
    # Требования
    # =============================================================================
    CREATE_REQUIREMENT = "create_requirement"
    EDIT_REQUIREMENT = "edit_requirement"
    VIEW_REQUIREMENT = "view_requirement"
    DELETE_REQUIREMENT = "delete_requirement"
    APPROVE_REQUIREMENT = "approve_requirement"
    REJECT_REQUIREMENT = "reject_requirement"
    LINK_REQUIREMENTS = "link_requirements"
    MANAGE_REQUIREMENT_VERSIONS = "manage_requirement_versions"
    EXPORT_REQUIREMENTS = "export_requirements"
    IMPORT_REQUIREMENTS = "import_requirements"

    # =============================================================================
    # Релизы
    # =============================================================================
    CREATE_RELEASE = "create_release"
    MANAGE_RELEASE = "manage_release"
    VIEW_RELEASE = "view_release"
    DELETE_RELEASE = "delete_release"
    PUBLISH_RELEASE = "publish_release"
    DEPLOY_RELEASE = "deploy_release"
    ROLLBACK_RELEASE = "rollback_release"
    APPROVE_RELEASE = "approve_release"

    # =============================================================================
    # Тестирование
    # =============================================================================
    CREATE_TEST = "create_test"
    EXECUTE_TEST = "execute_test"
    VIEW_TEST_RESULTS = "view_test_results"
    MANAGE_TEST_PLANS = "manage_test_plans"
    APPROVE_TEST_RESULTS = "approve_test_results"
    CREATE_TEST_AUTOMATION = "create_test_automation"
    MANAGE_TEST_ENVIRONMENTS = "manage_test_environments"

    # =============================================================================
    # Документация и спецификации
    # =============================================================================
    CREATE_SPECIFICATION = "create_specification"
    EDIT_SPECIFICATION = "edit_specification"
    VIEW_SPECIFICATION = "view_specification"
    DELETE_SPECIFICATION = "delete_specification"
    APPROVE_SPECIFICATION = "approve_specification"
    GENERATE_DOCUMENTATION = "generate_documentation"

    # =============================================================================
    # Коментарии и обратная связь
    # =============================================================================
    CREATE_COMMENT = "create_comment"
    EDIT_COMMENT = "edit_comment"
    DELETE_COMMENT = "delete_comment"
    MODERATE_COMMENTS = "moderate_comments"

    # =============================================================================
    # Интеграции и API
    # =============================================================================
    USE_API = "use_api"
    MANAGE_INTEGRATIONS = "manage_integrations"
    VIEW_API_LOGS = "view_api_logs"
    CREATE_API_KEYS = "create_api_keys"

    # =============================================================================
    # Отчеты и аналитика
    # =============================================================================
    VIEW_REPORTS = "view_reports"
    CREATE_REPORTS = "create_reports"
    EXPORT_REPORTS = "export_reports"
    VIEW_ADVANCED_ANALYTICS = "view_advanced_analytics"
