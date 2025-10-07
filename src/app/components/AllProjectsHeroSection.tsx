"use client";
import Link from "next/link";

type Category = {
  label: string;
  href: string;
};

interface ProjectHeroSectionProps {
  title: string;
  categories: Category[];
}

export default function ProjectHeroSection({
  title,
  categories,
}: ProjectHeroSectionProps) {
  return (
    <section className="w-full py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="mb-6">
          <span className="text-white text-lg font-normal">Categories: </span>
          {categories.map((category, index) => (
            <span key={category.label}>
              <Link
                href={category.href}
                className="text-gray-300 text-lg font-normal hover:text-[#B5CF22] transition-colors cursor-pointer"
              >
                {category.label}
              </Link>
              {index < categories.length - 1 && (
                <span className="text-gray-300 text-lg font-normal">, </span>
              )}
            </span>
          ))}
        </div>

        <div className="pt-20">
          <div className="text-white text-start text-7xl font-semibold">
            {title}
          </div>
        </div>
      </div>
    </section>
  );
}
