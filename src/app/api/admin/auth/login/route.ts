import { NextRequest, NextResponse } from "next/server";
import { setAdminAuth } from "../../../../utils/auth";
import { checkRateLimit, resetRateLimit } from "../../../../utils/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting first
    const rateLimit = checkRateLimit(request);
    if (rateLimit?.limited) {
      const resetTime = new Date(rateLimit.resetTime).toISOString();
      return NextResponse.json(
        { 
          error: "Too many login attempts. Please try again later.",
          resetTime: resetTime,
          remaining: rateLimit.remaining
        },
        { 
          status: 429,
          headers: {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": resetTime,
            "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const { password } = await request.json();

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = await setAdminAuth(password);

    if (!isValid) {
      // Return rate limit info even on failed login
      return NextResponse.json(
        { 
          error: "Invalid password",
          remaining: rateLimit?.remaining ?? 0,
          resetTime: rateLimit?.resetTime ? new Date(rateLimit.resetTime).toISOString() : undefined
        },
        { 
          status: 401,
          headers: rateLimit ? {
            "X-RateLimit-Limit": "5",
            "X-RateLimit-Remaining": rateLimit.remaining.toString(),
            "X-RateLimit-Reset": new Date(rateLimit.resetTime).toISOString()
          } : undefined
        }
      );
    }

    // Reset rate limit on successful login
    resetRateLimit(request);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

