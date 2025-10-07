"use client";
import Image from "next/image";
import Link from "next/link";

interface ProjectOverviewSectionProps {
  image: string;
  overviewText: string;
}

export default function ProjectOverviewSection({
  image,
  overviewText,
}: ProjectOverviewSectionProps) {
  return (
    <section
      className="w-full pb-30 bg-white"
      style={{
        background: "url('/taypro-semi.png') repeat",
        backgroundSize: "auto",
      }}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative w-full h-[700px] overflow-hidden">
          <Image
            src={image}
            alt="Project Overview"
            fill
            className="object-cover"
            priority
          />

          <div className="absolute right-10 top-1/2 transform -translate-y-1/2 bg-[#75AA00] p-6 w-90 h-[350px] flex flex-col justify-center items-center text-center">
            <div className="text-white text-start text-2xl mb-4">Overview</div>
            <p className="text-white text-start text-md leading-relaxed">
              {overviewText}
            </p>
            <Link
              href="/contact"
              className="text-white text-xl mt-8 border-b-2 border-[#e6ee9d] hover:text-[#e6ee9d] transition-colors duration-300"
            >
              Let&apos;s work together
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
