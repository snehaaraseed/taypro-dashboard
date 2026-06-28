#!/usr/bin/env bash
# Pre-deploy disk hygiene + free-space gate for Next.js staging builds.
# Safe to run anytime (idempotent). Called from deploy.sh before staging build.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"
RELEASE="${ROOT}/.release-build"

# Minimum free space before starting a full staging build (default 8 GiB).
MIN_FREE_KB="${DEPLOY_MIN_FREE_KB:-$((8 * 1024 * 1024))}"
# Warn when below this (default 12 GiB) — build may succeed but is tight.
WARN_FREE_KB="${DEPLOY_WARN_FREE_KB:-$((12 * 1024 * 1024))}"

log() {
  echo "  [disk] $*" >&2
}

avail_kb() {
  df -P / | awk 'NR==2 {print $4}'
}

cleanup_stale_tmp() {
  local freed=0
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    local size
    size=$(du -sk "$path" 2>/dev/null | awk '{print $1}' || echo 0)
    rm -rf "$path"
    freed=$((freed + size))
    log "removed stale tmp: $path (${size}K)"
  done < <(
    find /tmp -maxdepth 1 -type d -name 'taypro-backup-*' -mtime +7 2>/dev/null || true
  )
  while IFS= read -r path; do
    [ -n "$path" ] || continue
    local size
    size=$(du -sk "$path" 2>/dev/null | awk '{print $1}' || echo 0)
    rm -f "$path"
    freed=$((freed + size))
    log "removed old log: $path (${size}K)"
  done < <(
    find /tmp -maxdepth 1 -type f \( -name 'taypro-next-build*.log' -o -name 'taypro-rebuild.log' \) -size +50M -mtime +3 2>/dev/null || true
  )
  echo "$freed"
}

cleanup_staging_artifacts() {
  local freed=0
  local paths=(
    "$RELEASE/.next/server"
    "$RELEASE/.next/cache"
    "$RELEASE/.next/standalone/.next/server"
    "$RELEASE/.next/standalone/.next/cache"
    "$ROOT/.next/standalone.prev"
    "$ROOT/.next/cache"
  )
  for path in "${paths[@]}"; do
    [ -e "$path" ] || continue
    local size
    size=$(du -sk "$path" 2>/dev/null | awk '{print $1}' || echo 0)
    rm -rf "$path"
    freed=$((freed + size))
    log "removed staging artifact: $path (${size}K)"
  done
  echo "$freed"
}

main() {
  log "before: $(df -h / | tail -1)"

  local freed_tmp freed_staging
  freed_tmp=$(cleanup_stale_tmp)
  freed_staging=$(cleanup_staging_artifacts)
  local total_freed=$((freed_tmp + freed_staging))
  if [ "$total_freed" -gt 0 ]; then
    log "reclaimed ~$((total_freed / 1024)) MiB"
  fi

  local avail
  avail=$(avail_kb)
  local avail_gib=$((avail / 1024 / 1024))
  log "after cleanup: $(df -h / | tail -1)"

  if [ "$MIN_FREE_KB" -le 0 ]; then
    log "cleanup-only mode (no free-space gate)"
    exit 0
  fi

  if [ "$avail" -lt "$MIN_FREE_KB" ]; then
    echo "  ❌ Deploy blocked: need at least $((MIN_FREE_KB / 1024 / 1024)) GiB free on / (have ${avail_gib} GiB)." >&2
    echo "  → Resize the EBS volume in AWS (recommended 50–60 GiB), then run:" >&2
    echo "     bash scripts/grow-production-root-volume.sh" >&2
    echo "  → Or free space manually and re-run deploy." >&2
    exit 1
  fi

  if [ "$avail" -lt "$WARN_FREE_KB" ]; then
    log "⚠️  only ${avail_gib} GiB free — build may be tight; consider resizing EBS to 50+ GiB"
  else
    log "✅ ${avail_gib} GiB free — OK to build"
  fi
}

main "$@"
