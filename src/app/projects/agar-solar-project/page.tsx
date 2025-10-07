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
import SEO from "@/app/components/SEO";

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
  { label: "Automatic", href: "/automatic" },
  { label: "Capex", href: "/capex" },
  { label: "Semi-Automatic", href: "/semi-automatic" },
];

export default function AgarSolarProject() {
  const pathname = usePathname(); // e.g. "/projects/banda"
  const currentSlug = pathname.split("/").pop();

  const otherProjects = additionalProjects.filter(
    (p) => p.href.split("/").pop() !== currentSlug
  );
  return (
    <>
      <SEO
        title="Agar Solar Project"
        description="The Agar 250 MW Solar Project is a breakthrough in generating more power. By deploying solar cleaning robots, the project addresses the critical challenges of maintaining large-scale solar power plants."
        url="http://localhost:3000/projects/agar-solar-project"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen">
        <ProjectHeroSection
          title="Agar, Madhya Pradesh – 250 MW"
          categories={categories}
        />

        <ProjectOverviewSection
          image="/agar-solar.jpg"
          overviewText="TAYPRO implemented advanced cleaning robotics for 250 MW solar plant in Madhya Pradesh. We implemented 240 fully automatic waterless cleaning robots and 32 semi-automatic robots. These advanced solar cleaning robots played a key role in enhancing the overall plant efficiency and minimising resource consumption."
        />

        <ProjectDescriptionSection
          title="Higher & Consistent Solar Panel Performance"
          image="/banda-solar.jpg"
          paragraphs={[
            `The Agar 250 MW Solar Project is a breakthrough in generating more power. By deploying solar cleaning robots, the project addresses the critical challenges of maintaining large-scale solar power plants.`,
            `With Advance dual pass technology and the highest uptime guarantee offered by TAYPRO’s robots, here was significant rise in the overall plant performance ratio. TAYPRO minimised the downtime and delivered const effective solutions to maintain high and consistent power generation.`,
          ]}
        />

        <ProjectQuoteSection
          quote="For the Agar Solar Project, we integrated advanced robotics in solar operations and played a key role in driving the power generation & performance ratio"
          author="Yogesh Kudale, CEO, TAYPRO PRIVATE LIMITED"
        />

        <ProjectKeyMetricsSection
          title="Key Metrics"
          image="/agar-key-matrix.jpg"
          metrics={agarMetrics}
        />

        <RelatedProjectsSection projects={otherProjects} />

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
