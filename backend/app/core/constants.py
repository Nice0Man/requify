from enum import Enum as PyEnum


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
    VIEW_SYSTEM = "view_system"
    MANAGE_USERS = "manage_users"
    VIEW_USERS = "view_users"
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
    SEARCH_COMPANY = "search_company"
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
    UNLINK_REQUIREMENTS = "unlink_requirements"
    MANAGE_REQUIREMENT_VERSIONS = "manage_requirement_versions"
    EXPORT_REQUIREMENTS = "export_requirements"
    IMPORT_REQUIREMENTS = "import_requirements"
    CHANGE_REQUIREMENT_STATUS = "change_requirement_status"
    SEARCH_REQUIREMENTS = "search_requirements"

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
    GENERATE_RELEASE_SPECIFICATION = "generate_release_specification"
    SYNC_RELEASE_REQUIREMENTS = "sync_release_requirements"
    VIEW_RELEASE_CHANGELOG = "view_release_changelog"

    # =============================================================================
    # Тестирование
    # =============================================================================
    CREATE_TEST = "create_test"
    EXECUTE_TEST = "execute_test"
    VIEW_TESTS = "view_tests"
    DELETE_TEST = "delete_test"
    MANAGE_TESTS = "manage_tests"
    EXECUTE_INTEGRATION_TESTS = "execute_integration_tests"
    VIEW_TEST_RESULTS = "view_test_results"
    MANAGE_TEST_PLANS = "manage_test_plans"
    APPROVE_TEST_RESULTS = "approve_test_results"
    CREATE_TEST_AUTOMATION = "create_test_automation"
    MANAGE_TEST_ENVIRONMENTS = "manage_test_environments"
    CREATE_TEST_CASE = "create_test_case"
    EDIT_TEST_CASE = "edit_test_case"
    DELETE_TEST_CASE = "delete_test_case"
    VIEW_TEST_CASES = "view_test_cases"
    EXECUTE_TEST_CASE = "execute_test_case"
    CREATE_TEST_EXECUTION = "create_test_execution"
    VIEW_TEST_EXECUTIONS = "view_test_executions"
    VIEW_TESTING_SUMMARY = "view_testing_summary"
    REQUEST_REQUIREMENT_TESTING_STATUS = "request_requirement_testing_status"
    REQUEST_RELEASE_TESTING_STATUS = "request_release_testing_status"
    RUN_INTEGRATION_TESTS = "run_integration_tests"
    GET_INTEGRATION_TEST_STATUS = "get_integration_test_status"

    # =============================================================================
    # Документация и спецификации
    # =============================================================================
    CREATE_SPECIFICATION = "create_specification"
    EDIT_SPECIFICATION = "edit_specification"
    VIEW_SPECIFICATION = "view_specification"
    MANAGE_SPECIFICATION = "manage_specification"
    DELETE_SPECIFICATION = "delete_specification"
    APPROVE_SPECIFICATION = "approve_specification"
    GENERATE_DOCUMENTATION = "generate_documentation"
    GENERATE_SPECIFICATION_DOCUMENT = "generate_specification_document"
    VIEW_SPECIFICATION_REQUIREMENTS = "view_specification_requirements"

    # =============================================================================
    # Коментарии и обратная связь
    # =============================================================================
    CREATE_COMMENT = "create_comment"
    EDIT_COMMENT = "edit_comment"
    DELETE_COMMENT = "delete_comment"
    MODERATE_COMMENTS = "moderate_comments"
    VIEW_COMMENT = "view_comment"
    VIEW_REQUIREMENT_COMMENTS = "view_requirement_comments"
    CREATE_REQUIREMENT_COMMENT = "create_requirement_comment"
    VIEW_RECENT_COMMENTS = "view_recent_comments"
    VIEW_COMMENTS_STATISTICS = "view_comments_statistics"

    # =============================================================================
    # Связи между требованиями
    # =============================================================================
    CREATE_RELATIONSHIP = "create_relationship"
    VIEW_RELATIONSHIP = "view_relationship"
    EDIT_RELATIONSHIP = "edit_relationship"
    DELETE_RELATIONSHIP = "delete_relationship"
    VIEW_REQUIREMENT_RELATIONSHIPS = "view_requirement_relationships"
    CREATE_REQUIREMENT_RELATIONSHIP = "create_requirement_relationship"
    VIEW_REQUIREMENT_DEPENDENCIES = "view_requirement_dependencies"
    VIEW_REQUIREMENT_DEPENDENTS = "view_requirement_dependents"
    VIEW_REQUIREMENT_TRACE_MATRIX = "view_requirement_trace_matrix"

    # =============================================================================
    # Справочники
    # =============================================================================
    VIEW_REQUIREMENT_TYPES = "view_requirement_types"
    CREATE_REQUIREMENT_TYPE = "create_requirement_type"
    EDIT_REQUIREMENT_TYPE = "edit_requirement_type"
    DELETE_REQUIREMENT_TYPE = "delete_requirement_type"
    VIEW_REQUIREMENT_PRIORITIES = "view_requirement_priorities"
    CREATE_REQUIREMENT_PRIORITY = "create_requirement_priority"
    EDIT_REQUIREMENT_PRIORITY = "edit_requirement_priority"
    DELETE_REQUIREMENT_PRIORITY = "delete_requirement_priority"
    VIEW_REQUIREMENT_STATUSES = "view_requirement_statuses"
    CREATE_REQUIREMENT_STATUS = "create_requirement_status"
    EDIT_REQUIREMENT_STATUS = "edit_requirement_status"
    DELETE_REQUIREMENT_STATUS = "delete_requirement_status"
    VIEW_RELATIONSHIP_TYPES = "view_relationship_types"
    CREATE_RELATIONSHIP_TYPE = "create_relationship_type"
    EDIT_RELATIONSHIP_TYPE = "edit_relationship_type"
    DELETE_RELATIONSHIP_TYPE = "delete_relationship_type"

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
    VIEW_ANALYTICS = "view_analytics"
    GENERATE_REPORTS = "generate_reports"
    VIEW_QUALITY_METRICS = "view_quality_metrics"
    VIEW_ADVANCED_ANALYTICS = "view_advanced_analytics"

    # =============================================================================
    # Дашборд
    # =============================================================================
    VIEW_DASHBOARD = "view_dashboard"
    VIEW_DASHBOARD_STATS = "view_dashboard_stats"
    VIEW_DASHBOARD_OVERVIEW = "view_dashboard_overview"
    VIEW_MY_PROJECTS = "view_my_projects"
    VIEW_MY_REQUIREMENTS = "view_my_requirements"
    VIEW_MY_ACTIVITY = "view_my_activity"
    VIEW_MY_NOTIFICATIONS = "view_my_notifications"
    VIEW_RECENT_DASHBOARD_ACTIVITY = "view_recent_dashboard_activity"
    VIEW_DASHBOARD_PROJECTS_STATS = "view_dashboard_projects_stats"
    VIEW_RECENT_PROJECTS_DASHBOARD = "view_recent_projects_dashboard"
    VIEW_DASHBOARD_REQUIREMENTS_STATS = "view_dashboard_requirements_stats"
    VIEW_RECENT_REQUIREMENTS_DASHBOARD = "view_recent_requirements_dashboard"
    VIEW_DASHBOARD_HEALTH = "view_dashboard_health"
    VIEW_DASHBOARD_METRICS = "view_dashboard_metrics"
    SEARCH_DASHBOARD = "search_dashboard"
    FILTER_DASHBOARD = "filter_dashboard"
    EXPORT_DASHBOARD_STATS = "export_dashboard_stats"
    EXPORT_DASHBOARD_ACTIVITY = "export_dashboard_activity"
    CREATE_ACTIVITY_RECORD = "create_activity_record"
    UPDATE_USER_PREFERENCES = "update_user_preferences"
    CREATE_NOTIFICATION = "create_notification"
    MARK_NOTIFICATION_READ = "mark_notification_read"

    # =============================================================================
    # Административные разрешения
    # =============================================================================
    VIEW_ADMIN_USERS = "view_admin_users"
    VIEW_SYSTEM_INFO = "view_system_info"
    VIEW_HEALTH_CHECK = "view_health_check"
    VIEW_METRICS = "view_metrics"
    VIEW_USERS_STATISTICS = "view_users_statistics"
    VIEW_PROJECTS_STATISTICS = "view_projects_statistics"
    CREATE_BACKUP = "create_backup"
    VIEW_BACKUPS = "view_backups"
    UPDATE_SYSTEM_SETTINGS = "update_system_settings"
    VIEW_AUDIT_LOG = "view_audit_log"

    # =============================================================================
    # Сессии
    # =============================================================================
    VIEW_USER_SESSIONS = "view_user_sessions"
    REVOKE_SESSIONS = "revoke_sessions"

    # =============================================================================
    # Роли
    # =============================================================================
    VIEW_ROLES = "view_roles"
    CREATE_ROLE = "create_role"
    EDIT_ROLE = "edit_role"
    DELETE_ROLE = "delete_role"
    ASSIGN_ROLE = "assign_role"
