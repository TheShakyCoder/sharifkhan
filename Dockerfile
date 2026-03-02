# Stage 1: Build PHP dependencies
FROM composer:2 as php-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --ignore-platform-reqs \
    --no-interaction \
    --no-plugins \
    --no-scripts \
    --prefer-dist

# Stage 2: Build Node dependencies and assets
FROM node:20-alpine as node-builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Final Runtime
FROM dunglas/frankenphp:1-php8.3-alpine
LABEL maintainer="Antigravity"

# Copy composer binary for runtime optimizations
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Install necessary PHP extensions and runtime dependencies
# These are the standard ones for Laravel apps
RUN apk add --no-cache \
    libpng-dev \
    libjpeg-turbo-dev \
    freetype-dev \
    libzip-dev \
    icu-dev \
    nodejs \
    npm \
    bash \
    netcat-openbsd

RUN install-php-extensions \
    pcntl \
    pdo_mysql \
    pdo_sqlite \
    gd \
    intl \
    zip \
    opcache \
    bcmath \
    redis

# Set production environment variables
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV LOG_CHANNEL=stderr
ENV FRANKENPHP_CONFIG="worker ./public/index.php"

WORKDIR /var/www/html

# Copy application files
COPY --from=php-builder /app/vendor/ /var/www/html/vendor/
COPY --from=node-builder /app/public/build/ /var/www/html/public/build/
COPY --from=node-builder /app/bootstrap/ssr/ /var/www/html/bootstrap/ssr/
COPY . /var/www/html/

# Ensure necessary folders exist and permissions are correct
RUN mkdir -p storage/framework/{sessions,views,cache} \
    && mkdir -p storage/logs \
    && chmod -R 777 storage bootstrap/cache

# Re-run composer dump-autoload for optimization
RUN composer dump-autoload --optimize --no-dev --classmap-authoritative

# Expose ports for HTTP, HTTPS, and HTTP/3
EXPOSE 80 443 443/udp

# Custom Entrypoint to handle migrations and potential SSR
COPY .docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]

# Start FrankenPHP in worker mode
CMD ["frankenphp", "run-worker", "--config", "/var/www/html/public/index.php"]
