#!/bin/bash

# Taypro production deploy — single entry point (zero-downtime)
#
# Builds in .release-build/ while the live site keeps serving from .next/standalone/.
# Branded 503 maintenance page: only during the ~10s PM2 swap at the end.
#
# CMS safety (every deploy):
#   - Never rsync data/cms.sqlite or public/uploads from your laptop
#   - Staging build symlinks the live DB + uploads (no copy, no clobber)
#   - Metrics assert before/after swap (blogs/projects/authors/gallery counts)
#
# Do not edit /admin CMS during the swap window (~10s at the end).
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
RELEASE_DIR=".release-build"

DEPLOY_FAST=0
DEPLOY_SKIP_BUILD=0
DEPLOY_SWAP_ONLY=0
RSYNC_EXTRA=()

for arg in "$@"; do
    case "$arg" in
        --fast) DEPLOY_FAST=1 ;;
        --skip-build) DEPLOY_SKIP_BUILD=1 ;;
        --swap-only) DEPLOY_SWAP_ONLY=1; DEPLOY_SKIP_BUILD=1 ;;
        --checksum) RSYNC_EXTRA+=(--checksum) ;;
        -h|--help)
            echo "Usage: ./deploy.sh [--fast] [--skip-build] [--swap-only] [--checksum]"
            echo ""
            echo "  Production deploy: build in staging while the site stays live, then atomic swap."
            echo "  Visible maintenance (503): only during the ~10s PM2 swap at the end."
            echo ""
            echo "  --fast        Skip legacy backfill; skip npm install if lockfile unchanged"
            echo "  --skip-build  Skip staging build (requires existing .release-build/.next/BUILD_ID)"
            echo "  --swap-only   Alias for --skip-build (atomic swap only)"
            echo "  --checksum    Use slow rsync checksum (default: size+mtime only)"
            echo ""
            echo "CMS protection:"
            echo "  - Never rsync data/cms.sqlite or public/uploads from laptop"
            echo "  - Metrics assert before/after swap"
            echo "  - DEPLOY_UPLOAD_GSC_FROM_LOCAL=1  optional GSC JSON upload from laptop"
            echo "  - ERPNEXT_API_URL/KEY/SECRET copied from .env.local when present"
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

upload_deploy_helpers() {
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/scripts"
    scp -q -i "$SSH_KEY" \
        "$LOCAL_PATH/scripts/deploy-cms-safe.sh" \
        "$LOCAL_PATH/scripts/deploy-cms-metrics.mjs" \
        "$LOCAL_PATH/scripts/deploy-cms-assert-unchanged.mjs" \
        "$REMOTE_HOST:$REMOTE_PATH/scripts/"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" "chmod +x $REMOTE_PATH/scripts/deploy-cms-safe.sh"
}

enable_remote_maintenance() {
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/maintenance-mode.sh 2>/dev/null || true
        ./scripts/maintenance-mode.sh on
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
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF' 2>/dev/null || true
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/maintenance-mode.sh 2>/dev/null || true
        ./scripts/maintenance-mode.sh off
        echo "  ✅ Maintenance mode OFF"
EOF
}

recover_remote_app() {
    disable_remote_maintenance
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF' 2>/dev/null || true
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/deploy-cms-safe.sh 2>/dev/null || true
        if [ -f scripts/deploy-cms-safe.sh ]; then
            ./scripts/deploy-cms-safe.sh rollback-standalone 2>/dev/null || ./scripts/deploy-cms-safe.sh start
        else
            pm2 restart taypro-dashboard --update-env 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null || true
        fi
EOF
}

deploy_cleanup() {
    echo -e "${YELLOW}⚠️  Deploy interrupted or failed — ensuring site is up...${NC}"
    recover_remote_app
}

trap deploy_cleanup EXIT INT TERM

echo -e "${GREEN}🚀 Taypro deploy (503 only during ~10s swap)${NC}"
if [ "$DEPLOY_SWAP_ONLY" = "1" ]; then
    echo -e "${YELLOW}  Mode: swap only (staging build must already exist)${NC}"
elif [ "$DEPLOY_FAST" = "1" ]; then
    echo -e "${YELLOW}  Mode: --fast${NC}"
fi
echo ""

step_start "Upload deploy helpers"
upload_deploy_helpers
step_done
echo ""

if [ "$DEPLOY_SWAP_ONLY" != "1" ]; then
    step_start "Step 1: CMS baseline (site stays live)"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/deploy-cms-safe.sh
        ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-before.json
        cp -a /tmp/taypro-cms-metrics-before.json /tmp/taypro-cms-metrics-pre-swap.json
        echo "  📊 Pre-deploy CMS baseline saved (site still serving traffic)"
EOF
    step_done
    echo ""

    step_start "Step 2: Syncing code (live app unaffected)"
    echo -e "${YELLOW}  Building maintenance page (for brief swap window)...${NC}"
    node "$LOCAL_PATH/scripts/build-maintenance-html.mjs"
    rsync -avz "${RSYNC_EXTRA[@]}" --delete \
        --exclude 'node_modules' \
        --exclude '.next' \
        --exclude '.release-build' \
        --exclude '.git' \
        --exclude 'data/cms.sqlite' \
        --exclude 'data/cms.sqlite-*' \
        --exclude 'data/seo-coverage-filled.json' \
        --exclude 'data/gsc-oauth-tokens.json' \
        --exclude 'data/seo-gsc-boost.json' \
        --exclude 'data/gsc-latest-report.json' \
        --exclude 'data/gsc-not-found-pages.json' \
        --exclude 'data/404-hits.json' \
        --exclude 'data/redirect-candidates.json' \
        --exclude 'data/import-projects-report.json' \
        --exclude 'public/uploads' \
        --exclude '.env.production' \
        --exclude '.env.local' \
        --exclude '.env*.local' \
        --exclude 'secrets/' \
        --exclude 'AWS_Key/' \
        --exclude '.deploy-snapshots' \
        --exclude '.runtime/' \
        --exclude 'logs/*.log' \
        -e "ssh -i $SSH_KEY" \
        "$LOCAL_PATH/" \
        "$REMOTE_HOST:$REMOTE_PATH/"
    step_done
    echo ""

    step_start "Step 2a: Nginx maintenance config (install only; not enabled)"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/maintenance-mode.sh scripts/install-nginx-maintenance.sh 2>/dev/null || true
        ./scripts/install-nginx-maintenance.sh
EOF
    step_done
    echo ""

    step_start "Step 2b: Nginx legacy SEO redirects"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        cd /var/www/taypro-dashboard
        chmod +x scripts/install-nginx-legacy-seo.sh scripts/install-nginx-portal-noindex.sh 2>/dev/null || true
        ./scripts/install-nginx-legacy-seo.sh
        ./scripts/install-nginx-portal-noindex.sh || true
EOF
    step_done
    echo ""

    step_start "Step 2c: Production secrets and env"
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
        "$LOCAL_PATH/scripts/cron-merge-404-candidates.sh" \
        "$LOCAL_PATH/scripts/install-gsc-sync-cron.sh" \
        "$LOCAL_PATH/scripts/install-url-recovery-cron.sh" \
        "$LOCAL_PATH/scripts/install-blog-automation-cron.sh" \
        "$LOCAL_PATH/scripts/install-scheduled-publish-cron.sh" \
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
        echo -e "${GREEN}  ✅ Uploaded GSC OAuth env${NC}"

        ERPNEXT_ENV_SNIP=$(mktemp)
        grep -E '^ERPNEXT_API_URL=|^ERPNEXT_API_KEY=|^ERPNEXT_API_SECRET=|^ERPNEXT_NEWSLETTER_EMAIL_GROUP=' "$LOCAL_PATH/.env.local" >> "$ERPNEXT_ENV_SNIP" || true
        if [ -s "$ERPNEXT_ENV_SNIP" ]; then
            ssh -i "$SSH_KEY" "$REMOTE_HOST" "mkdir -p $REMOTE_PATH/secrets"
            scp -q -i "$SSH_KEY" \
                "$ERPNEXT_ENV_SNIP" \
                "$REMOTE_HOST:$REMOTE_PATH/secrets/erpnext-production.env"
            ssh -i "$SSH_KEY" "$REMOTE_HOST" \
                "chmod 600 $REMOTE_PATH/secrets/erpnext-production.env 2>/dev/null || true"
            echo -e "${GREEN}  ✅ Uploaded ERPNext API env${NC}"
        else
            echo -e "${YELLOW}  ⚠️  No ERPNEXT_API_* vars in .env.local — skip ERPNext upload${NC}"
        fi
        rm -f "$ERPNEXT_ENV_SNIP"
    fi

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
        chmod +x scripts/cron-sync-gsc-boost.sh scripts/install-gsc-sync-cron.sh 2>/dev/null || true
        chmod +x scripts/cron-merge-404-candidates.sh scripts/install-url-recovery-cron.sh 2>/dev/null || true
        chmod +x scripts/install-blog-automation-cron.sh scripts/install-scheduled-publish-cron.sh 2>/dev/null || true
        ./scripts/install-gsc-sync-cron.sh
        ./scripts/install-url-recovery-cron.sh
        ./scripts/install-blog-automation-cron.sh
EOF
    step_done
    echo ""
fi

if [ "$DEPLOY_SKIP_BUILD" != "1" ]; then
    step_start "Step 3: Staging build (site stays live — typically 6–15 min)"
    ssh -i "$SSH_KEY" -o ServerAliveInterval=30 "$REMOTE_HOST" bash -s "$DEPLOY_FAST" << 'EOF'
        DEPLOY_FAST="$1"
        set -e
        ROOT="/var/www/taypro-dashboard"
        RELEASE="$ROOT/.release-build"
        cd "$ROOT"
        chmod +x scripts/deploy-cms-safe.sh

        echo "  Preparing staging tree at $RELEASE ..."
        mkdir -p "$RELEASE"
        rsync -a --delete \
            --exclude '.next' \
            --exclude '.release-build' \
            --exclude 'node_modules' \
            --exclude 'data/cms.sqlite' \
            --exclude 'data/cms.sqlite-*' \
            --exclude 'public/uploads' \
            --exclude '.deploy-snapshots' \
            --exclude '.runtime/' \
            --exclude 'logs/*.log' \
            "$ROOT/" "$RELEASE/"

        mkdir -p "$RELEASE/data" "$RELEASE/public"
        ln -sfn "$ROOT/data/cms.sqlite" "$RELEASE/data/cms.sqlite"
        if [ -d "$ROOT/public/uploads" ]; then
            ln -sfn "$ROOT/public/uploads" "$RELEASE/public/uploads"
        fi

        cd "$RELEASE"
        export NODE_ENV=production
        if [ -f "$ROOT/.env.production" ]; then
            set -a
            while IFS= read -r line || [ -n "$line" ]; do
                line="${line%%$'\r'}"
                [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
                key="${line%%=*}"
                val="${line#*=}"
                # Strip optional surrounding quotes (build workers need clean paths).
                val="${val#\"}"
                val="${val%\"}"
                val="${val#\'}"
                val="${val%\'}"
                export "${key}=${val}"
            done < "$ROOT/.env.production"
            set +a
        fi
        export NEXT_TELEMETRY_DISABLED=1

        mkdir -p .deploy-cache
        LOCK_HASH=$(sha256sum package-lock.json 2>/dev/null | awk '{print $1}' || shasum -a 256 package-lock.json | awk '{print $1}')
        if [ "$DEPLOY_FAST" = "1" ] && [ -f .deploy-cache/package-lock.sha256 ] && [ "$(cat .deploy-cache/package-lock.sha256)" = "$LOCK_HASH" ]; then
            echo "  Skipping npm install in staging (package-lock.json unchanged)"
        else
            echo "  Installing dependencies in staging..."
            npm install --production=false
            echo "$LOCK_HASH" > .deploy-cache/package-lock.sha256
        fi

        ln -sfn "$RELEASE/node_modules" "$ROOT/node_modules"

        if [ "$DEPLOY_FAST" != "1" ] && [ -f "$ROOT/src/app/projects/agar-solar-project/page.tsx" ] && [ -f "$ROOT/data/cms.sqlite" ]; then
            echo "  Legacy project backfill (if needed)..."
            cd "$ROOT"
            npm run cms:backfill-projects 2>&1 | tail -6 || true
        fi

        cd "$ROOT"
        ./scripts/deploy-cms-safe.sh verify data/cms.sqlite
        echo "  CMS deploy prep on production DB (site still live)..."
        npm run cms:deploy-prep
        ./scripts/deploy-cms-safe.sh verify data/cms.sqlite

        cd "$RELEASE"
        echo "  Building Next.js in staging (live traffic unaffected)..."
        export TAYPRO_CMS_ROOT="${TAYPRO_CMS_ROOT:-$ROOT}"
        chmod -R u+w .next 2>/dev/null || true
        rm -rf .next
        npm run build 2>&1 | tee /tmp/taypro-next-build-staging.log

        if [ ! -f .next/BUILD_ID ]; then
            echo "  ❌ Staging build failed!"
            exit 1
        fi
        echo "  ✅ Staging build successful (BUILD_ID=$(cat .next/BUILD_ID))"
EOF

    if [ $? -ne 0 ]; then
        echo -e "${RED}  ❌ Staging build failed — live site unchanged${NC}"
        exit 1
    fi
    step_done
    echo ""
else
    step_start "Step 3: Verify existing staging build"
    ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
        set -e
        if [ ! -f /var/www/taypro-dashboard/.release-build/.next/BUILD_ID ]; then
            echo "  ❌ No staging build at .release-build/.next/BUILD_ID"
            echo "  Run without --skip-build first."
            exit 1
        fi
        echo "  ✅ Staging BUILD_ID=$(cat /var/www/taypro-dashboard/.release-build/.next/BUILD_ID)"
EOF
    step_done
    echo ""
fi

step_start "Step 4: Atomic swap (~10s maintenance page)"
echo -e "${YELLOW}  Building maintenance page (for swap window)...${NC}"
node "$LOCAL_PATH/scripts/build-maintenance-html.mjs"
scp -q -i "$SSH_KEY" \
    "$LOCAL_PATH/deploy/maintenance/index.html" \
    "$REMOTE_HOST:$REMOTE_PATH/deploy/maintenance/index.html"
echo -e "${YELLOW}  Turning on maintenance page (503) for swap...${NC}"
enable_remote_maintenance
echo ""
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard
    chmod +x scripts/deploy-cms-safe.sh

    if [ ! -f /tmp/taypro-cms-metrics-before.json ]; then
        ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-before.json
    fi
    ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-pre-swap.json

    ./scripts/deploy-cms-safe.sh swap-standalone /var/www/taypro-dashboard/.release-build

    sleep 2
    CODE=$(curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/ || echo "000")
    if [ "$CODE" = "200" ]; then
        echo "  ✅ Application responding (HTTP $CODE)"
    else
        echo "  ❌ Application responded with HTTP $CODE after swap"
        ./scripts/deploy-cms-safe.sh rollback-standalone
        exit 1
    fi

    ./scripts/deploy-cms-safe.sh save-metrics /tmp/taypro-cms-metrics-after-swap.json
    ./scripts/deploy-cms-safe.sh assert-unchanged /tmp/taypro-cms-metrics-before.json /tmp/taypro-cms-metrics-after-swap.json
EOF

SWAP_EXIT=$?
echo ""
if [ "$SWAP_EXIT" -ne 0 ]; then
    echo -e "${RED}  ❌ Swap failed — rolled back if possible${NC}"
    disable_remote_maintenance
    exit 1
fi

echo -e "${YELLOW}  Turning off maintenance page...${NC}"
disable_remote_maintenance
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF' 2>/dev/null || true
    set -e
    sudo rm -rf /var/cache/nginx/taypro/* 2>/dev/null || true
    echo "  ✅ Nginx HTML cache purged"
EOF
step_done
echo ""

trap - EXIT INT TERM

echo -e "${GREEN}✅ Deploy completed!${NC}"
echo -e "${YELLOW}  Site stayed live during build; branded 503 showed only during the PM2 swap.${NC}"
echo ""
echo "Website: https://taypro.in"
echo ""
echo -e "${YELLOW}Tips:${NC}"
echo "  ./deploy.sh --fast          routine releases"
echo "  ./deploy.sh --swap-only     re-swap after a failed cutover"
echo ""
