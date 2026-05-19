import ProjectsFilterPage from "@/app/components/ProjectsFilterPage";

export default async function ProjectAutomaticPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProjectsFilterPage variant="automatic" locale={locale} />;
}
