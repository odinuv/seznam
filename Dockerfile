FROM php:7.4-apache

ARG COMPOSER_FLAGS="--prefer-dist --no-interaction"
ARG DEBIAN_FRONTEND=noninteractive
ENV COMPOSER_ALLOW_SUPERUSER 1

WORKDIR /tmp/

RUN apt-get update -q && apt-get install -y --no-install-recommends \
        git 

# install composer
COPY docker/composer-install.sh /tmp/composer-install.sh
RUN chmod +x /tmp/composer-install.sh \
	&& /tmp/composer-install.sh

# Composer - deps always cached unless changed - First copy only composer files
COPY docker/* /code/docker/

# Download dependencies, but don't run scripts or init autoloaders as the app is missing
WORKDIR /code/

COPY docker/site.conf /etc/apache2/sites-available/
COPY docker/php-prod.ini /usr/local/etc/php/php.ini

# configure apache & php
RUN a2enmod rewrite \
	&& a2dissite 000-default \
	&& a2ensite site \
	&& pecl config-set php_ini /usr/local/etc/php.ini

# copy rest of the app
COPY . /code/

CMD ["apache2-foreground"]
