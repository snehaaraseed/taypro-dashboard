import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { revalidateSitemap } from "@/lib/seo/revalidate-sitemap";
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
    const saveAsDraft = body.saveAsDraft !== false;
    const focusedKeywords = parseFocusedKeywords(
      body.focusedKeywords ?? body.keywords
    );
    const seoKeyword = focusedKeywords[0] || topic;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }
    if (!brief) {
      return NextResponse.json(
        { error: "Description or brief is required" },
        { status: 400 }
      );
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

        revalidatePath(`/projects/${savedSlug}`);
        revalidatePath("/projects");
        revalidatePath("/admin/projects");
        revalidateSitemap();

        return NextResponse.json({
          success: true,
          message: "Project generated and saved as draft",
          project: {
            ...generated,
            slug: savedSlug,
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
