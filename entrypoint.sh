#!/bin/sh
# Write runtime config from env vars
cat > /usr/share/nginx/html/config.json <<JSON
{"eiaApiKey":"${EIA_API_KEY:-}"}
JSON
exec nginx -g 'daemon off;'
