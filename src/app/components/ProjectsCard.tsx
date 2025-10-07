import Image from "next/image";
import { projects } from "../data";
import Link from "next/link";

interface ProjectsCardProps {
  showHeader?: boolean;
  headerText?: React.ReactNode;
}

export default function ProjectsCard({
  showHeader = false,
  headerText,
}: ProjectsCardProps) {
  return (
    <section className="mx-auto px-30 py-10 bg-white">
      {showHeader && (
        <div className="text-3xl text-center bg-white lg:text-6xl lg:text-3xl py-15 font-semibold">
          {headerText || (
            <>
              Our Most Recent <br /> Projects
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {projects.map((project) => (
          <div
            key={project.title}
            className="relative z-0 w-full group overflow-hidden cursor-pointer"
            style={{ minHeight: "600px" }}
          >
            <Image
              src={project.img}
              alt={project.title}
              width={400}
              height={600}
              className="w-full h-full transform group-hover:scale-105 transition duration-300"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-transparent group-hover:bg-blue-900/30 transition duration-300 pointer-events-none" />

            {/* Dark overlay */}
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition duration-300" />

            {/* Animated border */}
            <div className="absolute inset-5 border border-white transition duration-300 ease-out scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:border-white" />

            {/* Title + Details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
              <Link href={project.href}>
                <div className="text-white text-3xl md:text-3xl mb-3 drop-shadow-md font-semibold">
                  {project.title}
                </div>
              </Link>

              <div
                className="flex flex-wrap justify-center gap-3 text-[#A8C117] text-lg md:text-xl font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.4, 0.4, 0.2, 0.5)",
                }}
              >
                {project.details.split(", ").map((item) => (
                  <Link
                    key={item}
                    href={`/projects/${item
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                    className="hover:underline hover:text-[#c3d958] transition-colors duration-300"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="border border-[#cbd2d0] mt-5"></div>
    </section>
  );
}
