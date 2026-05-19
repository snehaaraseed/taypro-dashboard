import ProjectsFilterPage from "@/app/components/ProjectsFilterPage";

export default async function ProjectCapexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProjectsFilterPage variant="capex" locale={locale} />;
}
