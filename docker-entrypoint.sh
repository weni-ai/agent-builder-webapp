#!/bin/sh

export JSON_STRING=''

sed "s|//CONFIGURATIONS_PLACEHOLDER|${JSON_STRING}|" /usr/share/nginx/html/agent-builder/index.html.tmpl > /tmp/index.html

exec "$@"