import { NextResponse } from "next/server";
import { verifyAdminAuth } from "../../../../utils/auth";

export async function GET() {
  const isAuthenticated = await verifyAdminAuth();

  if (isAuthenticated) {
    return NextResponse.json({ authenticated: true });
  }

  return NextResponse.json(
    { authenticated: false },
    { status: 401 }
  );
}

