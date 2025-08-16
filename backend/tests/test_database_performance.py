"""
Тесты производительности базы данных и схем.

Проверяют скорость выполнения операций CRUD,
сериализации больших объемов данных и
оптимизацию запросов.
"""

import pytest
import time
import statistics
from typing import List, Dict, Any
from datetime import datetime, timezone

from sqlalchemy import create_engine, text
from sqlalchemy.orm import Session, selectinload
from sqlalchemy.engine import Engine

from app.models.user import User
from app.models.user_profile import UserProfile
from app.models.user_settings import UserSettings
from app.models.company import Company
from app.models.project import Project
from app.models.requirement import Requirement
from app.models.base import Base

from app.schemas.user import UserResponse, UserWithRelations, UserDetailed


@pytest.fixture(scope="session")
def performance_engine():
    """Создает движок для тестов производительности."""
    # Используем SQLite с оптимизированными настройками
    engine = create_engine(
        "sqlite:///:memory:",
        echo=False,  # Отключаем логи для чистых измерений
        connect_args={"check_same_thread": False, "timeout": 30},
        pool_pre_ping=True,
        pool_recycle=3600,
    )

    # Оптимизируем SQLite для производительности
    with engine.connect() as conn:
        conn.execute(text("PRAGMA journal_mode=WAL"))
        conn.execute(text("PRAGMA synchronous=NORMAL"))
        conn.execute(text("PRAGMA cache_size=10000"))
        conn.execute(text("PRAGMA temp_store=memory"))
        conn.commit()

    return engine


@pytest.fixture(scope="function")
def performance_session(performance_engine):
    """Создает сессию для тестов производительности."""
    Base.metadata.create_all(performance_engine)

    with Session(performance_engine) as session:
        yield session

    Base.metadata.drop_all(performance_engine)


class TestCRUDPerformance:
    """Тесты производительности CRUD операций."""

    def test_bulk_user_creation_performance(self, performance_session):
        """Тестирует производительность массового создания пользователей."""
        user_count = 1000

        # Подготавливаем данные
        users_data = []
        for i in range(user_count):
            users_data.append(
                {
                    "username": f"user_{i}",
                    "email": f"user_{i}@example.com",
                    "name": f"User {i}",
                    "status": "active",
                    "is_active": True,
                }
            )

        # Измеряем время создания
        start_time = time.time()

        users = [User(**data) for data in users_data]
        performance_session.add_all(users)
        performance_session.commit()

        end_time = time.time()
        creation_time = end_time - start_time

        # Проверяем результат
        assert performance_session.query(User).count() == user_count

        # Проверяем производительность (должно быть быстрее 2 секунд)
        assert (
            creation_time < 2.0
        ), f"Создание {user_count} пользователей заняло {creation_time:.2f} секунд"

        # Выводим метрики
        users_per_second = user_count / creation_time
        print(f"\nСоздание пользователей: {users_per_second:.0f} пользователей/сек")

    def test_bulk_user_query_performance(self, performance_session):
        """Тестирует производительность массового запроса пользователей."""
        user_count = 500

        # Создаем пользователей
        users = []
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Измеряем время запроса
        start_time = time.time()

        all_users = performance_session.query(User).all()

        end_time = time.time()
        query_time = end_time - start_time

        # Проверяем результат
        assert len(all_users) == user_count

        # Проверяем производительность
        assert (
            query_time < 0.5
        ), f"Запрос {user_count} пользователей занял {query_time:.2f} секунд"

        print(f"\nЗапрос пользователей: {user_count/query_time:.0f} пользователей/сек")

    def test_bulk_user_update_performance(self, performance_session):
        """Тестирует производительность массового обновления пользователей."""
        user_count = 200

        # Создаем пользователей
        users = []
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Измеряем время обновления
        start_time = time.time()

        # Обновляем всех пользователей
        performance_session.query(User).update(
            {User.name: User.name + " Updated", User.status: "inactive"}
        )
        performance_session.commit()

        end_time = time.time()
        update_time = end_time - start_time

        # Проверяем результат
        updated_users = (
            performance_session.query(User).filter(User.name.like("% Updated")).all()
        )
        assert len(updated_users) == user_count

        # Проверяем производительность
        assert (
            update_time < 1.0
        ), f"Обновление {user_count} пользователей заняло {update_time:.2f} секунд"

        print(
            f"\nОбновление пользователей: {user_count/update_time:.0f} пользователей/сек"
        )


class TestSerializationPerformance:
    """Тесты производительности сериализации."""

    def test_user_serialization_performance(self, performance_session):
        """Тестирует производительность сериализации пользователей."""
        user_count = 500

        # Создаем пользователей
        users = []
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Загружаем пользователей
        users_from_db = performance_session.query(User).all()

        # Измеряем время сериализации
        start_time = time.time()

        serialized_users = []
        for user in users_from_db:
            user_schema = UserResponse.model_validate(user)
            serialized_users.append(user_schema)

        end_time = time.time()
        serialization_time = end_time - start_time

        # Проверяем результат
        assert len(serialized_users) == user_count

        # Проверяем производительность
        assert (
            serialization_time < 1.0
        ), f"Сериализация {user_count} пользователей заняла {serialization_time:.2f} секунд"

        serializations_per_second = user_count / serialization_time
        print(f"\nСериализация: {serializations_per_second:.0f} объектов/сек")

    def test_complex_user_serialization_performance(self, performance_session):
        """Тестирует производительность сериализации сложных пользователей."""
        user_count = 100

        # Создаем компанию
        company = Company(
            name="Test Company", description="Test Description", industry="Technology"
        )
        performance_session.add(company)
        performance_session.commit()
        performance_session.refresh(company)

        # Создаем пользователей с профилями и настройками
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
                company_id=company.id,
            )
            performance_session.add(user)
            performance_session.commit()
            performance_session.refresh(user)

            # Добавляем профиль
            profile = UserProfile(
                user_id=user.id,
                first_name=f"First{i}",
                last_name=f"Last{i}",
                display_name=f"Display {i}",
                bio=f"Bio for user {i}",
            )
            performance_session.add(profile)

            # Добавляем настройки
            settings = UserSettings(
                user_id=user.id,
                notification_settings={"email": True, "sms": False},
                interface_settings={"theme": "dark", "language": "en"},
            )
            performance_session.add(settings)

        performance_session.commit()

        # Загружаем пользователей с отношениями
        users_with_relations = (
            performance_session.query(User)
            .options(
                selectinload(User.profile),
                selectinload(User.settings),
                selectinload(User.company),
            )
            .all()
        )

        # Измеряем время сериализации
        start_time = time.time()

        serialized_users = []
        for user in users_with_relations:
            user_detailed = UserDetailed.model_validate(user)
            serialized_users.append(user_detailed)

        end_time = time.time()
        serialization_time = end_time - start_time

        # Проверяем результат
        assert len(serialized_users) == user_count

        # Проверяем производительность (более сложные объекты требуют больше времени)
        assert (
            serialization_time < 3.0
        ), f"Сериализация {user_count} сложных пользователей заняла {serialization_time:.2f} секунд"

        serializations_per_second = user_count / serialization_time
        print(f"\nСложная сериализация: {serializations_per_second:.0f} объектов/сек")


class TestQueryOptimizationPerformance:
    """Тесты производительности оптимизации запросов."""

    def test_n_plus_1_problem_prevention(self, performance_session):
        """Тестирует предотвращение проблемы N+1 запросов."""
        user_count = 50

        # Создаем компанию
        company = Company(name="Test Company", description="Test Description")
        performance_session.add(company)
        performance_session.commit()
        performance_session.refresh(company)

        # Создаем пользователей с профилями
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
                company_id=company.id,
            )
            performance_session.add(user)
            performance_session.commit()
            performance_session.refresh(user)

            profile = UserProfile(
                user_id=user.id,
                first_name=f"First{i}",
                last_name=f"Last{i}",
                display_name=f"Display {i}",
            )
            performance_session.add(profile)

        performance_session.commit()

        # Тест 1: Неоптимизированный запрос (N+1 проблема)
        start_time = time.time()

        users_bad = performance_session.query(User).all()
        profile_names_bad = []
        for user in users_bad:
            if (
                user.profile
            ):  # Это вызовет дополнительный запрос для каждого пользователя
                profile_names_bad.append(user.profile.display_name)

        bad_query_time = time.time() - start_time

        # Тест 2: Оптимизированный запрос с eager loading
        start_time = time.time()

        users_good = (
            performance_session.query(User).options(selectinload(User.profile)).all()
        )
        profile_names_good = []
        for user in users_good:
            if user.profile:
                profile_names_good.append(user.profile.display_name)

        good_query_time = time.time() - start_time

        # Проверяем результаты
        assert len(profile_names_bad) == user_count
        assert len(profile_names_good) == user_count
        assert profile_names_bad == profile_names_good

        # Оптимизированный запрос должен быть значительно быстрее
        optimization_ratio = bad_query_time / good_query_time
        assert (
            optimization_ratio > 2.0
        ), f"Оптимизация дала прирост только в {optimization_ratio:.1f}x раз"

        print(f"\nN+1 проблема:")
        print(f"Неоптимизированный: {bad_query_time:.3f} сек")
        print(f"Оптимизированный: {good_query_time:.3f} сек")
        print(f"Прирост производительности: {optimization_ratio:.1f}x")

    def test_pagination_performance(self, performance_session):
        """Тестирует производительность пагинации."""
        total_users = 1000
        page_size = 50

        # Создаем пользователей
        users = []
        for i in range(total_users):
            user = User(
                username=f"user_{i:04d}",  # Используем ведущие нули для правильной сортировки
                email=f"user_{i:04d}@example.com",
                name=f"User {i:04d}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Тестируем производительность разных страниц
        page_times = []

        for page in range(0, 5):  # Тестируем первые 5 страниц
            offset = page * page_size

            start_time = time.time()

            page_users = (
                performance_session.query(User)
                .order_by(User.username)
                .offset(offset)
                .limit(page_size)
                .all()
            )

            page_time = time.time() - start_time
            page_times.append(page_time)

            # Проверяем результат
            assert len(page_users) == page_size

            # Каждая страница должна загружаться быстро
            assert (
                page_time < 0.1
            ), f"Страница {page} загружалась {page_time:.3f} секунд"

        # Время загрузки страниц должно быть стабильным
        avg_time = statistics.mean(page_times)
        max_time = max(page_times)

        # Максимальное время не должно превышать среднее более чем в 2 раза
        assert (
            max_time < avg_time * 2
        ), f"Нестабильная производительность пагинации: avg={avg_time:.3f}, max={max_time:.3f}"

        print(f"\nПагинация ({page_size} элементов на страницу):")
        print(f"Среднее время: {avg_time:.3f} сек")
        print(f"Максимальное время: {max_time:.3f} сек")


class TestMemoryUsagePerformance:
    """Тесты использования памяти."""

    def test_large_dataset_memory_efficiency(self, performance_session):
        """Тестирует эффективность использования памяти для больших наборов данных."""
        import psutil
        import os

        process = psutil.Process(os.getpid())

        # Измеряем начальное использование памяти
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        user_count = 2000

        # Создаем большое количество пользователей
        users = []
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Измеряем память после создания
        after_creation_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Загружаем и сериализуем всех пользователей
        all_users = performance_session.query(User).all()
        serialized_users = [UserResponse.model_validate(user) for user in all_users]

        # Измеряем память после сериализации
        after_serialization_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Проверяем результат
        assert len(serialized_users) == user_count

        # Вычисляем использование памяти
        creation_memory_usage = after_creation_memory - initial_memory
        serialization_memory_usage = after_serialization_memory - after_creation_memory
        total_memory_usage = after_serialization_memory - initial_memory

        # Использование памяти должно быть разумным (не более 100MB для 2000 пользователей)
        assert (
            total_memory_usage < 100
        ), f"Слишком большое использование памяти: {total_memory_usage:.1f} MB"

        print(f"\nИспользование памяти для {user_count} пользователей:")
        print(f"Создание: {creation_memory_usage:.1f} MB")
        print(f"Сериализация: {serialization_memory_usage:.1f} MB")
        print(f"Общее: {total_memory_usage:.1f} MB")
        print(f"На пользователя: {total_memory_usage/user_count*1024:.1f} KB")


class TestConcurrentPerformance:
    """Тесты производительности при конкурентном доступе."""

    def test_concurrent_read_performance(self, performance_session):
        """Тестирует производительность конкурентного чтения."""
        import threading
        import queue

        user_count = 100
        thread_count = 5

        # Создаем пользователей
        users = []
        for i in range(user_count):
            user = User(
                username=f"user_{i}",
                email=f"user_{i}@example.com",
                name=f"User {i}",
                status="active",
                is_active=True,
            )
            users.append(user)

        performance_session.add_all(users)
        performance_session.commit()

        # Создаем движок для конкурентного доступа
        concurrent_engine = create_engine(
            "sqlite:///:memory:", echo=False, connect_args={"check_same_thread": False}
        )
        Base.metadata.create_all(concurrent_engine)

        # Копируем данные в новую БД
        with Session(concurrent_engine) as session:
            session.add_all(
                [
                    User(
                        **{
                            "username": user.username,
                            "email": user.email,
                            "name": user.name,
                            "status": user.status,
                            "is_active": user.is_active,
                        }
                    )
                    for user in users
                ]
            )
            session.commit()

        results_queue = queue.Queue()

        def read_users():
            """Функция для чтения пользователей в отдельном потоке."""
            try:
                start_time = time.time()

                with Session(concurrent_engine) as session:
                    thread_users = session.query(User).all()
                    serialized = [
                        UserResponse.model_validate(user) for user in thread_users
                    ]

                end_time = time.time()
                results_queue.put(
                    {
                        "success": True,
                        "time": end_time - start_time,
                        "count": len(serialized),
                    }
                )
            except Exception as e:
                results_queue.put({"success": False, "error": str(e)})

        # Запускаем конкурентные потоки
        start_time = time.time()

        threads = []
        for i in range(thread_count):
            thread = threading.Thread(target=read_users)
            threads.append(thread)
            thread.start()

        # Ждем завершения всех потоков
        for thread in threads:
            thread.join()

        total_time = time.time() - start_time

        # Собираем результаты
        results = []
        while not results_queue.empty():
            results.append(results_queue.get())

        # Проверяем результаты
        assert len(results) == thread_count

        successful_results = [r for r in results if r["success"]]
        assert (
            len(successful_results) == thread_count
        ), f"Не все потоки успешно выполнились: {results}"

        # Все потоки должны прочитать правильное количество пользователей
        for result in successful_results:
            assert result["count"] == user_count

        # Общее время должно быть разумным
        assert total_time < 5.0, f"Конкурентное чтение заняло {total_time:.2f} секунд"

        avg_thread_time = statistics.mean([r["time"] for r in successful_results])
        print(f"\nКонкурентное чтение ({thread_count} потоков):")
        print(f"Общее время: {total_time:.2f} сек")
        print(f"Среднее время потока: {avg_thread_time:.2f} сек")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short", "-s"])  # -s для вывода print statements
