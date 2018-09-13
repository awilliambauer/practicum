env
echo "domain = ${DOMAIN}"
whoami
ls -l /etc/apache2
ls -l /etc/apache2/sites-available
sed "s,HOSTNAME,$DOMAIN,;" \
    "/srv/practicum/apache-practicum-https.conf" \
    > /etc/apache2/sites-available/practicum-https.conf
a2dissite 000-default
a2ensite practicum-https

