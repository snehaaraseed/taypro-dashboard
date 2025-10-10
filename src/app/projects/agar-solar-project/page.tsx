"use client";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import CallbackCard from "@/app/components/CallbackCard";
import { additionalProjects, agarMetrics } from "@/app/data";
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
    name: " Agar, Madhya Pradesh – 250 MW",
    href: "",
  },
];

const categories = [
  { label: "Automatic", href: "/projects/automatic" },
  { label: "Capex", href: "/projects/capex" },
  { label: "Semi-Automatic", href: "/projects/semi-automatic" },
];

export default function AgarSolarProject() {
  const pathname = usePathname();
  const currentSlug = pathname.split("/").pop();

  const otherProjects = additionalProjects.filter(
    (p) => p.href.split("/").pop() !== currentSlug
  );

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {/* Container with responsive side padding and hidden horizontal overflow */}
      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <ProjectHeroSection
          title="Agar, Madhya Pradesh – 250 MW"
          categories={categories}
        />

        <ProjectOverviewSection
          image="/tayprosolarfirm/agar-solar.jpg"
          overviewText="TAYPRO implemented advanced cleaning robotics for 250 MW solar plant..."
        />

        <ProjectDescriptionSection
          title="Higher & Consistent Solar Panel Performance"
          image="/tayprosolarfirm/banda-solar.jpg"
          paragraphs={[
            `The Agar 250 MW Solar Project is a breakthrough in generating more power. By deploying solar cleaning robots, the project addresses the critical challenges of maintaining large-scale solar power plants. `,
            `With Advance dual pass technology and the highest uptime guarantee offered by TAYPRO’s robots, here was significant rise in the overall plant performance ratio. TAYPRO minimised the downtime and delivered const effective solutions to maintain high and consistent power generation.`,
          ]}
        />

        <ProjectQuoteSection
          quote="For the Agar Solar Project, we integrated advanced robotics in solar operations and played a key role in driving the power generation & performance ratio"
          author="Yogesh Kudale, CEO, TAYPRO PRIVATE LIMITED"
        />

        <ProjectKeyMetricsSection
          title="Key Metrics"
          image="/tayprokeymetrics/agar-key-matrix.jpg"
          metrics={agarMetrics}
        />

        <RelatedProjectsSection projects={otherProjects} />

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
