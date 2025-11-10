import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { readdir, stat, readlink } from "fs/promises";
import path from "path";

interface ImageFile {
  url: string;
  name: string;
  size: number;
  modified: string;
}

export async function GET(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const images: ImageFile[] = [];

    // This function recursively scans directories including OldWebsiteImages
    // OldWebsiteImages is accessible via symlink at public/uploads/OldWebsiteImages
    async function scanDirectory(dirPath: string, basePath: string = "/uploads") {
      try {
        const entries = await readdir(dirPath, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(dirPath, entry.name);
          let relativePath: string;
          
          if (basePath === "/uploads") {
            relativePath = `/uploads/${entry.name}`;
          } else {
            relativePath = `${basePath}/${entry.name}`;
          }

          // Check if it's a symlink - if so, resolve it and use the target path
          let actualPath = fullPath;
          let isDirectory = entry.isDirectory();
          let isFile = entry.isFile();
          
          if (entry.isSymbolicLink()) {
            try {
              // Read the symlink target
              const linkTarget = await readlink(fullPath);
              // Resolve to absolute path (handle relative symlinks)
              actualPath = path.isAbsolute(linkTarget) 
                ? linkTarget 
                : path.resolve(path.dirname(fullPath), linkTarget);
              
              // Check what the symlink points to
              const linkStats = await stat(actualPath);
              isDirectory = linkStats.isDirectory();
              isFile = linkStats.isFile();
            } catch (error) {
              // Symlink is broken, skip it
              console.warn(`Broken symlink: ${fullPath}`, error);
              continue;
            }
          }

          if (isDirectory) {
            // Recursively scan subdirectories (including symlinked directories)
            // Use actualPath to follow symlinks to their target
            await scanDirectory(actualPath, relativePath);
          } else if (isFile) {
            // Check if it's an image file
            const ext = path.extname(entry.name).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
              try {
                // Use actualPath to handle symlinked files
                const stats = await stat(actualPath);
                // Ensure the URL always starts with /uploads and uses forward slashes
                const url = relativePath.replace(/\\/g, "/").replace(/\/+/g, "/");
                images.push({
                  url: url,
                  name: entry.name,
                  size: stats.size,
                  modified: stats.mtime.toISOString(),
                });
              } catch (error) {
                // Skip files we can't read
                console.warn(`Could not read file: ${fullPath}`, error);
              }
            }
          }
        }
      } catch (error) {
        // Directory doesn't exist or can't be read
        console.warn(`Could not scan directory: ${dirPath}`, error);
      }
    }

    await scanDirectory(uploadsDir);

    // Function to extract base name from filename (removing size suffixes)
    // Examples: "image-150x150.jpg" -> "image", "photo-scaled.jpg" -> "photo"
    // Only removes clear size-related patterns, not generic trailing numbers
    function getBaseName(filename: string): string {
      const ext = path.extname(filename);
      const nameWithoutExt = filename.slice(0, -ext.length);
      
      // Remove common size patterns: -150x150, -300x200, -1024x768, -scaled, etc.
      // Pattern matches: -digitsxdigits (size dimensions), -scaled variants
      let baseName = nameWithoutExt
        .replace(/-\d+x\d+(-scaled)?$/i, '') // Remove -WIDTHxHEIGHT or -WIDTHxHEIGHT-scaled
        .replace(/-scaled\d*$/i, ''); // Remove -scaled or -scaled0, -scaled1, etc.
      
      // Only remove trailing numbers if they appear after a size pattern was removed
      // This handles cases like "image-150x150-1.jpg" -> "image"
      // But preserves "image-1.jpg" and "image-2.jpg" as different images
      if (baseName !== nameWithoutExt) {
        // A size pattern was removed, so trailing numbers are likely part of variant naming
        baseName = baseName.replace(/-\d+$/i, '');
      }
      
      return baseName.toLowerCase();
    }

    // Group images by base name and keep only the best version of each
    // Include directory path in grouping key to avoid grouping same-named files from different directories
    const imageMap = new Map<string, ImageFile>();
    
    for (const image of images) {
      // Extract directory path from URL (everything except filename)
      const urlDir = path.dirname(image.url);
      const baseName = getBaseName(image.name);
      // Use directory + base name as the grouping key
      const groupKey = `${urlDir}/${baseName}`;
      const existing = imageMap.get(groupKey);
      
      if (!existing) {
        // First occurrence of this base name in this directory
        imageMap.set(groupKey, image);
      } else {
        // Check if this is a better version
        const isOriginal = !image.name.match(/-\d+x\d+|-scaled/i); // No size suffix = original
        const existingIsOriginal = !existing.name.match(/-\d+x\d+|-scaled/i);
        
        if (isOriginal && !existingIsOriginal) {
          // This is original, existing is not - prefer this
          imageMap.set(groupKey, image);
        } else if (!isOriginal && existingIsOriginal) {
          // Existing is original, this is not - keep existing
          // Do nothing
        } else {
          // Both are variants or both are originals - prefer larger file size
          if (image.size > existing.size) {
            imageMap.set(groupKey, image);
          }
        }
      }
    }

    // Convert map back to array
    const uniqueImages = Array.from(imageMap.values());

    // Sort by modified date (newest first)
    uniqueImages.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    // Log summary for debugging
    console.log(`Gallery API: Found ${images.length} total images, ${uniqueImages.length} unique images after deduplication`);
    
    return NextResponse.json({
      success: true,
      images: uniqueImages.slice(0, 3000), // Limit to 3000 most recent images (includes OldWebsiteImages)
    });
  } catch (error) {
    console.error("Error listing images:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list images",
      },
      { status: 500 }
    );
  }
}

