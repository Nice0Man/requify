#!/bin/bash
set -e

# Создание базы данных для Requify
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    CREATE DATABASE IF NOT EXISTS requifydb;
    GRANT ALL PRIVILEGES ON DATABASE requifydb TO $POSTGRES_USER;
EOSQL

echo "Database requifydb created successfully!" 