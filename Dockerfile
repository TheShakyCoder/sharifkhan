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

# Install system dependencies
RUN apk add --no-cache bash netcat-openbsd nodejs npm

# Install PHP extensions
RUN install-php-extensions pcntl pdo_mysql intl zip bcmath gd redis

# Set production environment variables
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    # Standard Caddy/FrankenPHP server settings
    SERVER_NAME=:80

WORKDIR /var/www/html

# 1. Copy source files first
COPY . /var/www/html/

# 2. Layer in build artifacts
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/

# 3. Clean up and optimize
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

# Run the PHP server using the public directory as root
# This automatically handles Laravel's index.php routing
CMD ["frankenphp", "php-server", "--root", "public/"]
