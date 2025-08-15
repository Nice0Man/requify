"""
Базовые тесты совместимости моделей SQLAlchemy и схем Pydantic.

Простые тесты для проверки основной функциональности
без сложных зависимостей.
"""

import pytest
from typing import Dict, Any

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.models.base import Base
from app.models.user import User
from app.schemas.user import UserBase, UserCreate, UserResponse


@pytest.fixture(scope="function")
def test_db():
    """Создает простую тестовую базу данных в памяти."""
    engine = create_engine(
        "sqlite:///:memory:", echo=False, connect_args={"check_same_thread": False}
    )

    # Создаем таблицы
    Base.metadata.create_all(engine)

    # Возвращаем сессию
    with Session(engine) as session:
        yield session

    # Очищаем после теста
    Base.metadata.drop_all(engine)


@pytest.fixture
def user_data():
    """Простые тестовые данные пользователя."""
    return {
        "username": "testuser",
        "email": "test@example.com",
        "name": "Test User",
        "is_active": True,
    }


class TestBasicModelSchemaCompatibility:
    """Базовые тесты совместимости моделей и схем."""

    def test_user_create_schema_validation(self, user_data):
        """Тестирует валидацию схемы создания пользователя."""
        # Создаем схему с безопасным паролем
        user_create_data = user_data.copy()
        user_create_data["password"] = (
            "SafePassword123!"  # Не содержит email или username
        )

        user_create = UserCreate(**user_create_data)

        # Проверяем основные поля
        assert user_create.username == user_data["username"]
        assert user_create.email == user_data["email"]
        assert user_create.name == user_data["name"]
        assert user_create.password == "SafePassword123!"

    def test_user_model_creation(self, test_db, user_data):
        """Тестирует создание модели пользователя в БД."""
        # Добавляем обязательный password_hash
        user_data_with_hash = user_data.copy()
        user_data_with_hash["password_hash"] = "fake_hash_for_testing"

        # Создаем пользователя
        user = User(**user_data_with_hash)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)

        # Проверяем, что пользователь создан
        assert user.id is not None
        assert user.username == user_data["username"]
        assert user.email == user_data["email"]
        assert user.name == user_data["name"]

    def test_user_model_to_schema_conversion(self, test_db, user_data):
        """Тестирует преобразование модели в схему."""
        # Добавляем обязательный password_hash
        user_data_with_hash = user_data.copy()
        user_data_with_hash["password_hash"] = "fake_hash_for_testing"

        # Создаем пользователя в БД
        user = User(**user_data_with_hash)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)

        # Преобразуем в схему ответа
        user_response = UserResponse.model_validate(user)

        # Проверяем поля
        assert user_response.id == user.id
        assert user_response.username == user.username
        assert user_response.email == user.email
        assert user_response.name == user.name
        assert user_response.is_active == user.is_active

    def test_user_base_schema_fields(self):
        """Тестирует наличие обязательных полей в базовой схеме."""
        # Проверяем, что у UserBase есть нужные поля
        fields = UserBase.model_fields

        required_fields = {"username", "email", "name"}
        schema_fields = set(fields.keys())

        # Проверяем наличие обязательных полей
        missing_fields = required_fields - schema_fields
        assert not missing_fields, f"Отсутствующие поля: {missing_fields}"

    def test_user_schema_field_types(self):
        """Тестирует типы полей в схеме."""
        fields = UserBase.model_fields

        # Проверяем типы основных полей
        assert (
            "str" in str(fields["username"].annotation)
            or fields["username"].annotation == str
        )
        assert "EmailStr" in str(
            fields["email"].annotation
        )  # email использует EmailStr
        assert (
            "str" in str(fields["name"].annotation) or fields["name"].annotation == str
        )

    def test_model_schema_data_consistency(self, test_db, user_data):
        """Тестирует консистентность данных между моделью и схемой."""
        # Создаем пользователя через схему с безопасным паролем
        user_create_data = user_data.copy()
        user_create_data["password"] = "SafePassword123!"  # Пароль не содержит email
        user_create = UserCreate(**user_create_data)

        # Создаем модель из схемы (исключая поля, которых нет в модели User)
        schema_only_fields = {
            "password",
            "confirm_password",
            "invite_token",
            "first_name",
            "last_name",
            "timezone",
            "language",
        }
        model_data = user_create.model_dump(exclude=schema_only_fields)
        model_data["password_hash"] = "fake_hash_for_testing"  # Добавляем требуемый хеш
        user = User(**model_data)
        test_db.add(user)
        test_db.commit()
        test_db.refresh(user)

        # Преобразуем обратно в схему
        user_response = UserResponse.model_validate(user)

        # Проверяем консистентность данных
        assert user_response.username == user_create.username
        assert user_response.email == user_create.email
        assert user_response.name == user_create.name

    def test_multiple_users_serialization(self, test_db):
        """Тестирует сериализацию нескольких пользователей."""
        users_data = [
            {
                "username": f"user{i}",
                "email": f"user{i}@test.com",
                "name": f"User {i}",
                "is_active": True,
                "password_hash": f"fake_hash_{i}",  # Добавляем обязательный хеш
            }
            for i in range(1, 6)
        ]

        # Создаем пользователей
        users = []
        for data in users_data:
            user = User(**data)
            users.append(user)
            test_db.add(user)

        test_db.commit()

        # Обновляем объекты
        for user in users:
            test_db.refresh(user)

        # Сериализуем всех пользователей
        user_responses = [UserResponse.model_validate(user) for user in users]

        # Проверяем результат
        assert len(user_responses) == 5
        for i, user_response in enumerate(user_responses, 1):
            assert user_response.username == f"user{i}"
            assert user_response.email == f"user{i}@test.com"
            assert user_response.name == f"User {i}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
