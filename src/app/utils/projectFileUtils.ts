import "server-only";

import { promises as fs } from "fs";
import path from "path";

export interface ProjectMetadata {
  title: string;
  description: string;
  image: string;
  details: string[];
  slug: string;
  date: string;
  createdAt: string;
  published?: boolean; // Defaults to true for backward compatibility
}

export interface ProjectData {
  title: string;
  description: string;
  image: string;
  details: string[];
  date?: string;
  content?: string; // Optional detailed content for project pages
  published?: boolean; // Defaults to true for backward compatibility
}

export function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

/**
 * Generate page.tsx file content for a project
 */
export function generatePageTSX(
  metadata: ProjectMetadata,
  content?: string
): string {
  const dateFormatted = new Date(metadata.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Escape strings for use in template literals
  const escapeForTemplate = (str: string): string => {
    return str
      .replace(/\\/g, "\\\\")
      .replace(/`/g, "\\`")
      .replace(/\${/g, "\\${");
  };

  const escapedTitle = escapeForTemplate(metadata.title);
  const escapedDescription = escapeForTemplate(metadata.description);
  const escapedImage = escapeForTemplate(metadata.image);
  // For content, we need to properly escape it for use in JSX template literal
  const escapedContent = content ? JSON.stringify(content) : "";

  const detailsString = JSON.stringify(metadata.details);

  return `import { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "${escapedTitle}", href: "" },
];

export const metadata: Metadata = {
  title: "${escapedTitle} - Solar Panel Cleaning Robot Installation Project | Taypro",
  description: "${escapedDescription} Learn about our Solar Panel Cleaning Robot installation at this solar power plant. Discover how Taypro's robotic cleaning systems enhance efficiency and ROI.",
  keywords: [
    "Solar Panel Cleaning Robot installation",
    "${escapedTitle}",
    "solar panel cleaning robot project",
    "Taypro solar project",
    "robotic solar panel cleaning",
    "automatic solar panel cleaning",
  ],
  openGraph: {
    title: "${escapedTitle} - Solar Panel Cleaning Robot Installation | Taypro",
    description: "${escapedDescription} Taypro Solar Panel Cleaning Robot installation project.",
    images: ["${escapedImage}"],
    url: \`\${siteUrl}/projects/${metadata.slug}\`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "${escapedTitle} - Solar Panel Cleaning Robot Project",
    description: "${escapedDescription}",
    images: ["${escapedImage}"],
  },
  alternates: {
    canonical: \`\${siteUrl}/projects/${metadata.slug}\`,
  },
};

export default async function ProjectPage() {
  // Check if project is published
  const { readProjectMetadata } = await import("@/app/utils/projectFileUtils");
  const metadata_check = await readProjectMetadata("${metadata.slug}");
  
  // Return 404 for drafts
  if (metadata_check && metadata_check.published === false) {
    const { notFound } = await import("next/navigation");
    notFound();
  }

  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.slug !== "${metadata.slug}")
    .slice(0, 3);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section
          className="bg-white min-h-[50vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/tayprobglayout/taypro-project.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="pt-10">
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              ${escapedTitle}
            </h1>
            <p className="text-[#A8C117] text-center text-[18px] mb-4">
              Solar Panel Cleaning Robot Installation Project
            </p>
          </div>

          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <AllProjectsOverviewSection
          image="${escapedImage}"
          overviewText="${escapedDescription}"
        />

        ${escapedContent ? `
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <BlogContent
              content={${escapedContent}}
              className="prose prose-lg max-w-none space-y-5
               prose-headings:text-[#052638]
               prose-headings:font-semibold
               prose-p:text-gray-700
               prose-p:leading-relaxed
               prose-a:text-blue-600
               prose-a:hover:text-blue-800
               prose-strong:text-[#052638]
               prose-ul:text-gray-700
               prose-ol:text-gray-700
               prose-li:text-gray-700
               prose-blockquote:border-l-4
               prose-blockquote:border-blue-500
               prose-blockquote:pl-4
               prose-blockquote:italic
               prose-code:bg-gray-100
               prose-code:px-2
               prose-code:py-1
               prose-code:rounded"
            />
          </div>
        </article>
        ` : ""}

        {relatedProjects.length > 0 && (
          <AllRelatedProjectsSection projects={relatedProjects} />
        )}
      </div>
    </>
  );
}
`;
}

/**
 * Get the projects directory path
 */
function getProjectsDir(): string {
  return path.join(process.cwd(), "src", "app", "projects");
}

/**
 * Create project files (metadata.json and page.tsx)
 */
export async function createProjectFiles(
  projectData: ProjectData
): Promise<{ slug: string }> {
  const slug = createSlug(projectData.title);
  const projectDir = path.join(getProjectsDir(), slug);

  // Create directory if it doesn't exist
  await fs.mkdir(projectDir, { recursive: true });

  const metadata: ProjectMetadata = {
    title: projectData.title,
    description: projectData.description,
    image: projectData.image,
    details: projectData.details || [],
    slug: slug,
    date: projectData.date || new Date().toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    published: projectData.published !== undefined ? projectData.published : true,
  };

  // Write metadata.json
  const metadataPath = path.join(projectDir, "metadata.json");
  await fs.writeFile(
    metadataPath,
    JSON.stringify(metadata, null, 2),
    "utf-8"
  );

  // Write page.tsx
  const pagePath = path.join(projectDir, "page.tsx");
  const pageContent = generatePageTSX(metadata, projectData.content);
  await fs.writeFile(pagePath, pageContent, "utf-8");

  return { slug };
}

/**
 * Read project metadata
 */
export async function readProjectMetadata(
  slug: string
): Promise<ProjectMetadata | null> {
  try {
    const metadataPath = path.join(getProjectsDir(), slug, "metadata.json");
    const fileContent = await fs.readFile(metadataPath, "utf-8");
    return JSON.parse(fileContent) as ProjectMetadata;
  } catch (error) {
    console.error(`Error reading project metadata for ${slug}:`, error);
    return null;
  }
}

/**
 * Read project content from page.tsx
 */
export async function readProjectContent(slug: string): Promise<string> {
  try {
    const pagePath = path.join(getProjectsDir(), slug, "page.tsx");
    const fileContent = await fs.readFile(pagePath, "utf-8");

    // First, try to extract content from BlogContent component
    // The content is stored as content={"..."} where the string is a JSON-encoded string
    // Look for BlogContent component and extract its content prop value
    const blogContentStart = fileContent.indexOf('<BlogContent');
    if (blogContentStart !== -1) {
      // Find the content prop after BlogContent
      const contentPropStart = fileContent.indexOf('content={', blogContentStart);
      if (contentPropStart !== -1) {
        // Extract from the opening brace after content={
        const braceStart = contentPropStart + 9; // length of 'content={'
        let currentPos = braceStart;
        
        // Skip whitespace
        while (currentPos < fileContent.length && /\s/.test(fileContent[currentPos])) {
          currentPos++;
        }
        
        // Check if it starts with a quote (JSON string)
        if (fileContent[currentPos] === '"') {
          // Find the matching closing quote (accounting for escaped quotes)
          // The JSON string ends with a quote followed by whitespace and then }
          let endQuoteIndex = -1;
          let escaped = false;
          let i = currentPos + 1;
          
          while (i < fileContent.length) {
            const char = fileContent[i];
            
            if (escaped) {
              // After an escape, reset the flag and continue
              escaped = false;
              i++;
              continue;
            }
            
            if (char === '\\') {
              // Next character is escaped
              escaped = true;
              i++;
              continue;
            }
            
            if (char === '"') {
              // Found a quote - check if it's the closing quote
              // Look ahead to see if it's followed by whitespace and then } or className
              let j = i + 1;
              // Skip whitespace (including newlines)
              while (j < fileContent.length && /[\s\n\r]/.test(fileContent[j])) {
                j++;
              }
              // If we find a } or className after whitespace, this is the closing quote
              if (j < fileContent.length) {
                if (fileContent[j] === '}' || fileContent.substring(j, j + 9) === 'className') {
                  endQuoteIndex = i;
                  break;
                }
              }
              // Otherwise, this might be an escaped quote in the content, continue
            }
            
            i++;
          }
          
          if (endQuoteIndex > 0) {
            // Extract the JSON string (including the quotes)
            const jsonStr = fileContent.substring(currentPos, endQuoteIndex + 1);
            try {
              // Parse the JSON string to get the actual HTML content
              const parsed = JSON.parse(jsonStr);
              return parsed;
            } catch (parseError) {
              console.warn(`Error parsing BlogContent JSON for ${slug}:`, parseError);
              // Try to extract as raw string if JSON parsing fails
              return jsonStr.slice(1, -1); // Remove surrounding quotes
            }
          }
        }
      }
    }

    // Fallback: try to extract from overviewText prop (for older projects without BlogContent)
    const match = fileContent.match(/overviewText="([^"]*)"/);
    if (match && match[1]) {
      // Unescape the content
      return match[1]
        .replace(/\\`/g, "`")
        .replace(/\\\$/g, "$")
        .replace(/\\\\/g, "\\");
    }

    // Last fallback: try to extract from description
    const descMatch = fileContent.match(/description="([^"]*)"/);
    if (descMatch && descMatch[1]) {
      return descMatch[1]
        .replace(/\\`/g, "`")
        .replace(/\\\$/g, "$")
        .replace(/\\\\/g, "\\");
    }

    return "";
  } catch (error) {
    console.error(`Error reading project content for ${slug}:`, error);
    return "";
  }
}

/**
 * Update project files
 */
export async function updateProjectFiles(
  slug: string,
  projectData: ProjectData,
  newSlug?: string
): Promise<{ slug: string }> {
  const oldProjectDir = path.join(getProjectsDir(), slug);
  const finalSlug = newSlug || slug;
  const newProjectDir = path.join(getProjectsDir(), finalSlug);

  // Read existing metadata to preserve createdAt
  const existingMetadata = await readProjectMetadata(slug);
  const createdAt = existingMetadata?.createdAt || new Date().toISOString();

  const metadata: ProjectMetadata = {
    title: projectData.title,
    description: projectData.description,
    image: projectData.image,
    details: projectData.details || [],
    slug: finalSlug,
    date: projectData.date || existingMetadata?.date || new Date().toISOString().split("T")[0],
    createdAt: createdAt,
    published: projectData.published !== undefined ? projectData.published : (existingMetadata?.published !== undefined ? existingMetadata.published : true),
  };

  // If slug changed, move the directory
  if (slug !== finalSlug) {
    // Create new directory
    await fs.mkdir(newProjectDir, { recursive: true });

    // Write new files
    const metadataPath = path.join(newProjectDir, "metadata.json");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    const pagePath = path.join(newProjectDir, "page.tsx");
    const pageContent = generatePageTSX(metadata, projectData.content);
    await fs.writeFile(pagePath, pageContent, "utf-8");

    // Remove old directory
    await fs.rm(oldProjectDir, { recursive: true, force: true });
  } else {
    // Update existing files
    const metadataPath = path.join(oldProjectDir, "metadata.json");
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    const pagePath = path.join(oldProjectDir, "page.tsx");
    const pageContent = generatePageTSX(metadata, projectData.content);
    await fs.writeFile(pagePath, pageContent, "utf-8");
  }

  return { slug: finalSlug };
}

/**
 * Delete project files
 */
export async function deleteProjectFiles(slug: string): Promise<void> {
  const projectDir = path.join(getProjectsDir(), slug);
  await fs.rm(projectDir, { recursive: true, force: true });
}

/**
 * Get all file-based projects
 */
export async function getAllFileProjects(): Promise<
  Array<{
    id: string;
    img: string;
    title: string;
    details: string[];
    href: string;
    date: string;
  }>
> {
  try {
    const projectsDir = getProjectsDir();
    const entries = await fs.readdir(projectsDir, { withFileTypes: true });

    const projects = await Promise.all(
      entries
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          try {
            const metadata = await readProjectMetadata(entry.name);
            if (!metadata) return null;

            // Filter out drafts (only show published projects, defaulting to true)
            if (metadata.published === false) {
              return null;
            }

            return {
              id: metadata.slug,
              img: metadata.image,
              title: metadata.title,
              details: metadata.details,
              href: `/projects/${metadata.slug}`,
              date: metadata.date,
            };
          } catch (error) {
            console.error(`Error reading project ${entry.name}:`, error);
            return null;
          }
        })
    );

    return projects.filter((p) => p !== null) as Array<{
      id: string;
      img: string;
      title: string;
      details: string[];
      href: string;
      date: string;
    }>;
  } catch (error) {
    console.error("Error getting all file projects:", error);
    return [];
  }
}

