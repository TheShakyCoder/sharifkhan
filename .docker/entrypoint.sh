#!/bin/bash
set -e

# Run database migrations if APP_ENV is production and DB_AUTO_MIGRATE is true
if [ "${APP_ENV}" == "production" ] && [ "${DB_AUTO_MIGRATE}" == "true" ]; then
    echo "Running migrations..."
    php artisan migrate --force
fi

# Cache configuration, routes, and views for performance
echo "Caching configuration and routes..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Execute the main command (Supervisor)
exec "$@"
