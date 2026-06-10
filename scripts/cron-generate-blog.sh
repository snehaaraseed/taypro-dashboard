#!/usr/bin/env bash
# Every 5 min: after 00:30 Pacific (Gemini RPD resets at midnight PT), write one blog,
# schedule publish 09:00–17:00 IST, then start translation until quota or midnight IST.
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

if [ -f "$DONE_FILE" ]; then
  exit 0
fi

GEMINI_TZ="${GEMINI_QUOTA_RESET_TZ:-America/Los_Angeles}"
SOFT_START_MIN="${GEMINI_QUOTA_SOFT_START_MINUTES:-30}"
PT_HOUR=$(TZ="$GEMINI_TZ" date +%H)
PT_MIN=$(TZ="$GEMINI_TZ" date +%M)
PT_MINUTES=$((10#$PT_HOUR * 60 + 10#$PT_MIN))
if [ "$PT_MINUTES" -lt "$SOFT_START_MIN" ]; then
  exit 0
fi

API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
AUTH_HEADER="Authorization: Bearer ${AUTOMATION_CRON_SECRET}"

start_post_writer_translations() {
  if [ -x "$ROOT/scripts/start-post-writer-translations.sh" ]; then
    "$ROOT/scripts/start-post-writer-translations.sh" || true
  else
    echo "$(date -Is) WARN: missing start-post-writer-translations.sh" >> "$LOG"
  fi
}

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
  BODY=$(curl -sS -m 900 -X POST "$ENDPOINT" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")
  echo "$BODY"
  node -e "
    const b = JSON.parse(process.argv[1]);
    if (b.success === true) {
      process.exit(10);
    }
    if (b.quotaExhausted === true) {
      process.exit(20);
    }
    if (b.jobComplete === true || (b.schedule && b.schedule.canGenerate === false)) {
      process.exit(30);
    }
    process.exit(1);
  " "$BODY" 2>/dev/null
  EXIT=$?
  case "$EXIT" in
    10)
      echo "$(date -Is) blog scheduled (translation dispatched by API)" >> "$LOG"
      finish_blog_cron_day
      ;;
    20)
      RESET=$(node -e "
        try {
          const b = JSON.parse(process.argv[1]);
          process.stdout.write(b.nextGeminiQuotaResetIst || 'midnight Pacific (see quota-schedule)');
        } catch {
          process.stdout.write('midnight Pacific');
        }
      " "$BODY" 2>/dev/null || echo "midnight Pacific")
      echo "$(date -Is) Gemini quota exhausted; retry after reset (~$RESET)" >> "$LOG"
      ;;
    30)
      echo "$(date -Is) today's automation write already complete; starting translation worker" >> "$LOG"
      finish_blog_cron_day_and_translate
      ;;
    *)
      echo "$(date -Is) generate-blog failed; will retry on next cron tick" >> "$LOG"
      ;;
  esac
} >> "$LOG" 2>&1
