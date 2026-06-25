#!/usr/bin/env bash
# Idempotent: ensure security-headers.conf is included on HTML + static nginx locations.
set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
MARKER="# taypro-security-headers"

if [ ! -f "$REMOTE_PATH/deploy/nginx/security-headers.conf" ]; then
  echo "Missing deploy/nginx/security-headers.conf"
  exit 1
fi

if ! grep -q "$MARKER" "$NGINX_SITE" 2>/dev/null; then
  echo "Patching $NGINX_SITE with static security header includes ($MARKER)..."
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "s|include $REMOTE_PATH/deploy/nginx/static-public-direct.conf;|include $REMOTE_PATH/deploy/nginx/static-public-direct.conf; $MARKER|" "$NGINX_SITE" || true
  else
    sudo sed -i "s|include $REMOTE_PATH/deploy/nginx/static-public-direct.conf;|include $REMOTE_PATH/deploy/nginx/static-public-direct.conf; $MARKER|" "$NGINX_SITE" || true
  fi
fi

if [ "$(id -u)" -eq 0 ]; then
  nginx -t
  systemctl reload nginx
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "nginx security headers config verified."
