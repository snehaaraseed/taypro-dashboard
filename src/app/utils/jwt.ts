/**
 * JWT token utilities for secure authentication
 * Uses Node.js built-in crypto module for signing and verification
 */

import { SignJWT, jwtVerify } from "jose";

const SECRET_KEY = process.env.JWT_SECRET || process.env.ADMIN_PASSWORD || "change-this-secret-key-in-production";
const ALGORITHM = "HS256";
const TOKEN_EXPIRY = 60 * 60 * 24 * 7; // 7 days in seconds

// Convert secret to Uint8Array for jose
function getSecretKey(): Uint8Array {
  const encoder = new TextEncoder();
  return encoder.encode(SECRET_KEY);
}

/**
 * Generate a JWT token for admin authentication
 */
export async function generateToken(): Promise<string> {
  const secret = getSecretKey();
  
  const token = await new SignJWT({ 
    role: "admin",
    type: "admin-auth"
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setIssuedAt()
    .setExpirationTime(`${TOKEN_EXPIRY}s`)
    .sign(secret);
  
  return token;
}

/**
 * Verify a JWT token
 * @returns true if valid, false otherwise
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret, {
      algorithms: [ALGORITHM],
    });
    
    // Verify token type
    if (payload.type !== "admin-auth" || payload.role !== "admin") {
      return false;
    }
    
    return true;
  } catch (error) {
    // Token is invalid, expired, or malformed
    return false;
  }
}



