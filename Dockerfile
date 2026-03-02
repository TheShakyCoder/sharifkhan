# Stage 1: Build PHP dependencies
FROM composer:2 AS php-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist \
    --no-dev

# Stage 2: Build Node dependencies and assets
FROM node:20-alpine AS node-builder
WORKDIR /app

ARG VITE_APP_NAME
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
ARG VITE_PUSHER_APP_CLUSTER

COPY package.json package-lock.json ./
COPY --from=php-builder /app/vendor /app/vendor
COPY . .
RUN npm ci && npm run build

# Stage 3: Final Runtime
FROM dunglas/frankenphp:1-php8.3-alpine
LABEL maintainer="Antigravity"

RUN apk add --no-cache bash netcat-openbsd nodejs npm
RUN install-php-extensions pcntl pdo_mysql intl zip bcmath gd redis

# Set the document root for FrankenPHP to Laravel's public directory
ENV FRANKENPHP_CONFIG="import /etc/caddy/Caddyfile.d/*.conf"
ENV SERVER_NAME=:80

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr

WORKDIR /var/www/html

# Copy binary and source
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . /var/www/html/

# Restore production artifacts
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/

# Final cleanup and optimization (Clearing cache is critical to avoid 404/service errors)
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs \
    && rm -f bootstrap/cache/*.php \
    && chmod -R 777 storage bootstrap/cache \
    && php artisan config:clear \
    && php artisan route:clear \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative

EXPOSE 80 443 443/udp

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Use php-server mode with the root set to public/
CMD ["frankenphp", "php-server", "--root", "public/"]
