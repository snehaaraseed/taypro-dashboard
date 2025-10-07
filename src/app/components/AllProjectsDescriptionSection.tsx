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
    <section className="px-50 pt-10 pb-20 bg-white">
      <div className="text-center mb-16">
        <div className="text-4xl lg:text-5xl font-semibold text-[#052638] mb-4">
          {title}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <Image src={image} alt={title} width={500} height={400} priority />
        </div>

        <div className="space-y-8">
          {paragraphs.map((p, i) => (
            <p key={i} className="text-xl text-[#052638]">
              {p}
            </p>
          ))}
        </div>
      </div>

      <div className="absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32"></div>
    </section>
  );
}
