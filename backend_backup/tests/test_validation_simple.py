"""
Упрощенные тесты валидации схем.

Проверяют основные сценарии валидации без сложных зависимостей.
"""

import pytest
from pydantic import ValidationError

from app.schemas.user import UserCreate, UserUpdate, UserBase


class TestSimpleValidation:
    """Упрощенные тесты валидации."""

    def test_valid_user_creation(self):
        """Тестирует валидное создание пользователя."""
        user_data = {
            "username": "validuser",
            "email": "user@company.com",  # Изменяем email
            "name": "Valid User",
            "password": "SafePassword123!",  # Безопасный пароль, не содержащий части email
        }

        user = UserCreate(**user_data)
        assert user.username == "validuser"
        assert user.email == "user@company.com"
        assert user.name == "Valid User"

    def test_invalid_email_validation(self):
        """Тестирует валидацию неправильного email."""
        user_data = {
            "username": "testuser",
            "email": "invalid-email",  # Неправильный email
            "name": "Test User",
            "password": "SecurePassword123!",
        }

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**user_data)

        # Проверяем, что ошибка связана с email
        errors = exc_info.value.errors()
        email_errors = [e for e in errors if "email" in e.get("loc", [])]
        assert len(email_errors) > 0

    def test_short_username_validation(self):
        """Тестирует валидацию короткого username."""
        user_data = {
            "username": "a",  # Слишком короткий
            "email": "test@example.com",
            "name": "Test User",
            "password": "SecurePassword123!",
        }

        with pytest.raises(ValidationError) as exc_info:
            UserCreate(**user_data)

        # Проверяем ошибку username
        errors = exc_info.value.errors()
        username_errors = [e for e in errors if "username" in e.get("loc", [])]
        assert len(username_errors) > 0

    def test_user_update_partial(self):
        """Тестирует частичное обновление пользователя."""
        # Только username (поле которое есть в UserUpdate)
        update = UserUpdate(username="newuser")
        assert update.username == "newuser"
        assert update.email is None

        # Только email
        update = UserUpdate(email="new@example.com")
        assert update.email == "new@example.com"
        assert update.username is None

    def test_user_base_required_fields(self):
        """Тестирует обязательные поля в UserBase."""
        # Без обязательных полей должна быть ошибка
        with pytest.raises(ValidationError):
            UserBase()

        # С обязательными полями должно работать
        user = UserBase(username="test", email="test@example.com", name="Test User")
        assert user.username == "test"
        assert user.email == "test@example.com"
        assert user.name == "Test User"

    def test_field_serialization(self):
        """Тестирует сериализацию полей."""
        user = UserBase(
            username="testuser",
            email="test@example.com",
            name="Test User",
            is_active=True,
        )

        # Проверяем сериализацию в словарь
        data = user.model_dump()

        assert data["username"] == "testuser"
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert data["is_active"] is True

    def test_exclude_unset_serialization(self):
        """Тестирует сериализацию только установленных полей."""
        update = UserUpdate(
            username="newuser"
        )  # Используем поле, которое есть в UserUpdate

        # Только установленные поля
        data = update.model_dump(exclude_unset=True)
        assert data == {"username": "newuser"}

        # Все поля (включая None)
        all_data = update.model_dump()
        assert all_data["username"] == "newuser"
        assert "email" in all_data  # Поле присутствует, но None


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
