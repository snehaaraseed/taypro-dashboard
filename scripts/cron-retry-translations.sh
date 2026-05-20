#!/usr/bin/env bash
# Hourly cron: resume failed CMS translations after Gemini quota resets.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${TRANSLATION_QUEUE_LOG:-/var/log/translation-queue.log}"
ENV_FILE="$ROOT/.env.production"

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

# Hit the app directly (bypasses nginx 30s proxy_read_timeout on taypro.in).
API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
ENDPOINT="${API_BASE%/}/api/automation/retry-translations?reconcile=true"

{
  echo "$(date -Is) POST $ENDPOINT"
  curl -sS -m 600 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json"
  echo ""
} >> "$LOG" 2>&1
