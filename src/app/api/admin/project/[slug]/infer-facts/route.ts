import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { readProjectFull } from "@/lib/cms/projectService";
import {
  parseProjectFactsFromCms,
  parseFactsJson,
} from "@/lib/cms/project-facts";
import { enrichFactsWithRegionalContext, getRegionalContext } from "@/lib/cms/project-regional-context";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const { slug } = await params;
    const body = (await request.json().catch(() => ({}))) as {
      facts?: Record<string, unknown>;
    };

    const project = await readProjectFull(slug);
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const base =
      body.facts && Object.keys(body.facts).length > 0
        ? { ...parseProjectFactsFromCms(project), ...(body.facts as object) }
        : parseFactsJson(project.factsJson) ??
          parseProjectFactsFromCms({
            title: project.title,
            description: project.description,
            details: project.details,
            content: project.content,
            seoKeyword: project.seoKeyword,
          });

    const facts = enrichFactsWithRegionalContext(base);
    const regional = facts.state ? getRegionalContext(facts.state) : null;

    return NextResponse.json({
      success: true,
      facts,
      regional,
    });
  } catch (error) {
    console.error("POST infer-facts:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Infer facts failed",
      },
      { status: 500 }
    );
  }
}
