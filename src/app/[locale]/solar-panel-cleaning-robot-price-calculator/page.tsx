import { getTranslations } from "next-intl/server";
import {
  FAQPageSchema,
  SoftwareApplicationSchema,
} from "@/app/components/StructuredData";
import { RoiExampleScenarios } from "@/app/components/RoiExampleScenarios";
import { SITE_URL } from "@/lib/seo/sitemap-config";
import CalculatorPageClient from "./CalculatorPageClient";

const siteUrl = SITE_URL;
const CALCULATOR_PATH = "/solar-panel-cleaning-robot-price-calculator";
const FAQ_KEYS = ["0", "1", "2", "3", "4", "5", "6"] as const;

export default async function SolarPanelCleaningRobotPriceCalculatorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "PriceCalculatorPage" });

  const calculatorFaqs = FAQ_KEYS.map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  return (
    <>
      <SoftwareApplicationSchema
        name={t("schema.softwareName")}
        description={t("schema.softwareDescription")}
        image="/tayproasset/taypro-robotImage.png"
        applicationCategory="BusinessApplication"
        operatingSystem="Web"
        url={`${siteUrl}${CALCULATOR_PATH}`}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={calculatorFaqs} />
      <CalculatorPageClient
        exampleScenarios={<RoiExampleScenarios locale={locale} />}
      />
    </>
  );
}
