#!/usr/bin/env bash
# Install Taypro logrotate config (run on production as ubuntu with sudo).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
SRC="$ROOT/scripts/logrotate/taypro.conf"
DEST="/etc/logrotate.d/taypro"

if [ ! -f "$SRC" ]; then
  echo "Missing $SRC"
  exit 1
fi

if [ "$(id -u)" -ne 0 ]; then
  if command -v sudo >/dev/null 2>&1; then
    exec sudo bash "$0" "$@"
  fi
  echo "Run as root or with sudo."
  exit 1
fi

install -m 0644 "$SRC" "$DEST"
mkdir -p /var/www/taypro-dashboard/logs
chown ubuntu:ubuntu /var/www/taypro-dashboard/logs 2>/dev/null || true

# Touch cron logs so logrotate knows the paths (optional).
touch /var/log/blog-automation.log 2>/dev/null || true
chown ubuntu:ubuntu /var/log/blog-automation.log 2>/dev/null || true

if logrotate -d "$DEST" >/dev/null 2>&1; then
  echo "Installed $DEST (dry-run OK)"
else
  echo "Installed $DEST (run: sudo logrotate -d $DEST to verify)"
fi
