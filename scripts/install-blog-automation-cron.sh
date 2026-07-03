#!/usr/bin/env bash
# Idempotently install blog writer + scheduled publish crons; remove deprecated lines.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
WRITER_SCRIPT="$ROOT/scripts/cron-generate-blog.sh"
WRITER_LINE="*/5 * * * * $WRITER_SCRIPT # taypro-blog-writer (00:30 PT soft start in script)"
WRITER_MARKER="taypro-blog-writer"
DEPRECATED_TRANSLATION_MARKER="taypro-blog-translations"
CALENDAR_SCRIPT="$ROOT/scripts/generate-editorial-calendar.mjs"
CALENDAR_LINE="0 2 * * 0 cd $ROOT && node $CALENDAR_SCRIPT # taypro-editorial-calendar (Sun 02:00 IST)"
CALENDAR_MARKER="taypro-editorial-calendar"
DISCOVERY_SCRIPT="$ROOT/scripts/cron-run-topic-discovery.sh"
DISCOVERY_LINE="0 1 * * 0 $DISCOVERY_SCRIPT # taypro-topic-discovery (Sun 01:00 IST, before calendar)"
DISCOVERY_MARKER="taypro-topic-discovery"
CATCHUP_SCRIPT="$ROOT/scripts/cron-translate-catchup-morning.sh"
CATCHUP_LINE="30 9 * * 1-5 $CATCHUP_SCRIPT # taypro-translation-morning (weekday 09:30 IST)"
CATCHUP_MARKER="taypro-translation-morning"

if [ ! -x "$WRITER_SCRIPT" ]; then
  chmod +x "$WRITER_SCRIPT"
fi
chmod +x "$ROOT/scripts/blog-writer-cron-gate.mjs" 2>/dev/null || true
chmod +x "$ROOT/scripts/start-post-writer-translations.sh" 2>/dev/null || true
chmod +x "$ROOT/scripts/translation-recovery-status.mjs" 2>/dev/null || true
chmod +x "$ROOT/scripts/cron-translate-blogs-daily.sh" 2>/dev/null || true
chmod +x "$CALENDAR_SCRIPT" 2>/dev/null || true
chmod +x "$CATCHUP_SCRIPT" 2>/dev/null || true

mkdir -p "$ROOT/logs"
touch /var/log/blog-automation.log 2>/dev/null || true
chown ubuntu:ubuntu /var/log/blog-automation.log 2>/dev/null || true
touch /var/log/topic-discovery.log 2>/dev/null || true
chown ubuntu:ubuntu /var/log/topic-discovery.log 2>/dev/null || true

current="$(crontab -l 2>/dev/null || true)"
filtered="$(
  echo "$current" \
    | grep -vF "$WRITER_MARKER" \
    | grep -vF "$DEPRECATED_TRANSLATION_MARKER" \
    | grep -vF "cron-translate-blogs-daily.sh" \
    | grep -vF "random 9:00-15:00 IST" \
    | grep -vF "$CALENDAR_MARKER" \
    | grep -vF "$DISCOVERY_MARKER" \
    | grep -vF "$CATCHUP_MARKER" \
    || true
)"

{
  if [ -n "$filtered" ]; then
    printf '%s\n' "$filtered"
  fi
  printf '%s\n' "$WRITER_LINE"
  printf '%s\n' "$DISCOVERY_LINE"
  printf '%s\n' "$CALENDAR_LINE"
  printf '%s\n' "$CATCHUP_LINE"
} | crontab -

"$ROOT/scripts/install-scheduled-publish-cron.sh"

echo "Installed blog automation crons:"
crontab -l | grep -E "taypro-blog-writer|taypro-blog-scheduled-publish|taypro-editorial-calendar|taypro-topic-discovery|taypro-translation-morning" || true
