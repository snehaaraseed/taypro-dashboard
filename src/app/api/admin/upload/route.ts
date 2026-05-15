import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../utils/auth";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";
import { getDeploymentRoot } from "../../../utils/deploymentRoot";
import { registerUpload } from "@/lib/cms/uploadService";

// Route segment config for App Router
export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  // Check authentication
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    // Validate content type (multipart/form-data may have boundary parameter)
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    // Parse form data with error handling
    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error("FormData parsing error:", parseError);
      // Check if it's a size-related error
      const errorMessage = parseError instanceof Error ? parseError.message : String(parseError);
      if (errorMessage.includes("413") || errorMessage.includes("too large") || errorMessage.includes("Request Entity Too Large")) {
        return NextResponse.json(
          { error: "File is too large. Maximum size is 10MB. Please compress or resize your image." },
          { status: 413 }
        );
      }
      if (errorMessage.includes("pattern")) {
        return NextResponse.json(
          { error: "Invalid file format. Please ensure the file is a valid image." },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Failed to parse form data: ${errorMessage}. Please try again.` },
        { status: 400 }
      );
    }
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file uploaded" },
        { status: 400 }
      );
    }

    // Ensure file is a File object
    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Invalid file object" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    // Create directory structure: uploads/YYYY/MM/
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const uploadDir = path.join(
      getDeploymentRoot(),
      "public",
      "uploads",
      year,
      month
    );

    // Create directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    
    // Get original filename and sanitize it
    let originalName = file.name || "image";
    
    // Always derive extension from validated MIME type.
    // Do not trust user-provided filename extensions.
    const mimeToExt: Record<string, string> = {
      "image/jpeg": ".jpg",
      "image/jpg": ".jpg",
      "image/png": ".png",
      "image/webp": ".webp",
      "image/gif": ".gif",
    };
    const extension = mimeToExt[file.type];
    if (!extension) {
      return NextResponse.json(
        { error: "Unsupported image MIME type." },
        { status: 400 }
      );
    }
    
    // Get the actual extension from original filename only for basename parsing
    const originalExt = path.extname(originalName).toLowerCase();
    
    // Get base name without extension - remove the actual extension from filename
    let nameWithoutExt: string;
    if (originalExt) {
      // Remove the extension that was actually in the filename
      nameWithoutExt = path.basename(originalName, originalExt);
    } else {
      // No extension in filename, use the whole name (minus any path)
      nameWithoutExt = path.basename(originalName, path.extname(originalName));
    }
    
    // Fallback if name is empty
    if (!nameWithoutExt || nameWithoutExt.trim() === "") {
      nameWithoutExt = "image";
    }
    
    // Sanitize base name - keep only alphanumeric, dots, hyphens, and underscores
    // Remove any path separators and special characters
    const sanitizedName = nameWithoutExt
      .replace(/[^a-zA-Z0-9._-]/g, "_")
      .replace(/^\.+/, "") // Remove leading dots
      .replace(/\.+$/, "") // Remove trailing dots
      .substring(0, 100); // Limit length
    
    // If sanitized name is empty or too short, use a default
    const baseName = sanitizedName.length > 0 ? sanitizedName : "image";
    
    // Create final filename with timestamp (extension is added separately, so no double extension)
    const fileName = `${baseName}-${timestamp}${extension}`;
    const filePath = path.join(uploadDir, fileName);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    try {
      await writeFile(filePath, buffer);
      
      // Verify file was written successfully
      try {
        await access(filePath);
      } catch (verifyError) {
        console.error("File write verification failed:", verifyError);
        throw new Error("File was not saved correctly. Please try again.");
      }
    } catch (writeError) {
      console.error("Error writing file:", writeError);
      if (writeError instanceof Error) {
        if (writeError.message.includes("ENOSPC")) {
          throw new Error("No space left on server. Please contact administrator.");
        } else if (writeError.message.includes("EACCES")) {
          throw new Error("Permission denied. Check file system permissions.");
        }
      }
      throw writeError;
    }

    // Return the public URL
    const publicUrl = `/uploads/${year}/${month}/${fileName}`;

    console.log(`File uploaded successfully: ${publicUrl} -> ${filePath}`);

    await registerUpload({
      url: publicUrl,
      fileName,
      filePath,
      mimeType: file.type,
      size: file.size,
    });

    return NextResponse.json({
      success: true,
      url: publicUrl,
      fileName: fileName,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    
    // Provide more detailed error messages
    let errorMessage = "Failed to upload file";
    if (error instanceof Error) {
      errorMessage = error.message;
      // Check for specific error patterns
      if (error.message.includes("pattern")) {
        errorMessage = "Invalid filename format. Please try renaming the file.";
      } else if (error.message.includes("ENOENT")) {
        errorMessage = "Failed to create upload directory.";
      } else if (error.message.includes("EACCES")) {
        errorMessage = "Permission denied. Check file system permissions.";
      }
    }
    
    return NextResponse.json(
      {
        error: errorMessage,
        // Avoid leaking stack traces in API responses.
        details: process.env.NODE_ENV !== "production" && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

