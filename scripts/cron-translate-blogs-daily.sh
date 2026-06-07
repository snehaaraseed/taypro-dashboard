#!/usr/bin/env bash
# Daily cron: fire-and-forget CMS translation worker (up to CMS_TRANSLATION_MAX_PER_DAY items).
# Worker runs in background — not limited by HTTP/curl timeouts; logs to blog-translation-daily.log.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_LOG:-$ROOT/logs/blog-translation-daily.log}"
ENV_FILE="$ROOT/.env.production"
WORKER="scripts/run-daily-cms-translations.ts"

mkdir -p "$(dirname "$LOG")"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR: missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${GEMINI_API_KEY:-}" ] && [ -z "${GEMINI_API_KEY_2:-}" ]; then
  echo "$(date -Is) ERROR: GEMINI_API_KEY not set" >> "$LOG"
  exit 1
fi

cd "$ROOT"

run_worker() {
  npx tsx "$WORKER"
}

if [ "${CMS_TRANSLATION_FOREGROUND:-}" = "1" ]; then
  {
    echo "$(date -Is) FOREGROUND worker start"
    run_worker
    echo "$(date -Is) FOREGROUND worker exit=$?"
  } >> "$LOG" 2>&1
  exit 0
fi

nohup bash -c "
  echo \"\$(date -Is) BACKGROUND worker start (ppid=$$)\"
  cd \"$ROOT\"
  set -a
  # shellcheck disable=SC1090
  source \"$ENV_FILE\"
  set +a
  npx tsx \"$WORKER\"
  echo \"\$(date -Is) BACKGROUND worker exit=\$?\"
" >> "$LOG" 2>&1 &

echo "$(date -Is) DISPATCHED background translation worker (nohup pid=$!)" >> "$LOG"
