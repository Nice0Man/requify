"""
Скрипт для инициализации базовых справочных данных.

Создает начальные типы, приоритеты, статусы требований и типы связей.
"""

from sqlalchemy.ext.asyncio import AsyncSession

from app import crud, schemas


async def init_requirement_types(db: AsyncSession):
    """Инициализация типов требований."""
    types_data = [
        {"name": "Функциональное", "description": "Функциональное требование"},
        {"name": "Нефункциональное", "description": "Нефункциональное требование"},
        {"name": "Бизнес-требование", "description": "Бизнес-требование"},
        {"name": "Техническое", "description": "Техническое требование"},
        {"name": "Интерфейсное", "description": "Требование к интерфейсу"},
    ]

    for type_data in types_data:
        existing = await crud.requirement_type.get_by_name(db, name=type_data["name"])
        if not existing:
            type_in = schemas.RequirementTypeCreate(**type_data)
            await crud.requirement_type.create(db, obj_in=type_in)


async def init_requirement_priorities(db: AsyncSession):
    """Инициализация приоритетов требований."""
    priorities_data = [
        {"name": "Низкий", "description": "Низкий приоритет"},
        {"name": "Средний", "description": "Средний приоритет"},
        {"name": "Высокий", "description": "Высокий приоритет"},
        {"name": "Критический", "description": "Критический приоритет"},
    ]

    for priority_data in priorities_data:
        existing = await crud.requirement_priority.get_by_name(
            db, name=priority_data["name"]
        )
        if not existing:
            priority_in = schemas.RequirementPriorityCreate(**priority_data)
            await crud.requirement_priority.create(db, obj_in=priority_in)


async def init_requirement_statuses(db: AsyncSession):
    """Инициализация статусов требований."""
    statuses_data = [
        {"name": "Черновик", "description": "Требование в стадии разработки"},
        {"name": "Активное", "description": "Активное требование"},
        {"name": "На рассмотрении", "description": "Требование на рассмотрении"},
        {"name": "Утверждено", "description": "Утвержденное требование"},
        {"name": "Реализовано", "description": "Реализованное требование"},
        {"name": "Протестировано", "description": "Протестированное требование"},
        {"name": "Архивное", "description": "Архивное требование"},
    ]

    for status_data in statuses_data:
        existing = await crud.requirement_status.get_by_name(
            db, name=status_data["name"]
        )
        if not existing:
            status_in = schemas.RequirementStatusCreate(**status_data)
            await crud.requirement_status.create(db, obj_in=status_in)


async def init_relationship_types(db: AsyncSession):
    """Инициализация типов связей."""
    types_data = [
        {"name": "Зависит от", "description": "Требование зависит от другого"},
        {"name": "Блокирует", "description": "Требование блокирует другое"},
        {"name": "Связано с", "description": "Требование связано с другим"},
        {"name": "Дублирует", "description": "Требование дублирует другое"},
        {"name": "Заменяет", "description": "Требование заменяет другое"},
        {"name": "Уточняет", "description": "Требование уточняет другое"},
    ]

    for type_data in types_data:
        existing = await crud.relationship_type.get_by_name(db, name=type_data["name"])
        if not existing:
            type_in = schemas.RelationshipTypeCreate(**type_data)
            await crud.relationship_type.create(db, obj_in=type_in)


async def init_all_reference_data(db: AsyncSession):
    """Инициализация всех справочных данных."""
    print("Инициализация типов требований...")
    await init_requirement_types(db)

    print("Инициализация приоритетов требований...")
    await init_requirement_priorities(db)

    print("Инициализация статусов требований...")
    await init_requirement_statuses(db)

    print("Инициализация типов связей...")
    await init_relationship_types(db)

    print("Инициализация справочных данных завершена!")
