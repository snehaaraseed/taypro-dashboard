#!/usr/bin/env bash
# Idempotently add scheduled blog publish cron (every 5 minutes).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
CRON_SCRIPT="$ROOT/scripts/cron-publish-scheduled-blogs.sh"
CRON_LINE="*/5 * * * * $CRON_SCRIPT # taypro-blog-scheduled-publish"
MARKER="taypro-blog-scheduled-publish"

if [ ! -x "$CRON_SCRIPT" ]; then
  chmod +x "$CRON_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/blog-scheduled-publish.log"

current="$(crontab -l 2>/dev/null || true)"
if echo "$current" | grep -qF "$MARKER"; then
  echo "Scheduled publish cron already installed:"
  echo "$current" | grep -F "$MARKER" || true
  exit 0
fi

{
  if [ -n "$current" ]; then
    printf '%s\n' "$current"
  fi
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo "Installed scheduled blog publish cron:"
crontab -l | grep -F "$MARKER"
