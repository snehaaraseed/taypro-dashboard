"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { additionalProjects } from "@/app/data";
import { ItemListSchema } from "@/app/components/StructuredData";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export type ProjectsFilterVariant = "automatic" | "semiAutomatic" | "capex";

const SCHEMA_IDS: Record<ProjectsFilterVariant, string> = {
  automatic: "item-list-schema-projects-automatic",
  semiAutomatic: "item-list-schema-projects-semi-automatic",
  capex: "item-list-schema-projects-capex",
};

export default function ProjectsFilterPage({
  variant,
}: {
  variant: ProjectsFilterVariant;
}) {
  const t = useTranslations("ProjectsFilterPage");
  const tCommon = useTranslations("Common");

  const breadcrumbs = [
    { name: tCommon("breadcrumbHome"), href: "/" },
    { name: t("breadcrumbProjects"), href: "/projects" },
    { name: t(`${variant}.breadcrumb`), href: "" },
  ];

  const itemListEntries = additionalProjects.map((card) => ({
    name: card.title,
    url: card.href,
    image: card.img,
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ItemListSchema
        scriptId={SCHEMA_IDS[variant]}
        name={t(`${variant}.schemaName`)}
        description={t(`${variant}.schemaDescription`)}
        items={itemListEntries}
        siteUrl={siteUrl}
      />
      <section className="w-full pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <h1 className="text-[#052638] text-4xl md:text-5xl mb-4 font-semibold">
            {t(`${variant}.title`)}
          </h1>
          <p className="text-[#6B7280] text-lg mb-8">
            {t(`${variant}.description`)}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {additionalProjects.map((card, idx) => (
              <Link
                href={card.href}
                key={idx}
                title={t("projectLinkTitle")}
                className="block border border-gray-300 p-4 overflow-hidden group"
              >
                <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                  <Image
                    src={card.img}
                    alt={`${card.title} - ${t(`${variant}.imageAltSuffix`)}`}
                    title={`${card.title} - ${t(`${variant}.imageTitleSuffix`)}`}
                    fill
                    sizes="sm"
                    className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                    priority
                  />
                  <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                    <h3 className="text-sm font-semibold bg-opacity-10 px-3 transition-transform duration-300 group-hover:-translate-y-3">
                      {card.title}
                    </h3>
                    <p className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300 text-white/90">
                      {card.date}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
