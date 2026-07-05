#!/usr/bin/env bash
# Weekly database defragmentation cron task
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
LOG="${DEFRAGMENT_CRON_LOG:-$ROOT/logs/defragment-cron.log}"
ENV_FILE="$ROOT/.env.production"

mkdir -p "$(dirname "$LOG")"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

echo "$(date -Is) Running database defragmentation..." >> "$LOG"
if node --import tsx "$ROOT/scripts/defragment-db.ts" >> "$LOG" 2>&1; then
  echo "$(date -Is) Database defragmentation success." >> "$LOG"
else
  echo "$(date -Is) ERROR: Database defragmentation failed." >> "$LOG"
  exit 1
fi
