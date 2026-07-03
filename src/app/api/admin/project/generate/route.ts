import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidatePublicContent } from "@/lib/seo/revalidate-public-content";
import { generateProjectContent } from "@/lib/aiService";
import { isRetryableGenerationError } from "@/lib/seo/content-quality";
import { formatEditorialContextPrompt } from "@/lib/seo/editorial-context";
import { pickBlogFeaturedImage } from "@/lib/seo/blog-image-picker";
import { enrichBlogContentWithInlineImages } from "@/lib/seo/blog-inline-images";
import {
  createProjectFiles,
  createSlug,
  readProjectMetadata,
} from "@/lib/cms/projectService";
import { pickRandomBlogAuthor } from "@/lib/cms/authorService";
import { assertProjectDraftUnique } from "@/lib/seo/project-uniqueness";
import { requireAuth } from "@/app/utils/auth";
import { runProjectImprove } from "@/lib/cms/run-project-improve";
import { enrichFactsWithRegionalContext } from "@/lib/cms/project-regional-context";
import { createEmptySectionsJson } from "@/lib/seo/project-content-outline";
import type { ProjectFactsJson } from "@/lib/cms/project-facts-types";

const MAX_GENERATION_ATTEMPTS = 3;

export const maxDuration = 600;

function parseFocusedKeywords(input: unknown): string[] {
  if (Array.isArray(input)) {
    return input
      .map((k) => (typeof k === "string" ? k.trim() : ""))
      .filter(Boolean);
  }
  if (typeof input === "string") {
    return input
      .split(/[,;\n]+/)
      .map((k) => k.trim())
      .filter(Boolean);
  }
  return [];
}

function parseStructuredFacts(input: unknown): ProjectFactsJson | null {
  if (!input || typeof input !== "object") return null;
  return input as ProjectFactsJson;
}

export async function POST(request: NextRequest) {
  const authResponse = await requireAuth(request);
  if (authResponse) return authResponse;

  try {
    const body = await request.json();
    const topic = typeof body.topic === "string" ? body.topic.trim() : "";
    const brief =
      typeof body.brief === "string"
        ? body.brief.trim()
        : typeof body.description === "string"
          ? body.description.trim()
          : "";
    const structuredFacts = parseStructuredFacts(body.structuredFacts);
    const saveAsDraft = body.saveAsDraft !== false;
    const focusedKeywords = parseFocusedKeywords(
      body.focusedKeywords ?? body.keywords
    );
    const seoKeyword = focusedKeywords[0] || topic;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    if (!brief && !structuredFacts) {
      return NextResponse.json(
        { error: "Description/brief or structuredFacts is required" },
        { status: 400 }
      );
    }

    if (structuredFacts) {
      const bylineAuthor = await pickRandomBlogAuthor();
      const facts = enrichFactsWithRegionalContext({
        ...structuredFacts,
        primaryKeyword: seoKeyword,
      });
      const sections = createEmptySectionsJson(facts);
      const draftSlug = createSlug(topic);

      const improved = await runProjectImprove({
        slug: draftSlug,
        title: topic,
        description: brief || topic,
        content: "",
        details: [],
        image: "",
        imageAlt: "",
        published: false,
        facts,
        sections,
        editorialStatus: "ai_draft",
        seoKeyword,
      });

      if (await readProjectMetadata(draftSlug)) {
        throw new Error(
          "Generated title overlaps an existing project. Adjust the topic and try again."
        );
      }

      await assertProjectDraftUnique({
        title: improved.title,
        description: improved.description,
        slug: draftSlug,
      });

      const featured = await pickBlogFeaturedImage({
        title: improved.title,
        description: improved.description,
        seoKeyword,
        category: "Project case study",
      });

      const { slug: savedSlug } = await createProjectFiles({
        title: improved.title,
        description: improved.description,
        image: featured.url,
        imageAlt: featured.alt,
        details: improved.details,
        content: improved.content,
        facts: improved.facts,
        sections: improved.sections,
        editorialStatus: "ai_draft",
        seoKeyword,
        author: bylineAuthor.name,
        date: new Date().toISOString().split("T")[0],
        published: false,
      });

      revalidatePath("/admin/projects");
      await revalidatePublicContent([`/projects/${savedSlug}`, "/projects"], {
        sitemap: true,
      });

      return NextResponse.json({
        success: true,
        message: "Project generated from structured facts",
        project: {
          slug: savedSlug,
          adminUrl: `/admin/projects/${savedSlug}/edit`,
          status: "draft",
        },
      });
    }

    const editorialContext = await formatEditorialContextPrompt();
    const bylineAuthor = await pickRandomBlogAuthor();
    const category = "Project case study";
    let lastError: unknown;

    for (let genAttempt = 0; genAttempt < MAX_GENERATION_ATTEMPTS; genAttempt++) {
      try {
        const projectData = await generateProjectContent(
          topic,
          editorialContext,
          {
            userBrief: brief,
            focusedKeywords,
            author: bylineAuthor,
            preferQualityModel: genAttempt >= 1,
          }
        );

        if (
          !projectData.title ||
          !projectData.description ||
          !projectData.content
        ) {
          throw new Error("Failed to generate complete project content");
        }

        const slug = createSlug(projectData.title);
        if (await readProjectMetadata(slug)) {
          throw new Error(
            "Generated title overlaps an existing project. Adjust the topic or brief and try again."
          );
        }

        await assertProjectDraftUnique({
          title: projectData.title,
          description: projectData.description,
          slug,
        });

        const featured = await pickBlogFeaturedImage({
          title: projectData.title,
          description: projectData.description,
          seoKeyword,
          category,
        });

        const { content: contentWithImages, inlineImage } =
          await enrichBlogContentWithInlineImages({
            content: projectData.content,
            title: projectData.title,
            description: projectData.description,
            seoKeyword,
            category,
            featured,
          });

        const generated = {
          title: projectData.title,
          description: projectData.description,
          details: projectData.details,
          content: contentWithImages,
          image: featured.url,
          imageAlt: featured.alt,
          slug,
          author: bylineAuthor.name,
          authorSlug: bylineAuthor.slug,
          authorRole: bylineAuthor.role,
          imageSource: featured.source,
          imageMode: featured.mode,
          inlineImage: inlineImage?.url,
          inlineImageSource: inlineImage?.source,
        };

        if (!saveAsDraft) {
          return NextResponse.json({
            success: true,
            message: "Project content generated",
            project: generated,
          });
        }

        const { slug: savedSlug } = await createProjectFiles({
          title: projectData.title,
          description: projectData.description,
          image: featured.url,
          imageAlt: featured.alt,
          details: projectData.details,
          content: contentWithImages,
          author: bylineAuthor.name,
          date: new Date().toISOString().split("T")[0],
          published: false,
        });

        const savedMetadata = await readProjectMetadata(savedSlug);

        revalidatePath("/admin/projects");
        await revalidatePublicContent([`/projects/${savedSlug}`, "/projects"], {
          sitemap: true,
        });

        return NextResponse.json({
          success: true,
          message: "Project generated and saved as draft",
          project: {
            ...generated,
            slug: savedSlug,
            codename: savedMetadata?.codename ?? null,
            displayTitle: savedMetadata?.displayTitle,
            adminUrl: `/admin/projects/${savedSlug}/edit`,
            status: "draft",
          },
        });
      } catch (error) {
        lastError = error;
        if (
          isRetryableGenerationError(error) &&
          genAttempt < MAX_GENERATION_ATTEMPTS - 1
        ) {
          console.warn(
            `Admin project generation attempt ${genAttempt + 1} rejected, retrying:`,
            error instanceof Error ? error.message : error
          );
          continue;
        }
        throw error;
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new Error("Project generation failed");
  } catch (error) {
    console.error("Error in POST /api/admin/project/generate:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}
