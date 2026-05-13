#!/bin/bash

# Taypro Website Deployment Script
# This script safely deploys changes while preserving production blogs and projects
#
# IMPORTANT — do not use `git pull` on the production server for releases.
# Use this script from a developer machine with a current clone. `git pull` overwrites
# file-based CMS content (blogs, projects, authors) with whatever is on the branch and
# bypasses the merge logic below.
#
# PM2 must use cwd = .next/standalone (Next standalone). Admin API writes blogs under that
# path. Step 1 flushes standalone → repo root before snapshot so backups include live posts.
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

    # PM2 runs Next with cwd = .next/standalone, so blogFileUtils / uploads write UNDER STANDALONE.
    # Snapshots and merges use repo root — without this flush, new admin blogs/authors NEVER enter the backup
    # and disappear on the next "npm run build" (standalone is rebuilt from root).
    STAND=".next/standalone"
    if [ -d "$STAND/src/app/blog" ]; then
        echo "  Flushing blogs: standalone → repo root (PM2 cwd is .next/standalone)..."
        mkdir -p src/app/blog
        rsync -au "$STAND/src/app/blog/" src/app/blog/
    fi
    if [ -d "$STAND/src/app/projects" ]; then
        echo "  Flushing projects: standalone → repo root..."
        mkdir -p src/app/projects
        rsync -au "$STAND/src/app/projects/" src/app/projects/
    fi
    if [ -f "$STAND/src/app/data/blogAuthors.store.json" ]; then
        echo "  Flushing blogAuthors.store.json from standalone..."
        mkdir -p src/app/data
        cp -a "$STAND/src/app/data/blogAuthors.store.json" src/app/data/blogAuthors.store.json
    fi
    if [ -f "$STAND/data/published-topics.json" ]; then
        echo "  Flushing published-topics.json from standalone..."
        mkdir -p data
        cp -a "$STAND/data/published-topics.json" data/published-topics.json
    fi
    if [ -d "$STAND/public/uploads" ]; then
        echo "  Flushing public/uploads from standalone..."
        mkdir -p public/uploads
        rsync -au "$STAND/public/uploads/" public/uploads/
    fi

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
            # Match Step 4 reserved names — do not use "*-*" only (slugs without "-" would be skipped).
            find src/app/blog -mindepth 1 -maxdepth 1 -type d | while read -r blog_dir; do
                slug=$(basename "$blog_dir")
                case "$slug" in
                    "."|".."|"[slug]"|"add"|"db"|"api"|"author"|"components") continue ;;
                esac
                # Include drafts / odd states: any real post dir with CMS files (not only metadata+legacy page).
                if [ -f "$blog_dir/metadata.json" ] || [ -f "$blog_dir/page.tsx" ] || [ -f "$blog_dir/content.html" ] || [ -f "$blog_dir/page.legacy.tsx" ] || [ -f "$blog_dir/page.legacy.txt" ]; then
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
                if [ -f "$project_dir/metadata.json" ] || [ -f "$project_dir/page.tsx" ] || [ -f "$project_dir/page.legacy.tsx" ] || [ -f "$project_dir/page.legacy.txt" ]; then
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

BACKUP_PATH=$(ssh -i "$SSH_KEY" "$REMOTE_HOST" "tr -d '\r\n' < /tmp/taypro-backup-path.txt 2>/dev/null || echo ''")
if [ -z "$BACKUP_PATH" ]; then
    echo -e "${RED}❌ Step 1 did not produce a merge backup path. Aborting deploy (would risk overwriting production CMS).${NC}"
    exit 1
fi
echo -e "${GREEN}  ✅ Backup completed (merge source: $BACKUP_PATH)${NC}"
echo ""

# Step 2: Sync files (excluding production-specific content but including design assets)
echo -e "${YELLOW}📤 Step 2: Syncing code files...${NC}"
rsync -avz --checksum \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'public/uploads' \
    --exclude 'src/app/data/blogAuthors.store.json' \
    --exclude 'data/published-topics.json' \
    --exclude 'src/app/blog/*-*/metadata.json' \
    --exclude 'src/app/blog/*-*/page.tsx' \
    --exclude 'src/app/blog/*/metadata.json' \
    --exclude 'src/app/blog/*/page.tsx' \
    --exclude 'src/app/projects/*-*/metadata.json' \
    --exclude 'src/app/projects/*-*/page.tsx' \
    --exclude 'src/app/projects/*/metadata.json' \
    --exclude 'src/app/projects/*/page.tsx' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}  ✅ Files synced${NC}"
echo ""

# Step 3: Merge production CMS files (admin / frontend writes) over rsync result
echo -e "${YELLOW}🔄 Step 3: Merging production CMS files from backup (production wins)...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    set -euo pipefail
    cd /var/www/taypro-dashboard
    
    if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH" ]; then
        # For every blog slug captured in the backup, re-apply admin-managed files so a stale
        # local tree cannot overwrite production metadata, body HTML, or legacy routes.
        if [ -d "$BACKUP_PATH/src/app/blog" ]; then
            echo "  Merging blog CMS files from backup (full slug tree, production wins)..."
            find "$BACKUP_PATH/src/app/blog" -mindepth 1 -maxdepth 1 -type d | while read -r backup_blog_dir; do
                blog_slug=\$(basename "\$backup_blog_dir")
                case "\$blog_slug" in
                    "."|".."|"[slug]"|"add"|"db"|"api"|"author"|"components") continue ;;
                esac
                target_dir="src/app/blog/\$blog_slug"
                mkdir -p "\$target_dir"
                # Exact mirror of pre-deploy slug dir — removes stray files left by rsync (e.g. local placeholders).
                rsync -a --delete "\$backup_blog_dir/" "\$target_dir/"
                echo "    ✅ Merged blog: \$blog_slug"
            done
        fi

        # Same for projects (all slug dirs that were backed up, including e.g. capex, automatic)
        if [ -d "$BACKUP_PATH/src/app/projects" ]; then
            echo "  Merging project CMS files from backup (full slug tree, production wins)..."
            find "$BACKUP_PATH/src/app/projects" -mindepth 1 -maxdepth 1 -type d | while read -r backup_project_dir; do
                project_slug=\$(basename "\$backup_project_dir")
                case "\$project_slug" in
                    "."|".."|"layout") continue ;;
                esac
                target_dir="src/app/projects/\$project_slug"
                mkdir -p "\$target_dir"
                rsync -a --delete "\$backup_project_dir/" "\$target_dir/"
                echo "    ✅ Merged project: \$project_slug"
            done
        fi

        mkdir -p src/app/data
        if [ -f "$BACKUP_PATH/src/app/data/blogAuthors.store.json" ]; then
            cp -a "$BACKUP_PATH/src/app/data/blogAuthors.store.json" "src/app/data/blogAuthors.store.json"
            echo "    ✅ Restored src/app/data/blogAuthors.store.json"
        else
            echo "    ⚠️  No blogAuthors.store.json in backup (first deploy or empty); leaving rsync result."
        fi

        mkdir -p data
        if [ -f "$BACKUP_PATH/data/published-topics.json" ]; then
            cp -a "$BACKUP_PATH/data/published-topics.json" "data/published-topics.json"
            echo "    ✅ Restored data/published-topics.json"
        fi
        
        # Restore uploaded images (preserve production uploads, keep new design assets from local)
        if [ -d "$BACKUP_PATH/public/uploads" ]; then
            echo "  Restoring production-uploaded images..."
            mkdir -p public/uploads
            rsync -av "$BACKUP_PATH/public/uploads/" "public/uploads/" 2>/dev/null || true
            echo "    ✅ Production-uploaded images restored"
        fi

        echo "  Verifying restored production content..."
        if [ -d "$BACKUP_PATH/src/app/blog" ]; then
            find "$BACKUP_PATH/src/app/blog" -mindepth 1 -maxdepth 1 -type d | while read -r backup_blog_dir; do
                blog_slug=\$(basename "\$backup_blog_dir")
                case "\$blog_slug" in
                    "."|".."|"[slug]"|"add"|"db"|"api"|"author"|"components") continue ;;
                esac
                target_dir="src/app/blog/\$blog_slug"
                if [ ! -d "\$target_dir" ]; then
                    echo "  ❌ Missing restored blog directory: \$blog_slug"
                    exit 1
                fi
                diff_line=\$(rsync -ain --delete "\$backup_blog_dir/" "\$target_dir/" | sed -n '/^\.\/$/!{p;q;}')
                if [ -n "\$diff_line" ]; then
                    echo "  ❌ Restored blog does not match backup: \$blog_slug"
                    exit 1
                fi
            done
        fi

        if [ -d "$BACKUP_PATH/src/app/projects" ]; then
            find "$BACKUP_PATH/src/app/projects" -mindepth 1 -maxdepth 1 -type d | while read -r backup_project_dir; do
                project_slug=\$(basename "\$backup_project_dir")
                case "\$project_slug" in "."|".."|"layout") continue ;; 
                esac
                target_dir="src/app/projects/\$project_slug"
                if [ ! -d "\$target_dir" ]; then
                    echo "  ❌ Missing restored project directory: \$project_slug"
                    exit 1
                fi
                diff_line=\$(rsync -ain --delete "\$backup_project_dir/" "\$target_dir/" | sed -n '/^\.\/$/!{p;q;}')
                if [ -n "\$diff_line" ]; then
                    echo "  ❌ Restored project does not match backup: \$project_slug"
                    exit 1
                fi
            done
        fi

        if [ -f "$BACKUP_PATH/src/app/data/blogAuthors.store.json" ] && [ ! -f "src/app/data/blogAuthors.store.json" ]; then
            echo "  ❌ Missing restored src/app/data/blogAuthors.store.json"
            exit 1
        fi

        if [ -f "$BACKUP_PATH/data/published-topics.json" ] && [ ! -f "data/published-topics.json" ]; then
            echo "  ❌ Missing restored data/published-topics.json"
            exit 1
        fi

        if [ -d "$BACKUP_PATH/public/uploads" ]; then
            diff_line=\$(rsync -ain "$BACKUP_PATH/public/uploads/" "public/uploads/" | sed -n '/^\.\/$/!{p;q;}')
            if [ -n "\$diff_line" ]; then
                echo "  ❌ Restored uploads do not fully match backup"
                exit 1
            fi
        fi
        
        echo "  ✅ CMS merge completed and verified"
    else
        echo "  ⚠️  No backup found — CMS merge SKIPPED (rsync may overwrite production blogs/projects)."
        echo "  ⚠️  Fix Step 1 / SSH before relying on this deploy."
        exit 1
    fi
EOF

echo -e "${GREEN}  ✅ Production content restored${NC}"
echo ""

# Step 4: Migrate legacy per-slug page routes to dynamic renderer
echo -e "${YELLOW}🧭 Step 4: Migrating legacy blog routes...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    set -euo pipefail
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
            legacy_backup="$blog_dir/page.legacy.txt"
            legacy_backup_tsx="$blog_dir/page.legacy.tsx"
            content_file="$blog_dir/content.html"

            # Only process real blog directories
            if [ ! -f "$metadata_file" ]; then
                continue
            fi

            legacy_source=""
            if [ -f "$legacy_page" ]; then
                legacy_source="$legacy_page"
            elif [ -f "$legacy_backup" ]; then
                legacy_source="$legacy_backup"
            elif [ -f "$legacy_backup_tsx" ]; then
                legacy_source="$legacy_backup_tsx"
            fi

            # If content.html is missing, try extracting content from a preserved legacy page source.
            if [ ! -f "$content_file" ] && [ -n "$legacy_source" ]; then
                node - <<'NODE' "$legacy_source" "$content_file"
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

            # Keep legacy page backups out of the TS/Next compile graph so broken historical JSX
            # doesn't fail production builds after the route has moved to the dynamic renderer.
            if [ -f "$legacy_backup_tsx" ]; then
                if [ -f "$legacy_backup" ]; then
                    rm -f "$legacy_backup_tsx"
                else
                    mv "$legacy_backup_tsx" "$legacy_backup" 2>/dev/null || true
                fi
            fi

            # Move legacy page.tsx out of route resolution so dynamic [slug] handles rendering.
            if [ -f "$legacy_page" ]; then
                mv "$legacy_page" "$legacy_backup" 2>/dev/null || true
                echo "    ✅ Migrated route for: $slug"
            fi
        done
    fi

    if [ -d "src/app/projects" ]; then
        echo "  Converting legacy project backups to non-compiled files..."
        find src/app/projects -mindepth 1 -maxdepth 1 -type d | while read -r project_dir; do
            slug=$(basename "$project_dir")
            case "$slug" in "."|".."|"layout") continue ;; esac

            legacy_backup="$project_dir/page.legacy.txt"
            legacy_backup_tsx="$project_dir/page.legacy.tsx"

            if [ -f "$legacy_backup_tsx" ]; then
                if [ -f "$legacy_backup" ]; then
                    rm -f "$legacy_backup_tsx"
                else
                    mv "$legacy_backup_tsx" "$legacy_backup" 2>/dev/null || true
                fi
                echo "    ✅ Archived project legacy page: $slug"
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
    rm -rf .next
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

