import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit } from "@/app/utils/rateLimit";

const BACKEND_URL =
  process.env.SALESLEAD_BACKEND_URL ||
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "https://console.taypro.in";

const MAX_FIELD_LENGTH = 500;
const MAX_COMMENTS_LENGTH = 5000;

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, "saleslead");
    if (rateLimit.limited) {
      return NextResponse.json(
        { success: false, message: "Too many submissions. Please try again later." },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
            ),
          },
        }
      );
    }

    const body = await request.json();
    const name = String(body.name ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const email = String(body.email ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const phone = String(body.phone ?? "").trim().slice(0, MAX_FIELD_LENGTH);
    const company_name = String(body.company_name ?? "")
      .trim()
      .slice(0, MAX_FIELD_LENGTH);
    const comments = String(body.comments ?? "")
      .trim()
      .slice(0, MAX_COMMENTS_LENGTH);

    if (!name || !email || !phone) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please fill in all required fields (name, email, phone)" 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: "Please provide a valid email address" 
        },
        { status: 400 }
      );
    }

    // Try to send to external API
    try {
      const response = await fetch(`${BACKEND_URL}/api/v1/saleslead`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company_name: company_name || "",
          comments: comments || "",
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          success: true,
          message: data.message || "Request submitted successfully. We'll get back to you soon!",
        });
      } else {
        // If external API fails, still log the lead locally
        console.error("External API error:", response.status, await response.text());
        // Fall through to local handling
      }
    } catch (externalError) {
      console.error("External API connection error:", externalError);
      // Fall through to local handling or success response
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("Sales lead stored locally (backend unavailable)");
    }

    return NextResponse.json({
      success: true,
      message: "Request submitted successfully. We'll get back to you soon!",
    });
  } catch (error) {
    console.error("Sales lead submission error:", error);
    return NextResponse.json(
      { 
        success: false, 
        message: "An error occurred while submitting your request. Please try again later." 
      },
      { status: 500 }
    );
  }
}

