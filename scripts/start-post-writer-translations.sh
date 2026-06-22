#!/usr/bin/env bash
# Start post-writer translation via PM2 HTTP API (avoids standalone tsx server-only issues).
# Runs until quota exhaustion or the next Gemini soft start (~1:00 PM IST).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_LOG:-$ROOT/logs/blog-translation-post-writer.log}"
ENV_FILE="$ROOT/.env.production"
GATE_SCRIPT="$ROOT/scripts/blog-writer-cron-gate.mjs"

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

export TZ="${BLOG_CRON_TZ:-Asia/Kolkata}"
DONE_FILE="$ROOT/.runtime/blog-cron/done-$(date +%Y%m%d)"

if [ ! -f "$DONE_FILE" ]; then
  echo "$(date -Is) skip: today's English blog not done yet (translation deferred)" >> "$LOG"
  exit 0
fi

API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
ENDPOINT="${API_BASE%/}/api/automation/retry-translations"
AUTH_HEADER="Authorization: Bearer ${AUTOMATION_CRON_SECRET}"

STOP_AT_EPOCH=""
if [ -f "$GATE_SCRIPT" ]; then
  STOP_AT_EPOCH=$(node "$GATE_SCRIPT" next-soft-start-epoch 2>/dev/null || true)
fi

if [ -n "$STOP_AT_EPOCH" ]; then
  PAYLOAD=$(printf '{"postWriter":true,"stopAtEpoch":%s}' "$STOP_AT_EPOCH")
else
  PAYLOAD='{"postWriter":true}'
fi

{
  echo "$(date -Is) POST $ENDPOINT (postWriter stopAtEpoch=${STOP_AT_EPOCH:-auto})"
  BODY=$(curl -sS -m 60 -X POST "$ENDPOINT" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json" \
    -d "$PAYLOAD")
  echo "$BODY"
  node -e "
    const b = JSON.parse(process.argv[1]);
    if (b.started === true) process.exit(0);
    if (b.error && String(b.error).includes('already in progress')) process.exit(0);
    process.exit(1);
  " "$BODY" 2>/dev/null || {
    echo "$(date -Is) WARN: retry-translations did not start"
    exit 1
  }
  echo "$(date -Is) translation worker accepted"
} >> "$LOG" 2>&1
