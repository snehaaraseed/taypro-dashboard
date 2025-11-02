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
  { name: "Yadgir Solar Project – 50 MW", href: "" },
];

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "Yadgir Solar Project – 50 MW - Solar Panel Cleaning Robot Installation | Taypro",
  description: "A 50 MW solar power project in Yadgir with Solar Panel Cleaning Robot installation. Contributing to India's renewable energy goals with Taypro's advanced robotic cleaning systems for optimal solar panel efficiency.",
  keywords: [
    "Yadgir Solar Project",
    "50 MW solar project",
    "Solar Panel Cleaning Robot installation",
    "Yadgir solar power plant",
    "Taypro solar project",
    "solar panel cleaning robot project",
    "robotic solar panel cleaning",
  ],
  openGraph: {
    title: "Yadgir Solar Project – 50 MW - Solar Panel Cleaning Robot Installation | Taypro",
    description: "50 MW solar power project in Yadgir with Solar Panel Cleaning Robot installation contributing to India's renewable energy goals.",
    images: [`${siteUrl}/tayprosolarfirm/yadgir-solar.jpg`],
    url: `${siteUrl}/projects/yadgir-solar-project`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yadgir Solar Project – 50 MW with Solar Panel Cleaning Robots",
    description: "50 MW solar project in Yadgir with Solar Panel Cleaning Robot installation.",
    images: [`${siteUrl}/tayprosolarfirm/yadgir-solar.jpg`],
  },
  alternates: {
    canonical: `${siteUrl}/projects/yadgir-solar-project`,
  },
};

export default async function ProjectPage() {
  // Check if project is published
  const metadata = await readProjectMetadata("yadgir-solar-project");
  if (!metadata || metadata.published === false) {
    notFound();
  }
  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.id !== "yadgir-solar-project" && p.href !== "/projects/yadgir-solar-project")
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
              Yadgir Solar Project – 50 MW
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
          image="/tayprosolarfirm/yadgir-solar.jpg"
          overviewText="A 50 MW solar power project in Yadgir contributing to India's renewable energy goals."
        />

        
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <BlogContent
              content={"<h2>Project Overview</h2>\n<p>The Yadgir Solar Project is a strategic 50 MW installation that contributes meaningfully to India's renewable energy goals. This well-designed facility demonstrates our expertise in creating efficient and reliable solar power solutions tailored to regional requirements.</p>\n\n<h2>Project Highlights</h2>\n<p>Located in Yadgir, this 50 MW solar installation represents a carefully planned investment in clean energy infrastructure. The project showcases our ability to deliver efficient solar solutions that balance capacity, reliability, and cost-effectiveness.</p>\n\n<h2>Technology & Infrastructure</h2>\n<p>The Yadgir project leverages advanced solar panel cleaning technology to maintain optimal efficiency:</p>\n<ul>\n<li><strong>Automated Cleaning:</strong> State-of-the-art robotic cleaning systems ensure consistent panel performance</li>\n<li><strong>Smart Monitoring:</strong> Integrated monitoring systems track performance in real-time</li>\n<li><strong>Flexible Operation:</strong> Support for automatic, semi-automatic, and manual cleaning modes</li>\n<li><strong>Reliable Infrastructure:</strong> Robust installation designed for long-term operation</li>\n</ul>\n\n<h2>Maintenance & Operations</h2>\n<p>The project benefits from our comprehensive maintenance protocols. The advanced cleaning robots maintain panel cleanliness, ensuring maximum sunlight capture and conversion efficiency. Regular monitoring and maintenance activities include:</p>\n<ul>\n<li>Automated daily cleaning cycles</li>\n<li>Performance data analysis</li>\n<li>Preventive maintenance checks</li>\n<li>System optimization based on performance metrics</li>\n</ul>\n\n<h2>Performance & Efficiency</h2>\n<p>Through our advanced cleaning technology and operational excellence, the Yadgir project consistently achieves high performance levels. The automated cleaning systems play a crucial role in maintaining optimal efficiency, especially in environments where dust and debris can impact panel performance.</p>\n\n<h2>Contributing to India's Energy Goals</h2>\n<p>This 50 MW facility actively contributes to India's ambitious renewable energy targets. By generating clean electricity and demonstrating the viability of solar power, the Yadgir project serves as a model for future renewable energy installations across the country.</p>\n\n<p>The project not only provides clean energy but also supports regional development through employment opportunities and demonstrates our commitment to sustainable energy solutions.</p>"}
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
