# Используем официальный образ Python 3.13
FROM python:3.13-slim

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry
RUN pip install poetry==1.8.3

# Настраиваем Poetry
ENV POETRY_NO_INTERACTION=1 \
    POETRY_VENV_IN_PROJECT=1 \
    POETRY_CACHE_DIR=/tmp/poetry_cache \
    POETRY_VENV_PATH=/app/.venv

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем файлы Poetry
COPY pyproject.toml poetry.lock* ./

# Устанавливаем зависимости
RUN poetry config virtualenvs.create false && \
    poetry install --no-dev && \
    rm -rf $POETRY_CACHE_DIR

# Копируем код приложения
COPY requify/ ./requify/
COPY alembic.ini ./
COPY .env* ./

# Создаем необходимые директории
RUN mkdir -p logs uploads static

# Устанавливаем права
RUN chmod +x /app

# Экспортируем порт
EXPOSE 8000

# Создаем пользователя без прав root для безопасности
RUN groupadd -r requify && useradd -r -g requify requify
RUN chown -R requify:requify /app
USER requify

# Команда для запуска приложения
CMD ["uvicorn", "requify.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"] 