#!/bin/bash
set -e

# Wait for database if needed (example for MySQL)
# Example: while ! nc -z $DB_HOST 3306; do sleep 1; done

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

# Start Inertia SSR if the ssr.js file exists
if [ -f "bootstrap/ssr/ssr.mjs" ] || [ -f "bootstrap/ssr/ssr.js" ]; then
    echo "Starting Inertia SSR..."
    php artisan inertia:start-ssr &
fi

# Execute the main command (FrankenPHP)
exec "$@"
