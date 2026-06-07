#!/usr/bin/env bash
# Every 5 minutes: publish English blogs whose scheduled_publish_at has passed.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_SCHEDULE_LOG:-$ROOT/logs/blog-scheduled-publish.log}"
ENV_FILE="$ROOT/.env.production"
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

ENDPOINT="${API_BASE%/}/api/automation/publish-scheduled-blogs"

{
  echo "$(date -Is) POST $ENDPOINT"
  curl -sS -m 120 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d '{}'
  echo ""
} >> "$LOG" 2>&1
