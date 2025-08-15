"""
Базовые классы и интерфейсы для сервисов.

Модуль содержит базовые классы, абстракции и паттерны для реализации сервисов
в соответствии с принципами SOLID и лучшими практиками ООП.
"""

import abc
import asyncio
import threading
from typing import Any, Dict, List, Optional, Type, TypeVar, Generic
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.logger import logger


T = TypeVar('T')


class ServiceError(Exception):
    """Базовое исключение для всех сервисов."""
    
    def __init__(self, message: str, error_code: Optional[str] = None):
        self.message = message
        self.error_code = error_code
        super().__init__(self.message)


class ValidationError(ServiceError):
    """Исключение для ошибок валидации."""
    pass


class NotFoundError(ServiceError):
    """Исключение для случаев, когда ресурс не найден."""
    pass


class PermissionError(ServiceError):
    """Исключение для ошибок доступа."""
    pass


class SingletonMeta(type):
    """
    Метакласс для реализации паттерна Singleton.
    
    Потокобезопасная реализация singleton для сервисов.
    """
    _instances: Dict[Type, Any] = {}
    _lock = threading.Lock()

    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            with cls._lock:
                if cls not in cls._instances:
                    instance = super(SingletonMeta, cls).__call__(*args, **kwargs)
                    cls._instances[cls] = instance
        return cls._instances[cls]


class BaseServiceMeta(abc.ABCMeta, SingletonMeta):
    """
    Комбинированный метакласс для разрешения конфликта между abc.ABCMeta и SingletonMeta.
    """
    pass


class BaseService(abc.ABC, metaclass=BaseServiceMeta):
    """
    Базовый класс для всех сервисов.
    
    Реализует:
    - Паттерн Singleton
    - Шаблонные методы
    - Логирование
    - Обработку ошибок
    """
    
    def __init__(self):
        self._initialized = False
        self._setup()
    
    def _setup(self):
        """Инициализация сервиса. Переопределяется в наследниках."""
        if not self._initialized:
            self._initialized = True
            logger.info(f"{self.__class__.__name__} initialized as singleton")
    
    @abc.abstractmethod
    def get_service_name(self) -> str:
        """Возвращает имя сервиса."""
        pass
    
    def _log_operation(self, operation: str, details: Optional[Dict] = None):
        """Логирование операций сервиса."""
        service_name = self.get_service_name()
        log_msg = f"{service_name}: {operation}"
        if details:
            log_msg += f" - {details}"
        logger.info(log_msg)
    
    def _handle_error(self, error: Exception, operation: str) -> ServiceError:
        """Обработка и логирование ошибок."""
        service_name = self.get_service_name()
        error_msg = f"{service_name} error in {operation}: {str(error)}"
        logger.error(error_msg, exc_info=True)
        
        if isinstance(error, ServiceError):
            return error
        
        return ServiceError(error_msg)


class Repository(abc.ABC, Generic[T]):
    """
    Базовый класс для репозиториев.
    
    Реализует паттерн Repository для работы с данными.
    """
    
    @abc.abstractmethod
    async def get_by_id(self, db: AsyncSession, id: int) -> Optional[T]:
        """Получить объект по ID."""
        pass
    
    @abc.abstractmethod
    async def get_multi(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[T]:
        """Получить список объектов."""
        pass
    
    @abc.abstractmethod
    async def create(self, db: AsyncSession, obj_in: Any) -> T:
        """Создать новый объект."""
        pass
    
    @abc.abstractmethod
    async def update(self, db: AsyncSession, db_obj: T, obj_in: Any) -> T:
        """Обновить объект."""
        pass
    
    @abc.abstractmethod
    async def delete(self, db: AsyncSession, id: int) -> bool:
        """Удалить объект."""
        pass


class CRUDService(BaseService, Generic[T]):
    """
    Базовый сервис для CRUD операций.
    
    Реализует общую логику для создания, чтения, обновления и удаления объектов.
    """
    
    def __init__(self, repository: Repository[T]):
        self._repository = repository
        super().__init__()
    
    async def get(self, db: AsyncSession, id: int) -> Optional[T]:
        """Получить объект по ID."""
        try:
            self._log_operation(f"get", {"id": id})
            result = await self._repository.get_by_id(db, id)
            if not result:
                raise NotFoundError(f"Object with id {id} not found")
            return result
        except Exception as e:
            raise self._handle_error(e, "get")
    
    async def get_multi(
        self, 
        db: AsyncSession, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[T]:
        """Получить список объектов."""
        try:
            self._log_operation(f"get_multi", {"skip": skip, "limit": limit})
            return await self._repository.get_multi(db, skip=skip, limit=limit)
        except Exception as e:
            raise self._handle_error(e, "get_multi")
    
    async def create(self, db: AsyncSession, obj_in: Any) -> T:
        """Создать новый объект."""
        try:
            self._log_operation(f"create", {"obj_type": type(obj_in).__name__})
            return await self._repository.create(db, obj_in)
        except Exception as e:
            raise self._handle_error(e, "create")
    
    async def update(self, db: AsyncSession, id: int, obj_in: Any) -> T:
        """Обновить объект."""
        try:
            self._log_operation(f"update", {"id": id})
            db_obj = await self.get(db, id)
            return await self._repository.update(db, db_obj, obj_in)
        except Exception as e:
            raise self._handle_error(e, "update")
    
    async def delete(self, db: AsyncSession, id: int) -> bool:
        """Удалить объект."""
        try:
            self._log_operation(f"delete", {"id": id})
            return await self._repository.delete(db, id)
        except Exception as e:
            raise self._handle_error(e, "delete")


class ServiceFactory:
    """
    Фабрика для создания и управления сервисами.
    
    Реализует паттерн Factory для централизованного создания сервисов.
    """
    
    _services: Dict[str, BaseService] = {}
    
    @classmethod
    def register_service(cls, name: str, service_class: Type[BaseService]):
        """Регистрация нового типа сервиса."""
        cls._services[name] = service_class
    
    @classmethod
    def get_service(cls, name: str) -> BaseService:
        """Получение экземпляра сервиса."""
        if name not in cls._services:
            raise ValueError(f"Service {name} not registered")
        
        service_class = cls._services[name]
        # Благодаря SingletonMeta, всегда возвращается один и тот же экземпляр
        return service_class()
    
    @classmethod
    def list_services(cls) -> List[str]:
        """Список зарегистрированных сервисов."""
        return list(cls._services.keys())


class ServiceProxy(BaseService):
    """
    Прокси для сервисов.
    
    Реализует паттерн Proxy для контроля доступа к сервисам.
    """
    
    def __init__(self, target_service: BaseService, permissions: Optional[List[str]] = None):
        self._target_service = target_service
        self._permissions = permissions or []
        super().__init__()
    
    def get_service_name(self) -> str:
        return f"Proxy({self._target_service.get_service_name()})"
    
    def _check_permission(self, operation: str, user_permissions: List[str]) -> bool:
        """Проверка прав доступа."""
        if not self._permissions:
            return True
        
        required_permission = f"{self._target_service.get_service_name()}.{operation}"
        return required_permission in user_permissions
    
    async def execute_with_permission_check(
        self, 
        operation: str, 
        user_permissions: List[str], 
        *args, 
        **kwargs
    ):
        """Выполнение операции с проверкой прав."""
        if not self._check_permission(operation, user_permissions):
            raise PermissionError(f"Access denied for operation {operation}")
        
        method = getattr(self._target_service, operation)
        return await method(*args, **kwargs)


class EventDispatcher:
    """
    Диспетчер событий для сервисов.
    
    Реализует паттерн Observer для уведомлений о событиях.
    """
    
    def __init__(self):
        self._listeners: Dict[str, List[callable]] = {}
    
    def subscribe(self, event: str, callback: callable):
        """Подписка на событие."""
        if event not in self._listeners:
            self._listeners[event] = []
        self._listeners[event].append(callback)
    
    def unsubscribe(self, event: str, callback: callable):
        """Отписка от события."""
        if event in self._listeners:
            self._listeners[event].remove(callback)
    
    async def dispatch(self, event: str, data: Any = None):
        """Отправка события."""
        if event in self._listeners:
            for callback in self._listeners[event]:
                try:
                    if asyncio.iscoroutinefunction(callback):
                        await callback(data)
                    else:
                        callback(data)
                except Exception as e:
                    logger.error(f"Error in event listener for {event}: {e}")


# Глобальный экземпляр диспетчера событий
event_dispatcher = EventDispatcher()


class ServiceConfiguration:
    """
    Конфигурация для сервисов.
    
    Центральное место для управления настройками сервисов.
    """
    
    def __init__(self):
        self._config: Dict[str, Any] = {}
    
    def set_config(self, service_name: str, config: Dict[str, Any]):
        """Установка конфигурации для сервиса."""
        self._config[service_name] = config
    
    def get_config(self, service_name: str) -> Dict[str, Any]:
        """Получение конфигурации сервиса."""
        return self._config.get(service_name, {})
    
    def get_setting(self, service_name: str, setting_name: str, default: Any = None) -> Any:
        """Получение конкретной настройки сервиса."""
        service_config = self.get_config(service_name)
        return service_config.get(setting_name, default)


# Глобальный экземпляр конфигурации
service_config = ServiceConfiguration()
