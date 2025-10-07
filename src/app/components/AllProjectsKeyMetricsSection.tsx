"use client";
import Image from "next/image";

interface Metric {
  number: string | number;
  label: string;
}

interface ProjectKeyMetricsSectionProps {
  title: string;
  image: string;
  metrics: Metric[];
}

export default function ProjectKeyMetricsSection({
  title,
  image,
  metrics,
}: ProjectKeyMetricsSectionProps) {
  return (
    <section className="w-full py-20 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="text-[#0c2f42] font-semibold text-5xl md:text-6xl">
            {title}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row ml-40 items-center gap-30">
          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-[400px] lg:h-[500px] overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover" />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-8">
            {metrics.map((metric, index) => (
              <div key={index} className="flex flex-col">
                <div className="text-[#0c2f42] font-semibold text-4xl md:text-5xl mb-2">
                  {metric.number}
                </div>
                <div className="text-[#B5CF22] font-medium text-lg">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-40 border-b border-gray-300"></div>
      </div>
    </section>
  );
}
