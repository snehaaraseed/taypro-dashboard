#!/usr/bin/env bash
# One-time (idempotent): ensure production nginx serves 503 maintenance during deploy.
# Run on the server after code sync, or from deploy.sh via SSH.

set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
LOC_INCLUDE_MARKER="# taypro-maintenance-location"
LOC_INCLUDE="    include $REMOTE_PATH/deploy/nginx/maintenance-location.conf; $LOC_INCLUDE_MARKER"
SERVER_INCLUDE_MARKER="# taypro-maintenance-include"
SERVER_INCLUDE="    include $REMOTE_PATH/deploy/nginx/maintenance.conf; $SERVER_INCLUDE_MARKER"

if [ ! -f "$REMOTE_PATH/deploy/nginx/maintenance.conf" ] || [ ! -f "$REMOTE_PATH/deploy/maintenance/index.html" ]; then
  echo "Missing deploy/maintenance or deploy/nginx — sync the repo first."
  exit 1
fi

if [ ! -f "$NGINX_SITE" ]; then
  echo "Nginx site config not found at $NGINX_SITE"
  exit 1
fi

if ! grep -q "$SERVER_INCLUDE_MARKER" "$NGINX_SITE"; then
  echo "Adding server-level maintenance include..."
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "/ssl_dhparam/a\\
$SERVER_INCLUDE
" "$NGINX_SITE"
  else
    sudo sed -i "/ssl_dhparam/a\\
$SERVER_INCLUDE
" "$NGINX_SITE"
  fi
fi

# Inside each proxy_pass location so maintenance wins even if server-level if is skipped.
if ! grep -q "$LOC_INCLUDE_MARKER" "$NGINX_SITE"; then
  echo "Adding per-location maintenance checks..."
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "/proxy_pass http:\/\/127.0.0.1:3000;/i\\
$LOC_INCLUDE
" "$NGINX_SITE"
  else
    sudo sed -i "/proxy_pass http:\/\/127.0.0.1:3000;/i\\
$LOC_INCLUDE
" "$NGINX_SITE"
  fi
fi

if [ "$(id -u)" -eq 0 ]; then
  nginx -t
  systemctl reload nginx
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

rm -f "$REMOTE_PATH/.maintenance"
echo "Nginx maintenance support ready."
