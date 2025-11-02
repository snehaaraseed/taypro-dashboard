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
  { name: "Soyegaon Maharastra – 100 MW", href: "" },
];

export const metadata: Metadata = {
  title: "Soyegaon Maharastra – 100 MW | Taypro",
  description: "A major 100 MW solar power project in Maharashtra, one of our largest installations.",
  openGraph: {
    title: "Soyegaon Maharastra – 100 MW",
    description: "A major 100 MW solar power project in Maharashtra, one of our largest installations.",
    images: ["/tayprosolarfirm/soyegaon-solar.jpg"],
  },
};

export default async function ProjectPage() {
  const allProjects = await getAllFileProjects();
  const relatedProjects = allProjects
    .filter((p) => p.id !== "soyegaon-solar-project" && p.href !== "/projects/soyegaon-solar-project")
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
              Soyegaon Maharastra – 100 MW
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
          image="/tayprosolarfirm/soyegaon-solar.jpg"
          overviewText="A major 100 MW solar power project in Maharashtra, one of our largest installations."
        />

        
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <BlogContent
              content={"<h2>Project Overview</h2>\n<p>The Soyegaon Maharashtra Solar Project is a major 100 MW installation that significantly contributes to the region's renewable energy infrastructure. This large-scale project demonstrates our capability in managing complex solar power installations in Maharashtra's diverse landscape.</p>\n\n<h2>Regional Significance</h2>\n<p>Located in Maharashtra, this 100 MW facility plays a crucial role in the state's renewable energy portfolio. The project showcases how strategic location selection and advanced technology can maximize solar energy generation in various geographical conditions.</p>\n\n<h2>Technical Specifications</h2>\n<ul>\n<li><strong>Generation Capacity:</strong> 100 MW of clean solar power</li>\n<li><strong>Panel Technology:</strong> High-efficiency solar panels with advanced coatings</li>\n<li><strong>Cleaning Systems:</strong> Multi-mode cleaning including automatic and semi-automatic solutions</li>\n<li><strong>Grid Integration:</strong> Seamless integration with Maharashtra's power distribution network</li>\n</ul>\n\n<h2>Innovation & Technology</h2>\n<p>The Soyegaon project incorporates innovative solutions tailored to the regional climate and terrain. Our specialized cleaning robots navigate the site efficiently, ensuring that environmental factors like dust and seasonal variations don't compromise performance.</p>\n\n<p>Key technological features include:</p>\n<ul>\n<li>Weather-resistant panel mounting systems</li>\n<li>Adaptive cleaning schedules based on weather patterns</li>\n<li>Remote monitoring and control systems</li>\n<li>Efficient water management for cleaning operations</li>\n</ul>\n\n<h2>Operational Excellence</h2>\n<p>Our comprehensive maintenance approach ensures consistent performance throughout the year. The operations team implements:</p>\n<ul>\n<li>Regular performance assessments</li>\n<li>Scheduled cleaning and maintenance cycles</li>\n<li>Continuous system optimization</li>\n<li>Proactive issue resolution</li>\n</ul>\n\n<h2>Community & Environmental Benefits</h2>\n<p>Beyond power generation, the Soyegaon project delivers substantial environmental and community benefits. The clean energy produced reduces the region's carbon footprint while creating sustainable employment opportunities and supporting local economic development.</p>"}
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
