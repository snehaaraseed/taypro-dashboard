import ProjectsFilterPage from "@/app/components/ProjectsFilterPage";

export default async function ProjectSemiAutomaticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProjectsFilterPage variant="semiAutomatic" locale={locale} />;
}
