#!/usr/bin/env bash
# Monthly Insights — one deep-researched report per month.
# Category Pulse (thin GSC-stats report) is intentionally disabled: Insights is
# curated to a single high-quality deep report each month.
# Runs 1st of month (server time).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${INSIGHTS_CRON_LOG:-$ROOT/logs/insights-cron.log}"
ENV_FILE="$ROOT/.env.production"
BASE_URL="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"

mkdir -p "$(dirname "$LOG")"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR: missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${AUTOMATION_CRON_SECRET:-}" ]; then
  echo "$(date -Is) ERROR: AUTOMATION_CRON_SECRET not set" >> "$LOG"
  exit 1
fi

echo "$(date -Is) Starting monthly insights generation" >> "$LOG"

RESEARCH_CODE=$(curl -sS -o /tmp/insights-research.json -w "%{http_code}" \
  -X POST "${BASE_URL}/api/automation/generate-research-insight" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 1800) || RESEARCH_CODE="000"

echo "$(date -Is) research http=$RESEARCH_CODE $(cat /tmp/insights-research.json 2>/dev/null || true)" >> "$LOG"

if [ "$RESEARCH_CODE" != "200" ]; then
  echo "$(date -Is) FAILED research generation" >> "$LOG"
  exit 1
fi

echo "$(date -Is) Done" >> "$LOG"
