"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
import Image from "next/image";
import { energyResourceCards } from "../data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { EnergyResourceCard, extractSlugFromHref } from "../utils/extractSlug";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Blogs",
    href: "",
  },
];

export default function Blog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [loadingSlug, setLoadingSlug] = useState<string | null>(null);

  function handleClick(slug: string) {
    setLoadingSlug(slug);
    startTransition(() => {
      router.push(`/blog/${slug}`);
    });
  }

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />

      {isPending && loadingSlug && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="flex space-x-2">
            <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
            <span className="dot w-3 h-3 bg-gray-500 rounded-full"></span>
          </div>
        </div>
      )}

      <section className="w-full pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <h1 className="text-[#052638] text-4xl mb-4">Blogs</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {energyResourceCards.map(
              (card: EnergyResourceCard, idx: number) => {
                const slug = extractSlugFromHref(card.href);
                return (
                  <div
                    key={idx}
                    onClick={() => handleClick(slug)}
                    className="cursor-pointer block border border-gray-300 p-4 overflow-hidden group relative"
                  >
                    {isPending && loadingSlug === slug && (
                      <div className="absolute inset-0 bg-white bg-opacity-60 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                      </div>
                    )}

                    <div className="relative w-full h-90 overflow-hidden">
                      <Image
                        src={card.imgSrc}
                        alt={card.title}
                        title="Blogs"
                        fill
                        className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                        priority
                      />

                      <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                        <div className="text-sm font-semibold px-3 transition-transform duration-300 group-hover:-translate-y-3">
                          {card.title}
                        </div>
                        <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                          {card.date}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </div>
      </section>
    </>
  );
}
