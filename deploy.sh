#!/bin/bash

# Taypro Website Deployment Script
#
# PRODUCTION CMS (always preserved on every deploy):
#   - data/cms.sqlite  → blogs, authors, projects, upload gallery index
#   - public/uploads/  → gallery / media files on disk
#   Never rsync'd from your laptop. Snapshot at start → restore after code sync.
#
# Safety: internal scripts/deploy-cms-safe.sh (no standalone→data clobber), metrics assert.
# Optional: DEPLOY_UPLOAD_GSC_FROM_LOCAL=1 to push local data/gsc-*.json (default: skip).
#
# Do not edit /admin CMS during the build window (~15 min) — restore uses start-of-deploy DB.
# Do not run on the server: cms:prepare-deploy, cms:apply-handwritten-case-studies,
# cms:import-projects-xlsx (unless you intend to bulk-change production content).
#
# Do not use `git pull` on the production server; run this from a dev machine.

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SSH_KEY="/Users/yogesh/TayproWebsite/taypro-dashboard/AWS_Key/CloudServer.pem"
REMOTE_HOST="ubuntu@13.204.129.120"
REMOTE_PATH="/var/www/taypro-dashboard"
LOCAL_PATH="/Users/yogesh/TayproWebsite/taypro-dashboard"

DEPLOY_MAINTENANCE_ON=0
DEPLOY_FAST=0
DEPLOY_RESUME=0
RSYNC_EXTRA=()

for arg in "$@"; do
    case "$arg" in
        --fast) DEPLOY_FAST=1 ;;
        --resume) DEPLOY_RESUME=1 ;;
        --checksum) RSYNC_EXTRA+=(--checksum) ;;
        -h|--help)
            echo "Usage: ./deploy.sh [--fast] [--resume] [--checksum]"
            echo ""
            echo "  This is the only deploy entry point. Do not run other deploy-*.sh scripts."
            echo "  --fast     Skip legacy backfill; skip npm install if lockfile unchanged"
            echo "  --resume   Server already has code + CMS; finish build + PM2 only"
            echo "  --checksum Use slow rsync checksum (default: size+mtime only)"
            echo ""
            echo "CMS protection (every deploy):"
            echo "  - Never rsync data/cms.sqlite or public/uploads from laptop"
            echo "  - Snapshot → restore + metrics assert (blogs/projects/authors/gallery)"
            echo "  - DEPLOY_UPLOAD_GSC_FROM_LOCAL=1  optional GSC JSON upload from laptop"
            exit 0
            ;;
    esac
done

step_start() {
    STEP_LABEL="$1"
    STEP_TS=$(date +%s)
    echo -e "${YELLOW}⏱  ${STEP_LABEL} ($(date '+%H:%M:%S'))${NC}"
}

step_done() {
    local now=$(date +%s)
    echo -e "${GREEN}  ✅ ${STEP_LABEL} ($((now - STEP_TS))s)${NC}"
}

enable_remote_maintenance() {
    DEPLOY_MAINTENANCE_ON=1
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/maintenance-mode.sh 2>/dev/null || true
        touch .maintenance
        sudo nginx -t
        sudo systemctl reload nginx
        sleep 1
        CODE=$(curl -s -o /dev/null -w '%{http_code}' -k --resolve taypro.in:443:127.0.0.1 https://taypro.in/ || echo "000")
        if [ "$CODE" != "503" ]; then
            echo "  ⚠️  Maintenance verify got HTTP $CODE (expected 503)"
            exit 1
        fi
        echo "  ✅ Maintenance mode ON (HTTP 503 verified)"
EOF
}

disable_remote_maintenance() {
    DEPLOY_MAINTENANCE_ON=0
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF' 2>/dev/null || true
        set -e
        cd /var/www/taypro-dashboard
        rm -f .maintenance
        sudo nginx -t 2>/dev/null && sudo systemctl reload nginx 2>/dev/null || true
        echo "  ✅ Maintenance mode OFF"
EOF
}

ensure_remote_app_running() {
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF' 2>/dev/null || true
        cd /var/www/taypro-dashboard
        chmod +x scripts/deploy-cms-safe.sh 2>/dev/null || true
        if [ -f scripts/deploy-cms-safe.sh ]; then
            ./scripts/deploy-cms-safe.sh start
        else
            pm2 restart taypro-dashboard --update-env 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || true
        fi
EOF
}

deploy_cleanup() {
    echo -e "${YELLOW}⚠️  Deploy interrupted or failed — recovering site...${NC}"
    disable_remote_maintenance
    ensure_remote_app_running
}

trap deploy_cleanup EXIT INT TERM

echo -e "${GREEN}🚀 Starting Taypro Website Deployment${NC}"
if [ "$DEPLOY_RESUME" = "1" ]; then
    echo -e "${YELLOW}  Mode: --resume (build + restart only; keep this terminal open ~20 min)${NC}"
elif [ "$DEPLOY_FAST" = "1" ]; then
    echo -e "${YELLOW}  Mode: --fast (shorter path; CMS snapshot + build still run)${NC}"
fi
echo ""

upload_deploy_helpers() {
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/scripts"
    scp -q -i "$SSH_KEY" \
        "$LOCAL_PATH/scripts/deploy-cms-safe.sh" \
        "$LOCAL_PATH/scripts/deploy-cms-metrics.mjs" \
        "$LOCAL_PATH/scripts/deploy-cms-assert-unchanged.mjs" \
        "$REMOTE_HOST:$REMOTE_PATH/scripts/"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "chmod +x $REMOTE_PATH/scripts/deploy-cms-safe.sh"
}

if [ "$DEPLOY_RESUME" = "1" ]; then
    step_start "Resume (build + PM2 only)"
    upload_deploy_helpers
    ssh -i "$SSH_KEY" -o ServerAliveInterval=30 "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/deploy-cms-safe.sh
        export NODE_ENV=production
        if [ -f .env.production ]; then
            set -a
            # shellcheck disable=SC1091
            source <(grep -v '^#' .env.production | sed 's/\r$//')
            set +a
        fi
        export NEXT_TELEMETRY_DISABLED=1
        if [ -f .next/BUILD_ID ]; then
            echo "  .next/BUILD_ID present — skipping build"
        else
            chmod -R u+w .next 2>/dev/null || true
            npm run build 2>&1 | tee /tmp/taypro-next-build.log
        fi
        [ -f .next/BUILD_ID ] || { echo "  ❌ Build failed"; exit 1; }
        if [ -d .next/standalone ]; then
            mkdir -p .next/standalone/.next
            ./scripts/deploy-cms-safe.sh sync-public /var/www/taypro-dashboard
            [ -d .next/static ] && rsync -a .next/static/ .next/standalone/.next/static/
            [ -f .env.production ] && cp .env.production .next/standalone/.env.production
            ./scripts/deploy-cms-safe.sh push-standalone
            [ -d messages ] && mkdir -p .next/standalone/messages && rsync -a messages/ .next/standalone/messages/
        fi
        ./scripts/deploy-cms-safe.sh start
        pm2 save
        rm -f .maintenance
        sudo nginx -t && sudo systemctl reload nginx
        sleep 2
        CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
        echo "  localhost:3000 => HTTP $CODE"
EOF
    step_done
    trap - EXIT INT TERM
    echo ""
    echo -e "${GREEN}✅ Deploy finished (--resume)${NC}"
    echo "Website: https://taypro.in"
    exit 0
fi

# Upload CMS helpers (Step 1 depends on them)
echo -e "${YELLOW}📋 Uploading deploy helpers...${NC}"
upload_deploy_helpers
echo -e "${GREEN}  ✅ Ready${NC}"
echo ""

# Step 1: Stop app, checkpoint DB, snapshot CMS + uploads, restart app on old build
step_start "Step 1: Snapshotting production CMS"
ssh -i "$SSH_KEY" "$REMOTE_HOST" bash -s "$DEPLOY_FAST" << 'EOF'
    DEPLOY_FAST="$1"
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/deploy-cms-safe.sh

    ./scripts/deploy-cms-safe.sh stop

    if [ -d ".next/standalone/public/uploads" ]; then
        echo "  Flushing public/uploads from standalone..."
        mkdir -p public/uploads
        rsync -a .next/standalone/public/uploads/ public/uploads/
    fi

    ./scripts/deploy-cms-safe.sh flush

    SNAPSHOT_ROOT="/var/www/taypro-dashboard/.deploy-snapshots"
    mkdir -p "$SNAPSHOT_ROOT"

    STAMP=$(date +%Y%m%d-%H%M%S)
    PERSISTENT_DIR="$SNAPSHOT_ROOT/deploy-$STAMP"
    MERGE_DIR="/tmp/taypro-backup-$STAMP"

    if [ "$DEPLOY_FAST" = "1" ]; then
        ./scripts/deploy-cms-safe.sh snapshot "$MERGE_DIR"
        rm -rf "$PERSISTENT_DIR"
        cp -a "$MERGE_DIR" "$PERSISTENT_DIR"
        echo "  → fast: one snapshot, copied to $PERSISTENT_DIR"
    else
        ./scripts/deploy-cms-safe.sh snapshot "$PERSISTENT_DIR"
        ./scripts/deploy-cms-safe.sh snapshot "$MERGE_DIR"
    fi

    cd "$SNAPSHOT_ROOT"
    ls -1dt deploy-* 2>/dev/null | tail -n +4 | while read -r OLD; do
        echo "    Removing old snapshot: $OLD"
        rm -rf "$SNAPSHOT_ROOT/$OLD"
    done

    ls -1dt /tmp/taypro-backup-* 2>/dev/null | tail -n +4 | while read -r OLD; do
        echo "    Removing stale /tmp merge backup: $OLD"
        rm -rf "$OLD"
    done

    echo "$MERGE_DIR" > /tmp/taypro-backup-path.txt

    cd /var/www/taypro-dashboard
    ./scripts/deploy-cms-safe.sh save-metrics "$MERGE_DIR/cms-metrics.json"
    cp -a "$MERGE_DIR/cms-metrics.json" /tmp/taypro-cms-metrics-before.json
    echo "  📊 Pre-deploy CMS baseline saved (blogs/projects/authors/gallery)"

    ./scripts/deploy-cms-safe.sh start
    echo "  ✅ Snapshot complete (app restarted on previous build)"
EOF

step_done

BACKUP_PATH=$(ssh -i "$SSH_KEY" "$REMOTE_HOST" "tr -d '\r\n' < /tmp/taypro-backup-path.txt 2>/dev/null || echo ''")
if [ -z "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Step 1 did not produce a merge backup path. Aborting deploy.${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Backup completed (merge source: $BACKUP_PATH)${NC}"
echo ""

# Step 2: Sync code (exclude production data)
step_start "Step 2: Syncing code"
echo -e "${YELLOW}  Building maintenance page (embedded logo & assets)...${NC}"
node "$LOCAL_PATH/scripts/build-maintenance-html.mjs"
rsync -avz "${RSYNC_EXTRA[@]}" --delete \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'data/cms.sqlite' \
    --exclude 'data/cms.sqlite-*' \
    --exclude 'data/gsc-oauth-tokens.json' \
    --exclude 'data/seo-gsc-boost.json' \
    --exclude 'data/gsc-latest-report.json' \
    --exclude 'data/import-projects-report.json' \
    --exclude 'public/uploads' \
    --exclude '.env.production' \
    --exclude '.env.local' \
    --exclude '.env*.local' \
    --exclude 'secrets/' \
    --exclude '.deploy-snapshots' \
    --exclude '.runtime/' \
    --exclude 'logs/*.log' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

step_done
echo ""

# Step 2a: Ensure nginx can serve SEO-safe 503 maintenance during build
step_start "Step 2a: Nginx maintenance config"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/maintenance-mode.sh scripts/install-nginx-maintenance.sh 2>/dev/null || true
    ./scripts/install-nginx-maintenance.sh
EOF
step_done
echo ""

# Step 2a2: Legacy WordPress 301s at nginx layer (before Next.js)
step_start "Step 2a2: Nginx legacy SEO redirects"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/install-nginx-legacy-seo.sh scripts/install-nginx-portal-noindex.sh 2>/dev/null || true
    ./scripts/install-nginx-legacy-seo.sh
    ./scripts/install-nginx-portal-noindex.sh || true
EOF
step_done
echo ""

# Step 2b: GSC service account + production env (uploaded via scp; not in git/rsync)
step_start "Step 2b: GSC secrets and env"
if [ -f "$LOCAL_PATH/secrets/gsc-service-account.json" ]; then
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/secrets"
    scp -q -i "$SSH_KEY" \
        "$LOCAL_PATH/secrets/gsc-service-account.json" \
        "$REMOTE_HOST:$REMOTE_PATH/secrets/gsc-service-account.json"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" \
        "chmod 600 $REMOTE_PATH/secrets/gsc-service-account.json 2>/dev/null || true"
    echo -e "${GREEN}  ✅ Uploaded gsc-service-account.json${NC}"
else
    echo -e "${YELLOW}  ⚠️  No local secrets/gsc-service-account.json — skip upload${NC}"
fi
scp -q -i "$SSH_KEY" \
    "$LOCAL_PATH/scripts/patch-production-gsc-env.sh" \
    "$LOCAL_PATH/scripts/cron-sync-gsc-boost.sh" \
    "$LOCAL_PATH/scripts/install-gsc-sync-cron.sh" \
    "$REMOTE_HOST:$REMOTE_PATH/scripts/"

GSC_OAUTH_ENV_SNIP=""
if [ -f "$LOCAL_PATH/.env.local" ]; then
    GSC_OAUTH_ENV_SNIP=$(mktemp)
    grep -E '^GSC_OAUTH_CLIENT_ID=|^GSC_OAUTH_CLIENT_SECRET=' "$LOCAL_PATH/.env.local" >> "$GSC_OAUTH_ENV_SNIP" || true
    echo 'GSC_OAUTH_REDIRECT_URI=https://taypro.in/api/admin/gsc/oauth/callback' >> "$GSC_OAUTH_ENV_SNIP"
    scp -q -i "$SSH_KEY" \
        "$GSC_OAUTH_ENV_SNIP" \
        "$REMOTE_HOST:$REMOTE_PATH/secrets/gsc-oauth-production.env"
    rm -f "$GSC_OAUTH_ENV_SNIP"
    echo -e "${GREEN}  ✅ Uploaded GSC OAuth env (production redirect URI)${NC}"
fi

# Default: do not overwrite production GSC JSON from laptop (use /admin/gsc on prod).
if [ "${DEPLOY_UPLOAD_GSC_FROM_LOCAL:-0}" = "1" ]; then
    echo -e "${YELLOW}  DEPLOY_UPLOAD_GSC_FROM_LOCAL=1 — uploading local GSC data files${NC}"
else
    echo -e "${YELLOW}  Skipping local data/gsc-*.json upload (set DEPLOY_UPLOAD_GSC_FROM_LOCAL=1 to override)${NC}"
fi
for gsc_data in seo-gsc-boost.json gsc-latest-report.json gsc-oauth-tokens.json; do
    if [ "${DEPLOY_UPLOAD_GSC_FROM_LOCAL:-0}" = "1" ] && [ -f "$LOCAL_PATH/data/$gsc_data" ]; then
        ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/data"
        scp -q -i "$SSH_KEY" \
            "$LOCAL_PATH/data/$gsc_data" \
            "$REMOTE_HOST:$REMOTE_PATH/data/$gsc_data"
        if [ "$gsc_data" = "gsc-oauth-tokens.json" ]; then
            ssh -i "$SSH_KEY" "$REMOTE_HOST" \
                "chmod 600 $REMOTE_PATH/data/gsc-oauth-tokens.json 2>/dev/null || true"
        fi
        echo -e "${GREEN}  ✅ Uploaded data/$gsc_data${NC}"
    fi
done

ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/patch-production-gsc-env.sh
    OAUTH_FILE=""
    if [ -f secrets/gsc-oauth-production.env ]; then
        OAUTH_FILE="$REMOTE_PATH/secrets/gsc-oauth-production.env"
    fi
    if [ -n "\$OAUTH_FILE" ]; then
        ./scripts/patch-production-gsc-env.sh /var/www/taypro-dashboard "\$OAUTH_FILE"
    else
        ./scripts/patch-production-gsc-env.sh /var/www/taypro-dashboard
    fi
    if [ -f .env.production ] && [ -d .next/standalone ]; then
        cp -a .env.production .next/standalone/.env.production
        chmod 600 .next/standalone/.env.production 2>/dev/null || true
        echo "  ✅ Synced .env.production → standalone (GSC vars)"
    fi
    if [ -f data/gsc-oauth-tokens.json ] && [ -d .next/standalone/data ]; then
        cp -a data/gsc-oauth-tokens.json .next/standalone/data/ 2>/dev/null || true
    fi
    chmod +x scripts/cron-sync-gsc-boost.sh scripts/install-gsc-sync-cron.sh 2>/dev/null || true
    ./scripts/install-gsc-sync-cron.sh
EOF
step_done
echo ""

# Step 2c: Backfill project HTML on server while legacy page.tsx still exists
if [ "$DEPLOY_FAST" != "1" ]; then
    step_start "Step 2c: Legacy project backfill (if needed)"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        if [ -f "src/app/projects/agar-solar-project/page.tsx" ] && [ -f "data/cms.sqlite" ]; then
            npm run cms:backfill-projects 2>&1 | tail -6 || true
        fi
EOF
    step_done
    echo ""
fi

# Step 3: Restore production CMS data from backup
step_start "Step 3: Restoring CMS from backup"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    set -euo pipefail
    cd /var/www/taypro-dashboard
    chmod +x scripts/deploy-cms-safe.sh

    if [ ! -d "$BACKUP_PATH" ]; then
        echo "  ❌ Backup path missing: $BACKUP_PATH"
        exit 1
    fi

    ./scripts/deploy-cms-safe.sh restore "$BACKUP_PATH"

    echo "  Removing legacy file-based CMS directories on server..."
    npm run cms:cleanup-legacy 2>&1 || true

    echo "  ✅ CMS data files restored"

    ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-after-restore.json
    ./scripts/deploy-cms-safe.sh assert-unchanged /tmp/taypro-cms-metrics-before.json /tmp/taypro-cms-metrics-after-restore.json

    if [ -d "$BACKUP_PATH" ]; then
        rm -rf "$BACKUP_PATH"
        echo "    ✅ Removed /tmp merge backup (snapshots remain under .deploy-snapshots)"
    fi
EOF

step_done
echo ""

# Step 4: Build and restart
step_start "Step 4: Build on server (longest step — live output below)"
echo -e "${YELLOW}  Turning on maintenance page (503) before build...${NC}"
enable_remote_maintenance
echo ""
ssh -i "$SSH_KEY" "$REMOTE_HOST" bash -s "$DEPLOY_FAST" << 'EOF'
    DEPLOY_FAST="$1"
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/deploy-cms-safe.sh

    export NODE_ENV=production
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi

    ./scripts/deploy-cms-safe.sh stop

    mkdir -p .deploy-cache
    LOCK_HASH=$(sha256sum package-lock.json 2>/dev/null | awk '{print $1}' || shasum -a 256 package-lock.json | awk '{print $1}')
    if [ "$DEPLOY_FAST" = "1" ] && [ -f .deploy-cache/package-lock.sha256 ] && [ "$(cat .deploy-cache/package-lock.sha256)" = "$LOCK_HASH" ]; then
        echo "  Skipping npm install (package-lock.json unchanged)"
    else
        echo "  Installing dependencies..."
        npm install --production=false
        echo "$LOCK_HASH" > .deploy-cache/package-lock.sha256
    fi

    if [ ! -f "data/cms.sqlite" ]; then
        echo "  No cms.sqlite — run one-time import from legacy files..."
        npm run cms:migrate 2>&1 | tail -10
        npm run cms:backfill-projects 2>&1 | tail -5
    fi

    ./scripts/deploy-cms-safe.sh verify data/cms.sqlite

    echo "  CMS deploy prep (idempotent)..."
    npm run cms:deploy-prep

    ./scripts/deploy-cms-safe.sh verify data/cms.sqlite

    echo "  Building Next.js application (streaming; typically 6–15 min on this server)..."
    chmod -R u+w .next 2>/dev/null || true
    rm -rf .next
    export NEXT_TELEMETRY_DISABLED=1
    npm run build 2>&1 | tee /tmp/taypro-next-build.log

    if [ ! -f .next/BUILD_ID ]; then
        echo "  ❌ Build failed!"
        exit 1
    fi
    echo "  ✅ Build successful"

    if [ -d ".next/standalone" ]; then
        if [ -d "public" ]; then
            ./scripts/deploy-cms-safe.sh sync-public /var/www/taypro-dashboard
        fi
        if [ -d ".next/static" ]; then
            mkdir -p .next/standalone/.next
            rsync -a .next/static/ .next/standalone/.next/static/
            echo "  ✅ Synced .next/static → standalone/.next/static/"
        fi
        if [ -f ".env.production" ]; then
            cp .env.production .next/standalone/.env.production 2>/dev/null || true
        fi
        ./scripts/deploy-cms-safe.sh push-standalone
        if [ -f "data/seo-keywords.csv" ]; then
            mkdir -p .next/standalone/data
            cp -a data/seo-keywords.csv .next/standalone/data/
            echo "  ✅ Copied seo-keywords.csv to standalone"
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

    ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-after-build.json
    ./scripts/deploy-cms-safe.sh assert-unchanged /tmp/taypro-cms-metrics-before.json /tmp/taypro-cms-metrics-after-build.json
EOF

if [ $? -ne 0 ]; then
    echo -e "${RED}  ❌ Build failed!${NC}"
    exit 1
fi
step_done
echo ""

step_start "Step 5: Restarting application"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard

    if [ -f ".env.production" ] && [ -d ".next/standalone" ]; then
        cp -a .env.production .next/standalone/.env.production
        chmod 600 .next/standalone/.env.production 2>/dev/null || true
        echo "  ✅ Synced .env.production → .next/standalone/"
    fi

    if [ -d "public" ] && [ -d ".next/standalone" ]; then
        ./scripts/deploy-cms-safe.sh sync-public /var/www/taypro-dashboard
    fi

    chmod +x scripts/deploy-cms-safe.sh 2>/dev/null || true
    if [ -f scripts/deploy-cms-safe.sh ]; then
        ./scripts/deploy-cms-safe.sh push-standalone
    elif [ -f "data/cms.sqlite" ] && [ -d ".next/standalone/data" ]; then
        cp -a data/cms.sqlite .next/standalone/data/cms.sqlite 2>/dev/null || true
    fi

    if [ -d "messages" ] && [ -d ".next/standalone" ]; then
        mkdir -p .next/standalone/messages
        rsync -a messages/ .next/standalone/messages/
        echo "  ✅ Refreshed standalone/messages/"
    fi

    pm2 restart taypro-dashboard --update-env || pm2 start ecosystem.config.js
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

step_done

echo -e "${YELLOW}  Turning off maintenance page...${NC}"
disable_remote_maintenance

# Success — disable EXIT trap recovery (would restart unnecessarily)
trap - EXIT INT TERM

echo ""
echo -e "${GREEN}✅ Deployment completed successfully!${NC}"
echo -e "${YELLOW}  Tip: use ./deploy.sh --fast for routine releases (same safety, less I/O).${NC}"
echo ""
echo "Website: https://taypro.in"
echo ""
echo -e "${YELLOW}SEO post-deploy (manual — SEO-046):${NC}"
echo "  curl -I https://taypro.in/taypro-basic/  # expect 301 → HELYX"
echo "  curl -I https://taypro.in/industrial_solar_panel_cleaning_system.html  # expect 301 → hub"
echo "  GSC → URL Inspection on legacy URLs → request removal → resubmit sitemap.xml"
echo "CMS database: $REMOTE_PATH/data/cms.sqlite"
echo "Upload gallery: $REMOTE_PATH/public/uploads/"
echo "Snapshots (max 3): $REMOTE_PATH/.deploy-snapshots/"
echo "CMS baseline: /tmp/taypro-cms-metrics-before.json on server (this deploy)"
echo ""
