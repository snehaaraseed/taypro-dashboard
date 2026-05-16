/**
 * JWT token utilities for secure authentication
 */

import { SignJWT, jwtVerify } from "jose";

const ALGORITHM = "HS256";
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

function resolveSecret(): string {
  const secret =
    process.env.JWT_SECRET?.trim() || process.env.ADMIN_PASSWORD?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET or ADMIN_PASSWORD must be set in production");
  }
  return "dev-only-jwt-secret-change-me";
}

function getSecretKey(): Uint8Array {
  return new TextEncoder().encode(resolveSecret());
}

/**
 * Generate a JWT token for admin authentication
 */
export async function generateToken(): Promise<string> {
  const secret = getSecretKey();

  return new SignJWT({
    role: "admin",
    type: "admin-auth",
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY}s`)
    .sign(secret);
}

/**
 * Verify a JWT token
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });

    return payload.type === "admin-auth" && payload.role === "admin";
  } catch {
    return false;
  }
}
