#!/bin/bash

# Taypro Website Deployment Script
# This script safely deploys changes while preserving production blogs and projects

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration
SSH_KEY="/Users/yogesh/TayproWebsite/taypro-dashboard/AWS_Key/CloudServer.pem"
REMOTE_HOST="ubuntu@ec2-13-126-13-3.ap-south-1.compute.amazonaws.com"
REMOTE_PATH="/var/www/taypro-dashboard"
LOCAL_PATH="/Users/yogesh/TayproWebsite/taypro-dashboard"

echo -e "${GREEN}🚀 Starting Taypro Website Deployment${NC}"
echo ""

# Step 1: Backup production blogs and projects
echo -e "${YELLOW}📦 Step 1: Backing up production blogs and projects...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
    # Create backup directory with timestamp
    BACKUP_DIR="/tmp/taypro-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup blog posts (only actual blog content, not route files)
    if [ -d "src/app/blog" ]; then
        echo "  Backing up blog posts..."
        find src/app/blog -type d -name "*-*" -mindepth 1 -maxdepth 1 | while read blog_dir; do
            # Only backup if it contains metadata.json or page.tsx (actual blog posts)
            if [ -f "$blog_dir/metadata.json" ] || [ -f "$blog_dir/page.tsx" ]; then
                mkdir -p "$BACKUP_DIR/$(dirname "$blog_dir")"
                cp -r "$blog_dir" "$BACKUP_DIR/$blog_dir" 2>/dev/null || true
            fi
        done
    fi
    
    # Backup project pages (only actual project content)
    if [ -d "src/app/projects" ]; then
        echo "  Backing up project pages..."
        find src/app/projects -type d -name "*-*" -mindepth 1 -maxdepth 1 | while read project_dir; do
            # Only backup if it contains metadata.json or page.tsx (actual projects)
            if [ -f "$project_dir/metadata.json" ] || [ -f "$project_dir/page.tsx" ]; then
                mkdir -p "$BACKUP_DIR/$(dirname "$project_dir")"
                cp -r "$project_dir" "$BACKUP_DIR/$project_dir" 2>/dev/null || true
            fi
        done
    fi
    
    # Backup uploaded images (admin console uploads only)
    if [ -d "public/uploads" ]; then
        echo "  Backing up production-uploaded images..."
        mkdir -p "$BACKUP_DIR/public"
        cp -r public/uploads "$BACKUP_DIR/public/uploads" 2>/dev/null || true
    fi
    
    echo "  ✅ Backup created at: $BACKUP_DIR"
    echo "$BACKUP_DIR" > /tmp/taypro-backup-path.txt
EOF

BACKUP_PATH=$(ssh -i "$SSH_KEY" "$REMOTE_HOST" "cat /tmp/taypro-backup-path.txt 2>/dev/null || echo ''")
echo -e "${GREEN}  ✅ Backup completed${NC}"
echo ""

# Step 2: Sync files (excluding production-specific content but including design assets)
echo -e "${YELLOW}📤 Step 2: Syncing code files...${NC}"
rsync -avz \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude 'public/uploads' \
    --exclude 'src/app/blog/**/metadata.json' \
    --exclude 'src/app/blog/**/page.tsx' \
    --exclude 'src/app/projects/**/metadata.json' \
    --exclude 'src/app/projects/**/page.tsx' \
    -e "ssh -i $SSH_KEY" \
    "$LOCAL_PATH/" \
    "$REMOTE_HOST:$REMOTE_PATH/"

echo -e "${GREEN}  ✅ Files synced${NC}"
echo ""

# Step 3: Restore production blogs and projects
echo -e "${YELLOW}🔄 Step 3: Restoring production blogs and projects...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << EOF
    cd /var/www/taypro-dashboard
    
    if [ -n "$BACKUP_PATH" ] && [ -d "$BACKUP_PATH" ]; then
        # Restore blog posts
        if [ -d "$BACKUP_PATH/src/app/blog" ]; then
            echo "  Restoring blog posts..."
            find "$BACKUP_PATH/src/app/blog" -type d -name "*-*" -mindepth 1 -maxdepth 1 | while read backup_blog_dir; do
                blog_slug=\$(basename "\$backup_blog_dir")
                target_dir="src/app/blog/\$blog_slug"
                
                # Only restore if it doesn't exist in source (production-only content)
                if [ ! -d "\$target_dir" ] || [ ! -f "\$target_dir/metadata.json" ]; then
                    mkdir -p "\$(dirname "\$target_dir")"
                    cp -r "\$backup_blog_dir" "\$target_dir" 2>/dev/null || true
                    echo "    ✅ Restored blog: \$blog_slug"
                fi
            done
        fi
        
        # Restore project pages
        if [ -d "$BACKUP_PATH/src/app/projects" ]; then
            echo "  Restoring project pages..."
            find "$BACKUP_PATH/src/app/projects" -type d -name "*-*" -mindepth 1 -maxdepth 1 | while read backup_project_dir; do
                project_slug=\$(basename "\$backup_project_dir")
                target_dir="src/app/projects/\$project_slug"
                
                # Only restore if it doesn't exist in source (production-only content)
                if [ ! -d "\$target_dir" ] || [ ! -f "\$target_dir/metadata.json" ]; then
                    mkdir -p "\$(dirname "\$target_dir")"
                    cp -r "\$backup_project_dir" "\$target_dir" 2>/dev/null || true
                    echo "    ✅ Restored project: \$project_slug"
                fi
            done
        fi
        
        # Restore uploaded images (preserve production uploads, keep new design assets from local)
        if [ -d "$BACKUP_PATH/public/uploads" ]; then
            echo "  Restoring production-uploaded images..."
            mkdir -p public/uploads
            # Use rsync to merge: preserve production uploads, but don't overwrite existing files
            # This ensures production uploads are restored, while any new local uploads remain
            rsync -av "$BACKUP_PATH/public/uploads/" "public/uploads/" 2>/dev/null || true
            echo "    ✅ Production-uploaded images restored"
        fi
        
        # Note: Design assets (tayproasset, tayprorobots, etc.) are already synced from local
        # in Step 2, so they're updated with any design changes while uploads are preserved
        
        echo "  ✅ Restoration completed"
    else
        echo "  ⚠️  No backup found, skipping restoration"
    fi
EOF

echo -e "${GREEN}  ✅ Production content restored${NC}"
echo ""

# Step 4: Build and restart
echo -e "${YELLOW}🔨 Step 4: Building application...${NC}"
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
EOF

if [ $? -eq 0 ]; then
    echo -e "${GREEN}  ✅ Build completed${NC}"
else
    echo -e "${RED}  ❌ Build failed!${NC}"
    exit 1
fi

echo ""

# Step 5: Restart PM2
echo -e "${YELLOW}🔄 Step 5: Restarting application...${NC}"
ssh -i "$SSH_KEY" "$REMOTE_HOST" << 'EOF'
    cd /var/www/taypro-dashboard
    
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
echo "Backup location: $BACKUP_PATH"
echo ""

