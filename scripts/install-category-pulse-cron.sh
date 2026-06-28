#!/usr/bin/env bash
# Idempotently install monthly category pulse cron (1st of month, 10:00 IST).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
PULSE_SCRIPT="$ROOT/scripts/cron-generate-category-pulse.sh"
PULSE_LINE="0 10 1 * * $PULSE_SCRIPT # taypro-category-pulse"
PULSE_MARKER="taypro-category-pulse"

if [ ! -x "$PULSE_SCRIPT" ]; then
  chmod +x "$PULSE_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/category-pulse.log" 2>/dev/null || true

current="$(crontab -l 2>/dev/null || true)"
filtered="$(echo "$current" | grep -vF "$PULSE_MARKER" || true)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$PULSE_LINE"
} | crontab -

echo "Installed category pulse cron:"
crontab -l | grep -F "$PULSE_MARKER" || true
