"""
Базовый CRUD класс для всех моделей.

Содержит общие операции Create, Read, Update, Delete.
"""

from typing import (
    Any,
    Dict,
    Generic,
    List,
    Optional,
    Protocol,
    Type,
    TypeVar,
    Union,
)
from abc import ABC, abstractmethod

from sqlalchemy import select, func, delete, update
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from requify.app.models.base import Base

ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=BaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=BaseModel)


class CRUDBase(Generic[ModelType, CreateSchemaType, UpdateSchemaType]):
    """
    Базовый класс для CRUD операций с обобщенными типами.

    Обеспечивает стандартные операции Create, Read, Update, Delete
    для любой модели SQLAlchemy.
    """

    def __init__(self, model: Type[ModelType]):
        """
        Инициализация CRUD объекта.

        Args:
            model: Класс модели SQLAlchemy
        """
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """
        Получить объект по ID.

        Args:
            db: Сессия базы данных
            id: Идентификатор объекта

        Returns:
            Объект модели или None если не найден
        """
        stmt = select(self.model).where(self.model.id == id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi(
        self,
        db: AsyncSession,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None,
    ) -> List[ModelType]:
        """
        Получить список объектов с пагинацией и фильтрацией.

        Args:
            db: Сессия базы данных
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей
            filters: Словарь фильтров {поле: значение}

        Returns:
            Список объектов модели
        """
        stmt = select(self.model)

        # Применяем фильтры
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    stmt = stmt.where(getattr(self.model, field) == value)

        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count(
        self, db: AsyncSession, *, filters: Optional[Dict[str, Any]] = None
    ) -> int:
        """
        Подсчитать количество объектов с учетом фильтров.

        Args:
            db: Сессия базы данных
            filters: Словарь фильтров {поле: значение}

        Returns:
            Количество объектов
        """
        stmt = select(func.count(self.model.id))

        # Применяем фильтры
        if filters:
            for field, value in filters.items():
                if hasattr(self.model, field) and value is not None:
                    stmt = stmt.where(getattr(self.model, field) == value)

        result = await db.execute(stmt)
        return result.scalar() or 0

    async def create(self, db: AsyncSession, *, obj_in: CreateSchemaType) -> ModelType:
        """
        Создать новый объект.

        Args:
            db: Сессия базы данных
            obj_in: Схема для создания объекта

        Returns:
            Созданный объект
        """
        obj_in_data = jsonable_encoder(obj_in)
        db_obj = self.model(**obj_in_data)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def update(
        self,
        db: AsyncSession,
        *,
        db_obj: ModelType,
        obj_in: Union[UpdateSchemaType, Dict[str, Any]],
    ) -> ModelType:
        """
        Обновить существующий объект.

        Args:
            db: Сессия базы данных
            db_obj: Объект для обновления
            obj_in: Схема или словарь с данными для обновления

        Returns:
            Обновленный объект
        """
        obj_data = jsonable_encoder(db_obj)

        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)

        for field in obj_data:
            if field in update_data:
                setattr(db_obj, field, update_data[field])

        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def remove(self, db: AsyncSession, *, id: int) -> ModelType:
        """
        Удалить объект по ID.

        Args:
            db: Сессия базы данных
            id: Идентификатор объекта

        Returns:
            Удаленный объект

        Raises:
            ValueError: Если объект не найден
        """
        obj = await self.get(db, id=id)
        if not obj:
            raise ValueError(f"Object with id {id} not found")

        await db.delete(obj)
        await db.commit()
        return obj

    async def exists(self, db: AsyncSession, *, id: int) -> bool:
        """
        Проверить существование объекта по ID.

        Args:
            db: Сессия базы данных
            id: Идентификатор объекта

        Returns:
            True если объект существует, False иначе
        """
        stmt = select(func.count(self.model.id)).where(self.model.id == id)
        result = await db.execute(stmt)
        count = result.scalar() or 0
        return count > 0

    async def get_by_field(
        self, db: AsyncSession, *, field: str, value: Any
    ) -> Optional[ModelType]:
        """
        Получить объект по значению поля.

        Args:
            db: Сессия базы данных
            field: Название поля
            value: Значение поля

        Returns:
            Объект модели или None если не найден
        """
        if not hasattr(self.model, field):
            raise ValueError(f"Model {self.model.__name__} has no field {field}")

        stmt = select(self.model).where(getattr(self.model, field) == value)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_multi_by_field(
        self,
        db: AsyncSession,
        *,
        field: str,
        value: Any,
        skip: int = 0,
        limit: int = 100,
    ) -> List[ModelType]:
        """
        Получить список объектов по значению поля.

        Args:
            db: Сессия базы данных
            field: Название поля
            value: Значение поля
            skip: Количество пропускаемых записей
            limit: Максимальное количество записей

        Returns:
            Список объектов модели
        """
        if not hasattr(self.model, field):
            raise ValueError(f"Model {self.model.__name__} has no field {field}")

        stmt = select(self.model).where(getattr(self.model, field) == value)
        stmt = stmt.offset(skip).limit(limit)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def bulk_create(
        self, db: AsyncSession, *, objects_in: List[CreateSchemaType]
    ) -> List[ModelType]:
        """
        Массовое создание объектов.

        Args:
            db: Сессия базы данных
            objects_in: Список схем для создания объектов

        Returns:
            Список созданных объектов
        """
        db_objects = []
        for obj_in in objects_in:
            obj_in_data = jsonable_encoder(obj_in)
            db_obj = self.model(**obj_in_data)
            db_objects.append(db_obj)

        db.add_all(db_objects)
        await db.commit()

        for db_obj in db_objects:
            await db.refresh(db_obj)

        return db_objects

    async def bulk_update(
        self, db: AsyncSession, *, updates: List[Dict[str, Any]]
    ) -> bool:
        """
        Массовое обновление объектов.

        Args:
            db: Сессия базы данных
            updates: Список словарей с данными для обновления
                    Каждый словарь должен содержать 'id' и поля для обновления

        Returns:
            True если операция прошла успешно
        """
        for update_data in updates:
            if "id" not in update_data:
                raise ValueError("Each update must contain 'id' field")

            obj_id = update_data.pop("id")
            stmt = (
                update(self.model).where(self.model.id == obj_id).values(**update_data)
            )
            await db.execute(stmt)

        await db.commit()
        return True

    async def bulk_delete(self, db: AsyncSession, *, ids: List[int]) -> int:
        """
        Массовое удаление объектов по списку ID.

        Args:
            db: Сессия базы данных
            ids: Список идентификаторов для удаления

        Returns:
            Количество удаленных объектов
        """
        stmt = delete(self.model).where(self.model.id.in_(ids))
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount
