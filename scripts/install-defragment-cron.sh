#!/usr/bin/env bash
# Install weekly database defragmentation cron task (runs Sunday at 03:00)
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CRON_SCRIPT="$ROOT/scripts/cron-defragment-db.sh"
MARKER="# taypro-db-defragment-cron"
CRON_LINE="0 3 * * 0 $CRON_SCRIPT $MARKER"

chmod +x "$CRON_SCRIPT"

EXISTING=$(crontab -l 2>/dev/null || true)
if echo "$EXISTING" | grep -qF "$MARKER"; then
  echo "Database defragmentation cron already installed."
  exit 0
fi

{
  echo "$EXISTING"
  echo "$CRON_LINE"
} | crontab -

echo "Installed database defragmentation cron: Sunday 03:00 server time"
echo "  $CRON_SCRIPT"
echo "Log: \${DEFRAGMENT_CRON_LOG:-$ROOT/logs/defragment-cron.log}"
