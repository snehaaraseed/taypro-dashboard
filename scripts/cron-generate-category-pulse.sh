#!/usr/bin/env bash
# Monthly Category Pulse — 1st of month, 10:00 IST.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${CATEGORY_PULSE_LOG:-$ROOT/logs/category-pulse.log}"
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

echo "$(date -Is) Starting category pulse generation" >> "$LOG"

HTTP_CODE=$(curl -sS -o /tmp/category-pulse-response.json -w "%{http_code}" \
  -X POST "${BASE_URL}/api/automation/generate-category-pulse" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 600) || HTTP_CODE="000"

if [ "$HTTP_CODE" != "200" ]; then
  echo "$(date -Is) FAILED http=$HTTP_CODE $(cat /tmp/category-pulse-response.json 2>/dev/null || true)" >> "$LOG"
  exit 1
fi

echo "$(date -Is) OK $(cat /tmp/category-pulse-response.json)" >> "$LOG"
