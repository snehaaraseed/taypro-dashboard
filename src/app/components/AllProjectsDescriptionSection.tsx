"use client";
import Image from "next/image";

interface ProjectDescriptionSectionProps {
  title: string;
  image: string;
  paragraphs: string[];
}

export default function ProjectDescriptionSection({
  title,
  image,
  paragraphs,
}: ProjectDescriptionSectionProps) {
  return (
    <section
      className="
    px-4 sm:px-8 lg:px-50 pt-30 pb-20 bg-white overflow-x-hidden
    max-h-screen
    sm:overflow-y-visible sm:max-h-full
  "
    >
      <div className="text-center mb-12 lg:mb-16">
        <div className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold text-[#052638] mb-4">
          {title}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
        <div className="w-full flex justify-center lg:justify-start">
          <div className="w-full max-w-md lg:max-w-none">
            <Image
              src={image}
              alt={title}
              title="Solar Project"
              width={500}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>

        <div className="space-y-6 lg:space-y-8">
          {paragraphs.map((p, i) => (
            <p
              key={i}
              className="text-base sm:text-lg lg:text-xl text-[#052638] leading-relaxed"
            >
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* Background decorations - smaller on mobile */}
      <div className="absolute top-0 left-0 w-32 h-32 lg:w-64 lg:h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-16 lg:-translate-x-32 -translate-y-16 lg:-translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-48 h-48 lg:w-96 lg:h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-16 lg:translate-x-32 translate-y-16 lg:translate-y-32"></div>
    </section>
  );
}
