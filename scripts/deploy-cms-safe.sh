#!/usr/bin/env bash
# CMS SQLite safety helpers for production deploy (WAL mode).
# Sourced or invoked from deploy.sh on the server — do not run casually by hand.
set -euo pipefail

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
    const total = db.prepare('SELECT COUNT(*) AS n FROM blogs').get().n;
    const locales = db.prepare('SELECT locale, COUNT(*) AS c FROM blogs GROUP BY locale ORDER BY locale').all();
    console.log('  ✅ DB integrity OK —', total, 'blog rows');
    for (const row of locales) console.log('     ', row.locale + ':', row.c);
    db.close();
  " "$db_path"
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

case "${1:-}" in
  stop) cms_stop_app ;;
  start) cms_start_app ;;
  flush) cms_flush_to_data ;;
  verify) cms_verify "${2:-data/cms.sqlite}" ;;
  snapshot) cms_snapshot_to "$2" ;;
  restore) cms_restore_from "$2" ;;
  push-standalone) cms_push_to_standalone ;;
  *)
    echo "Usage: $0 {stop|start|flush|verify|snapshot <dir>|restore <dir>|push-standalone}"
    exit 1
    ;;
esac
