#!/usr/bin/env bash
# Weekly GSC → blog boost closed loop. Run after Search Console has fresh data (e.g. Monday 06:00 IST).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${GSC_SYNC_LOG:-/var/log/gsc-sync.log}"
ENV_FILE="$ROOT/.env.production"
BASE_URL="${TAYPRO_BASE_URL:-http://127.0.0.1:3000}"

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

echo "$(date -Is) Starting GSC boost sync" >> "$LOG"

HTTP_CODE=$(curl -sS -o /tmp/gsc-sync-response.json -w "%{http_code}" \
  -X POST "${BASE_URL}/api/automation/sync-gsc" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 120) || HTTP_CODE="000"

if [ "$HTTP_CODE" = "200" ]; then
  echo "$(date -Is) OK $(cat /tmp/gsc-sync-response.json)" >> "$LOG"
  exit 0
fi

echo "$(date -Is) FAILED http=$HTTP_CODE $(cat /tmp/gsc-sync-response.json 2>/dev/null || true)" >> "$LOG"
exit 1
