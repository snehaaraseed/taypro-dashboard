#!/bin/bash

# Taypro Website Deployment Script
# CMS content lives in data/cms.sqlite (SQLite). Deploy preserves cms.sqlite + public/uploads/.
# Topics and upload metadata are inside cms.sqlite (not separate JSON files).
#
# Do not use `git pull` on the production server for releases; run this script
# from a developer machine with a current clone.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SSH_KEY="/Users/yogesh/TayproWebsite/taypro-dashboard/AWS_Key/CloudServer.pem"
REMOTE_HOST="ubuntu@13.204.129.120"
REMOTE_PATH="/var/www/taypro-dashboard"
LOCAL_PATH="/Users/yogesh/TayproWebsite/taypro-dashboard"

echo -e "${GREEN}🚀 Starting Taypro Website Deployment${NC}"
echo ""

# Step 1: Snapshot CMS database, topics file, and uploads
echo -e "${YELLOW}📦 Step 1: Snapshotting production CMS (SQLite + uploads)...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard

    STAND=".next/standalone"
    if [ -f "$STAND/data/cms.sqlite" ]; then
        echo "  Flushing cms.sqlite: standalone → repo root..."
        mkdir -p data
        cp -a "$STAND/data/cms.sqlite" data/cms.sqlite
    fi
    if [ -d "$STAND/public/uploads" ]; then
        echo "  Flushing public/uploads from standalone..."
        mkdir -p public/uploads
        rsync -a "$STAND/public/uploads/" public/uploads/
    fi

    SNAPSHOT_ROOT="/var/www/taypro-dashboard/.deploy-snapshots"
    mkdir -p "$SNAPSHOT_ROOT"

    STAMP=$(date +%Y%m%d-%H%M%S)
    PERSISTENT_DIR="$SNAPSHOT_ROOT/deploy-$STAMP"
    MERGE_DIR="/tmp/taypro-backup-$STAMP"
    mkdir -p "$PERSISTENT_DIR/data" "$PERSISTENT_DIR/public" "$MERGE_DIR/data" "$MERGE_DIR/public"

    snapshot_one() {
        local DEST="$1"
        if [ -f "data/cms.sqlite" ]; then
            cp -a data/cms.sqlite "$DEST/data/"
            echo "  → $DEST : cms.sqlite"
        fi
        if [ -d "public/uploads" ]; then
            mkdir -p "$DEST/public"
            cp -a public/uploads "$DEST/public/"
            echo "  → $DEST : uploads"
        fi
    }

    snapshot_one "$PERSISTENT_DIR"
    snapshot_one "$MERGE_DIR"

    cd "$SNAPSHOT_ROOT"
    ls -1dt deploy-* 2>/dev/null | tail -n +4 | while read -r OLD; do
        echo "    Removing old snapshot: $OLD"
        rm -rf "$SNAPSHOT_ROOT/$OLD"
    done

    echo "$MERGE_DIR" > /tmp/taypro-backup-path.txt
    echo "  ✅ Snapshot complete"
EOF

BACKUP_PATH=$(ssh -i "$SSH_KEY" "$REMOTE_HOST" "tr -d '\r\n' < /tmp/taypro-backup-path.txt 2>/dev/null || echo ''")
if [ -z "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Step 1 did not produce a merge backup path. Aborting deploy.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Backup completed (merge source: $BACKUP_PATH)${NC}"
echo ""

# Step 2: Sync code (exclude production data)
echo -e "${YELLOW}📤 Step 2: Syncing code files...${NC}"
rsync -avz --checksum --delete \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'data/cms.sqlite' \
    --exclude 'data/cms.sqlite-*' \
    --exclude 'public/uploads' \
    --exclude '.env.production' \
    --exclude '.env.local' \
    --exclude '.env*.local' \
    --exclude '.deploy-snapshots' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}  ✅ Files synced${NC}"
echo ""

# Step 2b: Backfill project HTML on server while legacy page.tsx still exists (first deploy after cleanup)
echo -e "${YELLOW}📋 Step 2b: Backfill project content in DB (if legacy pages present)...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard
    if [ -f "src/app/projects/agar-solar-project/page.tsx" ] && [ -f "data/cms.sqlite" ]; then
        npm run cms:backfill-projects 2>&1 | tail -6 || true
    fi
EOF
echo ""

# Step 3: Restore production CMS data
echo -e "${YELLOW}🔄 Step 3: Restoring production CMS data from backup...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    set -euo pipefail
    cd /var/www/taypro-dashboard

    if [ ! -d "$BACKUP_PATH" ]; then
        echo "  ❌ Backup path missing: $BACKUP_PATH"
        exit 1
    fi

    mkdir -p data public/uploads

    if [ -f "$BACKUP_PATH/data/cms.sqlite" ]; then
        cp -a "$BACKUP_PATH/data/cms.sqlite" data/cms.sqlite
        echo "    ✅ Restored data/cms.sqlite"
    else
        echo "    ⚠️  No cms.sqlite in backup (first DB deploy on this server)."
    fi

    if [ -d "$BACKUP_PATH/public/uploads" ]; then
        rsync -a "$BACKUP_PATH/public/uploads/" public/uploads/
        echo "    ✅ Restored public/uploads"
    fi

    echo "  Removing legacy file-based CMS directories on server..."
    npm run cms:cleanup-legacy 2>&1 || true

    echo "  ✅ CMS data files restored"
EOF

echo -e "${GREEN}  ✅ Production CMS data restored${NC}"
echo ""

# Step 4: Build and restart
echo -e "${YELLOW}🔨 Step 4: Building application...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard

    export NODE_ENV=production
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi

    echo "  Installing dependencies..."
    npm install --production=false 2>&1 | tail -5

    if [ ! -f "data/cms.sqlite" ]; then
        echo "  No cms.sqlite — run one-time import from legacy files..."
        npm run cms:migrate 2>&1 | tail -10
        npm run cms:backfill-projects 2>&1 | tail -5
    fi

    echo "  Sync topics + upload index into DB (idempotent)..."
    npm run cms:migrate-extras 2>&1 | tail -6

    echo "  Apply image alt columns + backfill (idempotent)..."
    npm run cms:migrate-image-alt 2>&1 | tail -8

    if [ ! -f "data/cms.sqlite" ]; then
        echo "  ❌ data/cms.sqlite still missing after setup"
        exit 1
    fi

    BLOG_COUNT=$(node -e 'const D=require("better-sqlite3");const d=new D("data/cms.sqlite",{readonly:true});const n=d.prepare("SELECT COUNT(*) AS n FROM blogs").get().n;d.close();process.stdout.write(String(n));')
    echo "  CMS database OK (${BLOG_COUNT} blogs)"

    echo "  Building Next.js application..."
    pm2 stop taypro-dashboard 2>/dev/null || true
    sleep 2
    chmod -R u+w .next 2>/dev/null || true
    rm -rf .next
    npm run build 2>&1 | tail -25

    if [ ! -f .next/BUILD_ID ]; then
        echo "  ❌ Build failed!"
        exit 1
    fi
    echo "  ✅ Build successful"

    if [ -d ".next/standalone" ]; then
        if [ -d "public" ]; then
            mkdir -p .next/standalone/public
            rsync -a --delete public/ .next/standalone/public/
            echo "  ✅ Synced public/ → standalone/public/"
        fi
        if [ -d ".next/static" ]; then
            mkdir -p .next/standalone/.next
            rsync -a .next/static/ .next/standalone/.next/static/
            echo "  ✅ Synced .next/static → standalone/.next/static/"
        fi
        if [ -f ".env.production" ]; then
            cp .env.production .next/standalone/.env.production 2>/dev/null || true
        fi
        if [ -f "data/cms.sqlite" ]; then
            mkdir -p .next/standalone/data
            cp -a data/cms.sqlite .next/standalone/data/
            echo "  ✅ Copied cms.sqlite to standalone"
        fi
        if [ -d "messages" ]; then
            mkdir -p .next/standalone/messages
            rsync -a messages/ .next/standalone/messages/
            echo "  ✅ Synced messages/ → standalone/messages/"
        fi
        if [ -d "drizzle" ]; then
            mkdir -p .next/standalone/drizzle
            cp -a drizzle/* .next/standalone/drizzle/ 2>/dev/null || true
        fi
    fi
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}  ❌ Build failed!${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Build completed${NC}"
echo ""

echo -e "${YELLOW}🔄 Step 5: Restarting application...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard

    if [ -d "public" ] && [ -d ".next/standalone" ]; then
        mkdir -p .next/standalone/public
        rsync -a public/ .next/standalone/public/
        echo "  ✅ Refreshed standalone/public (assets + uploads)"
    fi
    if [ -f "data/cms.sqlite" ] && [ -d ".next/standalone/data" ]; then
        cp -a data/cms.sqlite .next/standalone/data/cms.sqlite 2>/dev/null || true
    fi
    if [ -d "messages" ] && [ -d ".next/standalone" ]; then
        mkdir -p .next/standalone/messages
        rsync -a messages/ .next/standalone/messages/
        echo "  ✅ Refreshed standalone/messages/"
    fi

    pm2 restart taypro-dashboard || pm2 start ecosystem.config.js
    pm2 save
    sleep 3
    pm2 status

    HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        echo "  ✅ Application is responding (HTTP $HTTP_CODE)"
    else
        echo "  ⚠️  Application responded with HTTP $HTTP_CODE"
    fi
EOF

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo ""
echo "Website: https://taypro.in"
echo "CMS database: $REMOTE_PATH/data/cms.sqlite"
echo "This run backup: $BACKUP_PATH"
echo "Snapshots (max 3): $REMOTE_PATH/.deploy-snapshots/"
echo ""
