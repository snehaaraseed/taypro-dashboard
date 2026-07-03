#!/usr/bin/env bash
# Weekday 09:30 IST: catch up blog translations (staggered locales hi→ar→ja→bn).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_CATCHUP_LOG:-$ROOT/logs/blog-translation-morning.log}"
ENV_FILE="$ROOT/.env.production"
GATE_SCRIPT="$ROOT/scripts/blog-writer-cron-gate.mjs"
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

if [ -f "$GATE_SCRIPT" ] && ! node "$GATE_SCRIPT" is-automation-day 2>/dev/null; then
  exit 0
fi

ENDPOINT="${API_BASE%/}/api/automation/retry-translations"

{
  echo "$(date -Is) POST $ENDPOINT (morning catchup)"
  curl -sS -m 1800 -X POST "$ENDPOINT" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    -H "Content-Type: application/json" \
    -d '{"postWriter":true}'
  echo ""
} >> "$LOG" 2>&1
