FROM php:5.6-apache
MAINTAINER practicum <practicum@cs.uw.edu>

# Create app directory
WORKDIR /srv/practicum

#RUN apt-get install -y git zip unzip libapache2-mod-shib2
# shouldn't really keep these
#RUN apt-get install -y screen nano
# probably not these python3 python3-matplotlib zlib1g-dev mono-devel libxml2-utils
RUN	a2enmod rewrite ssl
# shib2

RUN cd /var/www/html && \
  ln -s /srv/practicum/public practicum

COPY . .

CMD bin/setupApache.sh && \
    apache2-foreground
