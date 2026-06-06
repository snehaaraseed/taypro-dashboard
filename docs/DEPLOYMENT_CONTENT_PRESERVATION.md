# Deployment Content Preservation

**Date:** December 8, 2025  
**Status:** ✅ **CONFIGURED**

## Overview

The deployment scripts are configured to **automatically preserve** all production content during deployments:

- ✅ **Blogs** (50 blogs currently on production)
- ✅ **Projects** (5 projects currently on production)
- ✅ **Uploaded Images** (1,258 images, 330MB currently on production)

## How It Works

### Regular Deployments (`deploy.sh`)

The `deploy.sh` script uses a **backup-and-restore** mechanism:

1. **Step 1: Backup** (Before syncing)
   - Backs up all blog posts from `src/app/blog/*/`
   - Backs up all project pages from `src/app/projects/*/`
   - Backs up all uploaded images from `public/uploads/`

2. **Step 2: Sync** (Excludes production content)
   - Excludes `public/uploads` (preserves uploaded images)
   - Excludes `src/app/blog/**/metadata.json` (preserves blog metadata)
   - Excludes `src/app/blog/**/page.tsx` (preserves blog content)
   - Excludes `src/app/projects/**/metadata.json` (preserves project metadata)
   - Excludes `src/app/projects/**/page.tsx` (preserves project content)

3. **Step 3: Restore** (After syncing)
   - Restores all backed up blogs
   - Restores all backed up projects
   - Restores all backed up uploaded images

### Fresh Deployments (`deploy-fresh.sh`)

The `deploy-fresh.sh` script is for **new server deployments** and:
- Excludes `.env*` files (preserves environment configuration)
- **Note:** For fresh deployments, you may want to manually copy production content if needed

## Current Production Content

As of December 8, 2025:

- **Blogs:** 50 blog posts
- **Projects:** 5 project pages
- **Uploaded Images:** 1,258 images (330MB)

## What Gets Updated

During deployment, the following are **updated**:
- Application code (`src/` except blogs/projects)
- Configuration files
- Dependencies (`node_modules`)
- Build artifacts (`.next/`)
- Design assets (`public/tayproasset/`, `public/tayprorobots/`, etc.)

## What Gets Preserved

During deployment, the following are **preserved**:
- ✅ Blog posts created in production
- ✅ Project pages created in production
- ✅ Images uploaded via admin console
- ✅ Environment variables (`.env.production`)

## Verification

To verify content is preserved after deployment:

```bash
# Check blogs
ssh ubuntu@13.204.129.120 "find /var/www/taypro-dashboard/src/app/blog -type d -name '*-*' | wc -l"

# Check projects
ssh ubuntu@13.204.129.120 "find /var/www/taypro-dashboard/src/app/projects -type d -name '*-*' | wc -l"

# Check uploaded images
ssh ubuntu@13.204.129.120 "find /var/www/taypro-dashboard/public/uploads -type f | wc -l"
```

## Important Notes

1. **Always use `deploy.sh` for regular deployments** - It automatically preserves content
2. **Backups are stored in `/tmp/taypro-backup-*`** - These are temporary and cleaned up
3. **Design assets are updated** - Static design files (logos, robot images) are synced from local
4. **Uploaded images are preserved** - Only admin-uploaded images are preserved, design assets are updated

## Troubleshooting

If content is missing after deployment:

1. Check backup was created:
   ```bash
   ssh ubuntu@13.204.129.120 "ls -la /tmp/taypro-backup-*"
   ```

2. Check restoration logs in deployment output

3. Manually restore from backup if needed:
   ```bash
   BACKUP_PATH="/tmp/taypro-backup-YYYYMMDD-HHMMSS"
   # Restore blogs, projects, or uploads as needed
   ```

---

**Status:** ✅ **AUTOMATICALLY PRESERVED**  
**Script:** `deploy.sh`  
**Last Verified:** December 8, 2025

