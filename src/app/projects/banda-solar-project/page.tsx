"use client";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import CallbackCard from "@/app/components/CallbackCard";
import { additionalProjects, bandaMetrics } from "@/app/data";
import { usePathname } from "next/navigation";
import ProjectHeroSection from "@/app/components/AllProjectsHeroSection";
import ProjectOverviewSection from "@/app/components/AllProjectsOverviewSection";
import ProjectDescriptionSection from "@/app/components/AllProjectsDescriptionSection";
import ProjectQuoteSection from "@/app/components/AllProjectsQuoteSection";
import ProjectKeyMetricsSection from "@/app/components/AllProjectsKeyMetricsSection";
import RelatedProjectsSection from "@/app/components/AllRelatedProjectsSection";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Projects",
    href: "/projects",
  },
  {
    name: "Banda Solar Project – 70 MW",
    href: "",
  },
];

const categories = [
  { label: "Automatic", href: "/projects/automatic" },
  { label: "Capex", href: "/projects/capex" },
  { label: "Semi-Automatic", href: "/projects/semi-automatic" },
];

export default function BandaSolarProject() {
  const pathname = usePathname(); // e.g. "/projects/banda"
  const currentSlug = pathname.split("/").pop();

  const otherProjects = additionalProjects.filter(
    (p) => p.href.split("/").pop() !== currentSlug
  );
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <ProjectHeroSection
          title="Banda Solar Project – 70 MW"
          categories={categories}
        />

        <ProjectOverviewSection
          image="/tayprosolarfirm/banda-solar.jpg"
          overviewText="TAYPRO deployed 106 fully automatic waterless cleaning robots
                  and 54 semi-automatic robots at the Banda Solar Project in
                  Uttar Pradesh. The core objective is to ensure regular and
                  efficient cleaning of solar panels and enhance the performance
                  ratio."
        />

        <ProjectDescriptionSection
          title="Maximized The Energy Generation"
          image="/tayprosolarfirm/banda-project.jpg"
          paragraphs={[
            `At the Banda Solar Power plant TAYPRO integrated high-tech
            robotics to enhance the operational efficiency of the plant.
            A total of 160 solar cleaning robots helped to achieve
            exceptional energy generation.`,
            ` Also, TAYPRO ensured that there was the highest uptime for all the solar cleaning robots to maintain a higher performance ratio and power generation.`,
          ]}
        />

        <ProjectQuoteSection
          quote="We feel proud to deliver the promise of driving performance at Banda Solar Project."
          author="Akshay Auti, CTO, TAYPRO PRIVATE LIMITED"
        />

        <ProjectKeyMetricsSection
          title="Key Metrics"
          image="/tayprokeymetrics/banda-key-matrix.jpg"
          metrics={bandaMetrics}
        />

        <RelatedProjectsSection projects={otherProjects} />

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
