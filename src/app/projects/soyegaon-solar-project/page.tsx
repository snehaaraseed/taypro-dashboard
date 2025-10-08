"use client";

import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import CallbackCard from "@/app/components/CallbackCard";
import { additionalProjects, soyegaonMetrics } from "@/app/data";
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
    name: "Soyegaon Solar Project – 100 MW",
    href: "",
  },
];

const categories = [
  { label: "Automatic", href: "/projects/automatic" },
  { label: "Capex", href: "/projects/capex" },
  { label: "Semi-Automatic", href: "/projects/semi-automatic" },
];

export default function SoyegaonSolarProject() {
  const pathname = usePathname(); // e.g. "/projects/banda"
  const currentSlug = pathname.split("/").pop();

  const otherProjects = additionalProjects.filter(
    (p) => p.href.split("/").pop() !== currentSlug
  );
  return (
    <>
      <SEO
        title="Soyegaon Maharashtra"
        description="The Soygaon Solar Project required a solution to maximise the power generation and performance ratio. TAYPRO’s automatic and semi-automatic robots were meticulously deployed to deliver high-speed cleaning for autonomous cleaning for large-scale panel areas. Also, the semi-automatic robots focused on intricate cleaning requirements."
        keywords="soyegaon solar, soyegaon maharashtra, taypro solar projects, solar panel efficiency, power generation, cutting-edge technology"
        url="http://localhost:3000/projects/soyegaon-solar-project"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />

      <div className="min-h-screen overflow-x-hidden px-4 sm:px-6 lg:px-0">
        <ProjectHeroSection
          title="Soyegaon Solar Project – 100 MW"
          categories={categories}
        />

        <ProjectOverviewSection
          image="/soyegaon-solar.jpg"
          overviewText="TAYPRO deployed a total of 90 solar cleaning robots at the Soygaon Solar Project In Maharashtra. This included 54 Automatic Robots for high-speed autonomous cleaning and 36 Semi-Automated Robots for precision-based cleaning."
        />

        <ProjectDescriptionSection
          title="Enhanced solar panel efficiency and reduced operational costs."
          image="/taypro-soyegaon-mh.jpg"
          paragraphs={[
            `The Soygaon Solar Project required a solution to maximise the power generation and performance ratio. TAYPRO’s automatic and semi-automatic robots were meticulously deployed to deliver high-speed cleaning for autonomous cleaning for large-scale panel areas. Also, the semi-automatic robots focused on intricate cleaning requirements.`,
            `This strategic robotic cleaning system improved the overall energy conversion efficiency of the panels and decreased water usage. Moreover, each robot’s performance was monitored in real time for seamless operational adjustment and maintenance. `,
          ]}
        />

        <ProjectQuoteSection
          quote="At Soygaon Solar Project we leveraged the cutting-edge technology to meet the high power generation demand."
          author="Tejas Memane, COO, TAYPRO PRIVATE LIMITED"
        />

        <ProjectKeyMetricsSection
          title="Key Metrics"
          image="/soyegaon-key-matrix.jpg"
          metrics={soyegaonMetrics}
        />

        <RelatedProjectsSection projects={otherProjects} />

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
