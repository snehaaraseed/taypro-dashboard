import { NextRequest, NextResponse } from "next/server";
import { clearAdminAuth } from "../../../../utils/auth";

export async function POST(request: NextRequest) {
  try {
    await clearAdminAuth();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

