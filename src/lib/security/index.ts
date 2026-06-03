import { createHash, timingSafeEqual } from "crypto";
import { resolve as pathResolve, sep as pathSep } from "path";
import type { NextRequest } from "next/server";

/** Constant-time password comparison (length-independent via SHA-256). */
export function safeCompareSecret(provided: string, expected: string): boolean {
  const a = createHash("sha256").update(provided, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Cron / automation endpoints, require `Authorization: Bearer <secret>` or
 * `x-automation-secret: <secret>` matching AUTOMATION_CRON_SECRET.
 */
export function isAutomationAuthorized(request: NextRequest): boolean {
  const secret = process.env.AUTOMATION_CRON_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV !== "production";
  }

  const bearer = request.headers.get("authorization");
  if (bearer?.startsWith("Bearer ")) {
    return safeCompareSecret(bearer.slice(7), secret);
  }

  const header = request.headers.get("x-automation-secret");
  if (header) {
    return safeCompareSecret(header, secret);
  }

  return false;
}

export function getClientIp(request: Request | { headers: Headers }): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "forwarded-unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) {
    return cfIp.trim();
  }

  return `anon-${createHash("sha256").update(request.headers.get("user-agent") || "na").digest("hex").slice(0, 16)}`;
}

const IMAGE_SIGNATURES: Readonly<Record<string, readonly (readonly number[])[]>> =
  {
    "image/jpeg": [[0xff, 0xd8, 0xff]],
    "image/png": [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
    "image/gif": [
      [0x47, 0x49, 0x46, 0x38, 0x37, 0x61],
      [0x47, 0x49, 0x46, 0x38, 0x39, 0x61],
    ],
    "image/webp": [[0x52, 0x49, 0x46, 0x46]],
  };

function bytesMatch(
  buffer: Buffer,
  signature: readonly number[],
  offset = 0
): boolean {
  if (buffer.length < offset + signature.length) return false;
  return signature.every((byte, i) => buffer[offset + i] === byte);
}

/** Reject polyglot uploads that spoof MIME type. */
export function validateImageMagicBytes(
  buffer: Buffer,
  mimeType: string
): boolean {
  const signatures = IMAGE_SIGNATURES[mimeType];
  if (!signatures) return false;

  if (mimeType === "image/webp") {
    return (
      bytesMatch(buffer, signatures[0]) &&
      buffer.length >= 12 &&
      buffer.toString("ascii", 8, 12) === "WEBP"
    );
  }

  return signatures.some((sig) => bytesMatch(buffer, sig));
}

export function resolvePathInsideRoot(
  root: string,
  ...segments: string[]
): string | null {
  const resolvedRoot = pathResolve(root);
  const resolved = pathResolve(resolvedRoot, ...segments);
  if (
    resolved === resolvedRoot ||
    resolved.startsWith(resolvedRoot + pathSep)
  ) {
    return resolved;
  }
  return null;
}
