"""
Password Service.

Рефакторен с использованием паттернов проектирования и принципов SOLID.
"""

from typing import Optional, Dict, Any, List, Tuple
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime, UTC, timedelta
import secrets
import string

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import JWTTokenManager, PasswordManager, verify_password
from app.crud import user as crud_user, crud_refresh_token
from app.models.user import User
from app.utils.logger import logger
from .base import BaseService, ServiceError


class PasswordServiceError(ServiceError):
    """Ошибки сервиса паролей."""
    pass


class WeakPasswordError(PasswordServiceError):
    """Ошибка слабого пароля."""
    pass


class InvalidPasswordError(PasswordServiceError):
    """Ошибка неверного пароля."""
    pass


class PasswordStrength(str, Enum):
    """Уровни сложности пароля."""
    
    VERY_WEAK = "very_weak"
    WEAK = "weak"
    MEDIUM = "medium"
    STRONG = "strong"
    VERY_STRONG = "very_strong"


class PasswordResetTokenType(str, Enum):
    """Типы токенов сброса пароля."""
    
    EMAIL = "email"
    SMS = "sms"
    TEMPORARY = "temporary"


# Абстрактные интерфейсы
class IPasswordValidator(ABC):
    """Интерфейс валидатора паролей."""
    
    @abstractmethod
    def validate(self, password: str) -> Tuple[bool, List[str]]:
        """Валидировать пароль."""
        pass
    
    @abstractmethod
    def get_strength(self, password: str) -> PasswordStrength:
        """Получить уровень сложности пароля."""
        pass


class IPasswordGenerator(ABC):
    """Интерфейс генератора паролей."""
    
    @abstractmethod
    def generate(self, length: int = 12, include_symbols: bool = True) -> str:
        """Сгенерировать пароль."""
        pass


class IPasswordHasher(ABC):
    """Интерфейс хеширования паролей."""
    
    @abstractmethod
    def hash_password(self, password: str) -> str:
        """Хешировать пароль."""
        pass
    
    @abstractmethod
    def verify_password(self, password: str, hashed: str) -> bool:
        """Проверить пароль."""
        pass


# Конкретные реализации
class StandardPasswordValidator(IPasswordValidator):
    """Стандартный валидатор паролей."""
    
    def __init__(self, min_length: int = 8, require_uppercase: bool = True,
                 require_lowercase: bool = True, require_digits: bool = True,
                 require_symbols: bool = True):
        self.min_length = min_length
        self.require_uppercase = require_uppercase
        self.require_lowercase = require_lowercase
        self.require_digits = require_digits
        self.require_symbols = require_symbols
    
    def validate(self, password: str) -> Tuple[bool, List[str]]:
        """Валидировать пароль."""
        errors = []
        
        if len(password) < self.min_length:
            errors.append(f"Пароль должен содержать минимум {self.min_length} символов")
        
        if self.require_uppercase and not any(c.isupper() for c in password):
            errors.append("Пароль должен содержать заглавные буквы")
        
        if self.require_lowercase and not any(c.islower() for c in password):
            errors.append("Пароль должен содержать строчные буквы")
        
        if self.require_digits and not any(c.isdigit() for c in password):
            errors.append("Пароль должен содержать цифры")
        
        if self.require_symbols and not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            errors.append("Пароль должен содержать специальные символы")
        
        return len(errors) == 0, errors
    
    def get_strength(self, password: str) -> PasswordStrength:
        """Получить уровень сложности пароля."""
        score = 0
        
        # Длина
        if len(password) >= 8:
            score += 1
        if len(password) >= 12:
            score += 1
        if len(password) >= 16:
            score += 1
        
        # Символы
        if any(c.isupper() for c in password):
            score += 1
        if any(c.islower() for c in password):
            score += 1
        if any(c.isdigit() for c in password):
            score += 1
        if any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
            score += 1
        
        # Разнообразие
        unique_chars = len(set(password))
        if unique_chars >= len(password) * 0.7:
            score += 1
        
        if score <= 2:
            return PasswordStrength.VERY_WEAK
        elif score <= 4:
            return PasswordStrength.WEAK
        elif score <= 6:
            return PasswordStrength.MEDIUM
        elif score <= 7:
            return PasswordStrength.STRONG
        else:
            return PasswordStrength.VERY_STRONG


class SecurePasswordGenerator(IPasswordGenerator):
    """Безопасный генератор паролей."""
    
    def generate(self, length: int = 12, include_symbols: bool = True) -> str:
        """Сгенерировать безопасный пароль."""
        characters = string.ascii_letters + string.digits
        if include_symbols:
            characters += "!@#$%^&*()_+-="
        
        # Обеспечиваем наличие всех типов символов
        password = [
            secrets.choice(string.ascii_uppercase),
            secrets.choice(string.ascii_lowercase),
            secrets.choice(string.digits)
        ]
        
        if include_symbols:
            password.append(secrets.choice("!@#$%^&*()_+-="))
        
        # Заполняем оставшуюся длину
        for _ in range(length - len(password)):
            password.append(secrets.choice(characters))
        
        # Перемешиваем
        secrets.SystemRandom().shuffle(password)
        
        return ''.join(password)


class PasswordResetToken:
    """Токен сброса пароля."""
    
    def __init__(self, user_id: int, token: str, token_type: PasswordResetTokenType,
                 expires_at: datetime, created_at: Optional[datetime] = None):
        self.user_id = user_id
        self.token = token
        self.token_type = token_type
        self.expires_at = expires_at
        self.created_at = created_at or datetime.now(UTC)
        self.used = False
    
    def is_expired(self) -> bool:
        """Проверить, истек ли токен."""
        return datetime.now(UTC) > self.expires_at
    
    def is_valid(self) -> bool:
        """Проверить, действителен ли токен."""
        return not self.used and not self.is_expired()


class PasswordResetManager:
    """Менеджер сброса паролей."""
    
    def __init__(self):
        self._tokens: Dict[str, PasswordResetToken] = {}
        self._user_tokens: Dict[int, List[str]] = {}
    
    def create_reset_token(
        self,
        user_id: int,
        token_type: PasswordResetTokenType = PasswordResetTokenType.EMAIL,
        expires_in_hours: int = 24
    ) -> str:
        """Создать токен сброса пароля."""
        token = secrets.token_urlsafe(32)
        expires_at = datetime.now(UTC) + timedelta(hours=expires_in_hours)
        
        reset_token = PasswordResetToken(
            user_id=user_id,
            token=token,
            token_type=token_type,
            expires_at=expires_at
        )
        
        self._tokens[token] = reset_token
        
        if user_id not in self._user_tokens:
            self._user_tokens[user_id] = []
        self._user_tokens[user_id].append(token)
        
        return token
    
    def validate_reset_token(self, token: str) -> Optional[PasswordResetToken]:
        """Валидировать токен сброса."""
        reset_token = self._tokens.get(token)
        if reset_token and reset_token.is_valid():
            return reset_token
        return None
    
    def use_reset_token(self, token: str) -> bool:
        """Использовать токен сброса."""
        reset_token = self._tokens.get(token)
        if reset_token and reset_token.is_valid():
            reset_token.used = True
            return True
        return False
    
    def revoke_user_tokens(self, user_id: int):
        """Отозвать все токены пользователя."""
        if user_id in self._user_tokens:
            for token in self._user_tokens[user_id]:
                if token in self._tokens:
                    self._tokens[token].used = True
            self._user_tokens[user_id] = []


class PasswordService(BaseService):
    """
    Основной сервис паролей.
    
    Реализует паттерны:
    - Singleton (через BaseService)
    - Strategy (разные валидаторы и генераторы)
    - Template Method (процесс смены пароля)
    - Command (операции с паролями)
    """
    
    def __init__(self):
        self._validator: IPasswordValidator = StandardPasswordValidator()
        self._generator: IPasswordGenerator = SecurePasswordGenerator()
        self._reset_manager = PasswordResetManager()
        super().__init__()
    
    def get_service_name(self) -> str:
        return "PasswordService"
    
    def set_validator(self, validator: IPasswordValidator):
        """Установить валидатор паролей."""
        self._validator = validator
        self._log_operation("set_validator", {"validator": type(validator).__name__})
    
    def set_generator(self, generator: IPasswordGenerator):
        """Установить генератор паролей."""
        self._generator = generator
        self._log_operation("set_generator", {"generator": type(generator).__name__})
    
    async def change_password(
        self,
        db: AsyncSession,
        user: User,
        current_password: str,
        new_password: str
    ) -> None:
        """Изменить пароль пользователя."""
        try:
            self._log_operation("change_password", {"user_id": user.id})
            
            # Проверка текущего пароля
            if not verify_password(current_password, user.password_hash):
                raise InvalidPasswordError("Неверный текущий пароль")
            
            # Валидация нового пароля
            is_valid, errors = self._validator.validate(new_password)
            if not is_valid:
                raise WeakPasswordError(f"Пароль не соответствует требованиям: {', '.join(errors)}")
            
            # Хеширование и сохранение
            hashed_password = PasswordManager.hash_password(new_password)
            await crud_user.update(
                db, db_obj=user, obj_in={"password_hash": hashed_password}
            )
            
            # Отзыв всех refresh токенов для безопасности
            await crud_refresh_token.revoke_user_tokens(
                db, user_id=user.id, reason="password_change"
            )
            
            # Отзыв токенов сброса пароля
            self._reset_manager.revoke_user_tokens(user.id)
            
            logger.info(f"Password changed successfully for user: {user.email}")
            
        except Exception as e:
            raise self._handle_error(e, "change_password")
    
    async def validate_password_strength(self, password: str) -> Dict[str, Any]:
        """Валидировать силу пароля."""
        try:
            self._log_operation("validate_password_strength", {"length": len(password)})
            
            is_valid, errors = self._validator.validate(password)
            strength = self._validator.get_strength(password)
            
            return {
                "is_valid": is_valid,
                "errors": errors,
                "strength": strength.value,
                "score": self._calculate_score(strength)
            }
            
        except Exception as e:
            raise self._handle_error(e, "validate_password_strength")
    
    def generate_password(self, length: int = 12, include_symbols: bool = True) -> str:
        """Сгенерировать безопасный пароль."""
        try:
            self._log_operation("generate_password", {
                "length": length,
                "include_symbols": include_symbols
            })
            
            return self._generator.generate(length, include_symbols)
            
        except Exception as e:
            raise self._handle_error(e, "generate_password")
    
    async def request_password_reset(
        self,
        db: AsyncSession,
        email: str,
        token_type: PasswordResetTokenType = PasswordResetTokenType.EMAIL
    ) -> str:
        """Запросить сброс пароля."""
        try:
            self._log_operation("request_password_reset", {
                "email": email,
                "token_type": token_type.value
            })
            
            # Найти пользователя
            user = await crud_user.get_by_email(db, email=email)
            if not user:
                # Не раскрываем информацию о существовании пользователя
                logger.warning(f"Password reset requested for non-existent email: {email}")
                raise PasswordServiceError("Если email существует, инструкции отправлены")
            
            # Создать токен сброса
            reset_token = self._reset_manager.create_reset_token(
                user_id=user.id,
                token_type=token_type
            )
            
            return reset_token
            
        except Exception as e:
            raise self._handle_error(e, "request_password_reset")
    
    async def reset_password(
        self,
        db: AsyncSession,
        reset_token: str,
        new_password: str
    ) -> None:
        """Сбросить пароль по токену."""
        try:
            self._log_operation("reset_password", {"token_provided": bool(reset_token)})
            
            # Валидация токена
            token_obj = self._reset_manager.validate_reset_token(reset_token)
            if not token_obj:
                raise PasswordServiceError("Недействительный или истекший токен сброса")
            
            # Найти пользователя
            user = await crud_user.get(db, id=token_obj.user_id)
            if not user:
                raise PasswordServiceError("Пользователь не найден")
            
            # Валидация нового пароля
            is_valid, errors = self._validator.validate(new_password)
            if not is_valid:
                raise WeakPasswordError(f"Пароль не соответствует требованиям: {', '.join(errors)}")
            
            # Использовать токен
            if not self._reset_manager.use_reset_token(reset_token):
                raise PasswordServiceError("Токен уже использован")
            
            # Обновить пароль
            hashed_password = PasswordManager.hash_password(new_password)
            await crud_user.update(
                db, db_obj=user, obj_in={"password_hash": hashed_password}
            )
            
            # Отзыв всех токенов
            await crud_refresh_token.revoke_user_tokens(
                db, user_id=user.id, reason="password_reset"
            )
            
            logger.info(f"Password reset successfully for user: {user.email}")
            
        except Exception as e:
            raise self._handle_error(e, "reset_password")
    
    def _calculate_score(self, strength: PasswordStrength) -> int:
        """Вычислить числовую оценку силы пароля."""
        scores = {
            PasswordStrength.VERY_WEAK: 1,
            PasswordStrength.WEAK: 2,
            PasswordStrength.MEDIUM: 3,
            PasswordStrength.STRONG: 4,
            PasswordStrength.VERY_STRONG: 5,
        }
        return scores.get(strength, 1)


# Регистрация сервиса в фабрике
from .base import ServiceFactory
ServiceFactory.register_service("password", PasswordService)

# Singleton instance
password_service = PasswordService()