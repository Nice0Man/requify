-- Инициализация базы данных Requify
-- Этот скрипт создает необходимые расширения и настройки

-- Создаем расширения
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Создаем схему для приложения (если нужна)
-- CREATE SCHEMA IF NOT EXISTS requify;

-- Устанавливаем настройки для полнотекстового поиска
SET default_text_search_config = 'russian';

-- Создаем роли для приложения
DO $$
BEGIN
    -- Роль для приложения
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'requify_app') THEN
        CREATE ROLE requify_app LOGIN PASSWORD 'requify_app_password';
    END IF;
    
    -- Роль только для чтения
    IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'requify_readonly') THEN
        CREATE ROLE requify_readonly LOGIN PASSWORD 'requify_readonly_password';
    END IF;
END
$$;

-- Предоставляем права (используем переменную окружения или дефолтное имя)
-- GRANT CONNECT ON DATABASE requify-db TO requify_app;
-- GRANT USAGE ON SCHEMA public TO requify_app;
-- GRANT CREATE ON SCHEMA public TO requify_app;

-- Права только для чтения
-- GRANT CONNECT ON DATABASE requify-db TO requify_readonly;
-- GRANT USAGE ON SCHEMA public TO requify_readonly;

-- Настройки для производительности
-- ALTER DATABASE requify-db SET log_statement = 'all';
-- ALTER DATABASE requify-db SET log_min_duration_statement = 1000;

-- Комментарии
-- COMMENT ON DATABASE requify-db IS 'База данных системы управления требованиями Requify'; 