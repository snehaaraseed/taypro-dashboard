import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit } from "@/app/utils/rateLimit";
import { ErpNextError } from "@/lib/erpnext/client";
import { subscribeToNewsletter } from "@/lib/erpnext/email-group";

const MAX_EMAIL_LENGTH = 254;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkApiRateLimit(request, "newsletter");
    if (rateLimit.limited) {
      return NextResponse.json(
        {
          success: false,
          message: "Too many subscription attempts. Please try again later.",
        },
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
    const email = String(body.email ?? "").trim().slice(0, MAX_EMAIL_LENGTH);

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Please enter your email address." },
        { status: 400 }
      );
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const { alreadySubscribed } = await subscribeToNewsletter(email);

    return NextResponse.json({
      success: true,
      alreadySubscribed,
      message: alreadySubscribed
        ? "You're already subscribed to our newsletter."
        : "Thanks for subscribing! You'll receive blog updates in your inbox.",
    });
  } catch (error) {
    if (error instanceof ErpNextError) {
      console.error("POST /api/newsletter/subscribe ERPNext:", error.message);
      return NextResponse.json(
        {
          success: false,
          message:
            "We could not process your subscription right now. Please try again in a few minutes.",
        },
        {
          status:
            error.status >= 400 && error.status < 500 ? error.status : 502,
        }
      );
    }

    console.error("POST /api/newsletter/subscribe:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          "An error occurred while subscribing. Please try again in a few minutes.",
      },
      { status: 500 }
    );
  }
}
