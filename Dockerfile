# Используем базовый образ Python 3.11
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Устанавливаем системные зависимости
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Устанавливаем Poetry
RUN pip install poetry

# Копируем файлы Poetry
COPY pyproject.toml poetry.lock ./

# Настраиваем Poetry
RUN poetry config virtualenvs.create false

# Устанавливаем зависимости
RUN poetry install --no-dev

# Копируем код приложения
COPY requify ./requify

# Копируем дополнительные файлы
COPY env.example .env

# Создаем необходимые директории
RUN mkdir -p logs uploads

# Устанавливаем права
RUN chmod +x requify/app/main.py

# Открываем порт
EXPOSE 8000

# Команда по умолчанию
CMD ["uvicorn", "requify.requify.app.main:app", "--host", "0.0.0.0", "--port", "8000"] 