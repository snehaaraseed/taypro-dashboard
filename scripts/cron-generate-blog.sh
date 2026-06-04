#!/usr/bin/env bash
# Runs during 9:00–15:00 IST window (cron every 5 min). Picks one random minute per day,
# then POSTs generate-blog once (max 1 published post/day via BLOG_AUTOMATION_MIN_DAYS=1).
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
SLOT_FILE="$RUNTIME_DIR/target-$DAY.epoch"
DONE_FILE="$RUNTIME_DIR/done-$DAY"

if [ -f "$DONE_FILE" ]; then
  exit 0
fi

HOUR=$(date +%H)
if [ "$HOUR" -lt 9 ] || [ "$HOUR" -gt 15 ]; then
  exit 0
fi
if [ "$HOUR" -eq 15 ] && [ "$(date +%M)" -gt 0 ]; then
  exit 0
fi

API_BASE="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
AUTH_HEADER="Authorization: Bearer ${AUTOMATION_CRON_SECRET}"

now_epoch() {
  date +%s
}

if [ ! -f "$SLOT_FILE" ]; then
  START=$(date -d "today 09:00:00" +%s)
  END=$(date -d "today 15:00:00" +%s)
  RANGE=$((END - START))
  OFFSET=$((RANDOM % (RANGE + 1)))
  TARGET=$((START + OFFSET))
  echo "$TARGET" > "$SLOT_FILE"
  echo "$(date -Is) scheduled random run at $(date -d "@$TARGET" -Is) (9:00–15:00 window)" >> "$LOG"
fi

TARGET=$(cat "$SLOT_FILE")
NOW=$(now_epoch)

if [ "$NOW" -lt "$TARGET" ]; then
  exit 0
fi

# Already generated today (1/day cap)?
SCHEDULE_JSON=$(curl -sS -m 30 -G "$API_BASE/api/automation/generate-blog" \
  -H "$AUTH_HEADER" || echo "{}")
if node -e "
  const s = JSON.parse(process.argv[1]);
  if (s.canGenerate === false) process.exit(0);
  process.exit(1);
" "$SCHEDULE_JSON" 2>/dev/null; then
  LAST_RUN=$(node -e "
    try {
      const s = JSON.parse(process.argv[1]);
      process.stdout.write(s.lastRunAt || 'n/a');
    } catch {
      process.stdout.write('n/a');
    }
  " "$SCHEDULE_JSON" 2>/dev/null || echo "n/a")
  echo "$(date -Is) skip: cadence cap (canGenerate=false, last=$LAST_RUN)" >> "$LOG"
  touch "$DONE_FILE"
  exit 0
fi

ENDPOINT="${API_BASE%/}/api/automation/generate-blog"
{
  echo "$(date -Is) POST $ENDPOINT (target was $(date -d "@$TARGET" -Is))"
  BODY=$(curl -sS -m 900 -X POST "$ENDPOINT" \
    -H "$AUTH_HEADER" \
    -H "Content-Type: application/json")
  echo "$BODY"
  if node -e "
    const b = JSON.parse(process.argv[1]);
    process.exit(b.success === true ? 0 : 1);
  " "$BODY" 2>/dev/null; then
    touch "$DONE_FILE"
  elif node -e "
    const b = JSON.parse(process.argv[1]);
    process.exit(b.schedule && b.schedule.canGenerate === false ? 0 : 1);
  " "$BODY" 2>/dev/null; then
    touch "$DONE_FILE"
  fi
} >> "$LOG" 2>&1
