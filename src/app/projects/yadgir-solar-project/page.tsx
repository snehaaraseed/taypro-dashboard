"use client";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import CallbackCard from "@/app/components/CallbackCard";
import { additionalProjects, yadgirMetrics } from "@/app/data";
import { usePathname } from "next/navigation";
import ProjectHeroSection from "@/app/components/AllProjectsHeroSection";
import ProjectOverviewSection from "@/app/components/AllProjectsOverviewSection";
import ProjectDescriptionSection from "@/app/components/AllProjectsDescriptionSection";
import ProjectQuoteSection from "@/app/components/AllProjectsQuoteSection";
import ProjectKeyMetricsSection from "@/app/components/AllProjectsKeyMetricsSection";
import RelatedProjectsSection from "@/app/components/AllRelatedProjectsSection";
import SEO from "@/app/components/SEO";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Projects",
    href: "/projects",
  },
  {
    name: "Yadgir Solar Project – 50 MW",
    href: "",
  },
];

const categories = [
  { label: "Automatic", href: "/projects/automatic" },
  { label: "Capex", href: "/projects/capex" },
  { label: "Semi-Automatic", href: "/projects/semi-automatic" },
];

export default function YadgirSolarProject() {
  const pathname = usePathname(); // e.g. "/projects/banda"
  const currentSlug = pathname.split("/").pop();

  const otherProjects = additionalProjects.filter(
    (p) => p.href.split("/").pop() !== currentSlug
  );
  return (
    <>
      <SEO
        title="Yadgir Solar Project"
        description="TAYPRO deployed 96 fully automatic waterless cleaning robots
                 and 19 semi-automatic robots at the Yadgir Solar Project in
                  Karnataka. The objective was to achieve optimal solar panel
                 efficiency and a consistent performance ratio."
        keywords="yadgir solar, taypro solar projects, maximum energy generation, net zero goals, cutting-edge technology"
        url="http://localhost:3000/projects/yadgir-solar-project"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <ProjectHeroSection
          title="Yadgir Solar Project – 50 MW"
          categories={categories}
        />

        <ProjectOverviewSection
          image="/yadgir-solar.jpg"
          overviewText="TAYPRO deployed 96 fully automatic waterless cleaning robots
                 and 19 semi-automatic robots at the Yadgir Solar Project in
                  Karnataka. The objective was to achieve optimal solar panel
                 efficiency and a consistent performance ratio."
        />

        <ProjectDescriptionSection
          title="Maximized The Energy Generation"
          image="/solar-panel.jpg"
          paragraphs={[
            ` TAYPRO strategised and deployed advanced waterless cleaning
                    systems to deliver high power generation efficiency. The key
                   achievements of this project were significant reduction in the operation costs and improved energy output.`,
            ` TAYPRO’s advanced cleaning solutions achieved remarkable
                     results for minimising the downtime and reduced manual
                     intervention which resulted in increased efficiency and
                    operation optimization.`,
          ]}
        />

        <ProjectQuoteSection
          quote="What we implemented at Yadgir Solar Plant is a prime
                   example of how technology can help in meeting the net zero
                   goals."
          author="Abhishek Masurkar, CMO, TAYPRO PRIVATE LIMITED"
        />

        <ProjectKeyMetricsSection
          title="Key Metrics"
          image="/yadgir-key-matrix.jpg"
          metrics={yadgirMetrics}
        />

        <RelatedProjectsSection projects={otherProjects} />

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
