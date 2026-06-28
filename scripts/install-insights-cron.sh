#!/usr/bin/env bash
# Idempotently install monthly insights cron (one deep research report).
# 1st of month, server time (UTC on production).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
INSIGHTS_SCRIPT="$ROOT/scripts/cron-generate-insights.sh"
INSIGHTS_LINE="0 10 1 * * $INSIGHTS_SCRIPT # taypro-insights-monthly"
INSIGHTS_MARKER="taypro-insights-monthly"
LEGACY_PULSE_MARKER="taypro-category-pulse"

if [ ! -x "$INSIGHTS_SCRIPT" ]; then
  chmod +x "$INSIGHTS_SCRIPT"
fi

mkdir -p "$ROOT/logs"
touch "$ROOT/logs/insights-cron.log" 2>/dev/null || true

current="$(crontab -l 2>/dev/null || true)"
filtered="$(echo "$current" | grep -vF "$INSIGHTS_MARKER" | grep -vF "$LEGACY_PULSE_MARKER" || true)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$INSIGHTS_LINE"
} | crontab -

echo "Installed insights cron (monthly deep research):"
crontab -l | grep -F "$INSIGHTS_MARKER" || true
