#!/bin/bash

# Автоматический backup PostgreSQL для Requify
# Соответствует требованиям ТЗ п. 4.2.8 и 4.4.2.8

set -e

# Конфигурация
DB_HOST=${POSTGRES_SERVER:-db}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-requify}
DB_USER=${POSTGRES_USER:-postgres}
BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="${BACKUP_DIR}/requify_backup_${TIMESTAMP}.sql"
LOG_FILE="${BACKUP_DIR}/backup.log"

# Создаём директорию если её нет
mkdir -p ${BACKUP_DIR}

# Функция логирования
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a ${LOG_FILE}
}

# Проверка доступности БД
log "Проверка подключения к БД ${DB_NAME} на ${DB_HOST}:${DB_PORT}"
pg_isready -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME}

if [ $? -ne 0 ]; then
    log "ОШИБКА: БД недоступна"
    exit 1
fi

# Создание резервной копии
log "Начало создания резервной копии БД ${DB_NAME}"
pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --format=custom \
    --file=${BACKUP_FILE}

if [ $? -eq 0 ]; then
    log "Резервная копия успешно создана: ${BACKUP_FILE}"
    
    # Сжатие
    gzip ${BACKUP_FILE}
    log "Резервная копия сжата: ${BACKUP_FILE}.gz"
    
    # Удаление старых копий (старше 30 дней)
    find ${BACKUP_DIR} -name "requify_backup_*.sql.gz" -type f -mtime +30 -delete
    log "Удалены резервные копии старше 30 дней"
    
    # Отчёт о размере
    BACKUP_SIZE=$(du -h "${BACKUP_FILE}.gz" | cut -f1)
    log "Размер резервной копии: ${BACKUP_SIZE}"
    
else
    log "ОШИБКА: Не удалось создать резервную копию"
    exit 1
fi

# Проверка целостности
log "Проверка целостности резервной копии"
pg_restore --list "${BACKUP_FILE}.gz" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    log "Проверка целостности пройдена успешно"
else
    log "ОШИБКА: Резервная копия повреждена"
    exit 1
fi

log "Процесс резервного копирования завершён успешно" 