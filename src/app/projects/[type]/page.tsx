"use client";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import SEO from "@/app/components/SEO";
import { additionalProjects } from "@/app/data";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProjectTypePage() {
  const validTypes = ["automatic", "capex", "semi-automatic"];

  const params = useParams();
  const type = typeof params.type === "string" ? params.type : "";

  if (!type || !validTypes.includes(type.toLowerCase())) {
    return (
      <h1 className="text-center text-3xl mt-20">
        404 - Project Type Not Found
      </h1>
    );
  }

  const formattedType =
    type.charAt(0).toUpperCase() + type.slice(1).replace("-", " ");

  const breadcrumbs = [
    { name: "Home", href: "/" },
    {
      name: formattedType,
      href: "",
    },
  ];

  return (
    <>
      <SEO
        title={formattedType}
        description="Our intelligent solar cleaning robots enhance plant efficiency by enabling immaculate solar panel cleaning using intelligent AI and ML systems."
        keywords="taypro projects, solar projects, automatic, semi-automatic, capex, energy industry"
        url={`http://localhost:3000/${formattedType}`}
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />
      <section className="w-full pt-20 pb-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-start">
          <h2 className="text-[#052638] text-4xl  mb-4">{formattedType}</h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            {additionalProjects.map((card, idx) => (
              <Link
                href={card.href}
                key={idx}
                title="Solar Project"
                className="block border border-gray-300 p-4 overflow-hidden group"
              >
                <div className="relative w-full h-90 overflow-hidden">
                  {/* Image with slide animation */}
                  <Image
                    src={card.img}
                    alt={card.title}
                    title="Solar Project"
                    fill
                    className="object-cover opacity-80 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-105 group-hover:translate-x-3"
                    priority
                  />

                  <div className="absolute bottom-4 left-4 text-white flex flex-col transition-all duration-300">
                    <div className="text-sm font-semibold bg-opacity-10 px-3 transition-transform duration-300 group-hover:-translate-y-3">
                      {card.title}
                    </div>

                    <div className="text-xs bg-opacity-60 px-3 opacity-0 max-h-0 overflow-hidden group-hover:opacity-100 group-hover:max-h-20 transition-all duration-300">
                      {card.date}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
