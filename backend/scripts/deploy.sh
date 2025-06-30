# Скрипт развертывания Requify
# Автоматизирует процесс развертывания приложения

set -e  # Выход при ошибке
set -u  # Выход при использовании неопределенной переменной

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функции для цветного вывода
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверка зависимостей
check_dependencies() {
    log_info "Проверка зависимостей..."
    
    if ! command -v docker &> /dev/null; then
        log_error "Docker не установлен"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose не установлен"
        exit 1
    fi
    
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 не установлен"
        exit 1
    fi
    
    log_success "Все зависимости установлены"
}

# Создание .env файла если не существует
setup_env() {
    log_info "Настройка переменных окружения..."
    
    if [ ! -f .env ]; then
        if [ -f .env.example ]; then
            cp .env.example .env
            log_warning "Создан .env файл из .env.example. Проверьте настройки!"
        else
            log_error ".env.example файл не найден"
            exit 1
        fi
    else
        log_info ".env файл уже существует"
    fi
}

# Сборка и запуск контейнеров
deploy_containers() {
    log_info "Запуск контейнеров Docker..."
    
    # Остановка существующих контейнеров
    docker-compose down --remove-orphans
    
    # Сборка и запуск
    docker-compose up -d --build
    
    log_success "Контейнеры запущены"
}

# Применение миграций
apply_migrations() {
    log_info "Применение миграций базы данных..."
    
    # Ждем запуска базы данных
    log_info "Ожидание запуска базы данных..."
    sleep 10
    
    # Применяем миграции
    cd requify
    python -m scripts.migrations upgrade
    cd ..
    
    log_success "Миграции применены"
}

# Заполнение тестовыми данными
seed_data() {
    if [ "$1" = "--seed" ]; then
        log_info "Заполнение базы данных тестовыми данными..."
        
        cd requify
        python scripts/seed_db.py seed
        cd ..
        
        log_success "Тестовые данные добавлены"
    fi
}

# Проверка здоровья приложения
health_check() {
    log_info "Проверка состояния приложения..."
    
    # Ждем запуска приложения
    sleep 5
    
    # Проверяем доступность API
    if curl -f http://localhost:8000/api/v1/ > /dev/null 2>&1; then
        log_success "Приложение запущено и доступно"
    else
        log_warning "Приложение может быть еще не готово"
    fi
}

# Показать информацию после развертывания
show_info() {
    log_success "Развертывание завершено!"
    echo ""
    log_info "Приложение доступно по адресам:"
    echo "  🌐 Основное приложение: http://localhost:8000"
    echo "  📖 API документация: http://localhost:8000/docs"
    echo "  🔧 Админка: http://localhost:8000/admin"
    echo ""
    log_info "Полезные команды:"
    echo "  📋 Просмотр логов: docker-compose logs -f"
    echo "  🛑 Остановка: docker-compose down"
    echo "  🔄 Перезапуск: docker-compose restart"
    echo ""
}

# Основная функция
main() {
    log_info "🚀 Начинаем развертывание Requify..."
    
    # Проверяем аргументы
    SEED_DATA=""
    if [ $# -gt 0 ] && [ "$1" = "--seed" ]; then
        SEED_DATA="--seed"
    fi
    
    # Выполняем развертывание
    check_dependencies
    setup_env
    deploy_containers
    apply_migrations
    seed_data "$SEED_DATA"
    health_check
    show_info
    
    log_success "✅ Развертывание завершено успешно!"
}

# Обработка ошибок
trap 'log_error "Произошла ошибка во время развертывания"; exit 1' ERR

# Проверка аргументов и запуск
case "${1:-}" in
    --help|-h)
        echo "Использование: $0 [--seed] [--help]"
        echo ""
        echo "Опции:"
        echo "  --seed    Заполнить базу данных тестовыми данными"
        echo "  --help    Показать эту справку"
        echo ""
        echo "Примеры:"
        echo "  $0                # Обычное развертывание"
        echo "  $0 --seed         # Развертывание с тестовыми данными"
        exit 0
        ;;
    *)
        main "$@"
        ;;
esac 