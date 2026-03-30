#!/bin/sh
# Write nginx snippet with API key for proxy injection
cat > /etc/nginx/eia_key.conf <<CONF
set \$eia_api_key "${EIA_API_KEY:-}";
CONF
exec nginx -g 'daemon off;'
