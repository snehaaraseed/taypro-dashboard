#!/usr/bin/env bash
# Deprecated: translations now start automatically after the daily blog writer
# (scripts/cron-generate-blog.sh → start-post-writer-translations.sh).
# Safe to remove this line from crontab: 30 12 * * * .../cron-translate-blogs-daily.sh
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${BLOG_TRANSLATION_LOG:-$ROOT/logs/blog-translation-post-writer.log}"

mkdir -p "$(dirname "$LOG")"
echo "$(date -Is) skip: evening translation cron is deprecated; use post-writer flow" >> "$LOG"
exit 0
