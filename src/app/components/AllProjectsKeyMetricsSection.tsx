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
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 lg:mb-16">
          <div className="text-[#0c2f42] font-semibold text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
            {title}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row lg:ml-40 items-center gap-8 lg:gap-30">
          <div className="w-full lg:w-1/2">
            <div className="relative w-full h-[250px] sm:h-[300px] lg:h-[400px] xl:h-[500px] overflow-hidden">
              <Image
                src={image}
                alt={title}
                title="Project Key Metric"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="w-full lg:w-1/2 space-y-6 sm:space-y-8">
            {metrics.map((metric, index) => (
              <div
                key={index}
                className="flex flex-col text-center lg:text-left"
              >
                <div className="text-[#0c2f42] font-semibold text-3xl sm:text-4xl lg:text-4xl xl:text-5xl mb-2">
                  {metric.number}
                </div>
                <div className="text-[#B5CF22] font-medium text-base sm:text-lg">
                  {metric.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-20 sm:pt-30 lg:pt-40 border-b border-gray-300"></div>
      </div>
    </section>
  );
}
