#!/usr/bin/env bash
# Idempotent: block indexing on portal.taypro.in wiki subdomain (SEO portal-noindex).

set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_PORTAL_SITE="${NGINX_PORTAL_SITE:-/etc/nginx/sites-available/portal.taypro.in}"
INCLUDE_MARKER="# taypro-portal-noindex-include"
INCLUDE_LINE="    include $REMOTE_PATH/deploy/nginx/portal-noindex.conf; $INCLUDE_MARKER"

if [ ! -f "$REMOTE_PATH/deploy/nginx/portal-noindex.conf" ]; then
  echo "Missing deploy/nginx/portal-noindex.conf — sync the repo first."
  exit 1
fi

if [ ! -f "$NGINX_PORTAL_SITE" ]; then
  echo "Portal nginx site not found at $NGINX_PORTAL_SITE (skip if wiki uses another host)."
  exit 0
fi

if ! grep -q "$INCLUDE_MARKER" "$NGINX_PORTAL_SITE"; then
  echo "Adding portal noindex include..."
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "/server_name portal.taypro.in/i\\
$INCLUDE_LINE
" "$NGINX_PORTAL_SITE"
  else
    sudo sed -i "/server_name portal.taypro.in/i\\
$INCLUDE_LINE
" "$NGINX_PORTAL_SITE"
  fi
fi

if [ "$(id -u)" -eq 0 ]; then
  nginx -t
  systemctl reload nginx
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "Portal noindex headers ready."
