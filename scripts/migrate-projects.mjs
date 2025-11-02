import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Existing projects from data.ts - using exact slugs from hrefs
const existingProjects = [
  {
    slug: "banda-solar-project",
    title: "Banda Solar Project – 70 MW",
    description: "A large-scale solar power project in Banda generating 70 MW of clean energy.",
    image: "/tayprosolarfirm/banda-solar.jpg",
    details: ["Automatic", "Capex", "Semi-Automatic"],
    date: "2025-01-28",
    content: "The Banda Solar Project is a 70 MW solar power installation that showcases our expertise in large-scale renewable energy solutions. This project demonstrates our commitment to sustainable energy production and environmental conservation.",
  },
  {
    slug: "yadgir-solar-project",
    title: "Yadgir Solar Project – 50 MW",
    description: "A 50 MW solar power project in Yadgir contributing to India's renewable energy goals.",
    image: "/tayprosolarfirm/yadgir-solar.jpg",
    details: ["Automatic", "Capex", "Semi-Automatic"],
    date: "2025-01-28",
    content: "The Yadgir Solar Project represents a significant milestone in our portfolio. This 50 MW installation leverages advanced solar panel cleaning technology to maintain optimal efficiency and maximize energy output.",
  },
  {
    slug: "soyegaon-solar-project",
    title: "Soyegaon Maharastra – 100 MW",
    description: "A major 100 MW solar power project in Maharashtra, one of our largest installations.",
    image: "/tayprosolarfirm/soyegaon-solar.jpg",
    details: ["Automatic", "Capex", "Semi-Automatic"],
    date: "2025-01-28",
    content: "The Soyegaon Maharashtra project is a testament to our capability in managing large-scale solar installations. With 100 MW capacity, this project significantly contributes to the region's renewable energy infrastructure.",
  },
  {
    slug: "agar-solar-project",
    title: "Agar, Madhya Pradesh – 250 MW",
    description: "Our flagship 250 MW solar power project in Madhya Pradesh, setting new standards in solar energy production.",
    image: "/tayprosolarfirm/agar-solar.jpg",
    details: ["Automatic", "Capex", "Semi-Automatic"],
    date: "2022-05-27",
    content: "The Agar, Madhya Pradesh project is our largest solar installation to date. This 250 MW facility demonstrates our expertise in designing and managing mega-scale renewable energy projects. The project utilizes cutting-edge solar panel cleaning systems to ensure maximum efficiency and long-term sustainability.",
  },
];

function createSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

function escapeForTemplate(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\${/g, "\\${");
}

function generatePageTSX(metadata, content) {
  const escapedTitle = escapeForTemplate(metadata.title);
  const escapedDescription = escapeForTemplate(metadata.description);
  const escapedImage = escapeForTemplate(metadata.image);
  const escapedContent = content ? escapeForTemplate(content) : "";

  return `import { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "${escapedTitle}", href: "" },
];

export const metadata: Metadata = {
  title: "${escapedTitle} | Taypro",
  description: "${escapedDescription}",
  openGraph: {
    title: "${escapedTitle}",
    description: "${escapedDescription}",
    images: ["${escapedImage}"],
  },
};

export default async function ProjectPage() {
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
            <h1 className="text-[#A8C117] text-center text-[16px] mb-4">
              Sustainable Projects
            </h1>
            <h2 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              ${escapedTitle}
            </h2>
          </div>

          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <AllProjectsOverviewSection
          image="${escapedImage}"
          overviewText="${escapedContent || escapedDescription}"
        />

        {relatedProjects.length > 0 && (
          <AllRelatedProjectsSection projects={relatedProjects} />
        )}
      </div>
    </>
  );
}
`;
}

async function migrateProjects() {
  const projectsDir = path.join(process.cwd(), "src", "app", "projects");

  for (const project of existingProjects) {
    const slug = project.slug || createSlug(project.title);
    const projectDir = path.join(projectsDir, slug);

    // Create directory if it doesn't exist
    await fs.mkdir(projectDir, { recursive: true });

    // Check if metadata.json already exists (meaning it's already migrated)
    const metadataPath = path.join(projectDir, "metadata.json");
    try {
      await fs.access(metadataPath);
      console.log(`⚠️  Project "${project.title}" already has metadata.json, skipping...`);
      continue;
    } catch {
      // metadata.json doesn't exist, proceed with creation
    }

    const metadata = {
      title: project.title,
      description: project.description,
      image: project.image,
      details: project.details,
      slug: slug,
      date: project.date,
      createdAt: new Date().toISOString(),
    };

    // Write metadata.json (metadataPath already declared above)
    await fs.writeFile(
      metadataPath,
      JSON.stringify(metadata, null, 2),
      "utf-8"
    );

    // Write page.tsx
    const pagePath = path.join(projectDir, "page.tsx");
    const pageContent = generatePageTSX(metadata, project.content);
    await fs.writeFile(pagePath, pageContent, "utf-8");

    console.log(`✅ Created project: ${project.title} (${slug})`);
  }

  console.log("\n✨ Migration complete!");
}

migrateProjects().catch(console.error);

