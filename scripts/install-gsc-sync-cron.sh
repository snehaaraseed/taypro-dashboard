#!/usr/bin/env bash
# Idempotently add weekly GSC → seo-gsc-boost.json sync to ubuntu's crontab.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
CRON_SCRIPT="$ROOT/scripts/cron-sync-gsc-boost.sh"
# Monday 06:30 IST = 01:00 UTC (host clock is UTC per AI_BLOG_AUTOMATION_SETUP.md)
CRON_LINE="0 1 * * 1 $CRON_SCRIPT # taypro-gsc-boost-sync Mon 06:30 IST"
MARKER="taypro-gsc-boost-sync"

if [ ! -x "$CRON_SCRIPT" ]; then
  chmod +x "$CRON_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/gsc-sync.log"

current="$(crontab -l 2>/dev/null || true)"
if echo "$current" | grep -qF "$MARKER"; then
  echo "GSC sync cron already installed:"
  echo "$current" | grep -F "$MARKER" || true
  exit 0
fi

{
  if [ -n "$current" ]; then
    printf '%s\n' "$current"
  fi
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo "Installed weekly GSC sync cron:"
crontab -l | grep -F "$MARKER"
