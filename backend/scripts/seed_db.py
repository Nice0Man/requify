"""
Скрипт для заполнения базы данных тестовыми данными.

Создает начальные данные для разработки и тестирования приложения.
"""

import asyncio
from datetime import UTC, datetime
import sys
from pathlib import Path

# Добавляем корневую директорию в path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.config import settings
from app.db.db_helper import get_async_session, main_db_helper
from app.core.security import get_password_hash
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.company import Company, CompanyType, CompanyStatus
from app.models.department import Department, DepartmentType
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.release import Release
from app.models.requirement_types import RequirementType
from app.models.requirement_priorities import RequirementPriority
from app.models.requirement_statuses import RequirementStatus
from app.models.relationship_types import RelationshipType
from app.models.spec import Spec
from app.models.requirement_group import RequirementGroup
from app.models.test_result import TestResult
from app.models.comment import Comment
from app.crud import user as crud_user
from app.crud import department as crud_department
from app.crud import project as crud_project
from app.crud import requirement as crud_requirement
from app.crud import release as crud_release
from app.crud import relationship_type as crud_relationship_type
from app.crud import spec as crud_spec
from app.crud import requirement_group as crud_requirement_group
from app.crud import test_result as crud_test_result
from app.crud import comment as crud_comment
from app.schemas.user import UserCreate
from app.schemas.department import DepartmentCreate
from app.schemas.project import ProjectCreate
from app.schemas.requirement import RequirementCreate
from app.schemas.release import ReleaseCreate
from app.schemas.relationship_types import RelationshipTypeCreate
from app.schemas.spec import SpecCreate
from app.schemas.requirement_group import RequirementGroupCreate
from app.schemas.test_result import TestResultCreate
from app.schemas.comment import CommentCreate


async def create_reference_data(db: AsyncSession):
    """Создать справочные данные (типы, приоритеты, статусы требований)."""
    print("🔄 Создание справочных данных...")

    # Типы требований
    types_data = [
        {"name": "Функциональное", "description": "Функциональные требования системы"},
        {
            "name": "Нефункциональное",
            "description": "Требования к производительности, безопасности, удобству использования",
        },
        {"name": "Бизнес-требование", "description": "Бизнес-правила и процессы"},
        {"name": "Техническое", "description": "Технические ограничения и требования"},
    ]

    created_types = []
    for type_data in types_data:
        # Проверяем, существует ли тип
        existing_type = await db.execute(
            text("SELECT * FROM requirement_types WHERE name = :name"),
            {"name": type_data["name"]},
        )
        if not existing_type.first():
            req_type = RequirementType(**type_data)
            db.add(req_type)
            await db.flush()
            created_types.append(req_type)
        else:
            # Получаем существующий тип
            result = await db.execute(
                text("SELECT * FROM requirement_types WHERE name = :name"),
                {"name": type_data["name"]},
            )
            row = result.first()
            existing_type = RequirementType(id=row[0], name=row[1], description=row[2])
            created_types.append(existing_type)

    # Приоритеты требований
    priorities_data = [
        {"name": "Критический"},
        {"name": "Высокий"},
        {"name": "Средний"},
        {"name": "Низкий"},
    ]

    created_priorities = []
    for priority_data in priorities_data:
        # Проверяем, существует ли приоритет
        existing_priority = await db.execute(
            text("SELECT * FROM requirement_priorities WHERE name = :name"),
            {"name": priority_data["name"]},
        )
        if not existing_priority.first():
            req_priority = RequirementPriority(name=priority_data["name"])
            db.add(req_priority)
            await db.flush()
            created_priorities.append(req_priority)
        else:
            # Получаем существующий приоритет
            result = await db.execute(
                text("SELECT * FROM requirement_priorities WHERE name = :name"),
                {"name": priority_data["name"]},
            )
            row = result.first()
            existing_priority = RequirementPriority(id=row[0], name=row[1])
            created_priorities.append(existing_priority)

    # Статусы требований
    statuses_data = [
        {"name": "Черновик"},
        {"name": "На рассмотрении"},
        {"name": "Утверждено"},
        {"name": "В разработке"},
        {"name": "Реализовано"},
        {"name": "Тестируется"},
        {"name": "Готово"},
        {"name": "Отклонено"},
    ]

    created_statuses = []
    for status_data in statuses_data:
        # Проверяем, существует ли статус
        existing_status = await db.execute(
            text("SELECT * FROM requirement_statuses WHERE name = :name"),
            {"name": status_data["name"]},
        )
        if not existing_status.first():
            req_status = RequirementStatus(name=status_data["name"])
            db.add(req_status)
            await db.flush()
            created_statuses.append(req_status)
        else:
            # Получаем существующий статус
            result = await db.execute(
                text("SELECT * FROM requirement_statuses WHERE name = :name"),
                {"name": status_data["name"]},
            )
            row = result.first()
            existing_status = RequirementStatus(id=row[0], name=row[1])
            created_statuses.append(existing_status)

    # Типы связей
    relationship_types_data = [
        {"name": "depends_on"},
        {"name": "derived_from"},
        {"name": "refines"},
        {"name": "conflicts_with"},
        {"name": "implements"},
        {"name": "validates"},
    ]

    created_relationship_types = []
    for rel_type_data in relationship_types_data:
        # Проверяем, существует ли тип связи
        existing_rel_type = await db.execute(
            text("SELECT * FROM relationship_types WHERE name = :name"),
            {"name": rel_type_data["name"]},
        )
        if not existing_rel_type.first():
            rel_type = RelationshipType(**rel_type_data)
            db.add(rel_type)
            await db.flush()
            created_relationship_types.append(rel_type)
        else:
            # Получаем существующий тип
            result = await db.execute(
                text("SELECT * FROM relationship_types WHERE name = :name"),
                {"name": rel_type_data["name"]},
            )
            row = result.first()
            existing_rel_type = RelationshipType(id=row[0], name=row[1])
            created_relationship_types.append(existing_rel_type)

    print(
        f"✅ Создано {len(created_types)} типов, {len(created_priorities)} приоритетов, "
        f"{len(created_statuses)} статусов, {len(created_relationship_types)} типов связей"
    )
    return {
        "types": created_types,
        "priorities": created_priorities,
        "statuses": created_statuses,
        "relationship_types": created_relationship_types,
    }


async def create_sample_companies(db: AsyncSession):
    """Создать примеры компаний."""
    print("🔄 Создание компаний...")

    companies_data = [
        {
            "name": "IT Solutions Company",
            "slug": "it-solutions",
            "legal_name": "ООО ИТ Солюшнс Компани",
            "description": "Компания по разработке программного обеспечения",
            "type": CompanyType.SMALL_BUSINESS,
            "industry": "Информационные технологии",
            "size_category": "small",
            "employee_count": 25,
            "status": CompanyStatus.ACTIVE,
            "is_active": True,
        },
        {
            "name": "Demo Enterprise",
            "slug": "demo-enterprise",
            "legal_name": "АО Демо Энтерпрайз",
            "description": "Демонстрационная крупная компания",
            "type": CompanyType.ENTERPRISE,
            "industry": "Производство",
            "size_category": "large",
            "employee_count": 500,
            "status": CompanyStatus.TRIAL,
            "is_active": True,
        },
    ]

    created_companies = []
    for company_data in companies_data:
        # Проверяем, существует ли компания по slug
        existing_company = await db.execute(
            text("SELECT * FROM companies WHERE slug = :slug"),
            {"slug": company_data["slug"]},
        )
        if not existing_company.first():
            company = Company(**company_data)
            db.add(company)
            await db.flush()
            created_companies.append(company)
        else:
            # Получаем существующую компанию
            result = await db.execute(
                text("SELECT * FROM companies WHERE slug = :slug"),
                {"slug": company_data["slug"]},
            )
            row = result.first()
            existing_company = Company(
                id=row[0], 
                name=row[1], 
                slug=row[2]
            )
            created_companies.append(existing_company)

    print(f"✅ Создано {len(created_companies)} компаний")
    return created_companies


async def create_sample_departments(db: AsyncSession, companies: list[Company]):
    """Создать примеры департаментов."""
    print("🔄 Создание департаментов...")
    
    if not companies:
        print("❌ Нет компаний для создания департаментов")
        return []

    created_departments = []
    for company in companies:
        departments_data = [
            {
                "name": "Инженерный департамент",
                "slug": "engineering",
                "description": "Департамент разработки программного обеспечения",
                "type": DepartmentType.ENGINEERING.value,
                "company_id": company.id,
                "is_active": True,
            },
            {
                "name": "Продуктовый департамент", 
                "slug": "product",
                "description": "Департамент управления продуктом и аналитики",
                "type": DepartmentType.PRODUCT.value,
                "company_id": company.id,
                "is_active": True,
            },
            {
                "name": "QA департамент",
                "slug": "qa",
                "description": "Департамент обеспечения качества",
                "type": DepartmentType.QA.value,
                "company_id": company.id,
                "is_active": True,
            },
        ]

        for dept_data in departments_data:
            try:
                # Проверяем, существует ли департамент
                result = await db.execute(
                    text("SELECT * FROM departments WHERE slug = :slug AND company_id = :company_id"),
                    {"slug": dept_data["slug"], "company_id": company.id},
                )
                if not result.first():
                    department = Department(**dept_data)
                    db.add(department)
                    await db.flush()
                    created_departments.append(department)
                else:
                    print(f"Департамент {dept_data['slug']} уже существует в компании {company.name}")
                    # Получаем существующий департамент
                    result = await db.execute(
                        text("SELECT * FROM departments WHERE slug = :slug AND company_id = :company_id"),
                        {"slug": dept_data["slug"], "company_id": company.id},
                    )
                    row = result.first()
                    existing_dept = Department(
                        id=row[0],
                        name=row[2],
                        slug=row[3],
                        company_id=company.id
                    )
                    created_departments.append(existing_dept)
            except Exception as e:
                print(f"❌ Ошибка при создании департамента '{dept_data.get('slug', 'Unknown')}': {e}")
                continue

    print(f"✅ Создано {len(created_departments)} департаментов")
    return created_departments


async def create_sample_users(db: AsyncSession, companies: list[Company]):
    """Создать примеры пользователей."""
    print("🔄 Создание пользователей...")

    if not companies:
        print("❌ Нет компаний для создания пользователей")
        return []

    # Используем первую компанию как основную
    main_company = companies[0]

    users_data = [
        {
            "username": "adminuser",
            "email": "admin@example.com",
            "password": "SecurePass123!",
            "company_id": main_company.id,
        },
        {
            "username": "manager",
            "email": "manager@example.com",
            "password": "ProjectLead456#",
            "company_id": main_company.id,
        },
        {
            "username": "developer",
            "email": "developer@example.com",
            "password": "CodeMaster789$",
            "company_id": main_company.id,
        },
        {
            "username": "tester",
            "email": "tester@example.com",
            "password": "QualityCheck101%",
            "company_id": main_company.id,
        },
    ]

    # Создание пользователей через ORM
    created_users = []
    for user_data in users_data:
        # Проверяем, существует ли пользователь
        existing_user = await crud_user.get_by_email(db, email=user_data["email"])
        if not existing_user:
            user_create = UserCreate(**user_data)
            user = await crud_user.create(db, obj_in=user_create)
            created_users.append(user)
        else:
            print(f"Пользователь {user_data['email']} уже существует")
            created_users.append(existing_user)

    print(f"✅ Создано {len(created_users)} пользователей")
    return created_users


async def create_sample_user_profiles(db: AsyncSession, users: list[User]):
    """Создать примеры профилей пользователей."""
    print("🔄 Создание профилей пользователей...")

    if not users:
        print("❌ Нет пользователей для создания профилей")
        return []

    profiles_data = [
        {
            "user_id": users[0].id,
            "first_name": "Админ",
            "last_name": "Системный",
            "display_name": "Администратор",
            "department": "ИТ-отдел",
            "phone": "+79001234567",
            "position": "Системный администратор",
            "bio": "Ответственный за техническую инфраструктуру",
        },
        {
            "user_id": users[1].id if len(users) > 1 else users[0].id,
            "first_name": "Анна",
            "last_name": "Менеджерова",
            "display_name": "Анна Менеджерова",
            "department": "Управление проектами",
            "phone": "+79001234568",
            "position": "Менеджер проекта",
            "bio": "Управление проектами и координация команд",
        },
        {
            "user_id": users[2].id if len(users) > 2 else users[0].id,
            "first_name": "Иван",
            "last_name": "Разработчиков",
            "display_name": "Иван Разработчиков",
            "department": "Разработка",
            "phone": "+79001234569",
            "position": "Ведущий разработчик",
            "bio": "Разработка бэкенд-систем и архитектура",
        },
        {
            "user_id": users[3].id if len(users) > 3 else users[0].id,
            "first_name": "Мария",
            "last_name": "Тестировщикова",
            "display_name": "Мария Тестировщикова",
            "department": "Обеспечение качества",
            "phone": "+79001234570",
            "position": "QA инженер",
            "bio": "Тестирование и обеспечение качества продукта",
        },
    ]

    # Создание профилей через ORM
    created_profiles = []
    for profile_data in profiles_data:
        # Проверяем, существует ли профиль
        existing_profile = await db.execute(
            text("SELECT * FROM user_profiles WHERE user_id = :user_id"),
            {"user_id": profile_data["user_id"]},
        )
        if not existing_profile.first():
            profile = UserProfile(**profile_data)
            # Обновляем статус заполненности
            profile.update_completion_status()
            db.add(profile)
            await db.flush()
            created_profiles.append(profile)
        else:
            print(f"Профиль для пользователя {profile_data['user_id']} уже существует")

    print(f"✅ Создано {len(created_profiles)} профилей пользователей")
    return created_profiles


async def create_sample_projects(db: AsyncSession, owner_user: User, companies: list[Company], departments: list[Department]):
    """Создать примеры проектов."""
    print("🔄 Создание проектов...")

    if not companies:
        print("❌ Нет компаний для создания проектов")
        return []
        
    if not departments:
        print("❌ Нет департаментов для создания проектов")
        return []

    # Используем первую компанию как основную
    main_company = companies[0]
    # Используем первый департамент (engineering)
    main_department = departments[0]

    projects_data = [
        {
            "name": "Система управления требованиями",
            "code": "RMS",
            "description": "Основной проект для управления требованиями и тестированием",
            "status": "active",
            "company_id": main_company.id,
            "department_id": main_department.id,
            "owner_id": owner_user.id,
        },
        {
            "name": "Мобильное приложение",
            "code": "MOBILE",
            "description": "Проект разработки мобильного приложения",
            "status": "planning",
            "company_id": main_company.id,
            "department_id": main_department.id,
            "owner_id": owner_user.id,
        },
        {
            "name": "Интеграция с внешними системами",
            "code": "INTEGRATION",
            "description": "Проект интеграции с АСУТс и другими системами",
            "status": "active",
            "company_id": main_company.id,
            "department_id": main_department.id,
            "owner_id": owner_user.id,
        },
    ]

    # Создание проектов через ORM
    created_projects = []
    for project_data in projects_data:
        try:
            # Проверяем, существует ли проект
            existing_project = await db.execute(
                text("SELECT * FROM projects WHERE code = :code"),
                {"code": project_data["code"]},
            )
            if not existing_project.first():
                project = Project(**project_data)
                db.add(project)
                await db.flush()
                created_projects.append(project)
            else:
                print(f"Проект {project_data['code']} уже существует")
                # Получаем существующий проект
                result = await db.execute(
                    text("SELECT * FROM projects WHERE code = :code"),
                    {"code": project_data["code"]},
                )
                row = result.first()
                existing_project = Project(
                    id=row[0], 
                    code=row[1], 
                    name=row[2]
                )
                created_projects.append(existing_project)
        except Exception as e:
            print(
                f"❌ Ошибка при создании проекта '{project_data.get('code', 'Unknown')}': {e}"
            )
            # Пытаемся сделать rollback для восстановления сессии
            try:
                await db.rollback()
            except Exception as rollback_error:
                print(f"❌ Ошибка при rollback: {rollback_error}")
            continue

    print(f"✅ Создано {len(created_projects)} проектов")
    return created_projects


async def create_sample_specs(db: AsyncSession, projects: list[Project]):
    """Создать примеры спецификаций."""
    print("🔄 Создание спецификаций...")

    if not projects:
        print("❌ Нет проектов для создания спецификаций")
        return []

    # Получаем ID главного проекта напрямую вместо обращения к объекту
    main_project_id = projects[0].id  # Используем первый проект

    specs_data = [
        {
            "name": "Функциональные требования v1.0",
            "description": "Основная спецификация функциональных требований",
            "project_id": main_project_id,
        },
        {
            "name": "Интерфейс пользователя",
            "description": "Спецификация требований к пользовательскому интерфейсу",
            "project_id": main_project_id,
        },
        {
            "name": "API спецификация",
            "description": "Техническая спецификация программного интерфейса",
            "project_id": main_project_id,
        },
    ]

    # Создание спецификаций через ORM
    created_specs = []
    for spec_data in specs_data:
        # Проверяем, существует ли спецификация
        existing_spec = await crud_spec.get_by_name(
            db, name=spec_data["name"], project_id=spec_data["project_id"]
        )
        if not existing_spec:
            spec_create = SpecCreate(**spec_data)
            spec = await crud_spec.create(db, obj_in=spec_create)
            created_specs.append(spec)
        else:
            print(f"Спецификация '{spec_data['name']}' уже существует")
            created_specs.append(existing_spec)

    print(f"✅ Создано {len(created_specs)} спецификаций")
    return created_specs


async def create_sample_requirement_groups(db: AsyncSession, projects: list[Project]):
    """Создать примеры групп требований."""
    print("🔄 Создание групп требований...")

    if not projects:
        print("❌ Нет проектов для создания групп требований")
        return []

    # Получаем ID главного проекта напрямую вместо обращения к объекту
    main_project_id = projects[0].id  # Используем первый проект

    groups_data = [
        {
            "name": "Аутентификация и авторизация",
            "project_id": main_project_id,
        },
        {
            "name": "Управление проектами",
            "project_id": main_project_id,
        },
        {
            "name": "Отчетность",
            "project_id": main_project_id,
        },
    ]

    # Создание групп требований через ORM
    created_groups = []
    for group_data in groups_data:
        # Проверяем, существует ли группа
        existing_group = await crud_requirement_group.get_by_name(
            db, name=group_data["name"], project_id=group_data["project_id"]
        )
        if not existing_group:
            group_create = RequirementGroupCreate(**group_data)
            group = await crud_requirement_group.create(db, obj_in=group_create)
            created_groups.append(group)
        else:
            print(f"Группа требований '{group_data['name']}' уже существует")
            created_groups.append(existing_group)

    print(f"✅ Создано {len(created_groups)} групп требований")
    return created_groups


async def create_sample_requirements(
    db: AsyncSession, projects: list[Project], author: User, reference_data: dict
):
    """Создать примеры требований."""
    print("🔄 Создание требований...")

    if not projects:
        print("❌ Нет проектов для создания требований")
        return []

    if (
        not reference_data.get("types")
        or not reference_data.get("priorities")
        or not reference_data.get("statuses")
    ):
        print("❌ Нет справочных данных для создания требований")
        return []

    # Получаем ID главного проекта напрямую вместо обращения к объекту
    main_project_id = projects[0].id  # Используем первый проект

    # Получаем ID для разных типов требований
    functional_type = next(
        (t for t in reference_data["types"] if t.name == "Функциональное"),
        reference_data["types"][0],
    )
    nonfunctional_type = next(
        (t for t in reference_data["types"] if t.name == "Нефункциональное"),
        reference_data["types"][0],
    )

    # Получаем ID для разных приоритетов
    high_priority = next(
        (p for p in reference_data["priorities"] if p.name == "Высокий"),
        reference_data["priorities"][0],
    )
    medium_priority = next(
        (p for p in reference_data["priorities"] if p.name == "Средний"),
        reference_data["priorities"][0],
    )

    # Получаем ID для статуса "Черновик"
    draft_status = next(
        (s for s in reference_data["statuses"] if s.name == "Черновик"),
        reference_data["statuses"][0],
    )

    requirements_data = [
        {
            "title": "Аутентификация пользователей",
            "description": "Система должна поддерживать аутентификацию через email и пароль",
            "project_id": main_project_id,
            "type_id": functional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Управление проектами",
            "description": "Пользователи должны иметь возможность создавать и управлять проектами",
            "project_id": main_project_id,
            "type_id": functional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Система отчетности",
            "description": "Система должна генерировать отчеты по проектам и требованиям",
            "project_id": main_project_id,
            "type_id": functional_type.id,
            "priority_id": medium_priority.id,
            "status_id": draft_status.id,
        },
        {
            "title": "Производительность",
            "description": "Система должна обрабатывать запросы за время не более 2 секунд",
            "project_id": main_project_id,
            "type_id": nonfunctional_type.id,
            "priority_id": high_priority.id,
            "status_id": draft_status.id,
        },
    ]

    # Создание требований через ORM
    created_requirements = []
    for req_data in requirements_data:
        try:
            # Проверяем, существует ли требование (простая проверка по количеству)
            existing_reqs = await crud_requirement.get_by_project(
                db, project_id=req_data["project_id"]
            )
            existing_titles = [req.title for req in existing_reqs]

            if req_data["title"] not in existing_titles:
                requirement_create = RequirementCreate(**req_data)
                requirement = await crud_requirement.create(
                    db, obj_in=requirement_create, author_id=author.id
                )
                created_requirements.append(requirement)
            else:
                print(f"Требование '{req_data['title']}' уже существует")
                # Находим существующее требование
                existing_req = next(
                    req for req in existing_reqs if req.title == req_data["title"]
                )
                created_requirements.append(existing_req)
        except Exception as e:
            print(
                f"❌ Ошибка при создании требования '{req_data.get('title', 'Unknown')}': {e}"
            )
            # Пытаемся сделать rollback для восстановления сессии
            try:
                await db.rollback()
            except Exception as rollback_error:
                print(f"❌ Ошибка при rollback: {rollback_error}")
            continue

    print(f"✅ Создано {len(created_requirements)} требований")
    return created_requirements


async def create_sample_releases(db: AsyncSession, projects: list[Project]):
    """Создать примеры релизов."""
    print("🔄 Создание релизов...")

    if not projects:
        print("❌ Нет проектов для создания релизов")
        return []

    # Получаем ID главного проекта напрямую вместо обращения к объекту
    main_project_id = projects[0].id  # Используем первый проект

    releases_data = [
        {
            "name": "Релиз 1.0.0",
            "version": "1.0.0",
            "description": "Первый стабильный релиз с базовой функциональностью",
            "project_id": main_project_id,
            "status": "planned",
            "planned_date": datetime.now(UTC).replace(tzinfo=None),
        },
        {
            "name": "Релиз 1.1.0",
            "version": "1.1.0",
            "description": "Релиз с улучшениями UI и новыми функциями",
            "project_id": main_project_id,
            "status": "in_progress",
            "planned_date": datetime.now(UTC).replace(tzinfo=None),
        },
    ]

    # Создание релизов через ORM
    created_releases = []
    for release_data in releases_data:
        # Проверяем, существует ли релиз по версии и проекту
        existing_releases = await crud_release.get_by_project(
            db, project_id=release_data["project_id"]
        )
        existing_versions = [rel.version for rel in existing_releases]

        if release_data["version"] not in existing_versions:
            release_create = ReleaseCreate(**release_data)
            release = await crud_release.create(db, obj_in=release_create)
            created_releases.append(release)
        else:
            print(f"Релиз {release_data['version']} уже существует")
            # Находим существующий релиз
            existing_release = next(
                rel
                for rel in existing_releases
                if rel.version == release_data["version"]
            )
            created_releases.append(existing_release)

    print(f"✅ Создано {len(created_releases)} релизов")
    return created_releases


async def create_sample_test_results(
    db: AsyncSession, requirements: list[Requirement], author: User
):
    """Создать примеры результатов тестирования."""
    print("🔄 Создание результатов тестирования...")

    if not requirements:
        print("❌ Нет требований для создания результатов тестирования")
        return []

    # Импортируем TestStatus для правильного использования enum
    from app.models.test_result import TestStatus

    # Создаем тестировщика для назначения
    tester_user = author  # Используем автора как тестировщика для простоты

    test_results_data = [
        {
            "requirement_id": requirements[0].id,
            "status": TestStatus.PASSED,
            "notes": "Тест входа в систему - позитивный сценарий. Все проверки пройдены успешно",
            "external_id": "TC_001",
            "tester_id": tester_user.id,
            "started_at": datetime.now(UTC).replace(tzinfo=None),
            "completed_at": datetime.now(UTC).replace(tzinfo=None),
        },
        {
            "requirement_id": requirements[0].id,
            "status": TestStatus.FAILED,
            "notes": "Тест входа в систему - негативный сценарий. Ошибка валидации учетных данных",
            "external_id": "TC_002",
            "tester_id": tester_user.id,
            "started_at": datetime.now(UTC).replace(tzinfo=None),
            "completed_at": datetime.now(UTC).replace(tzinfo=None),
        },
        {
            "requirement_id": (
                requirements[1].id if len(requirements) > 1 else requirements[0].id
            ),
            "status": TestStatus.PASSED,
            "notes": "Тест создания проекта. Проект создан успешно",
            "external_id": "TC_003",
            "tester_id": tester_user.id,
            "started_at": datetime.now(UTC).replace(tzinfo=None),
            "completed_at": datetime.now(UTC).replace(tzinfo=None),
        },
    ]

    # Создание результатов тестирования через ORM
    created_test_results = []
    for test_data in test_results_data:
        # Проверяем, существует ли результат теста (простая проверка по external_id)
        existing_results = await crud_test_result.get_by_requirement(
            db, requirement_id=test_data["requirement_id"]
        )
        existing_external_ids = [
            res.external_id for res in existing_results if res.external_id
        ]

        if test_data["external_id"] not in existing_external_ids:
            test_create = TestResultCreate(**test_data)
            test_result = await crud_test_result.create(db, obj_in=test_create)
            created_test_results.append(test_result)
        else:
            print(f"Результат теста '{test_data['external_id']}' уже существует")

    print(f"✅ Создано {len(created_test_results)} результатов тестирования")
    return created_test_results


async def create_sample_comments(
    db: AsyncSession, requirements: list[Requirement], users: list[User]
):
    """Создать примеры комментариев."""
    print("🔄 Создание комментариев...")

    if not requirements or not users:
        print("❌ Нет требований или пользователей для создания комментариев")
        return []

    # Используем разных пользователей для комментариев
    admin_user = users[0]
    manager_user = users[1] if len(users) > 1 else users[0]

    comments_data = [
        {
            "content": "Требование нуждается в дополнительной детализации",
            "requirement_id": requirements[0].id,
        },
        {
            "content": "Согласовано с архитектурой системы",
            "requirement_id": requirements[0].id,
        },
        {
            "content": "Необходимо учесть требования безопасности",
            "requirement_id": (
                requirements[1].id if len(requirements) > 1 else requirements[0].id
            ),
        },
    ]

    # Создание комментариев через ORM
    created_comments = []
    for i, comment_data in enumerate(comments_data):
        # Используем разных авторов
        author = admin_user if i % 2 == 0 else manager_user

        # Проверяем, существует ли комментарий (простая проверка по тексту)
        existing_comments = await crud_comment.get_by_requirement(
            db, requirement_id=comment_data["requirement_id"]
        )
        existing_texts = [comment.content for comment in existing_comments]

        if comment_data["content"] not in existing_texts:
            comment_create = CommentCreate(**comment_data)
            comment = await crud_comment.create(
                db, obj_in=comment_create, author_id=author.id
            )
            created_comments.append(comment)
        else:
            print(f"Комментарий уже существует")

    print(f"✅ Создано {len(created_comments)} комментариев")
    return created_comments


async def seed_database():
    """Основная функция заполнения базы данных."""
    print("🌱 Начинаем заполнение базы данных тестовыми данными...")

    try:
        # Получаем сессию напрямую через async generator
        session_gen = get_async_session()
        session = await session_gen.__anext__()

        try:
            # Создаем справочные данные
            reference_data = await create_reference_data(session)

            # Создаем компании
            companies = await create_sample_companies(session)

            # Создаем департаменты
            departments = await create_sample_departments(session, companies)

            # Создаем пользователей
            users = await create_sample_users(session, companies)
            admin_user = users[0] if users else None

            if not admin_user:
                print("❌ Не удалось создать администратора")
                return

            # Создаем профили пользователей
            profiles = await create_sample_user_profiles(session, users)

            # Создаем проекты
            projects = await create_sample_projects(session, admin_user, companies, departments)

            # Создаем спецификации
            specs = await create_sample_specs(session, projects)

            # Создаем группы требований
            requirement_groups = await create_sample_requirement_groups(
                session, projects
            )

            # Создаем требования
            requirements = await create_sample_requirements(
                session, projects, admin_user, reference_data
            )

            # Создаем релизы
            releases = await create_sample_releases(session, projects)

            # Создаем результаты тестирования
            test_results = await create_sample_test_results(
                session, requirements, admin_user
            )

            # Создаем комментарии
            comments = await create_sample_comments(session, requirements, users)

            # Собираем данные для вывода ДО коммита (чтобы избежать greenlet_spawn error)
            companies_info = []
            departments_info = []
            
            # Используем .flush() чтобы получить данные из текущей транзакции
            await session.flush()
            
            for company in companies:
                companies_info.append({
                    "name": company.name,
                    "slug": company.slug
                })
                
            for department in departments:
                departments_info.append({
                    "name": department.name,
                    "company_id": department.company_id
                })

            # Коммитим все изменения
            await session.commit()

            print("✅ База данных успешно заполнена тестовыми данными!")
            print("\n📋 Созданные учетные записи:")
            print("   admin@example.com / SecurePass123! (Администратор)")
            print("   manager@example.com / ProjectLead456# (Менеджер)")
            print("   developer@example.com / CodeMaster789$ (Разработчик)")
            print("   tester@example.com / QualityCheck101% (Тестировщик)")
            print("\n🏢 Созданные компании:")
            for company_info in companies_info:
                print(f"   {company_info['name']} ({company_info['slug']})")
                
            print("\n🏬 Созданные департаменты:")
            for dept_info in departments_info:
                print(f"   {dept_info['name']}")

        finally:
            await session.close()

    except Exception as e:
        print(f"❌ Ошибка при заполнении базы данных: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


async def clear_database():
    """Очистить базу данных."""
    print("🗑️  Очистка базы данных...")

    confirm = input("⚠️  ВНИМАНИЕ! Это удалит ВСЕ данные. Продолжить? (yes/NO): ")
    if confirm.lower() != "yes":
        print("❌ Операция отменена")
        return

    try:
        # Получаем сессию напрямую через async generator
        session_gen = get_async_session()
        session = await session_gen.__anext__()

        try:
            # Очищаем данные в правильном порядке (с учетом внешних ключей)
            from app.models.requirement import Requirement
            from app.models.release import Release
            from app.models.project import Project
            from app.models.user import User
            from app.models.comment import Comment
            from app.models.test_result import TestResult
            from app.models.refresh_token import RefreshToken
            from app.models.relationship import Relationship
            from app.models.spec import Spec
            from app.models.requirement_group import RequirementGroup

            print("🔄 Удаление связанных данных...")

            # Удаляем в правильном порядке (сначала зависимые таблицы)
            await session.execute(text("DELETE FROM comments"))
            await session.execute(text("DELETE FROM test_results"))
            await session.execute(text("DELETE FROM relationships"))
            await session.execute(text("DELETE FROM requirements"))
            await session.execute(text("DELETE FROM requirement_groups"))
            await session.execute(text("DELETE FROM specs"))
            await session.execute(text("DELETE FROM releases"))
            await session.execute(text("DELETE FROM projects"))
            await session.execute(text("DELETE FROM refresh_tokens"))
            
            # Удаляем профили пользователей (связанные с users)
            await session.execute(text("DELETE FROM user_profiles"))
            
            # Удаляем пользователей
            await session.execute(text("DELETE FROM users"))
            
            # Удаляем департаменты (связанные с компаниями)
            await session.execute(text("DELETE FROM departments"))
            
            # Удаляем компании (должны быть последними среди основных данных)
            await session.execute(text("DELETE FROM companies"))

            # Удаляем справочные данные
            await session.execute(text("DELETE FROM relationship_types"))
            await session.execute(text("DELETE FROM requirement_types"))
            await session.execute(text("DELETE FROM requirement_priorities"))
            await session.execute(text("DELETE FROM requirement_statuses"))

            await session.commit()

        finally:
            await session.close()

        print("✅ База данных очищена")

    except Exception as e:
        print(f"❌ Ошибка при очистке базы данных: {e}")
        import traceback

        traceback.print_exc()
        sys.exit(1)


async def main():
    """Главная функция."""
    import argparse

    parser = argparse.ArgumentParser(description="Управление тестовыми данными")
    parser.add_argument(
        "action",
        choices=["seed", "clear"],
        help="Действие: seed (заполнить) или clear (очистить)",
    )

    args = parser.parse_args()

    if args.action == "seed":
        await seed_database()
    elif args.action == "clear":
        await clear_database()


if __name__ == "__main__":
    asyncio.run(main())
