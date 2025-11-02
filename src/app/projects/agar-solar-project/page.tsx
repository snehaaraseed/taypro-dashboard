import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import { getAllFileProjects, readProjectMetadata } from "@/app/utils/projectFileUtils";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Agar, Madhya Pradesh – 250 MW", href: "" },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Agar, Madhya Pradesh – 250 MW - Solar Panel Cleaning Robot Installation | Taypro",
  description: "Our flagship 250 MW solar power project in Madhya Pradesh with Solar Panel Cleaning Robot installation. Setting new standards in solar energy production with Taypro's advanced robotic cleaning systems.",
  keywords: [
    "Agar Solar Project",
    "250 MW solar project",
    "Madhya Pradesh solar project",
    "Solar Panel Cleaning Robot installation",
    "Taypro flagship project",
    "solar panel cleaning robot project",
    "robotic solar panel cleaning",
  ],
  openGraph: {
    title: "Agar, Madhya Pradesh – 250 MW - Solar Panel Cleaning Robot Installation | Taypro",
    description: "Flagship 250 MW solar power project with Solar Panel Cleaning Robot installation. Setting new standards in solar energy production.",
    images: [`${siteUrl}/tayprosolarfirm/agar-solar.jpg`],
    url: `${siteUrl}/projects/agar-solar-project`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agar, Madhya Pradesh – 250 MW Solar Project with Cleaning Robots",
    description: "Flagship 250 MW solar project with Solar Panel Cleaning Robot installation.",
    images: [`${siteUrl}/tayprosolarfirm/agar-solar.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/projects/agar-solar-project`,
  },
};

export default async function ProjectPage() {
  // Check if project is published
  const metadata = await readProjectMetadata("agar-solar-project");
  if (!metadata || metadata.published === false) {
    notFound();
  }
  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.id !== "agar-solar-project" && p.href !== "/projects/agar-solar-project")
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
              Agar, Madhya Pradesh – 250 MW
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
          image="/tayprosolarfirm/agar-solar.jpg"
          overviewText="Our flagship 250 MW solar power project in Madhya Pradesh, setting new standards in solar energy production."
        />

        
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <BlogContent
              content={"<h2>Project Overview</h2>\n<p>The Agar, Madhya Pradesh Solar Project is our flagship installation and one of the largest solar power facilities in the region, generating an impressive 250 MW of renewable energy. This mega-scale project showcases our comprehensive expertise in designing, implementing, and managing large-scale solar installations.</p>\n\n<h2>Project Scale & Significance</h2>\n<p>As our largest solar installation to date, the Agar project represents a significant investment in India's renewable energy infrastructure. The 250 MW capacity positions it as a cornerstone facility in Madhya Pradesh's clean energy portfolio.</p>\n\n<h2>Advanced Technology Implementation</h2>\n<p>The project leverages cutting-edge solar panel cleaning systems to maintain optimal efficiency:</p>\n<ul>\n<li><strong>Automatic Cleaning Systems:</strong> Fully automated robotic cleaning ensures consistent panel performance</li>\n<li><strong>Intelligent Monitoring:</strong> AI-powered systems track performance metrics in real-time</li>\n<li><strong>Predictive Maintenance:</strong> Advanced analytics predict maintenance needs before issues arise</li>\n<li><strong>Energy Storage Integration:</strong> Integrated storage solutions for consistent power delivery</li>\n</ul>\n\n<h2>Engineering Excellence</h2>\n<p>Our engineering team implemented innovative solutions to maximize energy output while minimizing environmental impact. The site layout was carefully designed to optimize solar capture throughout the day, and the installation incorporates the latest in solar panel technology and inverter systems.</p>\n\n<h2>Economic & Environmental Impact</h2>\n<p>This 250 MW facility provides clean electricity to power hundreds of thousands of homes and businesses. The project has:</p>\n<ul>\n<li>Created hundreds of local employment opportunities during construction and operation</li>\n<li>Significantly reduced carbon emissions in the region</li>\n<li>Contributed to India's ambitious renewable energy goals</li>\n<li>Demonstrated the viability of large-scale solar power generation</li>\n</ul>\n\n<h2>Ongoing Operations</h2>\n<p>The project operates with comprehensive maintenance protocols, ensuring long-term reliability and efficiency. Our dedicated operations team monitors performance metrics, conducts regular cleaning cycles, and implements continuous improvements to optimize energy generation.</p>"}
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

        {relatedProjects.length > 0 && (
          <AllRelatedProjectsSection projects={relatedProjects} />
        )}
      </div>
    </>
  );
}
