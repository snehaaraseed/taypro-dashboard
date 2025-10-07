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

export default function RelatedProjectsSection({
  projects,
}: RelatedProjectsSectionProps) {
  return (
    <section className="w-full bg-white pb-30">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-[#0c2f42] font-medium text-3xl mb-5">
          Related Projects
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Link key={project.id} href={project.href} className="group block">
              <div className="relative w-full h-[280px] mb-6 overflow-hidden">
                <Image
                  src={project.img}
                  alt={project.title}
                  fill
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
              <div className="text-[#9cb01f] font-medium text-2xl leading-tight">
                {project.title}
              </div>
              <div className="text-gray-500 text-sm">{project.date}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
