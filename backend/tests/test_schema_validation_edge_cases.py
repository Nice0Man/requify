"""
Тесты крайних случаев валидации схем.

Проверяют обработку граничных значений, исключений
и сложных сценариев валидации данных.
"""

import pytest
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Any, Dict

from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError

from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserBase,
    UserDetailed,
    UserStatus,
    AuthProvider,
)
from app.schemas.company import CompanyCreate, CompanyUpdate
from app.schemas.project import ProjectCreate, ProjectUpdate
from app.schemas.requirement import RequirementCreate, RequirementUpdate


class TestUserSchemaValidationEdgeCases:
    """Тесты крайних случаев валидации пользовательских схем."""

    @pytest.mark.parametrize(
        "invalid_email",
        [
            "invalid-email",
            "@example.com",
            "user@",
            "user..test@example.com",
            "user@example..com",
            "",
            None,
        ],
    )
    def test_invalid_email_formats(self, invalid_email):
        """Тестирует различные неправильные форматы email."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email=invalid_email,
                name="Test User",
                password="password123",
            )

    @pytest.mark.parametrize(
        "forbidden_domain",
        [
            "temp-mail.org",
            "10minutemail.com",
            "guerrillamail.com",
            "mailinator.com",
            "tempmail.email",
            "throwaway.email",
        ],
    )
    def test_forbidden_email_domains(self, forbidden_domain):
        """Тестирует блокировку запрещенных доменов email."""
        with pytest.raises(ValidationError, match="Email domain .* is not allowed"):
            UserCreate(
                username="testuser",
                email=f"user@{forbidden_domain}",
                name="Test User",
                password="password123",
            )

    @pytest.mark.parametrize(
        "reserved_username",
        [
            "admin",
            "administrator",
            "root",
            "system",
            "support",
            "help",
            "api",
            "www",
            "ftp",
            "mail",
            "email",
            "test",
            "demo",
            "guest",
            "null",
            "undefined",
        ],
    )
    def test_reserved_usernames_rejected(self, reserved_username):
        """Тестирует отклонение зарезервированных имен пользователей."""
        with pytest.raises(
            ValidationError, match=f"Username '{reserved_username}' is reserved"
        ):
            UserCreate(
                username=reserved_username,
                email="test@example.com",
                name="Test User",
                password="password123",
            )

    @pytest.mark.parametrize(
        "invalid_username",
        [
            "a",  # Слишком короткий
            "user@name",  # Недопустимые символы
            "user name",  # Пробелы
            "user#name",  # Спецсимволы
            ".username",  # Начинается с точки
            "username.",  # Заканчивается точкой
            "-username",  # Начинается с дефиса
            "username-",  # Заканчивается дефисом
            "_username",  # Начинается с подчеркивания
            "username_",  # Заканчивается подчеркиванием
            "user..name",  # Последовательные точки
            "user--name",  # Последовательные дефисы
            "user__name",  # Последовательные подчеркивания
        ],
    )
    def test_invalid_username_formats(self, invalid_username):
        """Тестирует различные неправильные форматы username."""
        with pytest.raises(ValidationError):
            UserCreate(
                username=invalid_username,
                email="test@example.com",
                name="Test User",
                password="password123",
            )

    def test_password_confirmation_mismatch(self):
        """Тестирует несоответствие пароля и подтверждения."""
        with pytest.raises(
            ValidationError, match="Password and confirm_password do not match"
        ):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                password="password123",
                confirm_password="different_password",
            )

    @pytest.mark.parametrize(
        "weak_password",
        [
            "123",  # Слишком короткий
            "password",  # Слишком простой
            "123456789",  # Только цифры
            "abcdefghi",  # Только буквы
            "PASSWORD",  # Только заглавные
        ],
    )
    def test_weak_password_rejection(self, weak_password):
        """Тестирует отклонение слабых паролей."""
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                password=weak_password,
                confirm_password=weak_password,
            )

    def test_password_contains_username(self):
        """Тестирует отклонение пароля, содержащего имя пользователя."""
        with pytest.raises(
            ValidationError, match="Password should not contain username"
        ):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                password="testuser123",
                confirm_password="testuser123",
            )

    def test_password_contains_email(self):
        """Тестирует отклонение пароля, содержащего email."""
        with pytest.raises(
            ValidationError, match="Password should not contain email address"
        ):
            UserCreate(
                username="testuser",
                email="user@example.com",
                name="Test User",
                password="user123password",
                confirm_password="user123password",
            )

    def test_auth_provider_consistency_validation(self):
        """Тестирует валидацию согласованности провайдера аутентификации."""
        # Для внешних провайдеров должен быть указан auth_provider_id
        with pytest.raises(ValidationError, match="auth_provider_id is required"):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                auth_provider=AuthProvider.GOOGLE,
                auth_provider_id=None,
                password="password123",
            )

    def test_company_id_validation(self):
        """Тестирует валидацию ID компании."""
        with pytest.raises(
            ValidationError, match="Company ID must be a positive integer"
        ):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                company_id=-1,
                password="password123",
            )

    def test_large_data_fields_validation(self):
        """Тестирует валидацию больших данных."""
        # Очень длинное имя
        long_name = "A" * 1000
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name=long_name,
                password="password123",
            )

        # Очень длинный username
        long_username = "a" * 100
        with pytest.raises(ValidationError):
            UserCreate(
                username=long_username,
                email="test@example.com",
                name="Test User",
                password="password123",
            )


class TestUpdateSchemaValidation:
    """Тесты валидации схем обновления."""

    def test_empty_update_validation(self):
        """Тестирует валидацию пустого обновления."""
        with pytest.raises(
            ValidationError, match="At least one field must be provided"
        ):
            UserUpdate()

    def test_null_values_in_update(self):
        """Тестирует обработку null значений в обновлении."""
        # Null значения должны быть валидными для опциональных полей
        update = UserUpdate(username=None, email="new@example.com", name=None)
        assert update.username is None
        assert update.email == "new@example.com"
        assert update.name is None

    def test_partial_update_validation(self):
        """Тестирует валидацию частичного обновления."""
        # Только одно поле
        update = UserUpdate(name="New Name")
        assert update.name == "New Name"
        assert update.email is None

        # Несколько полей
        update = UserUpdate(name="New Name", email="new@example.com")
        assert update.name == "New Name"
        assert update.email == "new@example.com"
        assert update.username is None


class TestComplexValidationScenarios:
    """Тесты сложных сценариев валидации."""

    def test_unicode_and_special_characters(self):
        """Тестирует обработку Unicode и специальных символов."""
        # Unicode в имени должен работать
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            name="Тест Пользователь",  # Кириллица
            password="password123",
        )
        assert user.name == "Тест Пользователь"

        # Emoji в имени
        user = UserCreate(
            username="testuser2",
            email="test2@example.com",
            name="Test User 😊",
            password="password123",
        )
        assert user.name == "Test User 😊"

    def test_edge_case_datetime_values(self):
        """Тестирует крайние случаи для datetime полей."""
        # Очень старая дата
        old_date = datetime(1900, 1, 1, tzinfo=timezone.utc)
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            name="Test User",
            password="password123",
            terms_accepted_at=old_date,
        )
        assert user.terms_accepted_at == old_date

        # Будущая дата
        future_date = datetime(2100, 12, 31, tzinfo=timezone.utc)
        user = UserCreate(
            username="testuser2",
            email="test2@example.com",
            name="Test User",
            password="password123",
            email_verified_at=future_date,
        )
        assert user.email_verified_at == future_date

    def test_json_field_edge_cases(self):
        """Тестирует крайние случаи для JSON полей."""
        # Пустой словарь
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            name="Test User",
            password="password123",
            preferences={},
        )
        assert user.preferences == {}

        # Вложенный JSON
        complex_preferences = {
            "ui": {"theme": "dark", "sidebar": {"collapsed": True, "width": 250}},
            "notifications": {"email": True, "push": False, "frequency": "daily"},
            "features": ["feature1", "feature2", "feature3"],
        }

        user = UserCreate(
            username="testuser2",
            email="test2@example.com",
            name="Test User",
            password="password123",
            preferences=complex_preferences,
        )
        assert user.preferences == complex_preferences

    def test_enum_field_validation(self):
        """Тестирует валидацию enum полей."""
        # Валидные значения
        for status in UserStatus:
            user = UserCreate(
                username=f"user_{status.value}",
                email=f"{status.value}@example.com",
                name="Test User",
                password="password123",
                status=status,
            )
            assert user.status == status

        # Невалидное значение
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser",
                email="test@example.com",
                name="Test User",
                password="password123",
                status="invalid_status",
            )

    def test_cross_field_validation(self):
        """Тестирует перекрестную валидацию полей."""
        # Для локального провайдера auth_provider_id должен быть None
        user = UserCreate(
            username="testuser",
            email="test@example.com",
            name="Test User",
            password="password123",
            auth_provider=AuthProvider.LOCAL,
            auth_provider_id="some_id",  # Будет сброшен в None
        )
        assert user.auth_provider_id is None

        # Для внешних провайдеров auth_provider_id обязателен
        with pytest.raises(ValidationError):
            UserCreate(
                username="testuser2",
                email="test2@example.com",
                name="Test User",
                password="password123",
                auth_provider=AuthProvider.GOOGLE,
                auth_provider_id=None,
            )


class TestSchemaSerializationEdgeCases:
    """Тесты крайних случаев сериализации схем."""

    def test_none_values_serialization(self):
        """Тестирует сериализацию None значений."""
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "name": "Test User",
            "status": UserStatus.ACTIVE,
            "auth_provider": AuthProvider.LOCAL,
            "company_id": None,
            "auth_provider_id": None,
            "email_verified_at": None,
            "last_login_at": None,
        }

        user = UserBase(**user_data)
        serialized = user.model_dump()

        # None значения должны быть сериализованы
        assert serialized["company_id"] is None
        assert serialized["auth_provider_id"] is None
        assert serialized["email_verified_at"] is None

    def test_exclude_unset_serialization(self):
        """Тестирует сериализацию с исключением неустановленных полей."""
        # Создаем объект только с частью полей
        update = UserUpdate(name="New Name", email="new@example.com")

        # Сериализуем только установленные поля
        serialized = update.model_dump(exclude_unset=True)

        # Должны быть только установленные поля
        assert set(serialized.keys()) == {"name", "email"}
        assert serialized["name"] == "New Name"
        assert serialized["email"] == "new@example.com"

    def test_datetime_serialization_formats(self):
        """Тестирует различные форматы сериализации datetime."""
        now = datetime.now(timezone.utc)

        user = UserBase(
            username="testuser",
            email="test@example.com",
            name="Test User",
            email_verified_at=now,
        )

        # JSON сериализация
        json_data = user.model_dump(mode="json")
        assert isinstance(json_data["email_verified_at"], str)

        # Python сериализация
        python_data = user.model_dump(mode="python")
        assert isinstance(python_data["email_verified_at"], datetime)


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
