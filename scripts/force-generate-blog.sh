#!/usr/bin/env bash
# Detached forced blog generation on production (survives SSH disconnect).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="$ROOT/logs/blog-force-run.log"
RESULT="/tmp/blog-force-result.json"
ENV_FILE="$ROOT/.env.production"
export TZ="${BLOG_CRON_TZ:-Asia/Kolkata}"

mkdir -p "$ROOT/logs"
cd "$ROOT"
if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${AUTOMATION_CRON_SECRET:-}" ]; then
  echo "$(date -Is) ERROR AUTOMATION_CRON_SECRET not set" >> "$LOG"
  exit 1
fi

DAY=$(date +%Y%m%d)
echo "$(date -Is) [force] starting generate-blog force=true (timeout 3600s)" >> "$LOG"

curl -sS -m 3600 -X POST "http://127.0.0.1:3000/api/automation/generate-blog?force=true" \
  -H "Authorization: Bearer ${AUTOMATION_CRON_SECRET}" \
  -H "Content-Type: application/json" \
  -o "$RESULT" \
  -w "\nHTTP %{http_code} in %{time_total}s\n" >> "$LOG" 2>&1

echo "$(date -Is) [force] response:" >> "$LOG"
head -c 8000 "$RESULT" >> "$LOG" 2>&1 || true
echo >> "$LOG"

if [ -f "$ROOT/.runtime/blog-cron/done-$DAY" ]; then
  echo "$(date -Is) [force] SUCCESS done file exists" >> "$LOG"
else
  echo "$(date -Is) [force] no done file yet" >> "$LOG"
fi

sqlite3 "$ROOT/data/cms.sqlite" \
  "SELECT slug, created_at FROM blogs WHERE locale='en' ORDER BY id DESC LIMIT 1;" \
  >> "$LOG" 2>&1 || true

echo "$(date -Is) [force] finished" >> "$LOG"
