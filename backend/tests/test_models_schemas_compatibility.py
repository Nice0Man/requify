"""
Тесты совместимости моделей SQLAlchemy и схем Pydantic.

Основаны на лучших практиках тестирования баз данных с pytest и SQLModel.
Проверяют:
1. Соответствие полей между моделями и схемами
2. Корректную сериализацию/десериализацию
3. Валидацию данных
4. Работу с ORM отношениями
"""

import pytest
from typing import Any, Dict, List, Optional, Type, get_type_hints
from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import Session, selectinload
from sqlmodel import SQLModel

from app.models.base import Base
from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.models.company import Company
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.comment import Comment

from app.schemas.user import (
    UserBase, UserCreate, UserUpdate, UserResponse, 
    UserWithRelations, UserDetailed
)
from app.schemas.company import CompanyBase, CompanyCreate, CompanyResponse
from app.schemas.project import ProjectBase, ProjectCreate, ProjectResponse
from app.schemas.requirement import RequirementBase, RequirementCreate, RequirementResponse

from app.core.config import settings


@pytest.fixture(scope="session")
def test_engine():
    """
    Создает тестовый движок базы данных в памяти.
    
    Использует SQLite in-memory для быстрых изолированных тестов.
    Основано на лучших практиках SQLModel и pytest.
    """
    # Используем in-memory SQLite для тестов
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,  # Отключаем логи для чистого вывода тестов
        connect_args={"check_same_thread": False},  # Для многопоточности
    )
    return engine


@pytest.fixture(scope="function")
def test_session(test_engine):
    """
    Создает изолированную сессию для каждого теста.
    
    Каждый тест получает чистую базу данных со всеми таблицами.
    После теста все данные очищаются.
    """
    # Создаем все таблицы
    Base.metadata.create_all(test_engine)
    
    # Создаем сессию
    with Session(test_engine) as session:
        yield session
    
    # Очищаем все таблицы после теста
    Base.metadata.drop_all(test_engine)


@pytest.fixture
def sample_user_data():
    """Образцы данных для создания пользователя."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "status": "active",
        "auth_provider": "local",
        "is_email_verified": True,
        "is_active": True
    }


@pytest.fixture
def sample_company_data():
    """Образцы данных для создания компании."""
    return {
        "name": "Test Company",
        "description": "Test company description",
        "website": "https://test.com",
        "industry": "Technology",
        "size": "startup"
    }


@pytest.fixture
def sample_project_data():
    """Образцы данных для создания проекта."""
    return {
        "name": "Test Project",
        "description": "Test project description",
        "status": "active",
        "priority": "high"
    }


class TestModelSchemaFieldCompatibility:
    """
    Тесты соответствия полей между моделями и схемами.
    
    Проверяют, что все поля модели корректно мапятся на схемы
    и наоборот, исключая служебные поля.
    """
    
    def test_user_model_base_schema_fields_match(self):
        """Проверяет соответствие полей User модели и UserBase схемы."""
        # Получаем поля модели (исключая служебные)
        user_model_fields = self._get_model_fields(User)
        
        # Получаем поля схемы
        user_schema_fields = self._get_schema_fields(UserBase)
        
        # Поля, которые есть в модели, но отсутствуют в схеме (ожидаемые различия)
        expected_model_only_fields = {
            'id', 'created_at', 'updated_at', 'password_hash'
        }
        
        # Поля, которые есть в схеме, но отсутствуют в модели
        schema_only_fields = user_schema_fields - user_model_fields
        model_only_fields = user_model_fields - user_schema_fields
        
        # Убираем ожидаемые различия
        unexpected_model_only = model_only_fields - expected_model_only_fields
        
        assert not schema_only_fields, f"Поля только в схеме: {schema_only_fields}"
        assert not unexpected_model_only, f"Неожиданные поля только в модели: {unexpected_model_only}"
    
    def test_user_response_schema_includes_id(self):
        """Проверяет, что UserResponse схема включает поле id."""
        response_fields = self._get_schema_fields(UserResponse)
        assert 'id' in response_fields, "UserResponse должна включать поле id"
    
    def test_user_detailed_schema_includes_relations(self):
        """Проверяет, что UserDetailed схема включает поля отношений."""
        detailed_fields = self._get_schema_fields(UserDetailed)
        
        expected_relation_fields = {'profile', 'settings', 'company_name', 'roles', 'teams'}
        missing_fields = expected_relation_fields - detailed_fields
        
        assert not missing_fields, f"Отсутствующие поля отношений: {missing_fields}"
    
    def _get_model_fields(self, model_class: Type[Base]) -> set:
        """Получает набор полей SQLAlchemy модели."""
        mapper = inspect(model_class)
        return {column.key for column in mapper.columns}
    
    def _get_schema_fields(self, schema_class: Type[SQLModel]) -> set:
        """Получает набор полей Pydantic схемы."""
        return set(schema_class.model_fields.keys())


class TestModelSchemaDataSerialization:
    """
    Тесты сериализации данных между моделями и схемами.
    
    Проверяют корректное преобразование данных из модели в схему
    и обратно, включая сложные типы и отношения.
    """
    
    def test_user_model_to_base_schema_conversion(self, test_session, sample_user_data):
        """Тестирует преобразование User модели в UserBase схему."""
        # Создаем пользователя в БД
        user = User(**sample_user_data)
        test_session.add(user)
        test_session.commit()
        test_session.refresh(user)
        
        # Преобразуем в схему
        user_schema = UserBase.model_validate(user)
        
        # Проверяем основные поля
        assert user_schema.username == sample_user_data["username"]
        assert user_schema.email == sample_user_data["email"]
        assert user_schema.name == sample_user_data["name"]
        assert user_schema.status == sample_user_data["status"]
        assert user_schema.is_active == sample_user_data["is_active"]
    
    def test_user_schema_to_model_conversion(self, sample_user_data):
        """Тестирует создание User модели из UserCreate схемы."""
        # Создаем схему
        user_create = UserCreate(**sample_user_data, password="testpassword123")
        
        # Преобразуем в модель (исключая поле password)
        user_data = user_create.model_dump(exclude={'password'})
        user = User(**user_data)
        
        # Проверяем основные поля
        assert user.username == sample_user_data["username"]
        assert user.email == sample_user_data["email"]
        assert user.name == sample_user_data["name"]
        assert user.status == sample_user_data["status"]
        assert user.is_active == sample_user_data["is_active"]
    
    def test_user_with_relations_serialization(self, test_session, sample_user_data, sample_company_data):
        """Тестирует сериализацию пользователя с отношениями."""
        # Создаем компанию
        company = Company(**sample_company_data)
        test_session.add(company)
        test_session.commit()
        test_session.refresh(company)
        
        # Создаем пользователя с компанией
        user_data = sample_user_data.copy()
        user_data['company_id'] = company.id
        user = User(**user_data)
        test_session.add(user)
        test_session.commit()
        
        # Создаем профиль пользователя
        profile = UserProfile(
            user_id=user.id,
            first_name="Test",
            last_name="User",
            display_name="Test User",
            bio="Test bio"
        )
        test_session.add(profile)
        
        # Создаем настройки пользователя
        settings = UserSettings(
            user_id=user.id,
            notification_settings={"email": True, "sms": False},
            interface_settings={"theme": "dark", "language": "ru"}
        )
        test_session.add(settings)
        test_session.commit()
        
        # Загружаем пользователя с отношениями
        user_with_relations = test_session.query(User).options(
            selectinload(User.profile),
            selectinload(User.settings),
            selectinload(User.company)
        ).filter(User.id == user.id).first()
        
        # Преобразуем в схему с отношениями
        user_detailed = UserDetailed.model_validate(user_with_relations)
        
        # Проверяем основные поля
        assert user_detailed.username == sample_user_data["username"]
        assert user_detailed.email == sample_user_data["email"]
        
        # Проверяем отношения
        assert user_detailed.profile is not None
        assert user_detailed.settings is not None
        assert user_detailed.company_name == sample_company_data["name"]


class TestModelSchemaValidation:
    """
    Тесты валидации данных в схемах.
    
    Проверяют корректную работу валидаторов Pydantic
    и соответствие ограничениям модели БД.
    """
    
    def test_user_create_validation_success(self):
        """Тестирует успешную валидацию при создании пользователя."""
        valid_data = {
            "username": "validuser",
            "email": "valid@example.com",
            "name": "Valid User",
            "password": "ValidPassword123!",
            "confirm_password": "ValidPassword123!"
        }
        
        user_create = UserCreate(**valid_data)
        assert user_create.username == "validuser"
        assert user_create.email == "valid@example.com"
    
    def test_user_create_validation_invalid_email(self):
        """Тестирует валидацию неправильного email."""
        invalid_data = {
            "username": "testuser",
            "email": "invalid-email",
            "name": "Test User",
            "password": "password123"
        }
        
        with pytest.raises(ValueError, match="value is not a valid email address"):
            UserCreate(**invalid_data)
    
    def test_user_create_validation_short_username(self):
        """Тестирует валидацию слишком короткого username."""
        invalid_data = {
            "username": "a",  # Слишком короткий
            "email": "test@example.com",
            "name": "Test User",
            "password": "password123"
        }
        
        with pytest.raises(ValueError, match="String should have at least 2 characters"):
            UserCreate(**invalid_data)
    
    def test_user_update_partial_validation(self):
        """Тестирует валидацию частичного обновления."""
        # Все поля опциональны в UserUpdate
        partial_update = UserUpdate(name="New Name")
        assert partial_update.name == "New Name"
        assert partial_update.email is None
        assert partial_update.username is None


class TestORMRelationshipsCompatibility:
    """
    Тесты совместимости ORM отношений с схемами.
    
    Проверяют корректную работу отношений один-к-одному,
    один-ко-многим и многие-ко-многим.
    """
    
    def test_user_profile_one_to_one_relationship(self, test_session, sample_user_data):
        """Тестирует отношение один-к-одному между User и UserProfile."""
        # Создаем пользователя
        user = User(**sample_user_data)
        test_session.add(user)
        test_session.commit()
        test_session.refresh(user)
        
        # Создаем профиль
        profile = UserProfile(
            user_id=user.id,
            first_name="Test",
            last_name="User",
            display_name="Test User"
        )
        test_session.add(profile)
        test_session.commit()
        
        # Проверяем отношение от User к UserProfile
        assert user.profile is not None
        assert user.profile.first_name == "Test"
        
        # Проверяем отношение от UserProfile к User
        assert profile.user is not None
        assert profile.user.email == sample_user_data["email"]
    
    def test_user_company_many_to_one_relationship(self, test_session, sample_user_data, sample_company_data):
        """Тестирует отношение многие-к-одному между User и Company."""
        # Создаем компанию
        company = Company(**sample_company_data)
        test_session.add(company)
        test_session.commit()
        test_session.refresh(company)
        
        # Создаем пользователей в компании
        user1_data = sample_user_data.copy()
        user1_data.update({"username": "user1", "email": "user1@example.com", "company_id": company.id})
        user1 = User(**user1_data)
        
        user2_data = sample_user_data.copy()
        user2_data.update({"username": "user2", "email": "user2@example.com", "company_id": company.id})
        user2 = User(**user2_data)
        
        test_session.add_all([user1, user2])
        test_session.commit()
        
        # Проверяем отношение от User к Company
        assert user1.company is not None
        assert user1.company.name == sample_company_data["name"]
        
        # Проверяем отношение от Company к Users
        assert len(company.users) == 2
        user_emails = {user.email for user in company.users}
        assert "user1@example.com" in user_emails
        assert "user2@example.com" in user_emails


class TestModelSchemaPerformance:
    """
    Тесты производительности сериализации и валидации.
    
    Проверяют, что операции с моделями и схемами
    выполняются в приемлемое время.
    """
    
    def test_bulk_user_serialization_performance(self, test_session):
        """Тестирует производительность массовой сериализации пользователей."""
        import time
        
        # Создаем 100 пользователей
        users = []
        for i in range(100):
            user = User(
                username=f"user{i}",
                email=f"user{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True
            )
            users.append(user)
        
        test_session.add_all(users)
        test_session.commit()
        
        # Измеряем время сериализации
        start_time = time.time()
        
        serialized_users = []
        for user in users:
            user_schema = UserResponse.model_validate(user)
            serialized_users.append(user_schema)
        
        end_time = time.time()
        serialization_time = end_time - start_time
        
        # Проверяем, что сериализация прошла успешно
        assert len(serialized_users) == 100
        
        # Проверяем производительность (должно быть быстрее 1 секунды)
        assert serialization_time < 1.0, f"Сериализация заняла {serialization_time:.2f} секунд"


class TestComplexDataTypes:
    """
    Тесты работы со сложными типами данных.
    
    Проверяют корректную обработку JSON, дат,
    decimal и других сложных типов.
    """
    
    def test_json_field_serialization(self, test_session, sample_user_data):
        """Тестирует сериализацию JSON полей."""
        user = User(**sample_user_data)
        test_session.add(user)
        test_session.commit()
        test_session.refresh(user)
        
        # Создаем настройки с JSON полями
        settings = UserSettings(
            user_id=user.id,
            notification_settings={
                "email": True,
                "sms": False,
                "push": True,
                "frequency": "daily"
            },
            interface_settings={
                "theme": "dark",
                "language": "ru",
                "timezone": "Europe/Moscow",
                "items_per_page": 25
            }
        )
        test_session.add(settings)
        test_session.commit()
        
        # Загружаем пользователя с настройками
        user_with_settings = test_session.query(User).options(
            selectinload(User.settings)
        ).filter(User.id == user.id).first()
        
        # Сериализуем в схему
        user_detailed = UserDetailed.model_validate(user_with_settings)
        
        # Проверяем JSON поля
        assert user_detailed.settings is not None
        assert isinstance(user_detailed.settings, dict)
        
        # Если settings корректно сериализованы, должны содержать наши данные
        if 'notification_settings' in user_detailed.settings:
            assert user_detailed.settings['notification_settings']['email'] is True
        
        if 'interface_settings' in user_detailed.settings:
            assert user_detailed.settings['interface_settings']['theme'] == "dark"
    
    def test_datetime_field_serialization(self, test_session, sample_user_data):
        """Тестирует сериализацию полей datetime."""
        # Создаем пользователя с явно заданным временем
        now = datetime.now(timezone.utc)
        user_data = sample_user_data.copy()
        user_data.update({
            "email_verified_at": now,
            "last_login_at": now,
            "terms_accepted_at": now
        })
        
        user = User(**user_data)
        test_session.add(user)
        test_session.commit()
        test_session.refresh(user)
        
        # Сериализуем в схему
        user_schema = UserResponse.model_validate(user)
        
        # Проверяем datetime поля
        assert user_schema.email_verified_at is not None
        assert isinstance(user_schema.email_verified_at, datetime)
        assert user_schema.last_login_at is not None
        assert isinstance(user_schema.last_login_at, datetime)


if __name__ == "__main__":
    # Запуск тестов напрямую
    pytest.main([__file__, "-v", "--tb=short"])
