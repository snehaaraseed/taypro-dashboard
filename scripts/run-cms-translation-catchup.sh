#!/usr/bin/env bash
# Fire-and-forget catch-up: full backlog via PM2 API until quota or midnight IST.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_CATCHUP_LOG:-$ROOT/logs/blog-translation-catchup.log}"
ENV_FILE="$ROOT/.env.production"
TZ="${CMS_TRANSLATION_TZ:-Asia/Kolkata}"
API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"

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

STOP_AT_EPOCH=$(TZ="$TZ" date -d "tomorrow 00:00:00" +%s 2>/dev/null || TZ="$TZ" date -v0H -v0M -v0S -v+1d +%s)
ENDPOINT="${API_BASE%/}/api/automation/retry-translations"
PAYLOAD=$(printf '{"catchup":true,"stopAtEpoch":%s}' "$STOP_AT_EPOCH")

{
  echo "$(date -Is) POST $ENDPOINT (catchup stop_at_epoch=$STOP_AT_EPOCH tz=$TZ)"
  curl -sS -m 60 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD"
  echo ""
} >> "$LOG" 2>&1
