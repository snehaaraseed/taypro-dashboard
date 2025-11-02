import { Metadata } from "next";
import Image from "next/image";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { AllProjectsOverviewSection } from "@/app/components/AllProjectsOverviewSection";
import { AllRelatedProjectsSection } from "@/app/components/AllRelatedProjectsSection";
import { BlogContent } from "@/app/components/BlogContent";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Banda Solar Project – 70 MW", href: "" },
];

export const metadata: Metadata = {
  title: "Banda Solar Project – 70 MW | Taypro",
  description: "A large-scale solar power project in Banda generating 70 MW of clean energy.",
  openGraph: {
    title: "Banda Solar Project – 70 MW",
    description: "A large-scale solar power project in Banda generating 70 MW of clean energy.",
    images: ["/tayprosolarfirm/banda-solar.jpg"],
  },
};

export default async function ProjectPage() {
  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.slug !== "banda-solar-project")
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
              Banda Solar Project – 70 MW
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
          image="/tayprosolarfirm/banda-solar.jpg"
          overviewText="A large-scale solar power project in Banda generating 70 MW of clean energy."
        />

        
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <BlogContent
              content={"<h2>Project Overview</h2>\n<p>The Banda Solar Project represents a significant milestone in renewable energy infrastructure, generating 70 MW of clean electricity to power thousands of homes and businesses. Located in the strategic region of Banda, this large-scale installation demonstrates our expertise in managing complex solar power projects.</p>\n\n<h2>Key Features</h2>\n<ul>\n<li><strong>Capacity:</strong> 70 MW of solar power generation</li>\n<li><strong>Technology:</strong> State-of-the-art solar panel technology with advanced cleaning systems</li>\n<li><strong>Maintenance:</strong> Automated cleaning robots ensure optimal efficiency throughout the year</li>\n<li><strong>Environmental Impact:</strong> Significant reduction in carbon emissions contributing to India's renewable energy goals</li>\n</ul>\n\n<h2>Implementation Details</h2>\n<p>The project utilizes cutting-edge solar panel cleaning technology, including both automatic and semi-automatic cleaning systems. This ensures maximum efficiency by maintaining clean panels that can capture and convert sunlight at optimal rates.</p>\n\n<p>Our comprehensive maintenance approach includes:</p>\n<ul>\n<li>Regular automated cleaning cycles</li>\n<li>Performance monitoring and optimization</li>\n<li>Preventive maintenance protocols</li>\n<li>24/7 monitoring systems</li>\n</ul>\n\n<h2>Impact & Benefits</h2>\n<p>This 70 MW installation contributes significantly to the regional power grid, reducing dependence on fossil fuels and promoting sustainable energy practices. The project creates local employment opportunities and supports the region's economic development while advancing India's renewable energy targets.</p>"}
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
