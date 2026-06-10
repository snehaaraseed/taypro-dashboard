#!/usr/bin/env bash
# Weekly GSC → blog boost closed loop + not-found page probe + redirect candidates.
# Runs Monday 06:30 IST (01:00 UTC). Merge step follows successful GSC sync.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${GSC_SYNC_LOG:-$ROOT/logs/gsc-sync.log}"
ENV_FILE="$ROOT/.env.production"
BASE_URL="${TAYPRO_BASE_URL:-http://127.0.0.1:3000}"

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

echo "$(date -Is) Starting GSC boost + not-found sync" >> "$LOG"

HTTP_CODE=$(curl -sS -o /tmp/gsc-sync-response.json -w "%{http_code}" \
  -X POST "${BASE_URL}/api/automation/sync-gsc" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 600) || HTTP_CODE="000"

if [ "$HTTP_CODE" != "200" ]; then
  echo "$(date -Is) FAILED http=$HTTP_CODE $(cat /tmp/gsc-sync-response.json 2>/dev/null || true)" >> "$LOG"
  exit 1
fi

echo "$(date -Is) OK $(cat /tmp/gsc-sync-response.json)" >> "$LOG"

echo "$(date -Is) Running redirect-candidate merge" >> "$LOG"
if bash "$ROOT/scripts/cron-merge-404-candidates.sh" >> "$LOG" 2>&1; then
  echo "$(date -Is) Redirect-candidate merge OK" >> "$LOG"
else
  echo "$(date -Is) WARN redirect-candidate merge failed (GSC sync succeeded)" >> "$LOG"
fi
