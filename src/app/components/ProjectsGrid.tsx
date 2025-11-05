"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimateOnScroll } from "./AnimateOnScroll";

type Project = {
  id: string;
  title: string;
  img: string;
  href: string;
  details?: string[];
};

export default function ProjectsGrid({ projects }: { projects: Project[] }) {
  if (projects.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No projects available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {projects.map((project, idx) => (
        <AnimateOnScroll key={project.id} animation="scaleIn" delay={idx * 150}>
          <div className="relative z-0 w-full group overflow-hidden cursor-pointer min-h-[300px] sm:min-h-[400px] md:min-h-[600px]">
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
        </AnimateOnScroll>
      ))}
    </div>
  );
}

