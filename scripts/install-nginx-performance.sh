#!/usr/bin/env bash
# One-time (idempotent): nginx upstream keepalive + connection reuse for Next.js.
# Run on production after code sync, or: ssh ubuntu@host 'cd /var/www/taypro-dashboard && ./scripts/install-nginx-performance.sh'

set -euo pipefail

REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
UPSTREAM_MARKER="# taypro-nextjs-upstream"
UPSTREAM_INCLUDE="include $REMOTE_PATH/deploy/nginx/nextjs-upstream.conf; $UPSTREAM_MARKER"

if [ ! -f "$REMOTE_PATH/deploy/nginx/nextjs-upstream.conf" ]; then
  echo "Missing deploy/nginx/nextjs-upstream.conf — sync the repo first."
  exit 1
fi

if [ ! -f "$NGINX_SITE" ]; then
  echo "Nginx site config not found at $NGINX_SITE"
  exit 1
fi

run_sed() {
  if [ "$(id -u)" -eq 0 ]; then
    sed -i "$@"
  else
    sudo sed -i "$@"
  fi
}

if ! grep -q "$UPSTREAM_MARKER" "$NGINX_SITE"; then
  echo "Adding upstream keepalive block..."
  run_sed "1i\\
$UPSTREAM_INCLUDE
" "$NGINX_SITE"
fi

if grep -q 'proxy_pass http://127.0.0.1:3000;' "$NGINX_SITE"; then
  echo "Switching proxy_pass to upstream keepalive pool..."
  run_sed 's|proxy_pass http://127.0.0.1:3000;|proxy_pass http://taypro_nextjs;|g' "$NGINX_SITE"
fi

if ! grep -q 'proxy_set_header Connection "";' "$NGINX_SITE"; then
  echo "Adding Connection header for keepalive..."
  run_sed '/proxy_set_header Connection .upgrade./a\
    proxy_set_header Connection "";' "$NGINX_SITE"
fi

if [ "$(id -u)" -eq 0 ]; then
  nginx -t
  systemctl reload nginx
else
  sudo nginx -t
  sudo systemctl reload nginx
fi

echo "nginx performance tuning applied."
