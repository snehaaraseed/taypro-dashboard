#!/usr/bin/env bash
# Finish a deploy that stopped mid-build (server already has synced code + CMS).
# Run ON THE SERVER from /var/www/taypro-dashboard
set -euo pipefail

cd /var/www/taypro-dashboard
chmod +x scripts/deploy-cms-safe.sh 2>/dev/null || true

export NODE_ENV=production
if [ -f .env.production ]; then
  set -a
  # shellcheck disable=SC1091
  source <(grep -v '^#' .env.production | sed 's/\r$//')
  set +a
fi

export NEXT_TELEMETRY_DISABLED=1

echo "==> Resume: build (skip if BUILD_ID exists)"
if [ -f .next/BUILD_ID ]; then
  echo "    .next/BUILD_ID already present — skipping build"
else
  chmod -R u+w .next 2>/dev/null || true
  npm run build 2>&1 | tee /tmp/taypro-next-build-resume.log
fi

if [ ! -f .next/BUILD_ID ]; then
  echo "❌ Build failed — see /tmp/taypro-next-build-resume.log"
  exit 1
fi
echo "✅ Build OK"

echo "==> Sync standalone bundle"
if [ -d .next/standalone ]; then
  mkdir -p .next/standalone/public .next/standalone/.next
  [ -d public ] && rsync -a --delete public/ .next/standalone/public/
  [ -d .next/static ] && rsync -a .next/static/ .next/standalone/.next/static/
  [ -f .env.production ] && cp .env.production .next/standalone/.env.production
  ./scripts/deploy-cms-safe.sh push-standalone
  [ -d messages ] && mkdir -p .next/standalone/messages && rsync -a messages/ .next/standalone/messages/
fi

echo "==> Restart PM2"
./scripts/deploy-cms-safe.sh start || pm2 restart taypro-dashboard --update-env || pm2 start ecosystem.config.js
pm2 save

echo "==> Disable maintenance"
rm -f .maintenance
sudo nginx -t && sudo systemctl reload nginx

sleep 2
CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
echo "localhost:3000 => HTTP $CODE"
echo "✅ Resume complete"
