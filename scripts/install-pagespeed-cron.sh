#!/usr/bin/env bash
# Idempotently add monthly PageSpeed audit to ubuntu's crontab.
# Schedule: 22:00 UTC on 28th–31st; shell script gates to 1st ~03:30 IST.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
CRON_SCRIPT="$ROOT/scripts/cron-pagespeed-audit.sh"
CRON_LINE="0 22 28-31 * * $CRON_SCRIPT # taypro-pagespeed-audit monthly ~03:30 IST on 1st"
MARKER="taypro-pagespeed-audit"

if [ ! -x "$CRON_SCRIPT" ]; then
  chmod +x "$CRON_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/pagespeed-audit.log"

current="$(crontab -l 2>/dev/null || true)"
filtered="$(echo "$current" | grep -vF "$MARKER" || true)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo "Installed monthly PageSpeed audit cron:"
crontab -l | grep -F "$MARKER"
