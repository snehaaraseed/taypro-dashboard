import { NextRequest, NextResponse } from "next/server";
import { checkApiRateLimit } from "@/app/utils/rateLimit";
import { ErpNextError } from "@/lib/erpnext/client";
import {
  getRoleFitAssessment,
  submitRoleFitAssessment,
  type AssessmentAnswerInput,
} from "@/lib/erpnext/role-fit-assessment";

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

function normalizeToken(value: unknown): string | null {
  const token = String(value ?? "").trim();
  if (!token || !TOKEN_RE.test(token)) return null;
  return token;
}

function parseAnswers(value: unknown): AssessmentAnswerInput[] | null {
  if (!Array.isArray(value) || value.length === 0) return null;

  const answers: AssessmentAnswerInput[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") return null;
    const row = item as Record<string, unknown>;
    const question = String(row.question ?? "").trim();
    const type = String(row.type ?? "").trim();
    const answer = String(row.answer ?? "").trim();
    if (!question || !type) return null;
    answers.push({ question, type, answer });
  }

  return answers;
}

export async function GET(request: NextRequest) {
  const token = normalizeToken(request.nextUrl.searchParams.get("token"));
  if (!token) {
    return NextResponse.json(
      { success: false, message: "Invalid assessment link." },
      { status: 400 }
    );
  }

  const rateLimit = checkApiRateLimit(request, "careers-assessment");
  if (rateLimit.limited) {
    return NextResponse.json(
      { success: false, message: "Too many requests. Please try again later." },
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

  try {
    const data = await getRoleFitAssessment(token);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ErpNextError) {
      console.error("GET /api/careers/assessment ERPNext:", error.message);
      return NextResponse.json(
        {
          success: false,
          message: "This assessment link is invalid or has expired.",
        },
        { status: error.status === 404 ? 404 : 502 }
      );
    }

    console.error("GET /api/careers/assessment:", error);
    return NextResponse.json(
      { success: false, message: "Could not load assessment." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const rateLimit = checkApiRateLimit(request, "careers-assessment-submit");
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

  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }

  const token = normalizeToken(body.token);
  const answers = parseAnswers(body.answers);

  if (!token) {
    return NextResponse.json(
      { success: false, message: "Invalid assessment link." },
      { status: 400 }
    );
  }

  if (!answers) {
    return NextResponse.json(
      { success: false, message: "Please answer all required questions." },
      { status: 400 }
    );
  }

  for (const row of answers) {
    if (row.type !== "Free Text" && !row.answer) {
      return NextResponse.json(
        { success: false, message: "Please answer all required questions." },
        { status: 400 }
      );
    }
  }

  try {
    const data = await submitRoleFitAssessment(token, answers);
    return NextResponse.json({ success: true, data });
  } catch (error) {
    if (error instanceof ErpNextError) {
      console.error("POST /api/careers/assessment ERPNext:", error.message);
      const message =
        error.status === 417 || error.message.includes("already been submitted")
          ? "This assessment has already been submitted."
          : "We could not submit your assessment. Please try again.";
      return NextResponse.json(
        { success: false, message },
        { status: error.status >= 400 && error.status < 500 ? error.status : 502 }
      );
    }

    console.error("POST /api/careers/assessment:", error);
    return NextResponse.json(
      { success: false, message: "We could not submit your assessment." },
      { status: 500 }
    );
  }
}
