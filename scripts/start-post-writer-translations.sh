#!/usr/bin/env bash
# Fire-and-forget: translate full CMS backlog after the daily blog writer finishes.
# Stops when both Gemini API keys hit quota or at midnight IST (new calendar day).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_LOG:-$ROOT/logs/blog-translation-post-writer.log}"
ENV_FILE="$ROOT/.env.production"
TZ="${CMS_TRANSLATION_TZ:-Asia/Kolkata}"

mkdir -p "$(dirname "$LOG")"
mkdir -p "$ROOT/.runtime/translation-cron"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR: missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

STOP_AT_EPOCH=$(TZ="$TZ" date -d "tomorrow 00:00:00" +%s 2>/dev/null || TZ="$TZ" date -v0H -v0M -v0S -v+1d +%s)

{
  echo "$(date -Is) dispatch post-writer translation worker (stop_at_epoch=$STOP_AT_EPOCH tz=$TZ)"
  CMS_TRANSLATION_CATCHUP=1 \
  CMS_TRANSLATION_STOP_AT_EPOCH="$STOP_AT_EPOCH" \
  nohup node --require "$ROOT/scripts/preload-stub-server-only.cjs" \
    "$ROOT/node_modules/tsx/dist/cli.mjs" \
    "$ROOT/scripts/run-daily-cms-translations.ts" --catchup \
    >> "$LOG" 2>&1 &
  echo "$(date -Is) worker_pid=$!"
} >> "$LOG" 2>&1
