#!/usr/bin/env bash
# Monthly PageSpeed Insights audit for English/default taypro.in URLs (mobile).
# Runs on the 1st of each month ~03:30 IST (22:00 UTC on last days of month + IST gate).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${PAGESPEED_AUDIT_LOG:-$ROOT/logs/pagespeed-audit.log}"
ENV_FILE="$ROOT/.env.production"
export TZ="${PAGESPEED_CRON_TZ:-Asia/Kolkata}"

mkdir -p "$(dirname "$LOG")"

# Only run when tomorrow is the 1st in IST (cron fires 22:00 UTC on 28th–31st).
TOMORROW_IST_DAY="$(TZ=Asia/Kolkata date -d tomorrow +%d 2>/dev/null || TZ=Asia/Kolkata date -v+1d +%d)"
if [ "$TOMORROW_IST_DAY" != "01" ]; then
  exit 0
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR: missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [ -z "${PAGESPEED_API_KEY:-}" ] && [ -z "${GOOGLE_API_KEY:-}" ]; then
  echo "$(date -Is) ERROR: PAGESPEED_API_KEY not set" >> "$LOG"
  exit 1
fi

{
  echo "$(date -Is) pagespeed audit start"
  cd "$ROOT"
  npx tsx scripts/run-pagespeed-audit.ts
  echo "$(date -Is) pagespeed audit done"
} >> "$LOG" 2>&1
