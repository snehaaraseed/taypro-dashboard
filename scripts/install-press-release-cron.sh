#!/usr/bin/env bash
# Install daily press-release cron (checks queue, generates draft if pending).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
CRON_SCRIPT="$ROOT/scripts/cron-generate-press-release.sh"
MARKER="# taypro-press-release-cron"
CRON_LINE="0 8 * * * $CRON_SCRIPT $MARKER"

chmod +x "$CRON_SCRIPT"

EXISTING=$(crontab -l 2>/dev/null || true)
if echo "$EXISTING" | grep -qF "$MARKER"; then
  echo "Press release cron already installed."
  exit 0
fi

{
  echo "$EXISTING"
  echo "$CRON_LINE"
} | crontab -

echo "Installed press release cron: daily 08:00 server time"
echo "  $CRON_SCRIPT"
echo "Log: \${PRESS_CRON_LOG:-$ROOT/logs/press-cron.log}"
