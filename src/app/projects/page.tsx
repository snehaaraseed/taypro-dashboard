import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { CollectionPageSchema } from "@/app/components/StructuredData";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import ProjectsGrid from "../components/ProjectsGrid";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Projects",
    href: "",
  },
];

export default async function ProjectPage() {
  const projects = await getAllFileProjects();

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name="Solar Panel Cleaning Robot Installation Projects"
        description="View our portfolio of solar panel cleaning robot installation projects across India. Explore successful deployments of automatic, semi-automatic, and CAPEX model solar panel cleaning robots."
        siteUrl={siteUrl}
        url={`${siteUrl}/projects`}
      />
      <div className="min-h-screen">
        <section
          className="bg-white min-h-[50vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/tayprobglayout/taypro-project.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <AnimateOnScroll animation="fadeInUp" className="pt-10">
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              Solar Panel Cleaning Robot Installation Projects
              <br />
              <span className="text-[#A8C117] text-[20px] font-normal">
                Sustainable Energy Solutions
              </span>
            </h1>
          </AnimateOnScroll>

          {/* Add curve SVG or image beneath the form */}
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

        <section className="px-4 sm:px-6 lg:px-30 py-10 overflow-x-hidden">
          <ProjectsGrid projects={projects} />
        </section>
      </div>
    </>
  );
}
