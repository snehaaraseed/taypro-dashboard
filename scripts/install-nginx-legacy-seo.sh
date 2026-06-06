#!/usr/bin/env bash
# Idempotent: ensure production nginx returns 301 for legacy WordPress URLs
# before Next.js (SEO-045). Run on server after deploy.

set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
INCLUDE_MARKER="# taypro-legacy-seo-include"
INCLUDE_LINE="    include $REMOTE_PATH/deploy/nginx/legacy-static-deny.conf; $INCLUDE_MARKER"

if [ ! -f "$REMOTE_PATH/deploy/nginx/legacy-static-deny.conf" ]; then
  echo "Missing deploy/nginx/legacy-static-deny.conf — sync the repo first."
  exit 1
fi

if [ ! -f "$NGINX_SITE" ]; then
  echo "Nginx site config not found at $NGINX_SITE"
  exit 1
fi

if ! grep -q "$INCLUDE_MARKER" "$NGINX_SITE"; then
  echo "Adding legacy SEO redirect include..."
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "/server_name taypro.in/i\\
$INCLUDE_LINE
" "$NGINX_SITE"
  else
    sudo sed -i "/server_name taypro.in/i\\
$INCLUDE_LINE
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

echo "Nginx legacy SEO redirects ready."
