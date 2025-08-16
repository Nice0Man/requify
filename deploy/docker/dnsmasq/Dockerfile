FROM alpine:latest

# Установка dnsmasq
RUN apk add --no-cache dnsmasq

# Создание директорий для логов
RUN mkdir -p /var/log

# Копирование конфигурации
COPY dnsmasq.conf /etc/dnsmasq.conf

# Экспорт порта DNS
EXPOSE 53/tcp 53/udp

# Запуск dnsmasq в foreground режиме
CMD ["dnsmasq", "--no-daemon", "--log-queries", "--log-facility=-"]