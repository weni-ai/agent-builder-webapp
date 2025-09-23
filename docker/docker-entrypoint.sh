#!/bin/sh

export JSON_STRING=''

sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/bulk-send/index.html.tmpl > /tmp/index.html

exec "$@"
