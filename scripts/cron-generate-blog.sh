#!/usr/bin/env bash
# Every 5 min: recover translation when backlog exists; write one blog after 00:30 Pacific
# (Gemini RPD resets at midnight PT ≈ 12:30 IST). On text-model quota exhaustion, hold until
# the next 00:30 PT instead of retrying every 5 min. Writer only runs when done-* is missing.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_AUTOMATION_LOG:-/var/log/blog-automation.log}"
ENV_FILE="$ROOT/.env.production"
RUNTIME_DIR="$ROOT/.runtime/blog-cron"
export TZ="${BLOG_CRON_TZ:-Asia/Kolkata}"

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

mkdir -p "$RUNTIME_DIR"
DAY=$(date +%Y%m%d)
DONE_FILE="$RUNTIME_DIR/done-$DAY"

start_post_writer_translations() {
  if [ -x "$ROOT/scripts/start-post-writer-translations.sh" ]; then
    "$ROOT/scripts/start-post-writer-translations.sh" || true
  else
    echo "$(date -Is) WARN: missing start-post-writer-translations.sh" >> "$LOG"
  fi
}

maybe_recover_translation() {
  local status_json status_exit
  set +e
  status_json="$(
    node "$ROOT/scripts/translation-recovery-status.mjs" 2>/dev/null
  )"
  status_exit=$?
  set -e
  if [ "$status_exit" -eq 10 ]; then
    echo "$(date -Is) translation recovery: worker down with pending backlog — ${status_json:-unknown}" >> "$LOG"
    start_post_writer_translations
  fi
}

maybe_recover_translation

if [ -f "$DONE_FILE" ]; then
  exit 0
fi

GATE_SCRIPT="$ROOT/scripts/blog-writer-cron-gate.mjs"
QUOTA_HOLD_FILE="$RUNTIME_DIR/quota-hold-until"

if [ ! -f "$GATE_SCRIPT" ]; then
  echo "$(date -Is) ERROR: missing $GATE_SCRIPT" >> "$LOG"
  exit 1
fi

if [ -f "$QUOTA_HOLD_FILE" ]; then
  if node "$GATE_SCRIPT" check-hold "$QUOTA_HOLD_FILE" 2>/dev/null; then
    exit 0
  fi
  rm -f "$QUOTA_HOLD_FILE"
fi

if ! node "$GATE_SCRIPT" past-soft-start 2>/dev/null; then
  exit 0
fi

API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
AUTH_HEADER="Authorization: Bearer ${AUTOMATION_CRON_SECRET}"

finish_blog_cron_day() {
  touch "$DONE_FILE"
}

finish_blog_cron_day_and_translate() {
  finish_blog_cron_day
  start_post_writer_translations
}

ENDPOINT="${API_BASE%/}/api/automation/generate-blog"
{
  echo "$(date -Is) POST $ENDPOINT"
  BODY=$(curl -sS -m 1800 -X POST "$ENDPOINT" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")
  echo "$BODY"
  set +e
  node -e "
    const b = JSON.parse(process.argv[1]);
    if (b.success === true) {
      process.exit(10);
    }
    if (b.quotaExhausted === true) {
      process.exit(20);
    }
    if (b.outsideWriterWindow === true || b.quotaWaiting === true) {
      process.exit(40);
    }
    if (b.jobComplete === true || (b.schedule && b.schedule.canGenerate === false)) {
      process.exit(30);
    }
    process.exit(1);
  " "$BODY" 2>/dev/null
  EXIT=$?
  set -e
  case "$EXIT" in
    10)
      echo "$(date -Is) blog scheduled (translation dispatched by API)" >> "$LOG"
      finish_blog_cron_day
      ;;
    20)
      HOLD_UNTIL=$(node "$GATE_SCRIPT" write-hold "$QUOTA_HOLD_FILE" 2>/dev/null || echo "next writer start")
      echo "$(date -Is) Gemini text-model quota exhausted; writer on hold until ~$HOLD_UNTIL IST" >> "$LOG"
      ;;
    40)
      ;;
    30)
      echo "$(date -Is) today's automation write already complete; starting translation worker" >> "$LOG"
      finish_blog_cron_day_and_translate
      ;;
    *)
      echo "$(date -Is) generate-blog failed; will retry on next cron tick" >> "$LOG"
      maybe_recover_translation
      ;;
  esac
} >> "$LOG" 2>&1
