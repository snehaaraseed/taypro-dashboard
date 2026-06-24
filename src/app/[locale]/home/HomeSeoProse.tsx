import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Container } from "@/app/components/Container";

export default async function HomeSeoProse() {
  const t = await getTranslations("Home.seoProse");

  return (
    <section
      className="py-10 md:py-12 bg-white border-b border-gray-100"
      aria-labelledby="home-seo-prose-heading"
    >
      <Container>
        <h2
          id="home-seo-prose-heading"
          className="text-[#052638] font-semibold text-2xl md:text-3xl mb-4"
        >
          {t("heading")}
        </h2>
        <p className="text-[#27415c] text-base md:text-lg leading-relaxed max-w-4xl mb-4">
          {t("bodyBeforeHub")}{" "}
          <Link
            href="/solar-panel-cleaning-system"
            className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
          >
            {t("hubLink")}
          </Link>
          {t("bodyBetweenHubService")}{" "}
          <Link
            href="/solar-panel-cleaning-system/solar-panel-cleaning-service"
            className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
          >
            {t("serviceLink")}
          </Link>
          {t("bodyBetweenServiceCalculator")}{" "}
          <Link
            href="/solar-panel-cleaning-robot-price-calculator"
            className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
          >
            {t("calculatorLink")}
          </Link>
          {t("bodyAfterCalculator")}
        </p>
      </Container>
    </section>
  );
}
