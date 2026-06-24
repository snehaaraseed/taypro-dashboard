import Link from "next/link";
import Image from "next/image";
import { getAllBlogsForSimilar } from "@/app/utils/blogUtils";

interface EnergyResourceCardProps {
  title?: string;
  subtitle?: string;
  limit?: number;
  ctaLabel?: string;
  ctaHref?: string;
}

const FALLBACK_RESOURCES = [
  {
    title: "The Complete Guide to Solar Panel Maintenance",
    imgSrc: "/tayproenergyresource/taypro-energy-resource1.webp",
    date: "July 27, 2025",
    href: "/blog/the-complete-guide-to-solar-panel-maintenance",
  },
  {
    title: "New Solar Panel Technologies 2025",
    imgSrc: "/tayproenergyresource/taypro-energy-resource2.webp",
    date: "July 23, 2025",
    href: "/blog/new-solar-panel-technologies-2025",
  },
  {
    title: "Solar Module Types for Utility Buyers",
    imgSrc: "/tayproenergyresource/taypro-energy-resource3.webp",
    date: "July 21, 2025",
    href: "/blog/understanding-different-types-of-solar-panels",
  },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}

/**
 * Server-rendered "Energy Resources" / related blogs card.
 * Pulls the most recent published blogs from `src/app/blog/*` so
 * new posts surface automatically everywhere this card is used.
 */
export default async function EnergyResourceCard({
  title = "Energy Resources",
  subtitle = "Insights, guides and field notes from the Taypro team on robotic solar cleaning, plant performance, and O&M best practices.",
  limit = 3,
  ctaLabel = "View all resources",
  ctaHref = "/blog",
}: EnergyResourceCardProps = {}) {
  let resourceCards: {
    title: string;
    imgSrc: string;
    date: string;
    href: string;
  }[] = [];

  try {
    const allBlogs = await getAllBlogsForSimilar();
    resourceCards = allBlogs.slice(0, limit).map((b) => ({
      title: b.title,
      imgSrc: b.featuredImage,
      date: formatDate(b.updatedAt || b.publishDate),
      href: b.href,
    }));
  } catch (error) {
    console.warn("EnergyResourceCard: falling back to static list", error);
  }

  if (resourceCards.length === 0) {
    resourceCards = FALLBACK_RESOURCES.slice(0, limit);
  }

  return (
    <section className="w-full pt-40 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="text-[#052638] font-semibold text-3xl sm:text-4xl mb-4">
          {title}
        </h3>
        {subtitle && (
          <p className="text-[#475569] text-base sm:text-lg max-w-3xl mx-auto mb-12">
            {subtitle}
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {resourceCards.map((card) => (
            <Link
              href={card.href}
              key={`${card.href}-${card.title}`}
              title={card.title}
              className="block border border-gray-300 p-4 overflow-hidden group"
            >
              <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                <Image
                  src={card.imgSrc}
                  alt={`${card.title} - Solar Panel Cleaning Robot resource by Taypro`}
                  title={`${card.title} - Taypro blog`}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                />
                <div className="absolute bottom-4 left-4 right-4 text-white flex flex-col transition-all duration-300 text-left">
                  <h4 className="text-sm font-semibold bg-opacity-10 px-3 transition-transform duration-300 group-hover:-translate-y-3 line-clamp-2">
                    {card.title}
                  </h4>
                  <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                    {card.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href={ctaHref}
          title="Taypro blog"
          className="inline-block bg-[#A8C117] text-[#052638] text-lg px-6 py-2 rounded-lg transition-colors duration-200 hover:bg-[#91bc00] cursor-pointer"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
