import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  deletePressQueueItem,
  requeuePressQueueItem,
  updatePressQueueItem,
  type PressQueueAngle,
} from "@/lib/press/press-release-queue";

const ANGLES: PressQueueAngle[] = [
  "product_launch",
  "milestone",
  "award",
  "partnership",
  "deployment",
];

interface RouteParams {
  params: Promise<{ id: string }>;
}

function parseFacts(value: unknown): string[] | undefined {
  if (value === undefined) return undefined;
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

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { id } = await params;
    const body = await request.json();

    if (body.requeue === true) {
      const result = requeuePressQueueItem(id);
      if (!result.success) {
        return NextResponse.json(
          { error: result.error ?? "Requeue failed" },
          { status: result.error === "Queue item not found" ? 404 : 400 }
        );
      }
      return NextResponse.json({ success: true, item: result.item });
    }

    const angle = body.angle as PressQueueAngle | undefined;
    if (angle !== undefined && !ANGLES.includes(angle)) {
      return NextResponse.json({ error: "Invalid angle" }, { status: 400 });
    }

    const result = updatePressQueueItem(id, {
      angle,
      titleHint:
        typeof body.titleHint === "string" ? body.titleHint : undefined,
      summary: typeof body.summary === "string" ? body.summary : undefined,
      facts: parseFacts(body.facts),
      quoteAttribution:
        typeof body.quoteAttribution === "string"
          ? body.quoteAttribution
          : undefined,
      status:
        body.status === "pending" ||
        body.status === "done" ||
        body.status === "skipped"
          ? body.status
          : undefined,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Update failed" },
        { status: result.error === "Queue item not found" ? 404 : 400 }
      );
    }

    return NextResponse.json({ success: true, item: result.item });
  } catch (error) {
    console.error("PATCH /api/admin/press/queue/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { id } = await params;
    const result = deletePressQueueItem(id);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error ?? "Delete failed" },
        { status: result.error === "Queue item not found" ? 404 : 400 }
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/admin/press/queue/[id]:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
