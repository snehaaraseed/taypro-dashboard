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

RUNTIME_DIR="$ROOT/.runtime/blog-cron"
mkdir -p "$RUNTIME_DIR"
FORCE_OK=0
if node -e "
  const fs = require('fs');
  const raw = fs.readFileSync(process.argv[1], 'utf8');
  const b = JSON.parse(raw);
  process.exit(b.success === true ? 0 : 1);
" "$RESULT" 2>/dev/null; then
  FORCE_OK=1
  touch "$RUNTIME_DIR/done-$DAY"
  echo "$(date -Is) [force] SUCCESS — marked done-$DAY" >> "$LOG"
  rm -f "$ROOT/.runtime/translation-cron/catchup.lock" "$RUNTIME_DIR/writer.lock"
  if [ -x "$ROOT/scripts/start-post-writer-translations.sh" ]; then
    "$ROOT/scripts/start-post-writer-translations.sh" || true
    echo "$(date -Is) [force] post-writer translations triggered" >> "$LOG"
  fi
else
  echo "$(date -Is) [force] FAILED (success !== true in response)" >> "$LOG"
fi

sqlite3 "$ROOT/data/cms.sqlite" \
  "SELECT slug, updated_at FROM blogs WHERE locale='en' ORDER BY updated_at DESC LIMIT 1;" \
  >> "$LOG" 2>&1 || true

echo "$(date -Is) [force] finished (ok=$FORCE_OK)" >> "$LOG"
