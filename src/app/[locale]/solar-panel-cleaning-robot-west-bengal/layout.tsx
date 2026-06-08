import { generateStateLandingMetadata } from "@/lib/seo/state-landing-metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return generateStateLandingMetadata("westBengal", locale);
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
