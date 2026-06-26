#!/usr/bin/env bash
# Upload local data/cms.sqlite to production (with backup + brief PM2 stop).
# Use only after cms:pull-production and verified local fixes.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SSH_KEY="${SSH_KEY:-$ROOT/AWS_Key/CloudServer.pem}"
REMOTE_HOST="${REMOTE_HOST:-ubuntu@13.204.129.120}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/taypro-dashboard}"
LOCAL_DB="$ROOT/data/cms.sqlite"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"

if [ ! -f "$SSH_KEY" ]; then
  echo "❌ SSH key not found: $SSH_KEY"
  exit 1
fi

if [ ! -f "$LOCAL_DB" ]; then
  echo "❌ Local database not found: $LOCAL_DB"
  exit 1
fi

echo "⏱  Verifying local cms.sqlite..."
node -e "
  const Database = require('better-sqlite3');
  const db = new Database(process.argv[1], { readonly: true });
  const ic = db.prepare('PRAGMA integrity_check').get().integrity_check;
  if (ic !== 'ok') {
    console.error('❌ integrity_check failed:', ic);
    process.exit(1);
  }
  const enPub = db.prepare(\"SELECT COUNT(*) AS n FROM blogs WHERE locale='en' AND published=1\").get().n;
  console.log('✅ Local DB OK — en published blogs:', enPub);
  db.close();
" "$LOCAL_DB"

echo "⏱  Backing up production cms.sqlite..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/data/backups && cp -a $REMOTE_PATH/data/cms.sqlite $REMOTE_PATH/data/backups/cms.sqlite.before-push.$TIMESTAMP"

echo "⏱  Stopping PM2 (brief)..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "cd $REMOTE_PATH && pm2 stop taypro-dashboard 2>/dev/null || true && sleep 2"

echo "⏱  Uploading local cms.sqlite..."
scp -q -i "$SSH_KEY" "$LOCAL_DB" "$REMOTE_HOST:$REMOTE_PATH/data/cms.sqlite.new"
ssh -i "$SSH_KEY" "$REMOTE_HOST" "mv $REMOTE_PATH/data/cms.sqlite.new $REMOTE_PATH/data/cms.sqlite && rm -f $REMOTE_PATH/data/cms.sqlite-wal $REMOTE_PATH/data/cms.sqlite-shm"

echo "⏱  Verifying production database + syncing standalone..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "cd $REMOTE_PATH && chmod +x scripts/deploy-cms-safe.sh && ./scripts/deploy-cms-safe.sh verify data/cms.sqlite && (./scripts/deploy-cms-safe.sh push-standalone || true)"

echo "⏱  Restarting PM2..."
ssh -i "$SSH_KEY" "$REMOTE_HOST" "cd $REMOTE_PATH && pm2 restart taypro-dashboard 2>/dev/null || pm2 start ecosystem.config.js && pm2 save 2>/dev/null || true"

echo ""
echo "✅ Production CMS updated from local database."
echo "   Backup: data/backups/cms.sqlite.before-push.$TIMESTAMP"
