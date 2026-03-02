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
COPY package.json package-lock.json ./
RUN npm ci

# Vite build needs the 'vendor' folder to resolve Ziggy routes
COPY --from=php-builder /app/vendor /app/vendor
COPY . .
RUN npm run build

# Stage 3: Final Runtime
FROM dunglas/frankenphp:1-php8.3-alpine
LABEL maintainer="Antigravity"

# Install runtime dependencies
RUN apk add --no-cache bash netcat-openbsd nodejs npm

# Install PHP extensions
RUN install-php-extensions pcntl pdo_mysql intl zip bcmath
RUN install-php-extensions gd redis

# Set production environment variables
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    FRANKENPHP_CONFIG="worker ./public/index.php"

WORKDIR /var/www/html

# Copy binary and artifacts
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/
COPY . /var/www/html/

# Permissions and Autoload optimization
# We clear bootstrap/cache before dump-autoload to avoid Sail/dev dependency errors
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs \
    && rm -f bootstrap/cache/*.php \
    && chmod -R 777 storage bootstrap/cache \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative

EXPOSE 80 443 443/udp

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["frankenphp", "run-worker", "--config", "/var/www/html/public/index.php"]
