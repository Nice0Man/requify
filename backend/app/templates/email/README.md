# Email Templates Documentation

Это руководство по использованию email шаблонов Requify, созданных в едином стиле frontend приложения.

## 📧 Доступные шаблоны

### 1. `security_alert.html.jinja` - Уведомления о безопасности

**Использование:** Для критических предупреждений о безопасности (вирусы, подозрительная активность)

**Переменные:**
```python
{
    "filename": "file.pdf",
    "user_id": 123,
    "file_hash": "a1b2c3d4...",
    "file_size": 1024000,
    "scan_duration_ms": 250,
    "scan_timestamp": "2025-07-29T19:30:00",
    "threat_details": "Virus: Win32.Trojan.Generic",
    "incident_count": 5,
    "admin_panel_url": "https://admin.requify.local"
}
```

**Пример использования:**
```python
await email_service.send_notification_email(
    subject="🚨 БЕЗОПАСНОСТЬ: Обнаружена угроза",
    template_data=security_data,
    template_name="security_alert",
    recipients=[admin_email]
)
```

### 2. `general_notification.html.jinja` - Универсальные уведомления

**Использование:** Для любых общих уведомлений с гибкой настройкой

**Переменные:**
```python
{
    "notification_title": "Обновление системы",
    "notification_type": "info",  # success, info, warning, danger
    "notification_icon": "🔄",
    "user_name": "Иван Петров",
    "notification_message": "Система будет обновлена",
    "alert_title": "Плановое обслуживание",
    "alert_message": "Система будет недоступна 30 минут",
    "details_list": [
        {"label": "Время", "value": "22:00-22:30", "is_code": False},
        {"label": "Затронутые сервисы", "value": "API, Web", "is_code": True}
    ],
    "action_items": [
        {"icon": "✅", "text": "Сохраните незавершенную работу", "status": "completed"},
        {"icon": "⏰", "text": "Дождитесь завершения обновления", "status": "pending"}
    ],
    "action_button": {
        "url": "https://requify.local/status",
        "text": "Статус системы",
        "icon": "📊",
        "style": "button-info"
    },
    "additional_info": "Обновление улучшит производительность на 20%"
}
```

### 3. `system_alert.html.jinja` - Системные предупреждения

**Использование:** Для технических предупреждений и мониторинга системы

**Переменные:**
```python
{
    "alert_type": "DATABASE_ERROR",
    "severity": "critical",  # low, medium, high, critical
    "severity_icon": "🚨",
    "alert_title": "Критическая ошибка базы данных",
    "alert_message": "Обнаружена проблема с подключением к БД",
    "service_name": "Requify API",
    "event_timestamp": "2025-07-29T19:30:00",
    "environment": "production",
    "server_info": "prod-server-01",
    "error_code": "DB_CONNECTION_TIMEOUT",
    "affected_users": 150,
    "error_details": "Connection timeout after 30s",
    "stack_trace": "...",  # Техническая информация
    "metrics": [
        {"name": "CPU", "value": "85%", "status": "warning", "threshold": "80%"},
        {"name": "Memory", "value": "95%", "status": "critical", "threshold": "90%"}
    ],
    "auto_recovery": {
        "success": False,
        "message": "Автоматическое восстановление не удалось"
    },
    "recommended_actions": [
        {"icon": "🔧", "text": "Перезапустить сервис БД", "priority": "urgent"},
        {"icon": "📊", "text": "Проверить метрики сервера", "priority": "pending"}
    ],
    "monitoring_urls": [
        {"link": "https://grafana.requify.local", "text": "Grafana", "icon": "📈"}
    ],
    "resolution_steps": [
        "Проверить статус БД сервера",
        "Перезапустить соединения",
        "Мониторить восстановление"
    ],
    "service_status": [
        {"name": "API", "status": "critical"},
        {"name": "Web UI", "status": "warning"},
        {"name": "Files", "status": "ok"}
    ]
}
```

### 4. `user_notification.html.jinja` - Пользовательские уведомления

**Использование:** Для уведомлений пользователей о действиях в системе

**Переменные:**
```python
{
    "subject": "Проект обновлен",
    "notification_title": "Изменения в проекте",
    "notification_icon": "📝",
    "user_name": "Анна Смирнова", 
    "notification_message": "В вашем проекте произошли изменения",
    "notification_type": "success",  # success, info, warning
    "success_message": "Требования успешно обновлены",
    "changes_list": [
        {
            "icon": "📝",
            "title": "Обновлено требование",
            "description": "Изменено описание функции",
            "old_value": "Старое описание",
            "new_value": "Новое описание",
            "timestamp": "19:30"
        }
    ],
    "project_info": {
        "name": "Мобильное приложение",
        "status": "active",  # active, completed, on-hold
        "description": "Разработка iOS/Android приложения",
        "details": [
            {"label": "Версия", "value": "1.2.0"},
            {"label": "Команда", "value": "5 человек"}
        ]
    },
    "next_steps": [
        {
            "title": "Просмотреть изменения",
            "description": "Ознакомьтесь с обновленными требованиями",
            "deadline": "До 30.07.2025",
            "status": "pending"  # completed, urgent
        }
    ],
    "action_required": {
        "message": "Требуется ваше утверждение изменений",
        "deadline": "31.07.2025 18:00"
    },
    "action_buttons": [
        {
            "url": "https://requify.local/projects/123",
            "text": "Перейти к проекту",
            "icon": "🚀",
            "style": "button-success"
        }
    ],
    "summary": "Обновлено 3 требования, добавлено 1 новое",
    "help_url": "https://docs.requify.local",
    "support_url": "https://support.requify.local",
    "dashboard_url": "https://requify.local/dashboard"
}
```

## 🎨 Стили и дизайн

Все шаблоны используют единый дизайн:
- **Цветовая схема:** Синий (#2196f3) как основной, Material Design палитра
- **Типографика:** Inter, система шрифтов
- **Компоненты:** Кнопки, алерты, карточки в едином стиле
- **Адаптивность:** Корректное отображение на мобильных устройствах
- **Градиенты:** Современные градиенты для фонов и кнопок

## 📱 Адаптивность

Все шаблоны оптимизированы для:
- **Desktop:** Полноценный дизайн с grid-layout
- **Mobile:** Упрощенные колонки, увеличенные кнопки
- **Email клиенты:** Совместимость с Outlook, Gmail, Apple Mail

## 🔧 Кастомизация

### Добавление новых типов алертов:
```css
.email-title.alert-custom {
    color: #purple;
    background: linear-gradient(135deg, #f3e5f5, #e1bee7);
    border: 2px solid #ba68c8;
}
```

### Новые статусы кнопок:
```css
.button.button-custom {
    background: linear-gradient(135deg, #custom-color, #custom-dark);
}
```

## 📄 Примеры использования

### Отправка уведомления о безопасности:
```python
# В file_service.py уже реализовано
await email_service.send_notification_email(
    subject=f"🚨 БЕЗОПАСНОСТЬ: Обнаружена угроза - {filename}",
    template_data={
        "filename": filename,
        "user_id": user_id,
        "file_hash": file_hash,
        "threat_details": threat_details,
        "incident_count": incident_count
    },
    template_name="security_alert",
    recipients=[admin_email]
)
```

### Уведомление пользователя:
```python
await email_service.send_notification_email(
    subject="Проект обновлен",
    template_data={
        "notification_title": "Обновление проекта",
        "user_name": user.name,
        "notification_type": "success",
        "project_info": project_data,
        "action_buttons": [{"url": project_url, "text": "Открыть"}]
    },
    template_name="user_notification", 
    recipients=[user.email]
)
```

### Системное предупреждение:
```python
await email_service.send_notification_email(
    subject="КРИТИЧНО: Проблема с БД",
    template_data={
        "severity": "critical",
        "alert_title": "Ошибка базы данных",
        "service_name": "Requify API",
        "error_details": error_info,
        "metrics": system_metrics
    },
    template_name="system_alert",
    recipients=[admin_emails]
)
```

## 🎯 Рекомендации

1. **Используйте правильный шаблон** для каждого типа уведомления
2. **Заполняйте все ключевые поля** для лучшего UX
3. **Тестируйте** в разных email клиентах
4. **Не перегружайте** уведомления лишней информацией
5. **Используйте иконки** для улучшения визуального восприятия 