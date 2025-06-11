FROM php:8.2-fpm-alpine AS base
RUN apk add --no-cache $PHPIZE_DEPS linux-headers \
    git curl unzip zip libzip-dev libpng-dev libxml2-dev oniguruma-dev \
    && docker-php-ext-install mbstring bcmath pcntl \
    && pecl install redis \
    && docker-php-ext-enable redis

WORKDIR /var/www

# --- Development stages with Composer ---
FROM base as dev-stage
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN apk add --no-cache --virtual .build-deps \
    && pecl install xdebug \
    && docker-php-ext-enable xdebug \
    && apk del .build-deps
CMD ["php-fpm"]

# --- CICD stage for Composer dependencies ---
FROM base AS cicd-stage
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# --- Build stage for production dependencies ---
FROM base AS build
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
COPY . .
RUN composer install --no-dev --prefer-dist --no-interaction --optimize-autoloader

# --- Production stages (no Composer, only vendor) ---
FROM base AS prod-stage
COPY --from=build /var/www /var/www
CMD ["php-fpm"]