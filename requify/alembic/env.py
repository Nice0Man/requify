import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# Добавляем родительский каталог в путь импорта
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Импортируем модели и конфигурацию из нашего приложения
from app.core.config import settings
from app.db.base_class import Base  # noqa

# Этот тот target, который используется для создания миграций
target_metadata = Base.metadata

# Загружаем конфигурацию Alembic из alembic.ini
config = context.config

# Переопределяем строку подключения к БД из настроек приложения
config.set_main_option("sqlalchemy.url", str(settings.DATABASE_URI))

# Загружаем конфигурацию логирования
fileConfig(config.config_file_name)


def run_migrations_offline() -> None:
    """
    Запуск миграций в оффлайн режиме.
    Это не требует соединения с БД.
    """
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Запуск миграций в онлайн режиме.
    Требует соединения с БД.
    """
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
