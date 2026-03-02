# Stage 1: Build PHP dependencies
FROM composer:2 AS php-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --ignore-platform-reqs --no-interaction --no-plugins --no-scripts --prefer-dist --no-dev

# Stage 2: Build Node assets
FROM node:20-alpine AS node-builder
WORKDIR /app
ARG VITE_APP_NAME
ARG VITE_PUSHER_APP_KEY
ARG VITE_PUSHER_HOST
ARG VITE_PUSHER_PORT
ARG VITE_PUSHER_SCHEME
ARG VITE_PUSHER_APP_CLUSTER

COPY package.json package-lock.json ./
# Vite needs 'vendor' to resolve Ziggy routes
COPY --from=php-builder /app/vendor /app/vendor
COPY . .
# We don't use --production here because SSR needs several 'devDependencies' at runtime
RUN npm ci && npm run build

# Stage 3: Final Runtime
FROM php:8.3-fpm-alpine
LABEL maintainer="Antigravity"

# Install system dependencies
RUN apk add --no-cache \
    bash \
    nginx \
    supervisor \
    nodejs \
    npm \
    netcat-openbsd \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev

# Install PHP extensions
RUN curl -sSL https://github.com/mlocati/docker-php-extension-installer/releases/latest/download/install-php-extensions -o /usr/local/bin/install-php-extensions && \
    chmod +x /usr/local/bin/install-php-extensions && \
    install-php-extensions pcntl pdo_mysql intl zip bcmath gd redis

# Configure Nginx and Supervisor
COPY .docker/nginx.conf /etc/nginx/http.d/default.conf
COPY .docker/supervisor.conf /etc/supervisor/conf.d/laravel.conf

WORKDIR /var/www/html

# Restore binary and source
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . /var/www/html/

# Layer in built artifacts
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
# IMPORTANT: Copy node_modules WITHOUT pruning, as Inertia SSR requires many devDeps like @inertiajs/vue3
COPY --from=node-builder /app/node_modules/ /var/www/html/node_modules/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/

# Final cleanup, permissions, and optimization
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs database \
    && rm -f bootstrap/cache/*.php \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache \
    && php artisan config:clear \
    && php artisan route:clear \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative

EXPOSE 80

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start services via Supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/laravel.conf"]
