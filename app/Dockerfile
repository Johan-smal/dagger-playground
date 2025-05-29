FROM php:8.2-fpm as base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git curl unzip zip libzip-dev libpng-dev libonig-dev libxml2-dev \
    && docker-php-ext-install pdo_mysql mbstring zip exif pcntl bcmath

# Install Composer globally
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www

FROM base as dev-stage

# Install development dependencies
RUN apt-get update && apt-get install -y \
    libzip-dev \
    && docker-php-ext-install zip

# Install Xdebug directly using pecl
RUN pecl install xdebug \
    && docker-php-ext-enable xdebug

# Install additional PHP extensions
RUN docker-php-ext-install gd

# PHP-FPM runs by default
CMD ["php-fpm"]