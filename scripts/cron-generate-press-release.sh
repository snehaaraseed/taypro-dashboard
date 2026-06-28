#!/usr/bin/env bash
# Press release generator — processes next item in data/press-release-queue.json.
# No-ops when queue is empty. Creates draft (unpublished) for human review.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${PRESS_CRON_LOG:-$ROOT/logs/press-cron.log}"
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

echo "$(date -Is) Starting press release generation check" >> "$LOG"

HTTP_CODE=$(curl -sS -o /tmp/press-release.json -w "%{http_code}" \
  -X POST "${BASE_URL}/api/automation/generate-press-release" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 300) || HTTP_CODE="000"

BODY=$(cat /tmp/press-release.json 2>/dev/null || true)
echo "$(date -Is) http=$HTTP_CODE $BODY" >> "$LOG"

if [ "$HTTP_CODE" = "200" ]; then
  if echo "$BODY" | grep -q '"jobComplete":true'; then
    echo "$(date -Is) No pending queue items (job complete)" >> "$LOG"
    exit 0
  fi
  if echo "$BODY" | grep -q '"success":true'; then
    echo "$(date -Is) Draft created" >> "$LOG"
    exit 0
  fi
fi

if [ "$HTTP_CODE" = "422" ] || [ "$HTTP_CODE" = "409" ]; then
  echo "$(date -Is) Skipped or conflict (http $HTTP_CODE)" >> "$LOG"
  exit 0
fi

echo "$(date -Is) FAILED (http $HTTP_CODE)" >> "$LOG"
exit 1
