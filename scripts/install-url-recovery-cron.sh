#!/usr/bin/env bash
# Idempotently add weekly redirect-candidate merge (runs after GSC sync on Mondays).
# Also refreshes the cron line if the schedule/script changed.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
MERGE_SCRIPT="$ROOT/scripts/cron-merge-404-candidates.sh"
# Monday 07:00 IST = 01:30 UTC (30 min after GSC sync, fallback if GSC chain fails)
CRON_LINE="30 1 * * 1 $MERGE_SCRIPT # taypro-url-recovery-merge Mon 07:00 IST"
MARKER="taypro-url-recovery-merge"

if [ ! -x "$MERGE_SCRIPT" ]; then
  chmod +x "$MERGE_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/url-recovery-merge.log"

current="$(crontab -l 2>/dev/null || true)"
filtered="$(echo "$current" | grep -vF "$MARKER" || true)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$CRON_LINE"
} | crontab -

echo "Installed weekly URL recovery merge cron:"
crontab -l | grep -F "$MARKER"
