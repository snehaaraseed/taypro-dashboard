import { NextRequest, NextResponse } from "next/server";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { getBlogImageProvider } from "@/lib/seo/blog-image-generate";
import { shouldUseProductLibraryImage } from "@/lib/seo/blog-image-strategy";
import { isAutomationAuthorized } from "@/lib/security";

export const maxDuration = 120;

const SCENARIOS = {
  product: {
    title:
      "Managing Performance Ratio Losses: Why a Solar Panel Cleaning Robot Beats Manual Labor",
    description:
      "Compare Taypro robot cleaning vs manual labor for 50MW+ utility plants in India.",
    seoKeyword: "solar panel cleaning robot",
    category: "Robot Models & Features",
  },
  educational: {
    title:
      "How Dust and Soiling Reduce Solar Plant Performance Ratio in Summer",
    description:
      "Technical guide on soiling losses, cleaning frequency, and PR monitoring for 50MW+ sites in India.",
    seoKeyword: "solar panel soiling",
    category: "O&M Best Practices",
  },
} as const;

/** Dev-only: exercise library vs AI image generation without generating a full blog. */
export async function POST(request: NextRequest) {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!isAutomationAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as {
    scenario?: keyof typeof SCENARIOS;
  };
  const scenario = body.scenario === "product" ? "product" : "educational";
  const input = SCENARIOS[scenario];

  const useLibrary = shouldUseProductLibraryImage(input);
  const start = Date.now();
  const image = await pickBlogFeaturedImage(input);

  return NextResponse.json({
    scenario,
    useLibrary,
    imageProvider: getBlogImageProvider(),
    durationMs: Date.now() - start,
    image,
  });
}
