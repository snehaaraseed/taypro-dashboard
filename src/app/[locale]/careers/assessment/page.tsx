import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/app/components/Container";
import RoleFitAssessmentForm from "@/app/components/RoleFitAssessmentForm";

export const dynamic = "force-dynamic";

const TOKEN_RE = /^[A-Za-z0-9_-]{16,128}$/;

type AssessmentPageProps = {
  searchParams: Promise<{ token?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Role Fit Assessment | Taypro Careers",
    robots: { index: false, follow: false },
  };
}

export default async function RoleFitAssessmentPage({
  searchParams,
}: AssessmentPageProps) {
  const t = await getTranslations("CareersPage.assessment");
  const { token: rawToken } = await searchParams;
  const token = String(rawToken ?? "").trim();

  if (!token || !TOKEN_RE.test(token)) {
    return (
      <main className="bg-white py-16">
        <Container>
          <div className="mx-auto max-w-xl rounded-xl border border-gray-200 bg-[#f4f7f9] p-8 text-center">
            <h1 className="mb-3 text-2xl font-semibold text-[#052638]">
              {t("invalidLinkTitle")}
            </h1>
            <p className="mb-6 text-[#27415c]">{t("invalidLinkMessage")}</p>
            <Link
              href="/careers"
              className="inline-flex rounded-lg bg-[#052638] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0a3a4a]"
            >
              {t("backToCareers")}
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  return (
    <main className="bg-white py-16">
      <Container>
        <div className="mx-auto max-w-2xl">
          <RoleFitAssessmentForm token={token} />
        </div>
      </Container>
    </main>
  );
}
