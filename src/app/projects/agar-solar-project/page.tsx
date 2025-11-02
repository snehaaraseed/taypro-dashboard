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
  { name: "Agar, Madhya Pradesh – 250 MW", href: "" },
];

export const metadata: Metadata = {
  title: "Agar, Madhya Pradesh – 250 MW | Taypro",
  description: "Our flagship 250 MW solar power project in Madhya Pradesh, setting new standards in solar energy production.",
  openGraph: {
    title: "Agar, Madhya Pradesh – 250 MW",
    description: "Our flagship 250 MW solar power project in Madhya Pradesh, setting new standards in solar energy production.",
    images: ["/tayprosolarfirm/agar-solar.jpg"],
  },
};

export default async function ProjectPage() {
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
            <h1 className="text-[#A8C117] text-center text-[16px] mb-4">
              Sustainable Projects
            </h1>
            <h2 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              Agar, Madhya Pradesh – 250 MW
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
          image="/tayprosolarfirm/agar-solar.jpg"
          overviewText="Our flagship 250 MW solar power project in Madhya Pradesh, setting new standards in solar energy production."
        />

        
        {/* Detailed Content Section */}
        <article className="w-full pb-20 bg-white">
          <div className="max-w-4xl mx-auto px-6">
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
