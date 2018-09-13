FROM php:5.6-apache
MAINTAINER practicum <practicum@cs.uw.edu>

# Create app directory
WORKDIR /srv/practicum

# Bundle app source
COPY . .

CMD apache2-foreground
