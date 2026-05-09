#!/bin/bash

# Taypro Website Deployment Script
# This script safely deploys changes while preserving production blogs and projects
#
# IMPORTANT — do not use `git pull` on the production server for releases.
# Use this script from a developer machine with a current clone. `git pull` overwrites
# file-based CMS content (blogs, projects, authors) with whatever is on the branch and
# bypasses the merge logic below.
#
# Persistent deploy snapshots (max 3) live on the server under:
#   /var/www/taypro-dashboard/.deploy-snapshots/deploy-YYYYMMDD-HHMMSS/
# plus /tmp/taypro-backup-* for the merge source of the current run.
# Manual revert: pick a snapshot and merge files the same way as Step 3, or copy whole slug dirs.

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="/Users/yogesh/TayproWebsite/taypro-dashboard/AWS_Key/CloudServer.pem"
REMOTE_HOST="ubuntu@13.204.129.120"
REMOTE_PATH="/var/www/taypro-dashboard"
LOCAL_PATH="/Users/yogesh/TayproWebsite/taypro-dashboard"

echo -e "${GREEN}🚀 Starting Taypro Website Deployment${NC}"
echo ""

# Step 1: Snapshot production CMS + uploads (persistent, rotated) and mirror to /tmp for merge step
echo -e "${YELLOW}📦 Step 1: Snapshotting production (persistent, keep last 3) + merge source...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -e
    cd /var/www/taypro-dashboard

    SNAPSHOT_ROOT="/var/www/taypro-dashboard/.deploy-snapshots"
    mkdir -p "$SNAPSHOT_ROOT"

    STAMP=$(date +%Y%m%d-%H%M%S)
    PERSISTENT_DIR="$SNAPSHOT_ROOT/deploy-$STAMP"
    MERGE_DIR="/tmp/taypro-backup-$STAMP"

    for DIR in "$PERSISTENT_DIR" "$MERGE_DIR"; do
        mkdir -p "$DIR/src/app/data" "$DIR/data" "$DIR/public"
    done

    snapshot_one() {
        local DEST="$1"
        if [ -d "src/app/blog" ]; then
            echo "  → $DEST : blog posts..."
            find src/app/blog -mindepth 1 -maxdepth 1 -type d -name "*-*" | while read -r blog_dir; do
                if [ -f "$blog_dir/metadata.json" ] || [ -f "$blog_dir/page.tsx" ]; then
                    mkdir -p "$DEST/$(dirname "$blog_dir")"
                    cp -a "$blog_dir" "$DEST/$blog_dir"
                fi
            done
        fi
        if [ -d "src/app/projects" ]; then
            echo "  → $DEST : projects..."
            find src/app/projects -mindepth 1 -maxdepth 1 -type d | while read -r project_dir; do
                slug=$(basename "$project_dir")
                case "$slug" in "."|".."|"layout") continue ;; esac
                if [ -f "$project_dir/metadata.json" ] || [ -f "$project_dir/page.tsx" ]; then
                    mkdir -p "$DEST/$(dirname "$project_dir")"
                    cp -a "$project_dir" "$DEST/$project_dir"
                fi
            done
        fi
        if [ -f "src/app/data/blogAuthors.store.json" ]; then
            cp -a "src/app/data/blogAuthors.store.json" "$DEST/src/app/data/"
        fi
        if [ -f "data/published-topics.json" ]; then
            cp -a "data/published-topics.json" "$DEST/data/"
        fi
        if [ -d "public/uploads" ]; then
            echo "  → $DEST : uploads..."
            cp -a public/uploads "$DEST/public/"
        fi
    }

    echo "  Persistent snapshot: $PERSISTENT_DIR"
    snapshot_one "$PERSISTENT_DIR"

    echo "  Merge source copy: $MERGE_DIR"
    snapshot_one "$MERGE_DIR"

    # Keep only the 3 newest deploy-* trees under .deploy-snapshots
    echo "  Rotating old snapshots (max 3 kept)..."
    cd "$SNAPSHOT_ROOT"
    ls -1dt deploy-* 2>/dev/null | tail -n +4 | while read -r OLD; do
        echo "    Removing old snapshot: $OLD"
        rm -rf "$SNAPSHOT_ROOT/$OLD"
    done

    echo "  ✅ Snapshot complete"
    echo "$MERGE_DIR" > /tmp/taypro-backup-path.txt
EOF

BACKUP_PATH=$(ssh -i "$SSH_KEY" "$REMOTE_HOST" "cat /tmp/taypro-backup-path.txt 2>/dev/null || echo ''")
echo -e "${GREEN}  ✅ Backup completed${NC}"
echo ""

# Step 2: Sync files (excluding production-specific content but including design assets)
echo -e "${YELLOW}📤 Step 2: Syncing code files...${NC}"
rsync -avz --checksum \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'public/uploads' \
    --exclude 'src/app/blog/*-*/metadata.json' \
    --exclude 'src/app/blog/*-*/page.tsx' \
    --exclude 'src/app/projects/*-*/metadata.json' \
    --exclude 'src/app/projects/*-*/page.tsx' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}  ✅ Files synced${NC}"
echo ""

# Step 3: Merge production CMS files (admin / frontend writes) over rsync result
echo -e "${YELLOW}🔄 Step 3: Merging production CMS files from backup (production wins)...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    cd /var/www/taypro-dashboard
    
    if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH" ]; then
        # For every blog slug captured in the backup, re-apply admin-managed files so a stale
        # local tree cannot overwrite production metadata, body HTML, or legacy routes.
        if [ -d "$BACKUP_PATH/src/app/blog" ]; then
            echo "  Merging blog CMS files from backup..."
            find "$BACKUP_PATH/src/app/blog" -mindepth 1 -maxdepth 1 -type d -name "*-*" | while read -r backup_blog_dir; do
                blog_slug=\$(basename "\$backup_blog_dir")
                target_dir="src/app/blog/\$blog_slug"
                mkdir -p "\$target_dir"
                for f in metadata.json page.tsx content.html page.legacy.tsx; do
                    if [ -f "\$backup_blog_dir/\$f" ]; then
                        cp "\$backup_blog_dir/\$f" "\$target_dir/\$f"
                    fi
                done
                echo "    ✅ Merged blog: \$blog_slug"
            done
        fi

        # Same for projects (all slug dirs that were backed up, including e.g. capex, automatic)
        if [ -d "$BACKUP_PATH/src/app/projects" ]; then
            echo "  Merging project CMS files from backup..."
            find "$BACKUP_PATH/src/app/projects" -mindepth 1 -maxdepth 1 -type d | while read -r backup_project_dir; do
                project_slug=\$(basename "\$backup_project_dir")
                case "\$project_slug" in
                    "."|".."|"layout") continue ;;
                esac
                target_dir="src/app/projects/\$project_slug"
                mkdir -p "\$target_dir"
                for f in metadata.json page.tsx page.legacy.tsx; do
                    if [ -f "\$backup_project_dir/\$f" ]; then
                        cp "\$backup_project_dir/\$f" "\$target_dir/\$f"
                    fi
                done
                echo "    ✅ Merged project: \$project_slug"
            done
        fi

        if [ -f "$BACKUP_PATH/src/app/data/blogAuthors.store.json" ]; then
            mkdir -p src/app/data
            cp "$BACKUP_PATH/src/app/data/blogAuthors.store.json" "src/app/data/blogAuthors.store.json"
            echo "    ✅ Restored src/app/data/blogAuthors.store.json"
        fi

        if [ -f "$BACKUP_PATH/data/published-topics.json" ]; then
            mkdir -p data
            cp "$BACKUP_PATH/data/published-topics.json" "data/published-topics.json"
            echo "    ✅ Restored data/published-topics.json"
        fi
        
        # Restore uploaded images (preserve production uploads, keep new design assets from local)
        if [ -d "$BACKUP_PATH/public/uploads" ]; then
            echo "  Restoring production-uploaded images..."
            mkdir -p public/uploads
            rsync -av "$BACKUP_PATH/public/uploads/" "public/uploads/" 2>/dev/null || true
            echo "    ✅ Production-uploaded images restored"
        fi
        
        echo "  ✅ CMS merge completed"
    else
        echo "  ⚠️  No backup found, skipping CMS merge"
    fi
EOF

echo -e "${GREEN}  ✅ Production content restored${NC}"
echo ""

# Step 4: Migrate legacy per-slug page routes to dynamic renderer
echo -e "${YELLOW}🧭 Step 4: Migrating legacy blog routes...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard

    if [ -d "src/app/blog" ]; then
        echo "  Scanning blog directories for legacy page routes..."
        find src/app/blog -mindepth 1 -maxdepth 1 -type d | while read blog_dir; do
            slug=$(basename "$blog_dir")
            case "$slug" in
                "[slug]"|"add"|"db"|"api"|"author"|"components")
                    continue
                    ;;
            esac

            metadata_file="$blog_dir/metadata.json"
            legacy_page="$blog_dir/page.tsx"
            content_file="$blog_dir/content.html"

            # Only process real blog directories
            if [ ! -f "$metadata_file" ]; then
                continue
            fi

            # If content.html is missing, try extracting content from legacy page.tsx
            if [ ! -f "$content_file" ] && [ -f "$legacy_page" ]; then
                node - <<'NODE' "$legacy_page" "$content_file"
const fs = require("fs");
const [legacyPagePath, contentPath] = process.argv.slice(2);
const source = fs.readFileSync(legacyPagePath, "utf8");
const patterns = [
  /content=\{\s*`([\s\S]*?)`\s*\}/,
  /content=\{\\?`([\s\S]*?)\\?`\}/,
  /__html:\s*`([\s\S]*?)\\\\?`\s*,\s*\}\s*\}\s*\/>/,
  /__html:\s*`([\s\S]*?)\\\\?`\s*\}\s*\}\s*\/>/
];
let content = "";
for (const pattern of patterns) {
  const match = source.match(pattern);
  if (match && match[1]) {
    content = match[1]
      .replace(/\\n/g, "\n")
      .replace(/\\`/g, "`")
      .replace(/\\\$/g, "$")
      .replace(/\\\\/g, "\\");
    break;
  }
}
if (!content) {
  const start = source.indexOf("__html: `");
  const end = source.indexOf("\\`,", start);
  if (start !== -1 && end !== -1 && end > start) {
    content = source
      .slice(start + "__html: `".length, end)
      .replace(/\\`/g, "`")
      .replace(/\\\$/g, "$")
      .replace(/\\\\/g, "\\");
  }
}
if (content.trim()) {
  fs.writeFileSync(contentPath, content, "utf8");
}
NODE
            fi

            # Move legacy page.tsx out of route resolution so dynamic [slug] handles rendering
            if [ -f "$legacy_page" ]; then
                mv "$legacy_page" "$blog_dir/page.legacy.tsx" 2>/dev/null || true
                echo "    ✅ Migrated route for: $slug"
            fi
        done
    fi
EOF

echo -e "${GREEN}  ✅ Legacy route migration completed${NC}"
echo ""

# Step 5: Build and restart
echo -e "${YELLOW}🔨 Step 5: Building application...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    # Load environment variables
    export NODE_ENV=production
    if [ -f .env.production ]; then
        export $(cat .env.production | grep -v '^#' | xargs)
    fi
    
    # Install dependencies if needed
    echo "  Installing dependencies..."
    npm install --production=false 2>&1 | tail -5
    
    # Build application
    echo "  Building Next.js application..."
    npm run build 2>&1 | tail -20
    
    # Check if build was successful
    if [ -f .next/BUILD_ID ]; then
        echo "  ✅ Build successful"
    else
        echo "  ❌ Build failed!"
        exit 1
    fi
    
    # Copy public folder to standalone directory (required for Next.js standalone mode)
    # This ensures static assets and images are accessible to the Next.js server
    if [ -d ".next/standalone" ] && [ -d "public" ]; then
        echo "  Copying public folder to standalone directory..."
        cp -r public .next/standalone/ 2>/dev/null || true
        echo "  ✅ Public folder copied to standalone directory"
    else
        echo "  ⚠️  Warning: Could not copy public folder (standalone or public directory missing)"
    fi
    
    # Copy .next/static to standalone/.next/static (CRITICAL for JavaScript chunks and CSS)
    # Next.js standalone mode doesn't automatically copy static files
    if [ -d ".next/static" ] && [ -d ".next/standalone" ]; then
        echo "  Copying .next/static to standalone directory..."
        mkdir -p .next/standalone/.next
        cp -r .next/static .next/standalone/.next/ 2>/dev/null || true
        echo "  ✅ Static files (JS/CSS chunks) copied to standalone directory"
    else
        echo "  ⚠️  Warning: Could not copy .next/static (standalone or static directory missing)"
    fi
    
    # Copy .env.production to standalone directory (CRITICAL for environment variables)
    # Next.js standalone mode needs .env files in the standalone directory
    if [ -f ".env.production" ] && [ -d ".next/standalone" ]; then
        echo "  Copying .env.production to standalone directory..."
        cp .env.production .next/standalone/.env.production 2>/dev/null || true
        echo "  ✅ Environment variables file copied to standalone directory"
    fi
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Build completed${NC}"
else
    echo -e "${RED}  ❌ Build failed!${NC}"
    exit 1
fi

echo ""

# Step 6: Restart PM2
echo -e "${YELLOW}🔄 Step 6: Restarting application...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    # Ensure public folder is in standalone directory (in case build didn't include it)
    if [ -d ".next/standalone" ] && [ -d "public" ]; then
        if [ ! -d ".next/standalone/public" ]; then
            echo "  Copying public folder to standalone directory..."
            cp -r public .next/standalone/ 2>/dev/null || true
        else
            # Sync uploads from root to standalone (preserve new uploads)
            if [ -d "public/uploads" ]; then
                echo "  Syncing uploads to standalone directory..."
                rsync -av public/uploads/ .next/standalone/public/uploads/ 2>/dev/null || true
            fi
        fi
    fi
    
    # Restart PM2
    pm2 restart taypro-dashboard || pm2 start ecosystem.config.js
    pm2 save
    
    # Wait a moment for app to start
    sleep 3
    
    # Check status
    pm2 status
    
    # Test if app is responding
    echo ""
    echo "  Testing application..."
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
echo "This run merge source (also under .deploy-snapshots): $BACKUP_PATH"
echo "Persistent snapshots (max 3): $REMOTE_PATH/.deploy-snapshots/"
echo ""
echo "Revert from a snapshot or merge dir (SSH to server), then rebuild:"
echo "  cp -a $REMOTE_PATH/.deploy-snapshots/deploy-YYYYMMDD-HHMMSS/src/app/blog/<slug> $REMOTE_PATH/src/app/blog/"
echo "  # or restore whole blog tree from a snapshot: rsync -a SNAPSHOT/src/app/blog/ $REMOTE_PATH/src/app/blog/"
echo "  cd $REMOTE_PATH && npm run build && pm2 restart taypro-dashboard"
echo ""

