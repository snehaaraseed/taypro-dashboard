import ProjectsFilterPage from "@/app/components/ProjectsFilterPage";

export default async function ProjectOpexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <ProjectsFilterPage variant="opex" locale={locale} />;
}
