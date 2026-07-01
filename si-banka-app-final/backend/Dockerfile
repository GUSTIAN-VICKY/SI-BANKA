FROM php:8.2-apache

# 1. Install system dependencies & PostgreSQL development libraries
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libpng-dev \
    zip \
    unzip \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# 2. Install PHP extensions needed for Laravel (including MySQL & PostgreSQL)
RUN docker-php-ext-install pdo pdo_mysql pdo_pgsql gd

# 3. Enable Apache mod_rewrite for Laravel clean URLs
RUN a2enmod rewrite

# 4. Change Apache Document Root to Laravel's public directory
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# 5. Set working directory
WORKDIR /var/www/html

# 6. Copy application code
COPY . /var/www/html

# 7. Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-interaction --optimize-autoloader --no-dev

# 8. Set correct permissions for storage and cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# 9. Expose default port
EXPOSE 80
