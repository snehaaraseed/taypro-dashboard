import { getTranslations } from "next-intl/server";
import { Container } from "./Container";
import ProjectsGrid from "./ProjectsGrid";
import type { ProjectGridItem } from "@/lib/cms/project-card-display";

interface RelatedProjectsSectionProps {
  projects: ProjectGridItem[];
}

export async function AllRelatedProjectsSection({
  projects,
}: RelatedProjectsSectionProps) {
  const t = await getTranslations("ProjectDetailPage");

  return (
    <section className="w-full bg-white pb-16 sm:pb-20 lg:pb-24 overflow-x-hidden">
      <Container>
        <h3 className="text-[#052638] font-semibold text-2xl sm:text-3xl mb-10 md:mb-12">
          {t("relatedHeading")}
        </h3>
        <ProjectsGrid projects={projects} columns={3} />
      </Container>
    </section>
  );
}

export default AllRelatedProjectsSection;
