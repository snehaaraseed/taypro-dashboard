import Link from "next/link";
import Image from "next/image";
import { founders, items, metrics } from "../data";
import { Linkedin } from "lucide-react";
import CallbackCard from "../components/CallbackCard";
import { Breadcrumbs } from "../components/Breadcrumbs";
import type { Metadata } from "next";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "About Us",
    href: "",
  },
];

export const metadata: Metadata = {
  title: "Taypro - Know More About Taypro Unit.",
  description:
    "Taypro is at the forefront of revolutionizing solar energy efficiency through innovative technological solutions designed to address persistent challenges within the industry. As solar panels become increasingly integral to renewable energy systems, the efficiency of these installations can be significantly compromised by environmental factors.",
  keywords:
    "solar panel cleaning robots, cleaning technology, cleaning, automatic solar robot, taypro",
  openGraph: {
    title: "Taypro - Know More About Taypro Unit.",
    description:
      "Taypro is at the forefront of revolutionizing solar energy efficiency through innovative technological solutions designed to address persistent challenges within the industry. As solar panels become increasingly integral to renewable energy systems, the efficiency of these installations can be significantly compromised by environmental factors.",
    url: "http://localhost:3000/company",
    type: "website",
  },
};

export default function AboutUsPage() {
  const resources = [
    {
      title: "The Complete Guide to Solar Panel Maintenance",
      imgSrc: "/taypro-energy-resource1.webp",
      date: "July 27, 2025",
      href: "/blog/the-complete-guide-to-solar-panel-maintenance",
    },
    {
      title: "New Solar Panel Technologies 2025",
      imgSrc: "/taypro-energy-resource2.webp",
      date: "July 23, 2025",
      href: "/blog/new-solar-panel-technologies-2025",
    },
  ];
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen overflow-x-hidden">
        <section
          className="bg-white min-h-[50vh] flex flex-col items-center justify-start relative"
          style={{
            background: "url('/tayprobglayout/taypro-project.png') no-repeat",
            backgroundSize: "cover",
          }}
        >
          <div className="pt-10">
            <div className="text-[#A8C117] text-center text-[16px] mb-4">
              Who we are
            </div>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
              Engineers of a
              <br />
              sustainable future
            </h1>
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

        <section className="w-full py-16 bg-[#073448] flex justify-center">
          <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Card: Brand Values */}
            <div className="bg-white px-10 py-10 flex flex-col justify-between shadow-lg min-h-[600px]">
              <div>
                <h2 className="text-[#073448] font-semibold text-2xl mb-8">
                  Our Brand Values
                </h2>
                <ul className="space-y-5 text-lg text-[#245165] mb-10">
                  {[
                    "Innovative",
                    "Powerful",
                    "Consistent",
                    "Agile",
                    "Dependable",
                    "Empathetic",
                    "Excellence",
                  ].map((val) => (
                    <li className="flex items-center gap-2" key={val}>
                      <svg width="24" height="24" fill="none">
                        <path
                          d="M20 6L9 17l-5-5"
                          stroke="#7be117"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {val}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href="/solar-robots/solar-panel-cleaning-robot"
                title="Solar Panel Cleaning Robot"
              >
                <button className="bg-[#96DB00] text-[#073448] text-lg font-medium p-4 rounded-md hover:bg-[#91bc00] hover:text-white transition mt-4 cursor-pointer">
                  Explore Our Solutions
                </button>
              </Link>
            </div>
            {/* Middle Card: Sustainability Block */}
            <div className="bg-[#75AA00] px-8 py-10 flex flex-col justify-center text-white min-h-[600px]">
              <div className="mb-12">
                <div className="mb-2 text-2xl flex leading-relaxed">
                  For our company,
                  <br /> diversity &amp; sustainability
                  <br /> are not just words.
                </div>
                <Link href="/projects" title="Solar Project">
                  <div className="hover:text-[#caed7f] text-lg underline underline-offset-4 mb-2 cursor-pointer">
                    Explore Projects
                  </div>
                </Link>
              </div>
              <div className="mt-4 mb-6">
                <div className="text-6xl font-semibold mb-2">1.4 Bn</div>
                <div className="text-lg">Liters Water Saved Annually</div>
              </div>
              <div>
                <div className="text-5xl font-semibold mb-2">67.5k</div>
                <div className="text-lg">
                  Metric Tons Of CO2 Emission Reduced Annually
                </div>
              </div>
            </div>
            {/* Right Card: Image + Community Text */}
            <div className="bg-white flex flex-col shadow-lg min-h-[600px] overflow-hidden">
              <div className="w-full h-[360px] relative">
                <Image
                  src="/tayprorobots/taypro-modelT-img.png"
                  alt="Solar Panels"
                  title="Solar Panels"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-10 py-10 flex flex-col justify-start flex-grow">
                <div className="text-[#75AA00] font-semibold text-lg mb-2">
                  Community
                </div>
                <div className="text-[#073448] text-xl font-medium leading-relaxed">
                  Sustainable energy is
                  <br />
                  our corporate responsibility and obligation to society.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto px-4 sm:px-0">
            {items.map((item, idx) => (
              <div
                key={item.label}
                className={`grid grid-cols-5 gap-2 sm:gap-4 items-start mb-10 ${
                  idx !== items.length - 1
                    ? "border-b border-gray-200 pb-10"
                    : ""
                }`}
              >
                {/* Left label (green) */}
                <div className="col-span-1 text-[#b2cb19] text-xl font-normal pt-3">
                  {item.label}
                </div>
                {/* Right headline */}
                <div className="col-span-4 text-[#052638] font-semibold text-4xl md:text-5xl leading-tight">
                  {item.heading}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}
            <div className="flex justify-center items-center">
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about1.jpg"
                  alt="Taypro Marvel"
                  title="Taypro Marvel"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Right: Content */}
            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-[#b2cb19] text-2xl font-medium mb-6">
                A Technological Marvel
              </div>
              <p className="text-[#27415c] text-lg max-w-xl">
                Years of intensive development, collaboration with top-tier
                engineers, and integration of the latest technology culminated
                in the creation of the Taypro AMS. This revolutionary solar
                panel cleaning system is not merely a tool; it’s a game-changer
                for solar system owners.
              </p>
            </div>
          </div>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left: Image */}

            <div className="flex flex-col justify-center items-center text-center">
              <div className="text-[#b2cb19] text-2xl font-medium mb-6">
                Taypro’s Collaborative Approach
              </div>
              <p className="text-[#27415c] text-lg max-w-xl">
                At Taypro Private Limited, collaboration is at the heart of our
                success. We work seamlessly with the best minds in engineering,
                top-tier suppliers, and cutting-edge manufacturers. This
                collaboration ensures that every innovation, like the Taypro
                Model A, is a testament to progress and technology at its best.
              </p>
            </div>

            {/* Right: Content */}
            <div className="flex justify-center items-center">
              <div className="w-[520px] h-[460px] relative overflow-hidden shadow-md">
                <Image
                  src="/tayprosolarpanel/taypro-about2.webp"
                  alt="Taypro Marvel"
                  title="Taypro Marvel"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-30 bg-white px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-2 text-center">
            {metrics.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center">
                <span className="text-[#b2cb19] font-semibold text-6xl mb-2">
                  {stat.value}
                </span>
                <span className="text-[#b2cb19] text-lg">{stat.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full py-30 px-4 sm:px-6 lg:px-0 overflow-x-hidden">
          <div className="max-w-5xl mx-auto">
            <h3 className="text-white font-semibold text-4xl mb-8">Founders</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {founders.map((f) => (
                <div
                  key={f.name}
                  className="relative group overflow-hidden shadow-lg min-h-[400px] flex flex-col bg-white items-center"
                >
                  <div className="relative h-[500px] w-[400px] flex justify-center items-center mx-auto">
                    <Image
                      src={f.img}
                      alt={f.name}
                      title="Founder"
                      height={500}
                      width={400}
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="relative z-0 w-full flex flex-col items-center px-6 pb-6 pt-8 transition-transform duration-300 group-hover:-translate-y-6">
                    <div className="font-semibold text-3xl mb-1">{f.name}</div>
                    <div className="text-[#7be117] text-[#76AA00] text-xl mb-4">
                      {f.role}
                    </div>
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto translate-y-4 group-hover:translate-y-0 transition-all duration-300 flex items-center gap-2 text-[#7be117] hover:text-[#a8ef17]"
                      aria-label={`LinkedIn of ${f.name}`}
                    >
                      <Linkedin size={16} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Left: Title, description, button */}
            <div className="flex flex-col w-full lg:w-2/5">
              <div className="text-[#052638] font-semibold text-5xl mb-5">
                Resources
              </div>
              <div className="text-[#22405a] text-xl mt-6 leading-relaxed">
                In a world where sustainability is paramount,
                <br />
                Taypro Private Limited emerges as a pioneer,
                <br />
                reshaping the solar energy landscape. The Taypro
                <br />
                Model A is not just a cleaning system; it’s a<br />
                statement – a testament to Taypro’s unwavering
                <br />
                commitment to a greener, more sustainable
                <br />
                planet.
              </div>
              <Link href="/blog" title="blog">
                <button className="mt-6 inline-block w-full sm:w-auto bg-[#b2cb19] text-[#22405a] text-xl text-center py-2 px-4 rounded-lg hover:bg-lime-500 transition cursor-pointer">
                  View all resources
                </button>
              </Link>
            </div>

            {/* Right: Card resources (stack on mobile, row on desktop) */}
            <div className="w-full lg:w-3/5">
              <div className="flex flex-col md:flex-row gap-8">
                {resources.map((r) => (
                  <div
                    key={r.title}
                    className="flex-1 border-2 border-gray-300 bg-white rounded-sm overflow-hidden shadow-sm min-w-[320px] max-w-[400px] transition hover:shadow-xl"
                  >
                    <Link
                      title="Energy Resources"
                      href={r.href}
                      className="block w-full h-full p-0 overflow-hidden group relative"
                    >
                      {/* Image with overlay title */}
                      <div className="relative w-full h-[360px]">
                        <Image
                          src={r.imgSrc}
                          alt={r.title}
                          title="Energy Resource"
                          fill
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"
                          priority
                        />
                        <div className="absolute bottom-4 left-4 text-white text-sm font-semibold bg-opacity-30 px-3 py-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0">
                          {r.title}
                        </div>
                      </div>
                      {/* Date overlay */}
                      <div className="absolute bottom-4 right-4 text-white text-xs bg-black bg-opacity-30 px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {r.date}
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <CallbackCard headerText={""} />
      </div>
    </>
  );
}
