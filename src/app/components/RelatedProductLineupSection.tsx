import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";
import ProductLineupRow from "@/app/components/ProductLineupRow";
import type { ProductLineupRobot } from "@/lib/products/build-product-lineup";

export type RelatedProductLineupSectionProps = {
  headingId: string;
  robots: ProductLineupRobot[];
  eyebrow?: string;
  title?: string;
  subheading?: ReactNode;
  sectionClassName?: string;
};

const lineupShellClass =
  "mx-auto w-full max-w-7xl px-6 sm:px-10 lg:px-14 xl:px-16";

export default async function RelatedProductLineupSection({
  headingId,
  robots,
  eyebrow,
  title,
  subheading,
  sectionClassName = "py-14 md:py-20 bg-white",
}: RelatedProductLineupSectionProps) {
  if (robots.length === 0) return null;

  const t = await getTranslations("Common");

  return (
    <section className={sectionClassName} aria-labelledby={headingId}>
      <Container>
        <div className={lineupShellClass}>
          {eyebrow || title || subheading ? (
            <AnimateOnScroll animation="fadeInUp" className="mb-8 md:mb-10">
              {eyebrow ? (
                <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                  {eyebrow}
                </p>
              ) : null}
              {title ? (
                <h2
                  id={headingId}
                  className="text-[#052638] font-semibold text-3xl md:text-[35px] mb-3 leading-tight"
                >
                  {title}
                </h2>
              ) : (
                <h2 id={headingId} className="sr-only">
                  Related products
                </h2>
              )}
              {subheading ? (
                <div className="text-[#27415c] text-base md:text-lg leading-relaxed max-w-3xl">
                  {subheading}
                </div>
              ) : null}
            </AnimateOnScroll>
          ) : (
            <h2 id={headingId} className="sr-only">
              Related products
            </h2>
          )}

          <div>
            {robots.map((robot, idx) => (
              <AnimateOnScroll
                key={`${robot.model}-${robot.href}`}
                animation="fadeInUp"
                delay={idx * 50}
              >
                <ProductLineupRow
                  model={robot.model}
                  marketingName={robot.marketingName}
                  description={robot.description}
                  href={robot.href}
                  topViewPath={robot.topViewPath}
                  topViewWidth={robot.topViewWidth}
                  topViewHeight={robot.topViewHeight}
                  layout={robot.lineupLayout}
                  exploreLabel={t("productLineup.exploreCta", { model: robot.model })}
                  priority={idx === 0}
                />
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
