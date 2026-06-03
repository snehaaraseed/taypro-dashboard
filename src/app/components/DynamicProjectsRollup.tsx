import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Container } from "./Container";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";

interface DynamicProjectsRollupProps {
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  limit?: number;
  background?: "white" | "cream";
  showViewAll?: boolean;
}

/**
 * Server-rendered project case-study grid that reads from
 * `src/app/projects/*` on every request, so newly published
 * projects appear automatically anywhere this component is used.
 */
export default async function DynamicProjectsRollup({
  eyebrow = "Deployed at utility scale",
  heading = "Solar Panel Cleaning Robots already at work across India",
  subheading = "Taypro robots clean panels at multi-megawatt plants across India. A small sample of recent installations is below.",
  limit = 4,
  background = "cream",
  showViewAll = true,
}: DynamicProjectsRollupProps) {
  const projects = await getAllFileProjects();

  if (!projects || projects.length === 0) return null;

  const sorted = [...projects]
    .sort(
      (a, b) =>
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    )
    .slice(0, limit);

  if (sorted.length === 0) return null;

  const bgClass = background === "white" ? "bg-white" : "bg-[#f4f1e9]";

  return (
    <section className={`${bgClass} py-16 sm:py-20`}>
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
          {eyebrow && (
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {eyebrow}
            </div>
          )}
          {heading && (
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl leading-tight">
              {heading}
            </h2>
          )}
          {subheading && (
            <p className="text-gray-600 text-base sm:text-lg max-w-3xl mx-auto mt-5">
              {subheading}
            </p>
          )}
        </AnimateOnScroll>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {sorted.map((project, idx) => (
            <AnimateOnScroll
              key={project.id}
              animation="fadeInUp"
              delay={idx * 80}
              className="bg-white rounded-lg overflow-hidden shadow-sm flex flex-col h-full"
            >
              <Link
                href={project.href}
                title={`${project.title}, Solar Panel Cleaning Robot deployment`}
                className="relative aspect-[4/3] w-full overflow-hidden block"
              >
                <Image
                  src={project.img}
                  alt={`${project.title}, Solar Panel Cleaning Robot deployment by Taypro`}
                  title={project.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover hover:scale-105 transition-transform duration-300"
                />
              </Link>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="text-[#052638] font-semibold text-base sm:text-lg leading-snug mb-2">
                  <Link
                    href={project.href}
                    className="hover:text-[#A8C117] transition-colors"
                  >
                    {project.title}
                  </Link>
                </h3>
                {project.details && project.details.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {project.details.map((tag: string) => (
                      <span
                        key={tag}
                        className="inline-flex items-center text-xs font-medium bg-[#A8C117]/15 text-[#052638] px-2 py-1 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  href={project.href}
                  className="mt-auto inline-flex items-center gap-1 text-[#A8C117] font-medium text-sm hover:underline"
                >
                  View case study
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </AnimateOnScroll>
          ))}
        </div>

        {showViewAll && (
          <AnimateOnScroll animation="fadeInUp" className="text-center mt-10">
            <Link
              href="/projects"
              className="inline-flex items-center justify-center bg-[#052638] text-white font-medium px-7 py-3.5 rounded-md hover:bg-[#0c3d56] transition"
            >
              See all solar projects
            </Link>
          </AnimateOnScroll>
        )}
      </Container>
    </section>
  );
}
