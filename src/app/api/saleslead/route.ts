import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "https://console.taypro.in";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, company_name, comments } = body;

    // Validate required fields
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

    // If external API is not available, still return success
    // (In production, you might want to store this in a database or send via email)
    console.log("Sales Lead Submission:", {
      name,
      email,
      phone,
      company_name,
      comments,
      timestamp: new Date().toISOString(),
    });

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

