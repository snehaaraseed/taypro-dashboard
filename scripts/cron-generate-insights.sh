#!/usr/bin/env bash
# Monthly Insights — one deep-researched report per calendar month.
# Runs daily at 10:00 IST until the current month's report is published, then
# skips until the next month. Retries transient Gemini/API failures in-run.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${INSIGHTS_CRON_LOG:-$ROOT/logs/insights-cron.log}"
ENV_FILE="$ROOT/.env.production"
BASE_URL="${CMS_CRON_API_BASE:-http://127.0.0.1:3000}"
RUNTIME_DIR="$ROOT/.runtime/insights-cron"
WRITER_LOCK="$RUNTIME_DIR/writer.lock"
RESPONSE_FILE="/tmp/insights-research.json"
export TZ="${BLOG_CRON_TZ:-Asia/Kolkata}"

MAX_POST_ATTEMPTS="${INSIGHTS_CRON_MAX_ATTEMPTS:-3}"
POST_RETRY_SLEEP_SEC="${INSIGHTS_CRON_RETRY_SLEEP_SEC:-120}"

mkdir -p "$(dirname "$LOG")" "$RUNTIME_DIR"

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

exec 9>"$WRITER_LOCK"
if ! flock -n 9; then
  echo "$(date -Is) SKIP: insights generation already in progress" >> "$LOG"
  exit 0
fi

json_field() {
  local json="$1"
  local expr="$2"
  node -e "
const j = JSON.parse(process.argv[1]);
const v = (${expr});
process.stdout.write(v === true || v === false ? String(v) : (v ?? ''));
" "$json" 2>/dev/null || echo ""
}

echo "$(date -Is) insights cron check (period=$(date +%Y-%m))" >> "$LOG"

STATUS_CODE=$(curl -sS -o "$RESPONSE_FILE" -w "%{http_code}" \
  -X GET "${BASE_URL}/api/automation/generate-research-insight" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  --max-time 60) || STATUS_CODE="000"

STATUS_BODY=$(cat "$RESPONSE_FILE" 2>/dev/null || true)

if [ "$STATUS_CODE" != "200" ]; then
  echo "$(date -Is) WARN: status GET http=$STATUS_CODE $STATUS_BODY" >> "$LOG"
else
  PUBLISHED=$(json_field "$STATUS_BODY" "j.existing?.published")
  PERIOD=$(json_field "$STATUS_BODY" "j.period")
  SLUG=$(json_field "$STATUS_BODY" "j.existing?.slug")
  if [ "$PUBLISHED" = "true" ]; then
    echo "$(date -Is) SKIP: ${PERIOD} report already published (${SLUG})" >> "$LOG"
    exit 0
  fi
fi

attempt=1
while [ "$attempt" -le "$MAX_POST_ATTEMPTS" ]; do
  echo "$(date -Is) POST attempt $attempt/$MAX_POST_ATTEMPTS" >> "$LOG"

  RESEARCH_CODE=$(curl -sS -o "$RESPONSE_FILE" -w "%{http_code}" \
    -X POST "${BASE_URL}/api/automation/generate-research-insight" \
    -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
    --max-time 1800) || RESEARCH_CODE="000"

  BODY=$(cat "$RESPONSE_FILE" 2>/dev/null || true)
  echo "$(date -Is) research http=$RESEARCH_CODE $BODY" >> "$LOG"

  if [ "$RESEARCH_CODE" = "200" ]; then
    JOB_COMPLETE=$(json_field "$BODY" "j.jobComplete")
    SUCCESS=$(json_field "$BODY" "j.success")
    if [ "$JOB_COMPLETE" = "true" ] || [ "$SUCCESS" = "true" ]; then
      echo "$(date -Is) Done" >> "$LOG"
      exit 0
    fi
  fi

  if [ "$attempt" -ge "$MAX_POST_ATTEMPTS" ]; then
    echo "$(date -Is) FAILED after $MAX_POST_ATTEMPTS attempts — will retry tomorrow" >> "$LOG"
    exit 1
  fi

  echo "$(date -Is) retry in ${POST_RETRY_SLEEP_SEC}s" >> "$LOG"
  sleep "$POST_RETRY_SLEEP_SEC"
  attempt=$((attempt + 1))
done
