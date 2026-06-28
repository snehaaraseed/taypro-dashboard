import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import {
  buildIntentRegistryAdminSummary,
  loadKeywordIntentRegistryPreview,
  syncKeywordIntentRegistryFromPublishedTopics,
} from "@/lib/seo/keyword-intent-registry";
import { listGscIntentGapsForKeyword } from "@/lib/seo/gsc-intent-opportunities";
import { INTENT_FAMILY_ORDER } from "@/lib/seo/keyword-intent-taxonomy";
import { getSemanticRegistryAdminSummary } from "@/lib/seo/semantic-intent-registry";
import { listSemanticDomains } from "@/lib/seo/semantic-topic-coordinates";
import { moneyPageClustersForAdmin } from "@/lib/seo/money-page-clusters";

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  try {
    const sync = request.nextUrl.searchParams.get("sync") === "true";
    if (sync) {
      await syncKeywordIntentRegistryFromPublishedTopics();
    }

    const registry = loadKeywordIntentRegistryPreview();
    const keywords = buildIntentRegistryAdminSummary().map((row) => ({
      ...row,
      uncoveredFamilies: INTENT_FAMILY_ORDER.filter(
        (f) => !row.coveredFamilies.includes(f)
      ),
      gscGaps: listGscIntentGapsForKeyword(row.keyword).filter((g) => !g.covered),
    }));

    return NextResponse.json({
      updatedAt: registry.updatedAt,
      keywordCount: keywords.length,
      keywords,
      moneyPageClusters: moneyPageClustersForAdmin(),
      semanticDomains: listSemanticDomains().map((d) => ({
        id: d.id,
        label: d.label,
        subAngleCount: d.subAngles.length,
      })),
      semanticRegistry: getSemanticRegistryAdminSummary(),
    });
  } catch (error) {
    console.error("[intent-registry] GET failed:", error);
    return NextResponse.json(
      { error: "Failed to load intent registry" },
      { status: 500 }
    );
  }
}
