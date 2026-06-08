#!/usr/bin/env bash
# Download production CMS (data/cms.sqlite + optional uploads) to local dev.
# Production is canonical — never push local cms.sqlite via deploy.sh rsync.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="${SSH_KEY:-$ROOT/AWS_Key/CloudServer.pem}"
REMOTE_HOST="${REMOTE_HOST:-ubuntu@13.204.129.120}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
LOCAL_DATA="$ROOT/data"
BACKUP_DIR="$LOCAL_DATA/backups"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

SYNC_UPLOADS=0
for arg in "$@"; do
  case "$arg" in
    --uploads) SYNC_UPLOADS=1 ;;
    -h|--help)
      echo "Usage: ./scripts/pull-cms-from-production.sh [--uploads]"
      echo ""
      echo "  Downloads production data/cms.sqlite to local data/cms.sqlite"
      echo "  (with local backup). Use --uploads to rsync public/uploads/ too."
      exit 0
      ;;
    *)
      echo "Unknown option: $arg"
      exit 1
      ;;
  esac
done

if [ ! -f "$SSH_KEY" ]; then
  echo "❌ SSH key not found: $SSH_KEY"
  exit 1
fi

mkdir -p "$BACKUP_DIR" "$LOCAL_DATA"

echo "⏱  Checkpointing production CMS..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "cd $REMOTE_PATH && node -e \"
  const Database = require('better-sqlite3');
  const db = new Database('data/cms.sqlite');
  db.pragma('wal_checkpoint(TRUNCATE)');
  db.close();
\""

if [ -f "$LOCAL_DATA/cms.sqlite" ]; then
  echo "⏱  Backing up local cms.sqlite → backups/cms.sqlite.$TIMESTAMP"
  cp -a "$LOCAL_DATA/cms.sqlite" "$BACKUP_DIR/cms.sqlite.$TIMESTAMP"
fi

echo "⏱  Downloading production cms.sqlite..."
scp -q -i "$SSH_KEY" \
  "$REMOTE_HOST:$REMOTE_PATH/data/cms.sqlite" \
  "$LOCAL_DATA/cms.sqlite.new"
mv "$LOCAL_DATA/cms.sqlite.new" "$LOCAL_DATA/cms.sqlite"
rm -f "$LOCAL_DATA/cms.sqlite-wal" "$LOCAL_DATA/cms.sqlite-shm"

echo "⏱  Verifying database..."
node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.argv[1], { readonly: true });
  const ic = db.prepare('PRAGMA integrity_check').get().integrity_check;
  if (ic !== 'ok') {
    console.error('❌ integrity_check failed:', ic);
    process.exit(1);
  }
  const locales = db.prepare('SELECT locale, COUNT(*) AS c FROM blogs GROUP BY locale ORDER BY locale').all();
  const enPub = db.prepare(\"SELECT COUNT(*) AS n FROM blogs WHERE locale='en' AND published=1\").get().n;
  console.log('✅ DB OK — en published blogs:', enPub);
  for (const row of locales) console.log('   ', row.locale + ':', row.c);
  db.close();
" "$LOCAL_DATA/cms.sqlite"

if [ "$SYNC_UPLOADS" -eq 1 ]; then
  echo "⏱  Syncing public/uploads/ from production..."
  mkdir -p "$ROOT/public/uploads"
  rsync -az --progress -e "ssh -i $SSH_KEY" \
    "$REMOTE_HOST:$REMOTE_PATH/public/uploads/" \
    "$ROOT/public/uploads/"
  echo "✅ Uploads synced"
fi

echo "⏱  Rebuilding seo-corpus-index.json..."
(cd "$ROOT" && npm run -s seo:build-corpus-index)

echo ""
echo "✅ Local CMS matches production database."
echo "   Restart dev server if running: npm run dev"
