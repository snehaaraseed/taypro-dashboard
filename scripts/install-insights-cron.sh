#!/usr/bin/env bash
# Idempotently install daily insights cron (retries until current month is published).
# 10:00 IST daily — script skips when the month's report already exists.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
INSIGHTS_SCRIPT="$ROOT/scripts/cron-generate-insights.sh"
INSIGHTS_LINE="0 10 * * * $INSIGHTS_SCRIPT # taypro-insights-daily"
INSIGHTS_MARKERS=(
  "taypro-insights-daily"
  "taypro-insights-monthly"
  "taypro-category-pulse"
)

if [ ! -x "$INSIGHTS_SCRIPT" ]; then
  chmod +x "$INSIGHTS_SCRIPT"
fi

mkdir -p "$ROOT/logs" "$ROOT/.runtime/insights-cron"
touch "$ROOT/logs/insights-cron.log" 2>/dev/null || true

current="$(crontab -l 2>/dev/null || true)"
filtered="$current"
for marker in "${INSIGHTS_MARKERS[@]}"; do
  filtered="$(echo "$filtered" | grep -vF "$marker" || true)"
done

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$INSIGHTS_LINE"
} | crontab -

echo "Installed insights cron (daily until month published, 10:00 IST):"
crontab -l | grep -F "taypro-insights-daily" || true
