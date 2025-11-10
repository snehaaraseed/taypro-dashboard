import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../../utils/auth";
import { readdir, stat } from "fs/promises";
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

          if (entry.isDirectory()) {
            // Recursively scan subdirectories
            await scanDirectory(fullPath, relativePath);
          } else if (entry.isFile()) {
            // Check if it's an image file
            const ext = path.extname(entry.name).toLowerCase();
            if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) {
              try {
                const stats = await stat(fullPath);
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

    // Sort by modified date (newest first)
    images.sort((a, b) => 
      new Date(b.modified).getTime() - new Date(a.modified).getTime()
    );

    return NextResponse.json({
      success: true,
      images: images.slice(0, 1000), // Limit to 1000 most recent images (includes OldWebsiteImages)
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

