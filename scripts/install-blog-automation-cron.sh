#!/usr/bin/env bash
# Idempotently install blog writer + scheduled publish crons; remove deprecated lines.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
WRITER_SCRIPT="$ROOT/scripts/cron-generate-blog.sh"
WRITER_LINE="*/5 * * * * $WRITER_SCRIPT # taypro-blog-writer (00:30 PT soft start in script)"
WRITER_MARKER="taypro-blog-writer"
DEPRECATED_TRANSLATION_MARKER="taypro-blog-translations"

if [ ! -x "$WRITER_SCRIPT" ]; then
  chmod +x "$WRITER_SCRIPT"
fi
chmod +x "$ROOT/scripts/blog-writer-cron-gate.mjs" 2>/dev/null || true
chmod +x "$ROOT/scripts/start-post-writer-translations.sh" 2>/dev/null || true
chmod +x "$ROOT/scripts/translation-recovery-status.mjs" 2>/dev/null || true
chmod +x "$ROOT/scripts/cron-translate-blogs-daily.sh" 2>/dev/null || true

mkdir -p "$ROOT/logs"
touch /var/log/blog-automation.log 2>/dev/null || true
chown ubuntu:ubuntu /var/log/blog-automation.log 2>/dev/null || true

current="$(crontab -l 2>/dev/null || true)"
filtered="$(
  echo "$current" \
    | grep -vF "$WRITER_MARKER" \
    | grep -vF "$DEPRECATED_TRANSLATION_MARKER" \
    | grep -vF "cron-translate-blogs-daily.sh" \
    | grep -vF "random 9:00-15:00 IST" \
    || true
)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$WRITER_LINE"
} | crontab -

"$ROOT/scripts/install-scheduled-publish-cron.sh"

echo "Installed blog automation crons:"
crontab -l | grep -E "taypro-blog-writer|taypro-blog-scheduled-publish" || true
