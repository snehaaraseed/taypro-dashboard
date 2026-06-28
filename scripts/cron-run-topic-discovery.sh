#!/usr/bin/env bash
# Weekly demand-first topic discovery: mines real search demand per domain,
# validates candidates, and refills data/discovered-briefs.json. Run BEFORE the
# editorial calendar regenerates so new briefs get scheduled. Uses a small
# grounding budget; safe to re-run (dedups against corpus + pending briefs).
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
LOG="${DISCOVERY_LOG:-/var/log/topic-discovery.log}"
ENV_FILE="$ROOT/.env.production"
export TZ="${BLOG_CRON_TZ:-Asia/Kolkata}"

DISCOVERY_DOMAINS="${DISCOVERY_DOMAINS:-12}"
DISCOVERY_PER_DOMAIN="${DISCOVERY_PER_DOMAIN:-5}"
DISCOVERY_TARGET="${DISCOVERY_TARGET:-30}"

if [ ! -f "$ENV_FILE" ]; then
  echo "$(date -Is) ERROR: missing $ENV_FILE" >> "$LOG"
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

{
  echo "$(date -Is) topic discovery start (domains=$DISCOVERY_DOMAINS per=$DISCOVERY_PER_DOMAIN target=$DISCOVERY_TARGET)"
  cd "$ROOT"
  node scripts/run-topic-discovery.mjs \
    "--domains=$DISCOVERY_DOMAINS" \
    "--per-domain=$DISCOVERY_PER_DOMAIN" \
    "--target=$DISCOVERY_TARGET" || echo "$(date -Is) discovery exited non-zero"
  echo "$(date -Is) topic discovery done"
} >> "$LOG" 2>&1
