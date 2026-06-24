#!/usr/bin/env bash
# Origin microcache + connection cap — protects Node during crawl bursts.
set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
HTTP_CONF="/etc/nginx/conf.d/taypro-proxy-cache.conf"
HTTP_MARKER="# taypro-proxy-cache-http"
LOC_MARKER="# taypro-proxy-cache-location"
LOC_INCLUDE="    include $REMOTE_PATH/deploy/nginx/proxy-cache-location.conf; $LOC_MARKER"
LIMIT_MARKER="# taypro-origin-conn-limit"
LIMIT_LINE="    limit_conn taypro_origin_conns 28; $LIMIT_MARKER"
API_MARKER="# taypro-api-no-cache"
ADMIN_MARKER="# taypro-admin-no-cache"

run() {
  if [ "$(id -u)" -eq 0 ]; then "$@"; else sudo "$@"; fi
}

if [ ! -f "$REMOTE_PATH/deploy/nginx/proxy-cache-http.conf" ]; then
  echo "Missing proxy-cache files — sync repo first."
  exit 1
fi

run mkdir -p /var/cache/nginx/taypro
run chown -R www-data:www-data /var/cache/nginx/taypro

if [ ! -f "$HTTP_CONF" ] || ! grep -q "$HTTP_MARKER" "$HTTP_CONF" 2>/dev/null; then
  echo "Installing http-level cache + limit_conn zones..."
  run cp "$REMOTE_PATH/deploy/nginx/proxy-cache-http.conf" "$HTTP_CONF"
  echo " $HTTP_MARKER" | run tee -a "$HTTP_CONF" >/dev/null
fi

if ! grep -q "$LIMIT_MARKER" "$NGINX_SITE"; then
  echo "Adding origin connection cap..."
  run sed -i "/server_name taypro.in/a\\
$LIMIT_LINE
" "$NGINX_SITE"
fi

if ! grep -q "$API_MARKER" "$NGINX_SITE"; then
  echo "Adding /api/ bypass location..."
  run sed -i "/# Main location/i\\
    location /api/ {\\
    include $REMOTE_PATH/deploy/nginx/maintenance-location.conf; $API_MARKER\\
        proxy_cache off;\\
        proxy_pass http://taypro_nextjs;\\
    }\\
\\
" "$NGINX_SITE"
fi

if ! grep -q "$ADMIN_MARKER" "$NGINX_SITE"; then
  echo "Adding /admin bypass location..."
  run sed -i "/# Main location/i\\
    location /admin {\\
    include $REMOTE_PATH/deploy/nginx/maintenance-location.conf; $ADMIN_MARKER\\
        proxy_cache off;\\
        proxy_pass http://taypro_nextjs;\\
    }\\
\\
" "$NGINX_SITE"
fi

if ! grep -q "$LOC_MARKER" "$NGINX_SITE"; then
  echo "Adding HTML microcache to location /..."
  run sed -i "/location \/ {/a\\
$LOC_INCLUDE
" "$NGINX_SITE"
fi

# Longer timeouts for cold SSR while cache warms (server-level override).
if grep -q 'proxy_read_timeout 30s' "$NGINX_SITE"; then
  run sed -i 's/proxy_read_timeout 30s/proxy_read_timeout 90s/' "$NGINX_SITE"
  run sed -i 's/proxy_send_timeout 30s/proxy_send_timeout 90s/' "$NGINX_SITE"
fi

# Fix duplicate Connection headers if present.
run sed -i "/proxy_set_header Connection 'upgrade';/d" "$NGINX_SITE"

run nginx -t
run systemctl reload nginx
echo "Origin proxy cache + connection cap applied."
