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
    first_name: Optional[str] = Field(None, description="Имя пользователя")
    last_name: Optional[str] = Field(None, description="Фамилия пользователя")
    department: Optional[str] = Field(None, description="Отдел пользователя")
    phone: Optional[str] = Field(None, description="Телефон пользователя")

    
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

    @field_validator("phone")
    def validate_phone(cls, v):
        """Валидация номера телефона"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Удаляем все символы кроме цифр и +
            phone_digits = re.sub(r"[^\d+]", "", v)

            # Проверяем формат телефона (международный или российский)
            if not re.match(r"^(\+7|8|7)?[0-9]{10}$", phone_digits):
                raise ValueError("Invalid phone number format")

            # Нормализуем к формату +7XXXXXXXXXX
            if phone_digits.startswith("8"):
                phone_digits = "+7" + phone_digits[1:]
            elif phone_digits.startswith("7") and not phone_digits.startswith("+7"):
                phone_digits = "+" + phone_digits
            elif not phone_digits.startswith("+7"):
                phone_digits = "+7" + phone_digits

            return phone_digits
        return v

    @field_validator("first_name", "last_name")
    def validate_names(cls, v):
        """Валидация имени и фамилии"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Проверяем, что содержит только буквы, пробелы и дефисы
            if not re.match(r"^[a-zA-Zа-яА-ЯёЁ\s\-]+$", v):
                raise ValueError("Name can only contain letters, spaces and hyphens")

            # Проверяем длину
            if len(v) > 50:
                raise ValueError("Name cannot exceed 50 characters")

            return v.title()  # Приводим к правильному регистру
        return v

    @field_validator("department")
    def validate_department(cls, v):
        """Валидация отдела"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Проверяем длину
            if len(v) > 100:
                raise ValueError("Department name cannot exceed 100 characters")

            return v
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
    first_name: Optional[str] = Field(None, description="Имя пользователя")
    last_name: Optional[str] = Field(None, description="Фамилия пользователя")
    department: Optional[str] = Field(None, description="Отдел пользователя")
    phone: Optional[str] = Field(None, description="Телефон пользователя")

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

    @field_validator("phone")
    def validate_phone(cls, v):
        """Валидация номера телефона при обновлении"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Удаляем все символы кроме цифр и +
            phone_digits = re.sub(r"[^\d+]", "", v)

            # Проверяем формат телефона (международный или российский)
            if not re.match(r"^(\+7|8|7)?[0-9]{10}$", phone_digits):
                raise ValueError("Invalid phone number format")

            # Нормализуем к формату +7XXXXXXXXXX
            if phone_digits.startswith("8"):
                phone_digits = "+7" + phone_digits[1:]
            elif phone_digits.startswith("7") and not phone_digits.startswith("+7"):
                phone_digits = "+" + phone_digits
            elif not phone_digits.startswith("+7"):
                phone_digits = "+7" + phone_digits

            return phone_digits
        return v

    @field_validator("first_name", "last_name")
    def validate_names(cls, v):
        """Валидация имени и фамилии при обновлении"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Проверяем, что содержит только буквы, пробелы и дефисы
            if not re.match(r"^[a-zA-Zа-яА-ЯёЁ\s\-]+$", v):
                raise ValueError("Name can only contain letters, spaces and hyphens")

            # Проверяем длину
            if len(v) > 50:
                raise ValueError("Name cannot exceed 50 characters")

            return v.title()  # Приводим к правильному регистру
        return v

    @field_validator("department")
    def validate_department(cls, v):
        """Валидация отдела при обновлении"""
        if v is not None:
            v = v.strip()
            if not v:
                return None

            # Проверяем длину
            if len(v) > 100:
                raise ValueError("Department name cannot exceed 100 characters")

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
    email_verified: bool = False
    email_verified_at: Optional[datetime] = None

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


class UserLogin(BaseModel):
    """Схема для входа пользователя."""

    username: str = Field(..., description="Имя пользователя или email")
    password: str = Field(..., description="Пароль пользователя")

    @field_validator("username")
    def validate_username_or_email(cls, v):
        """Валидация имени пользователя или email для входа"""
        if not v or not v.strip():
            raise ValueError("Username or email cannot be empty")

        return v.strip().lower()

    @field_validator("password")
    def validate_password(cls, v):
        """Валидация пароля для входа"""
        if not v:
            raise ValueError("Password cannot be empty")

        return v


class UserProfile(BaseModel):
    """Схема профиля пользователя для публичного просмотра."""

    id: int
    username: str
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    department: Optional[str] = None
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

    @property
    def display_name(self) -> str:
        """Отображаемое имя пользователя"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        elif self.first_name:
            return self.first_name
        else:
            return self.username


class UserPasswordChange(BaseModel):
    """Схема для смены пароля."""

    current_password: str = Field(..., description="Текущий пароль")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        """Валидация нового пароля"""
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

        return v

    @model_validator(mode="after")
    def validate_passwords_match(self):
        """Проверка совпадения паролей"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")

        if self.current_password == self.new_password:
            raise ValueError("New password must be different from current password")

        return self


class UserPasswordReset(BaseModel):
    """Схема для сброса пароля."""

    email: EmailStr = Field(..., description="Email пользователя")

    @field_validator("email")
    def validate_email(cls, v):
        """Валидация email для сброса пароля"""
        return str(v).lower()


class UserPasswordResetConfirm(BaseModel):
    """Схема для подтверждения сброса пароля."""

    token: str = Field(..., description="Токен сброса пароля")
    new_password: str = Field(..., min_length=8, description="Новый пароль")
    confirm_password: str = Field(..., description="Подтверждение нового пароля")

    @field_validator("new_password")
    def validate_new_password(cls, v):
        """Валидация нового пароля"""
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

        return v

    @model_validator(mode="after")
    def validate_passwords_match(self):
        """Проверка совпадения паролей"""
        if self.new_password != self.confirm_password:
            raise ValueError("New password and confirmation do not match")

        return self


class EmailVerificationRequest(BaseModel):
    """Схема для запроса верификации email."""

    email: EmailStr = Field(..., description="Email для верификации")

    @field_validator("email")
    def validate_email(cls, v):
        """Валидация email"""
        return str(v).lower()


class EmailVerificationConfirm(BaseModel):
    """Схема для подтверждения верификации email."""

    token: str = Field(..., description="Токен верификации email")

    @field_validator("token")
    def validate_token(cls, v):
        """Валидация токена"""
        if not v or not v.strip():
            raise ValueError("Verification token cannot be empty")
        return v.strip()
