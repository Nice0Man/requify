"""
Схемы для модели User.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr, field_validator, model_validator
import re


class UserBase(BaseModel):
    """Базовая схема пользователя."""

    username: str = Field(
        ..., min_length=2, max_length=50, description="Имя пользователя"
    )
    email: EmailStr = Field(..., description="Email пользователя")
    role: str = Field(..., min_length=1, max_length=20, description="Роль пользователя")

    @field_validator("username")
    def validate_username(cls, v):
        """Валидация имени пользователя"""
        if not v or not v.strip():
            raise ValueError("Username cannot be empty")

        v = v.strip()

        # Имя пользователя может содержать только буквы, цифры, точки, дефисы и подчеркивания
        if not re.match(r"^[a-zA-Z0-9._-]+$", v):
            raise ValueError(
                "Username can only contain letters, numbers, dots, hyphens and underscores"
            )

        # Не должно начинаться или заканчиваться точкой, дефисом или подчеркиванием
        if v.startswith((".", "-", "_")) or v.endswith((".", "-", "_")):
            raise ValueError(
                "Username cannot start or end with dot, hyphen or underscore"
            )

        # Не должно содержать последовательные специальные символы
        if any(combo in v for combo in ["..", "--", "__", ".-", "-_", "_."]):
            raise ValueError("Username cannot contain consecutive special characters")

        return v.lower()  # Приводим к нижнему регистру

    @field_validator("email")
    def validate_email(cls, v):
        """Дополнительная валидация email"""
        email_str = str(v).lower()

        # Проверяем на запрещенные домены (можно расширить)
        forbidden_domains = ["temp-mail.org", "10minutemail.com", "guerrillamail.com"]
        domain = email_str.split("@")[1] if "@" in email_str else ""

        if domain in forbidden_domains:
            raise ValueError(f"Email domain {domain} is not allowed")

        # Проверяем длину локальной части (до @)
        local_part = email_str.split("@")[0] if "@" in email_str else ""
        if len(local_part) > 64:
            raise ValueError("Email local part cannot exceed 64 characters")

        return email_str

    @field_validator("role")
    def validate_role(cls, v):
        """Валидация роли пользователя"""
        if not v or not v.strip():
            raise ValueError("User role cannot be empty")

        v = v.strip().lower()

        # Предопределенные роли
        valid_roles = [
            "admin",
            "manager",
            "analyst",
            "developer",
            "tester",
            "viewer",
            "guest",
        ]

        if v not in valid_roles:
            raise ValueError(f"Invalid user role. Must be one of: {valid_roles}")

        return v


class UserCreate(UserBase):
    """Схема для создания пользователя."""

    password: str = Field(..., min_length=8, description="Пароль пользователя")

    @field_validator("password")
    def validate_password(cls, v):
        """Валидация пароля"""
        if not v or len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")

        # Проверка сложности пароля
        has_upper = any(c.isupper() for c in v)
        has_lower = any(c.islower() for c in v)
        has_digit = any(c.isdigit() for c in v)
        has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)

        if not has_upper:
            raise ValueError("Password must contain at least one uppercase letter")
        if not has_lower:
            raise ValueError("Password must contain at least one lowercase letter")
        if not has_digit:
            raise ValueError("Password must contain at least one digit")
        if not has_special:
            raise ValueError("Password must contain at least one special character")

        # Проверка на общие пароли
        common_passwords = [
            "password",
            "12345678",
            "qwerty123",
            "admin123",
            "password123",
            "welcome123",
            "letmein123",
            "monkey123",
            "123456789",
            "football123",
        ]

        if v.lower() in common_passwords:
            raise ValueError(
                "Password is too common, please choose a more secure password"
            )

        # Проверка на последовательности
        if "123456" in v or "abcdef" in v.lower() or "qwerty" in v.lower():
            raise ValueError("Password should not contain common sequences")

        return v

    @model_validator(mode="before")
    @classmethod
    def validate_user_creation(cls, data):
        """Дополнительная валидация при создании пользователя"""
        if isinstance(data, dict):
            username = data.get("username", "")
            email = data.get("email", "")
            password = data.get("password", "")

            # Проверяем, что пароль не содержит имя пользователя или email
            if username and len(username) > 3 and username.lower() in password.lower():
                raise ValueError("Password should not contain username")

            if email and len(email) > 5:
                email_local = email.split("@")[0] if "@" in email else email  # type: ignore
                if len(email_local) > 3 and email_local.lower() in password.lower():
                    raise ValueError("Password should not contain email address")

        return data


class UserUpdate(BaseModel):
    """Схема для обновления пользователя."""

    username: Optional[str] = Field(
        None, min_length=2, max_length=50, description="Имя пользователя"
    )
    email: Optional[EmailStr] = Field(None, description="Email пользователя")
    role: Optional[str] = Field(
        None, min_length=1, max_length=20, description="Роль пользователя"
    )
    password: Optional[str] = Field(
        None, min_length=8, description="Пароль пользователя"
    )

    @field_validator("username")
    def validate_username(cls, v):
        """Валидация имени пользователя при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Username cannot be empty")

            v = v.strip()

            if not re.match(r"^[a-zA-Z0-9._-]+$", v):
                raise ValueError(
                    "Username can only contain letters, numbers, dots, hyphens and underscores"
                )

            if v.startswith((".", "-", "_")) or v.endswith((".", "-", "_")):
                raise ValueError(
                    "Username cannot start or end with dot, hyphen or underscore"
                )

            if any(combo in v for combo in ["..", "--", "__", ".-", "-_", "_."]):
                raise ValueError(
                    "Username cannot contain consecutive special characters"
                )

            return v.lower()
        return v

    @field_validator("email")
    def validate_email(cls, v):
        """Валидация email при обновлении"""
        if v is not None:
            email_str = str(v).lower()

            forbidden_domains = [
                "temp-mail.org",
                "10minutemail.com",
                "guerrillamail.com",
            ]
            domain = email_str.split("@")[1] if "@" in email_str else ""

            if domain in forbidden_domains:
                raise ValueError(f"Email domain {domain} is not allowed")

            local_part = email_str.split("@")[0] if "@" in email_str else ""
            if len(local_part) > 64:
                raise ValueError("Email local part cannot exceed 64 characters")

            return email_str
        return v

    @field_validator("role")
    def validate_role(cls, v):
        """Валидация роли при обновлении"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("User role cannot be empty")

            v = v.strip().lower()

            valid_roles = [
                "admin",
                "manager",
                "analyst",
                "developer",
                "tester",
                "viewer",
                "guest",
            ]

            if v not in valid_roles:
                raise ValueError(f"Invalid user role. Must be one of: {valid_roles}")

            return v
        return v

    @field_validator("password")
    def validate_password(cls, v):
        """Валидация пароля при обновлении"""
        if v is not None:
            if not v or len(v) < 8:
                raise ValueError("Password must be at least 8 characters long")

            # Те же проверки сложности пароля
            has_upper = any(c.isupper() for c in v)
            has_lower = any(c.islower() for c in v)
            has_digit = any(c.isdigit() for c in v)
            has_special = any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v)

            if not has_upper:
                raise ValueError("Password must contain at least one uppercase letter")
            if not has_lower:
                raise ValueError("Password must contain at least one lowercase letter")
            if not has_digit:
                raise ValueError("Password must contain at least one digit")
            if not has_special:
                raise ValueError("Password must contain at least one special character")

            common_passwords = [
                "password",
                "12345678",
                "qwerty123",
                "admin123",
                "password123",
                "welcome123",
                "letmein123",
                "monkey123",
                "123456789",
                "football123",
            ]

            if v.lower() in common_passwords:
                raise ValueError(
                    "Password is too common, please choose a more secure password"
                )

            if "123456" in v or "abcdef" in v.lower() or "qwerty" in v.lower():
                raise ValueError("Password should not contain common sequences")

            return v
        return v

    @model_validator(mode="before")
    @classmethod
    def validate_at_least_one_field(cls, data):
        """Проверка, что хотя бы одно поле указано для обновления"""
        if isinstance(data, dict):
            if not any(v is not None for v in data.values()):
                raise ValueError("At least one field must be provided for update")
        return data


class UserInDBBase(UserBase):
    """Базовая схема пользователя с данными из БД."""

    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class User(UserInDBBase):
    """Схема пользователя для ответов API."""

    pass


class UserWithStats(User):
    """Схема пользователя со статистикой."""

    authored_requirements_count: int = 0
    modified_requirements_count: int = 0
    comments_count: int = 0

    @field_validator(
        "authored_requirements_count", "modified_requirements_count", "comments_count"
    )
    def validate_counts(cls, v):
        """Валидация счетчиков статистики"""
        if v < 0:
            raise ValueError("Statistical counts cannot be negative")
        return v

    @property
    def total_activity(self) -> int:
        """Общая активность пользователя"""
        return (
            self.authored_requirements_count
            + self.modified_requirements_count
            + self.comments_count
        )

    @property
    def is_active_contributor(self) -> bool:
        """Является ли пользователь активным участником"""
        return self.total_activity > 10


class UserInDB(UserInDBBase):
    """Схема пользователя в БД."""

    hashed_password: str = Field(..., description="Хэшированный пароль")

    @field_validator("hashed_password")
    def validate_hashed_password(cls, v):
        """Валидация хэшированного пароля"""
        if not v or not v.strip():
            raise ValueError("Hashed password cannot be empty")

        # Проверяем, что это похоже на bcrypt хэш
        if (
            not v.startswith("$2b$")
            and not v.startswith("$2a$")
            and not v.startswith("$2y$")
        ):
            raise ValueError("Invalid password hash format")

        return v
