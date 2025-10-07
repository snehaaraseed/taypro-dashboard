"use client";

import Image from "next/image";
import { additionalProjects } from "@/app/data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import Link from "next/link";
import SEO from "../components/SEO";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Projects",
    href: "",
  },
];

export default function ProjectPage() {
  return (
    <>
      <SEO
        title="Solar Project"
        description="Sustainable Projects Disrupting the energy-industry."
        keywords="solar projects, sustainable energy, solar panels, taypro solar plants, maximum power generation"
        url="http://localhost:3000/projects"
        breadcrumbs={breadcrumbs}
      />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section
          className="bg-white min-h-[50vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/taypro-project.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="pt-10">
            <h1 className="text-[#A8C117] text-center text-[16px] mb-4">
              Sustainable Projects
            </h1>
            <h2 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              Disrupting the energy-
              <br />
              industry.
            </h2>
          </div>

          {/* Add curve SVG or image beneath the form */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
            <svg
              className="w-full h-24 md:h-40"
              viewBox="0 0 1440 320"
              xmlns="http://www.w3.org/2000/svg"
              preserveAspectRatio="none"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <section className="mx-auto px-30 py-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {additionalProjects.map((project) => (
              <div
                key={project.title}
                className="relative z-0 w-full group overflow-hidden cursor-pointer"
                style={{ minHeight: "600px" }}
              >
                <Image
                  src={project.img}
                  alt={project.title}
                  width={400}
                  height={600}
                  className="w-full h-full transform group-hover:scale-105 transition duration-300"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-transparent group-hover:bg-blue-900/30 transition duration-300 pointer-events-none" />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/35 group-hover:bg-black/50 transition duration-300" />

                <div className="absolute inset-5 border border-white transition duration-300 ease-out scale-95 opacity-0 group-hover:scale-100 group-hover:opacity-100 group-hover:border-white" />

                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 text-center px-4">
                  <Link
                    href={project.href}
                    className="text-white text-3xl md:text-3xl mb-3 drop-shadow-md font-semibold hover:text-[#A8C117] transition-colors duration-300"
                  >
                    {project.title}
                  </Link>

                  <div
                    className="flex flex-wrap justify-center gap-3 text-[#A8C117] text-lg md:text-xl font-medium opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition duration-300"
                    style={{
                      transitionTimingFunction:
                        "cubic-bezier(0.4, 0.4, 0.2, 0.5)",
                    }}
                  >
                    {project.details.split(", ").map((item) => (
                      <Link
                        key={item}
                        href={`/projects/${item
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                        className="hover:underline hover:text-[#c3d958] transition-colors duration-300"
                      >
                        {item}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
