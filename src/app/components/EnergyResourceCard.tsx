import Link from "next/link";
import Image from "next/image";

export default function EnergyResourceCard() {
  const resourceCards = [
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
      title: "What Are The Different Types Of Solar Panels",
      imgSrc: "/tayproenergyresource/taypro-energy-resource3.webp",
      date: "July 21, 2025",
      href: "/blog/what-are-the-different-types-of-solar-panels-2",
    },
  ];

  return (
    <section className="w-full pt-40 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <h3 className="text-[#052638] font-semibold text-4xl  mb-4">
          Energy Resources
        </h3>
        <p className="text-[#475569] text-lg mb-12">
          Nam magna ex, accumsan id auctor sed, finibus a urna. Proin <br />{" "}
          interdum feugiat viverra. Praesent sapien tortor, pulvinar <br />{" "}
          rutrum purus at.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {resourceCards.map((card, idx) => (
            <Link
              href={card.href}
              key={idx}
              title="Energy Resources"
              className="block border border-gray-300 p-4 overflow-hidden group"
            >
              <div className="relative w-full h-64 sm:h-72 md:h-80 overflow-hidden">
                {/* Image with slide animation */}
                <Image
                  src={card.imgSrc}
                  alt={`${card.title} - Solar Panel Cleaning Robot technology and solar energy resource by Taypro`}
                  title={`${card.title} - Solar Panel Cleaning Robot Resource`}
                  fill
                  sizes="sm"
                  className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                  priority
                />

                {/* Title + Date container */}
                <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                  {/* Title */}
                  <h4 className="text-sm font-semibold bg-opacity-10 px-3 transition-transform duration-300 group-hover:-translate-y-3">
                    {card.title}
                  </h4>

                  {/* Date (hidden until hover) */}
                  <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                    {card.date}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/blog"
          title="Blog"
          className="inline-block bg-[#A8C117] text-[#052638] text-lg px-6 py-2 rounded-lg transition-colors duration-200 hover:bg-[#91bc00] cursor-pointer"
        >
          View all resources
        </Link>
      </div>
    </section>
  );
}
