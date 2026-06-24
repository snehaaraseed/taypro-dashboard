import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "../../../utils/auth";
import { registerUpload } from "@/lib/cms/uploadService";
import {
  isUploadContext,
  sanitizeUploadLabel,
  type UploadContext,
} from "@/lib/cms/imageUploadTypes";
import { saveProcessedImage } from "@/lib/cms/saveProcessedImage";
import { validateImageMagicBytes } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

function resolveUploadContext(raw: FormDataEntryValue | null): UploadContext {
  if (typeof raw === "string" && isUploadContext(raw)) {
    return raw;
  }
  return "general";
}

function resolveUploadLabel(
  raw: FormDataEntryValue | null,
  fileName: string
): string {
  if (typeof raw === "string" && raw.trim()) {
    return sanitizeUploadLabel(raw);
  }
  const withoutExt = fileName.replace(/\.[^.]+$/, "");
  return sanitizeUploadLabel(withoutExt || "image");
}

export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) {
    return authResponse;
  }

  try {
    const contentType = request.headers.get("content-type");
    if (!contentType || !contentType.includes("multipart")) {
      return NextResponse.json(
        { error: "Invalid content type. Expected multipart/form-data." },
        { status: 400 }
      );
    }

    let formData: FormData;
    try {
      formData = await request.formData();
    } catch (parseError) {
      console.error("FormData parsing error:", parseError);
      const errorMessage =
        parseError instanceof Error ? parseError.message : String(parseError);
      if (
        errorMessage.includes("413") ||
        errorMessage.includes("too large") ||
        errorMessage.includes("Request Entity Too Large")
      ) {
        return NextResponse.json(
          {
            error:
              "File is too large. Maximum size is 10MB. Please compress or resize your image.",
          },
          { status: 413 }
        );
      }
      if (errorMessage.includes("pattern")) {
        return NextResponse.json(
          {
            error:
              "Invalid file format. Please ensure the file is a valid image.",
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        {
          error: `Failed to parse form data: ${errorMessage}. Please try again.`,
        },
        { status: 400 }
      );
    }

    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: file ? "Invalid file object" : "No file uploaded" },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
      return NextResponse.json(
        { error: "Invalid file type. Only images are allowed." },
        { status: 400 }
      );
    }

    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (!validateImageMagicBytes(buffer, file.type)) {
      return NextResponse.json(
        { error: "File content does not match declared image type." },
        { status: 400 }
      );
    }

    const context = resolveUploadContext(formData.get("context"));
    const label = resolveUploadLabel(formData.get("label"), file.name || "image");

    const saved = await saveProcessedImage({
      buffer,
      mimeType: file.type,
      context,
      label,
    });

    console.log(
      `File uploaded: ${saved.url} (${saved.size} bytes, ${saved.width}x${saved.height})`
    );

    return NextResponse.json({
      success: true,
      url: saved.url,
      fileName: saved.fileName,
      originalSize: file.size,
      compressedSize: saved.size,
    });
  } catch (error) {
    console.error("Error uploading file:", error);

    let errorMessage = "Failed to upload file";
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes("pattern")) {
        errorMessage = "Invalid filename format. Please try renaming the file.";
      } else if (error.message.includes("ENOENT")) {
        errorMessage = "Failed to create upload directory.";
      } else if (error.message.includes("EACCES")) {
        errorMessage = "Permission denied. Check file system permissions.";
      } else if (error.message.includes("ENOSPC")) {
        errorMessage = "No space left on server. Please contact administrator.";
      }
    }

    return NextResponse.json(
      {
        error: errorMessage,
        details:
          process.env.NODE_ENV !== "production" && error instanceof Error
            ? error.stack
            : undefined,
      },
      { status: 500 }
    );
  }
}
