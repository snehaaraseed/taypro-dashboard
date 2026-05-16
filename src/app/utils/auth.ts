import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { safeCompareSecret } from "@/lib/security";
import { verifyToken, generateToken } from "./jwt";

const COOKIE_NAME = "admin-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD?.trim();
  if (password) return password;
  if (process.env.NODE_ENV === "production") {
    throw new Error("ADMIN_PASSWORD must be set in production");
  }
  return "admin123";
}

/**
 * Verify admin authentication from JWT token in cookie
 */
export async function verifyAdminAuth(): Promise<boolean> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);

  if (!authCookie?.value) {
    return false;
  }

  return verifyToken(authCookie.value);
}

/**
 * Set admin authentication cookie with JWT token
 */
export async function setAdminAuth(password: string): Promise<boolean> {
  if (password !== getAdminPassword()) {
    return false;
  }

  const token = await generateToken();

  const cookieStore = await cookies();
    cookieStore.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
  return true;
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
  _request: NextRequest
): Promise<NextResponse | null> {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(COOKIE_NAME);

  if (!authCookie?.value) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const isValid = await verifyToken(authCookie.value);
  if (!isValid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
}
