import { Container } from "./Container";
import ProjectsGrid from "./ProjectsGrid";
import type { ProjectGridItem } from "@/lib/cms/project-card-display";
import type { ProjectsGridLayout } from "@/lib/cms/project-card-display";

interface ProjectsCardProps extends ProjectsGridLayout {
  showHeader?: boolean;
  headerText?: React.ReactNode;
  projects: ProjectGridItem[];
  className?: string;
  backgroundClassName?: string;
}

export default function ProjectsCard({
  showHeader = false,
  headerText,
  projects,
  featuredFirst = false,
  columns = 2,
  className,
  backgroundClassName = "bg-white",
}: ProjectsCardProps) {
  return (
    <section
      className={`py-16 md:py-20 overflow-x-hidden ${backgroundClassName}`.trim()}
    >
      <Container>
        {showHeader && headerText ? (
          <h2 className="text-[#052638] font-semibold text-2xl md:text-3xl lg:text-4xl text-center mb-12 md:mb-16 max-w-4xl mx-auto leading-tight">
            {headerText}
          </h2>
        ) : null}

        <ProjectsGrid
          projects={projects}
          featuredFirst={featuredFirst}
          columns={columns}
          className={className}
        />
      </Container>
    </section>
  );
}
