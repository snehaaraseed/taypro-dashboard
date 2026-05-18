#!/usr/bin/env bash
# Daily cron hook: generates a draft when the 3-day cadence allows (~2/week).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_AUTOMATION_LOG:-/var/log/blog-automation.log}"
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

SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://taypro.in}"
ENDPOINT="${SITE_URL%/}/api/automation/generate-blog"

{
  echo "$(date -Is) POST $ENDPOINT"
  curl -sS -m 600 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json"
  echo ""
} >> "$LOG" 2>&1
