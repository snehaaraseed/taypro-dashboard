import Link from "next/link";
import Image from "next/image";
import { energyResourceCards } from "../data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Taypro Blogs – Expert Articles on Solar Cleaning Robots.",
  description:
    "Discover the Future of Solar Automation, Sustainability, and Smart Cleaning Solutions & reach out to Taypro for solar automation solutions and support.",
  keywords:
    "solar panel cleaning robots, blogs, articles, energy resources, solar robot, taypro",
  openGraph: {
    title: "Taypro Blogs – Expert Articles on Solar Cleaning Robots.",
    description:
      "Discover the Future of Solar Automation, Sustainability, and Smart Cleaning Solutions & reach out to Taypro for solar automation solutions and support.",
    url: "http://localhost:3000/blog",
    type: "website",
  },
};

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Blogs",
    href: "",
  },
];

export default function Blog() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <h1 className="text-[#052638] text-4xl  mb-4">Blogs</h1>

          <h2 className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {energyResourceCards.map((card, idx) => (
              <Link
                href={card.href}
                key={idx}
                title="Energy Resource"
                className="block border border-gray-300 p-4 overflow-hidden group"
              >
                <div className="relative w-full h-90 overflow-hidden">
                  {/* Image with slide animation */}
                  <Image
                    src={card.imgSrc}
                    alt={card.title}
                    title="Blogs"
                    fill
                    className="object-cover opacity-90 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                    priority
                  />

                  {/* Title + Date container */}
                  <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                    {/* Title */}
                    <div className="text-sm font-semibold px-3 transition-transform duration-300 group-hover:-translate-y-3">
                      {card.title}
                    </div>

                    {/* Date (hidden until hover) */}
                    <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                      {card.date}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </h2>
        </div>
      </section>
    </>
  );
}
