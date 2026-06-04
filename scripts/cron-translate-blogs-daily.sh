#!/usr/bin/env bash
# Daily cron: translate up to BLOG_TRANSLATION_MAX_PER_DAY published EN blogs (default 10).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
# Default under app dir — ubuntu cron cannot create new files in /var/log (Permission denied).
LOG="${BLOG_TRANSLATION_LOG:-$ROOT/logs/blog-translation-daily.log}"
ENV_FILE="$ROOT/.env.production"

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

API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
ENDPOINT="${API_BASE%/}/api/automation/retry-translations"

{
  echo "$(date -Is) POST $ENDPOINT"
  curl -sS -m 900 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json"
  echo ""
} >> "$LOG" 2>&1
