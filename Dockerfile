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

# Define ARGs for Vite to use during build (Coolify passes these automatically)
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

# Explicitly running the requested command
RUN npm ci && npm run build

# Stage 3: Final Runtime
FROM dunglas/frankenphp:1-php8.3-alpine
LABEL maintainer="Antigravity"

RUN apk add --no-cache bash netcat-openbsd nodejs npm
RUN install-php-extensions pcntl pdo_mysql intl zip bcmath gd redis

ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    FRANKENPHP_CONFIG="worker ./public/index.php"

WORKDIR /var/www/html

# Copy binary and all source files
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer
COPY . /var/www/html/

# Restore production-ready artifacts (Vendor, Build, SSR)
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/

# Final cleanup and optimization
RUN mkdir -p storage/framework/{sessions,views,cache} storage/logs \
    && rm -f bootstrap/cache/*.php \
    && chmod -R 777 storage bootstrap/cache \
    && composer dump-autoload --optimize --no-dev --classmap-authoritative

EXPOSE 80 443 443/udp

COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["frankenphp", "run-worker", "--config", "/var/www/html/public/index.php"]
