#!/bin/sh
# Inject EIA_API_KEY env var into the HTML at container start
sed -i "s|__EIA_API_KEY__|${EIA_API_KEY:-}|g" /usr/share/nginx/html/index.html
exec nginx -g 'daemon off;'
