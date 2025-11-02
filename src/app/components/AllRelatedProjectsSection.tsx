"use client";
import Link from "next/link";
import Image from "next/image";

type Project = {
  id: string | number;
  href: string;
  img: string;
  title: string;
  date: string;
};

interface RelatedProjectsSectionProps {
  projects: Project[];
}

function RelatedProjectsSection({
  projects,
}: RelatedProjectsSectionProps) {
  return (
    <section className="w-full bg-white pb-16 sm:pb-20 lg:pb-30 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <h3 className="text-[#0c2f42] font-medium text-2xl sm:text-3xl mb-4 sm:mb-5">
          Related Projects
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={project.href}
              title="Solar Project"
              className="group block"
            >
              <div className="relative w-full h-[200px] sm:h-[240px] lg:h-[280px] mb-4 sm:mb-6 overflow-hidden">
                <Image
                  src={project.img}
                  alt={project.title}
                  title="Solar Project"
                  fill
                  sizes="sm"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(to bottom, rgba(76, 223, 78, 0.5), rgba(121, 226, 80, 0.88))",
                  }}
                />
              </div>
              <h4 className="text-[#9cb01f] font-medium text-lg sm:text-xl lg:text-2xl leading-tight">
                {project.title}
              </h4>
              <div className="text-gray-500 text-xs sm:text-sm">
                {project.date}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RelatedProjectsSection;
export { RelatedProjectsSection as AllRelatedProjectsSection };
