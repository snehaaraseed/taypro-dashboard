import { getTranslations } from "next-intl/server";
import { Container } from "@/app/components/Container";

type FaqItem = { question: string; answer: string };

type HomeFaqServerProps = {
  faqs: FaqItem[];
};

export default async function HomeFaqServer({ faqs }: HomeFaqServerProps) {
  const t = await getTranslations("Home.faq");

  return (
    <section
      className="w-full py-14 md:py-20 bg-white"
      aria-labelledby="home-faq-heading"
    >
      <Container size="narrow">
        <div className="text-center mb-10">
          <h2
            id="home-faq-heading"
            className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
          >
            {t("heading")}
          </h2>
          <p className="text-[#27415c] text-lg leading-relaxed">{t("subheading")}</p>
        </div>
        <dl className="space-y-6">
          {faqs.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-gray-200 bg-[#f8fafb] p-5 md:p-6"
            >
              <dt className="text-[#052638] font-semibold text-lg mb-2">
                {faq.question}
              </dt>
              <dd className="text-[#27415c] text-sm md:text-base leading-relaxed">
                {faq.answer}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
