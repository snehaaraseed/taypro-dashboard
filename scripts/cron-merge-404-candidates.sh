#!/usr/bin/env bash
# Merge runtime 404 hits + GSC not-found feed → data/redirect-candidates.json
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${URL_RECOVERY_MERGE_LOG:-$ROOT/logs/url-recovery-merge.log}"
ENV_FILE="$ROOT/.env.production"

mkdir -p "$(dirname "$LOG")"
mkdir -p "$ROOT/data"

if [ -f "$ENV_FILE" ]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

cd "$ROOT"

{
  echo "$(date -Is) Starting seo:merge-404-candidates"
  npm run seo:merge-404-candidates
  echo "$(date -Is) Done"
} >> "$LOG" 2>&1
