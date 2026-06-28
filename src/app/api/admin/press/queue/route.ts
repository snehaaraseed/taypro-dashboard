import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  addPressQueueItem,
  loadPressReleaseQueue,
  type CreatePressQueueInput,
  type PressQueueAngle,
} from "@/lib/press/press-release-queue";

const ANGLES: PressQueueAngle[] = [
  "product_launch",
  "milestone",
  "award",
  "partnership",
  "deployment",
];

function parseFacts(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((f) => (typeof f === "string" ? f : "")).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  }
  return [];
}

export async function GET(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const items = loadPressReleaseQueue();
    return NextResponse.json({ items, angles: ANGLES });
  } catch (error) {
    console.error("GET /api/admin/press/queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const angle = body.angle as PressQueueAngle;
    if (!ANGLES.includes(angle)) {
      return NextResponse.json({ error: "Invalid angle" }, { status: 400 });
    }

    const input: CreatePressQueueInput = {
      id: typeof body.id === "string" ? body.id : undefined,
      angle,
      titleHint: typeof body.titleHint === "string" ? body.titleHint : "",
      summary: typeof body.summary === "string" ? body.summary : "",
      facts: parseFacts(body.facts),
      quoteAttribution:
        typeof body.quoteAttribution === "string"
          ? body.quoteAttribution
          : undefined,
    };

    const result = addPressQueueItem(input);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Failed to add queue item" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, item: result.item });
  } catch (error) {
    console.error("POST /api/admin/press/queue:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
