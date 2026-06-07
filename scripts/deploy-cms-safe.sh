#!/usr/bin/env bash
# INTERNAL: CMS helpers for ./deploy.sh (and legacy maintenance script). Do not run directly.
set -euo pipefail

ROOT="${TAYPRO_APP_ROOT:-/var/www/taypro-dashboard}"

CMS_DIR="${CMS_DIR:-data}"
STAND_DIR="${STAND_DIR:-.next/standalone/data}"

cms_stop_app() {
  echo "  Stopping PM2 (release SQLite writers)..."
  pm2 stop taypro-dashboard 2>/dev/null || true
  sleep 2
}

cms_start_app() {
  echo "  Starting PM2..."
  cd /var/www/taypro-dashboard
  pm2 restart taypro-dashboard 2>/dev/null || pm2 start ecosystem.config.js
  pm2 save 2>/dev/null || true
}

# Checkpoint WAL into main file; leaves -wal/-shm empty or tiny.
cms_checkpoint() {
  local db_path="$1"
  if [ ! -f "$db_path" ]; then
    echo "  ⚠️  No database at $db_path (skip checkpoint)"
    return 0
  fi
  echo "  Checkpointing WAL → $db_path"
  node -e "
    const Database = require('better-sqlite3');
    const db = new Database(process.argv[1]);
    db.pragma('wal_checkpoint(TRUNCATE)');
    db.close();
  " "$db_path"
}

# Remove WAL sidecar files so a restored main file is never merged with stale WAL.
cms_clear_wal_sidecars() {
  local dir="$1"
  rm -f "$dir/cms.sqlite-wal" "$dir/cms.sqlite-shm"
}

# Copy cms.sqlite bundle: after checkpoint, main file only; optionally include WAL if present and non-trivial.
cms_copy_bundle_to() {
  local SRC_DIR="$1"
  local DEST_DIR="$2"
  mkdir -p "$DEST_DIR"
  if [ ! -f "$SRC_DIR/cms.sqlite" ]; then
    echo "  ⚠️  No cms.sqlite in $SRC_DIR"
    return 1
  fi
  cms_checkpoint "$SRC_DIR/cms.sqlite"
  cp -a "$SRC_DIR/cms.sqlite" "$DEST_DIR/cms.sqlite"
  if [ -f "$SRC_DIR/cms.sqlite-wal" ] && [ -s "$SRC_DIR/cms.sqlite-wal" ]; then
    cp -a "$SRC_DIR/cms.sqlite-wal" "$DEST_DIR/cms.sqlite-wal"
    cp -a "$SRC_DIR/cms.sqlite-shm" "$DEST_DIR/cms.sqlite-shm" 2>/dev/null || true
    echo "  → copied cms.sqlite + wal/shm ($(du -h "$DEST_DIR/cms.sqlite" | cut -f1))"
  else
    cms_clear_wal_sidecars "$DEST_DIR"
    echo "  → copied checkpointed cms.sqlite only ($(du -h "$DEST_DIR/cms.sqlite" | cut -f1))"
  fi
}

cms_verify() {
  local db_path="$1"
  if [ ! -f "$db_path" ]; then
    echo "  ❌ Missing $db_path"
    return 1
  fi
  node -e "
    const Database = require('better-sqlite3');
    const db = new Database(process.argv[1], { readonly: true });
    const ic = db.prepare('PRAGMA integrity_check').get().integrity_check;
    if (ic !== 'ok') {
      console.error('  ❌ integrity_check failed:', String(ic).slice(0, 200));
      process.exit(1);
    }
    const blogs = db.prepare('SELECT COUNT(*) AS n FROM blogs').get().n;
    const blogsPub = db.prepare(\"SELECT COUNT(*) AS n FROM blogs WHERE locale='en' AND published=1\").get().n;
    const projects = db.prepare(\"SELECT COUNT(*) AS n FROM projects WHERE locale='en'\").get().n;
    const projectsPub = db.prepare(\"SELECT COUNT(*) AS n FROM projects WHERE locale='en' AND published=1\").get().n;
    let authors = 0;
    let uploads = 0;
    try { authors = db.prepare('SELECT COUNT(*) AS n FROM authors').get().n; } catch (_) {}
    try { uploads = db.prepare('SELECT COUNT(*) AS n FROM uploads').get().n; } catch (_) {}
    const locales = db.prepare('SELECT locale, COUNT(*) AS c FROM blogs GROUP BY locale ORDER BY locale').all();
    console.log('  ✅ DB integrity OK — blogs:', blogs, '(en published:', blogsPub + ')');
    console.log('     projects (en):', projects, '(published:', projectsPub + '), authors:', authors, ', upload index:', uploads);
    for (const row of locales) console.log('     ', row.locale + ' blogs:', row.c);
    db.close();
  " "$db_path"
}

cms_save_metrics() {
  local out_path="$1"
  local db_path="${2:-data/cms.sqlite}"
  mkdir -p "$(dirname "$out_path")"
  node scripts/deploy-cms-metrics.mjs "$db_path" > "$out_path"
  echo "  ✅ CMS metrics saved → $out_path"
}

cms_assert_unchanged() {
  local before_path="$1"
  local after_path="$2"
  node scripts/deploy-cms-assert-unchanged.mjs "$before_path" "$after_path"
}

# Checkpoint canonical CMS in data/. Never overwrite data/ from standalone:
# PM2 sets TAYPRO_CMS_ROOT to the repo root; admin writes go to data/cms.sqlite.
# Standalone only holds a build-time copy — copying it back clobbers publish flags.
cms_flush_to_data() {
  mkdir -p "$CMS_DIR"
  if [ -f "$CMS_DIR/cms.sqlite" ]; then
    echo "  Source: $CMS_DIR (canonical; checkpoint only)"
    cms_checkpoint "$CMS_DIR/cms.sqlite"
    cms_clear_wal_sidecars "$CMS_DIR"
    cms_verify "$CMS_DIR/cms.sqlite"
    return 0
  fi
  if [ -f "$STAND_DIR/cms.sqlite" ]; then
    echo "  Source: $STAND_DIR (no data/cms.sqlite yet — one-time bootstrap)"
    cms_copy_bundle_to "$STAND_DIR" "$CMS_DIR"
    cms_verify "$CMS_DIR/cms.sqlite"
    return 0
  fi
  echo "  ⚠️  No cms.sqlite found to flush"
}

cms_snapshot_to() {
  local DEST="$1"
  mkdir -p "$DEST/data"
  if [ -f "$CMS_DIR/cms.sqlite" ]; then
    cms_copy_bundle_to "$CMS_DIR" "$DEST/data"
    cms_verify "$DEST/data/cms.sqlite"
  fi
  if [ -d "public/uploads" ]; then
    mkdir -p "$DEST/public"
    rsync -a public/uploads/ "$DEST/public/uploads/"
    echo "  → $DEST : uploads"
  fi
}

cms_restore_from() {
  local SRC="$1"
  mkdir -p "$CMS_DIR" public/uploads
  if [ -f "$SRC/data/cms.sqlite" ]; then
    cms_clear_wal_sidecars "$CMS_DIR"
    cms_copy_bundle_to "$SRC/data" "$CMS_DIR"
    cms_verify "$CMS_DIR/cms.sqlite"
    echo "    ✅ Restored CMS database from backup"
  else
    echo "    ⚠️  No cms.sqlite in backup"
  fi
  if [ -d "$SRC/public/uploads" ]; then
    rsync -a "$SRC/public/uploads/" public/uploads/
    echo "    ✅ Restored public/uploads"
  fi
}

cms_push_to_standalone() {
  if [ ! -d ".next/standalone" ]; then
    return 0
  fi
  mkdir -p "$STAND_DIR"
  if [ ! -f "$CMS_DIR/cms.sqlite" ]; then
    return 0
  fi
  cms_clear_wal_sidecars "$STAND_DIR"
  cms_copy_bundle_to "$CMS_DIR" "$STAND_DIR"
  echo "  ✅ Synced checkpointed cms.sqlite → standalone"
}

# Install a built standalone tree from a staging directory (e.g. .release-build).
cms_install_standalone_from() {
  local source_root="$1"
  local stand_src="$source_root/.next/standalone"
  local static_src="$source_root/.next/static"

  if [ ! -f "$stand_src/server.js" ]; then
    echo "  ❌ Missing $stand_src/server.js"
    return 1
  fi

  mkdir -p "$ROOT/.next"
  cp -a "$stand_src" "$ROOT/.next/standalone"
  if [ -d "$static_src" ]; then
    mkdir -p "$ROOT/.next/standalone/.next"
    rsync -a "$static_src/" "$ROOT/.next/standalone/.next/static/"
  fi
  if [ -f "$ROOT/.env.production" ]; then
    cp -a "$ROOT/.env.production" "$ROOT/.next/standalone/.env.production"
    chmod 600 "$ROOT/.next/standalone/.env.production" 2>/dev/null || true
  fi
  if [ -f "$ROOT/data/seo-keywords.csv" ]; then
    mkdir -p "$ROOT/.next/standalone/data"
    cp -a "$ROOT/data/seo-keywords.csv" "$ROOT/.next/standalone/data/"
  fi
  if [ -f "$ROOT/data/gsc-oauth-tokens.json" ]; then
    mkdir -p "$ROOT/.next/standalone/data"
    cp -a "$ROOT/data/gsc-oauth-tokens.json" "$ROOT/.next/standalone/data/"
  fi
  if [ -d "$ROOT/messages" ]; then
    mkdir -p "$ROOT/.next/standalone/messages"
    rsync -a "$ROOT/messages/" "$ROOT/.next/standalone/messages/"
  fi
  if [ -d "$ROOT/drizzle" ]; then
    mkdir -p "$ROOT/.next/standalone/drizzle"
    cp -a "$ROOT/drizzle/"* "$ROOT/.next/standalone/drizzle/" 2>/dev/null || true
  fi

  cd "$ROOT"
  cms_push_to_standalone
  cms_sync_public_safe "$ROOT"
  echo "  ✅ Installed standalone from $source_root"
}

cms_rollback_standalone() {
  if [ -d "$ROOT/.next/standalone.prev" ]; then
    echo "  ↩️  Rolling back to previous standalone..."
    rm -rf "$ROOT/.next/standalone"
    mv "$ROOT/.next/standalone.prev" "$ROOT/.next/standalone"
    cms_start_app
    echo "  ✅ Rolled back to previous standalone"
  else
    echo "  ⚠️  No standalone.prev to roll back to"
    cms_start_app
  fi
}

# Brief PM2 stop → swap standalone → start (~3–5s). No nginx maintenance.
cms_swap_standalone() {
  local source_root="$1"
  if [ -z "$source_root" ] || [ ! -d "$source_root/.next/standalone" ]; then
    echo "  ❌ swap-standalone requires a staging path with .next/standalone"
    exit 1
  fi

  local swap_start
  swap_start=$(date +%s)

  cms_stop_app

  if [ -d "$ROOT/.next/standalone" ]; then
    rm -rf "$ROOT/.next/standalone.prev"
    mv "$ROOT/.next/standalone" "$ROOT/.next/standalone.prev"
  fi

  if ! cms_install_standalone_from "$source_root"; then
    cms_rollback_standalone
    exit 1
  fi

  cms_start_app

  local swap_end
  swap_end=$(date +%s)
  echo "  ✅ Standalone swap complete ($((swap_end - swap_start))s downtime)"

  rm -rf "$ROOT/.next/standalone.prev"
}

# Sync public/ → standalone without --delete on uploads (gallery must survive).
cms_sync_public_safe() {
  local app_root="${1:-$ROOT}"
  local src="$app_root/public"
  local dest="$app_root/.next/standalone/public"
  [ -d "$src" ] || return 0
  [ -d "$app_root/.next/standalone" ] || return 0
  mkdir -p "$dest"
  if [ -d "$src/uploads" ]; then
    mkdir -p "$dest/uploads"
    rsync -a "$src/uploads/" "$dest/uploads/"
  fi
  rsync -a --delete --exclude 'uploads' "$src/" "$dest/"
  echo "  ✅ Synced public/ → standalone/public/ (uploads preserved)"
}

case "${1:-}" in
  stop) cms_stop_app ;;
  start) cms_start_app ;;
  flush) cms_flush_to_data ;;
  verify) cms_verify "${2:-data/cms.sqlite}" ;;
  snapshot) cms_snapshot_to "$2" ;;
  restore) cms_restore_from "$2" ;;
  push-standalone) cms_push_to_standalone ;;
  sync-public) cms_sync_public_safe "${2:-$ROOT}" ;;
  save-metrics) cms_save_metrics "$2" "${3:-data/cms.sqlite}" ;;
  assert-unchanged) cms_assert_unchanged "$2" "$3" ;;
  swap-standalone) cms_swap_standalone "$2" ;;
  rollback-standalone) cms_rollback_standalone ;;
  *)
    echo "Usage: internal CMS helper — run ./deploy.sh from your machine instead."
    exit 1
    ;;
esac
