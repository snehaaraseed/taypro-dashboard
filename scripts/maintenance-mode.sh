#!/usr/bin/env bash
# Toggle nginx maintenance mode (503) for taypro.in production.
# Usage: maintenance-mode.sh on|off|status

set -euo pipefail

ACTION="${1:-}"
FLAG_FILE="${MAINTENANCE_FLAG:-/var/www/taypro-dashboard/.maintenance}"
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-available/taypro.in}"
MAINTENANCE_INCLUDE_MARKER="# taypro-maintenance-include"

usage() {
  echo "Usage: $0 on|off|status"
  exit 1
}

reload_nginx() {
  if ! command -v nginx >/dev/null 2>&1; then
    echo "nginx not found; skipped reload"
    return 0
  fi
  if [ "$(id -u)" -eq 0 ]; then
    nginx -t
    systemctl reload nginx
  else
    sudo nginx -t
    sudo systemctl reload nginx
  fi
}

ensure_nginx_include() {
  local conf_dir
  conf_dir="$(dirname "$FLAG_FILE")/deploy/nginx"
  if [ ! -f "$conf_dir/maintenance.conf" ]; then
    echo "Missing $conf_dir/maintenance.conf — sync deploy/ before enabling maintenance."
    exit 1
  fi
  if [ ! -f "$NGINX_SITE" ]; then
    echo "Nginx site config not found at $NGINX_SITE (skip include check)"
    return 0
  fi
  if grep -q "$MAINTENANCE_INCLUDE_MARKER" "$NGINX_SITE"; then
    return 0
  fi
  echo "Adding maintenance include to $NGINX_SITE ..."
  INCLUDE_LINE="    include /var/www/taypro-dashboard/deploy/nginx/maintenance.conf; $MAINTENANCE_INCLUDE_MARKER"
  if [ "$(id -u)" -eq 0 ]; then
  sed -i "/ssl_dhparam/a\\
$INCLUDE_LINE
" "$NGINX_SITE"
  else
    sudo sed -i "/ssl_dhparam/a\\
$INCLUDE_LINE
" "$NGINX_SITE"
  fi
  reload_nginx
  echo "Maintenance nginx block installed."
}

case "$ACTION" in
  on)
    ensure_nginx_include
    touch "$FLAG_FILE"
    reload_nginx
    echo "Maintenance mode ON ($FLAG_FILE)"
    ;;
  off)
    rm -f "$FLAG_FILE"
    reload_nginx
    echo "Maintenance mode OFF"
    ;;
  status)
    if [ -f "$FLAG_FILE" ]; then
      echo "Maintenance mode ON"
      exit 0
    fi
    echo "Maintenance mode OFF"
    ;;
  *)
    usage
    ;;
esac
