import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken, generateToken } from "./jwt";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";
const COOKIE_NAME = "admin-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

/**
 * Verify admin authentication from JWT token in cookie
 */
export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  
  if (!authCookie || !authCookie.value) {
    return false;
  }
  
  // Verify JWT token instead of plain password
  const isValid = await verifyToken(authCookie.value);
  return isValid;
}

/**
 * Set admin authentication cookie with JWT token
 */
export async function setAdminAuth(password: string): Promise<boolean> {
  if (password === ADMIN_PASSWORD) {
    // Generate JWT token instead of storing password
    const token = await generateToken();
    
    const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    return true;
  }
  return false;
}

/**
 * Clear admin authentication cookie
 */
export async function clearAdminAuth(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Middleware to protect admin routes
 */
export async function requireAuth(
  request: NextRequest
): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);
  
  if (!authCookie || !authCookie.value) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Verify JWT token instead of plain password
  const isValid = await verifyToken(authCookie.value);
  if (!isValid) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  return null;
}

