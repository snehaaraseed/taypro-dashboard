import Image from "next/image";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import ProjectsCardServer from "../components/ProjectsCardServer";

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
              Solar Panel Cleaning Robot Installation Projects
              <br />
              <span className="text-[#A8C117] text-[20px] font-normal">
                Sustainable Energy Solutions
              </span>
            </h1>
          </div>

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
          {projects.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No projects available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative z-0 w-full group overflow-hidden cursor-pointer min-h-[300px] sm:min-h-[400px] md:min-h-[600px]"
                >
                  <div className="absolute inset-0">
                    <Image
                      src={project.img}
                      alt={`${project.title} - Solar Panel Cleaning Robot Installation Project by Taypro`}
                      title={`${project.title} Solar Project with Solar Panel Cleaning Robot`}
                      fill
                      className="object-cover transform group-hover:scale-105 transition duration-300"
                      sizes="(max-width: 768px) 100vw, 50vw"
                      priority
                    />
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-transparent group-hover:bg-blue-900/30 transition duration-300 pointer-events-none" />

                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition duration-300" />

                  <div className="absolute inset-0 border border-white transition duration-300 ease-out scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100" />

                  <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
                    <Link
                      href={project.href}
                      title="Solar Project"
                      className="text-white text-2xl sm:text-3xl mb-3 drop-shadow-md font-semibold hover:text-[#A8C117] transition-colors duration-300"
                    >
                      <h4>{project.title}</h4>
                    </Link>

                    {project.details && project.details.length > 0 && (
                      <div
                        className="
      flex flex-wrap justify-center gap-3 text-[#A8C117]
      text-sm sm:text-lg md:text-xl font-medium
      opacity-100 translate-y-0
      md:opacity-0 md:translate-y-4
      md:group-hover:opacity-100 md:group-hover:translate-y-0
      transition duration-300
    "
                        style={{
                          transitionTimingFunction:
                            "cubic-bezier(0.4,0.4,0.2,0.5)",
                        }}
                      >
                        {project.details.map((item, index) => {
                          return (
                            <Link
                              key={index}
                              href={`/projects/${item.toLowerCase().toString()}`}
                              title="Solar Project"
                              className="hover:underline hover:text-[#c3d958] transition-colors duration-300"
                            >
                              {item}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </>
  );
}
