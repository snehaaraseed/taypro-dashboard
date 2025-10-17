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
    <section className="py-10 pb-40 bg-white px-4 sm:px-6 lg:px-30 max-w-full overflow-x-hidden mx-auto">
      {showHeader &&
        (headerText ? (
          <h3 className="text-2xl text-center bg-white lg:text-4xl py-15 font-semibold">
            {headerText}
          </h3>
        ) : (
          <h2 className="text-3xl text-center bg-white lg:text-6xl py-15 font-semibold">
            Our Most Recent <br /> Projects
          </h2>
        ))}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-full">
        {projects.map((project) => (
          <div
            key={project.title}
            className="relative z-0 w-full group overflow-hidden cursor-pointer min-h-[300px] sm:min-h-[400px] md:min-h-[600px]"
          >
            <div className="absolute inset-0">
              <Image
                src={project.img}
                alt={project.title}
                title="Solar Project"
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

            {/* Animated border */}
            <div className="absolute inset-5 border border-white transition duration-300 ease-out scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:border-white" />

            {/* Title + Details */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
              <Link title="Solar Project" href={project.href}>
                <h4 className="text-white text-3xl md:text-3xl mb-3 drop-shadow-md font-semibold">
                  {project.title}
                </h4>
              </Link>

              <div
                className="flex flex-wrap justify-center gap-3 text-[#A8C117] text-lg md:text-xl font-medium opacity-100 translate-y-0 md:opacity-0 md:translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300"
                style={{
                  transitionTimingFunction: "cubic-bezier(0.4, 0.4, 0.2, 0.5)",
                }}
              >
                {project.details.split(", ").map((item) => (
                  <Link
                    key={item}
                    title="Solar Project"
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
