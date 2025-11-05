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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export const metadata: Metadata = {
  title: "About Taypro - Leading Solar Panel Cleaning Robot Manufacturer",
  description:
    "Taypro is at the forefront of revolutionizing solar energy efficiency through innovative Solar Panel Cleaning Robot technology. Learn about our autonomous, waterless robotic cleaning solutions for solar farms.",
  keywords: [
    "Solar Panel Cleaning Robot",
    "solar panel cleaning robot manufacturer",
    "automatic solar panel cleaning robot",
    "Taypro Solar Panel Cleaning Robot",
    "solar cleaning technology",
    "robotic solar cleaning",
    "solar panel maintenance robots",
    "autonomous solar cleaning",
    "taypro",
  ],
  openGraph: {
    title: "About Taypro - Leading Solar Panel Cleaning Robot Manufacturer",
    description:
      "Taypro revolutionizes solar energy efficiency with innovative Solar Panel Cleaning Robot technology. Autonomous, waterless robotic cleaning solutions for solar farms.",
    url: `${siteUrl}/company`,
    type: "website",
    images: [
      {
        url: `${siteUrl}/tayproasset/taypro-logo.png`,
        width: 1200,
        height: 630,
        alt: "Taypro - Solar Panel Cleaning Robot Manufacturer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About Taypro - Leading Solar Panel Cleaning Robot Manufacturer",
    description:
      "Innovative Solar Panel Cleaning Robot technology for solar farms. Autonomous, waterless cleaning solutions.",
    images: [`${siteUrl}/tayproasset/taypro-logo.png`],
  },
  alternates: {
    canonical: `${siteUrl}/company`,
  },
};

export default function AboutUsPage() {
  const resources = [
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
            <h1 className="text-[#A8C117] text-center text-[16px] mb-4">
              Who we are
            </h1>
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
              aria-hidden="true"
            >
              <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
            </svg>
          </div>
        </section>

        <section className="w-full py-16 bg-[#073448] flex justify-center">
          <div className="max-w-6xl w-full mx-4 md:mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Card: Brand Values */}
            <div className="bg-white px-10 py-10 flex flex-col justify-between shadow-lg min-h-[600px]">
              <div>
                <h3 className="text-[#073448] font-semibold text-2xl mb-8">
                  Our Brand Values
                </h3>
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
                      <svg width="24" height="24" fill="none" aria-hidden="true">
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
                href="/solar-panel-cleaning-system"
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
                <h3 className="mb-2 text-2xl flex leading-relaxed">
                  For our company,
                  <br /> diversity &amp; sustainability
                  <br /> are not just words.
                </h3>
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
                  alt="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T operating on solar panel array"
                  title="Taypro Single-Axis Tracker Solar Panel Cleaning Robot Model-T"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
              <div className="px-10 py-10 flex flex-col justify-start flex-grow">
                <div className="text-[#75AA00] font-semibold text-lg mb-2">
                  Community
                </div>
                <h3 className="text-[#073448] text-xl font-medium leading-relaxed">
                  Sustainable energy is
                  <br />
                  our corporate responsibility and obligation to society.
                </h3>
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
                <h2 className="col-span-4 text-[#052638] font-semibold text-4xl md:text-5xl leading-tight">
                  {item.heading}
                </h2>
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
                  alt="Taypro Solar Panel Cleaning Robot - Technological marvel revolutionizing solar panel maintenance with autonomous robotic cleaning systems"
                  title="Taypro Solar Panel Cleaning Robot Technology"
                  fill
                  sizes="sm"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Right: Content */}
            <div className="flex flex-col justify-center items-center text-center">
              <h3 className="text-[#b2cb19] text-2xl font-medium mb-6">
                A Technological Marvel
              </h3>
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
              <h3 className="text-[#b2cb19] text-2xl font-medium mb-6">
                Taypro’s Collaborative Approach
              </h3>
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
                  alt="Taypro Collaborative Engineering - Solar Panel Cleaning Robot development through collaboration with top-tier engineers and manufacturers"
                  title="Taypro Solar Panel Cleaning Robot Collaborative Development"
                  fill
                  sizes="sm"
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

        <section className="w-full py-30 px-4 sm:px-6 lg:px-0 overflow-x-hidden bg-[#073448]">
          <div className="max-w-7xl mx-auto">
            <h3 className="text-white font-semibold text-4xl mb-8">Our Team</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 md:gap-4 team-cards-container">
              {founders.map((f) => (
                <div
                  key={f.name}
                  className="team-card relative group overflow-hidden shadow-2xl flex flex-col bg-white items-center rounded-lg hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                  style={{ willChange: 'transform, opacity' }}
                >
                  {/* Vignette overlay for entire card - radial gradient effect */}
                  <div 
                    className="absolute inset-0 z-10 pointer-events-none rounded-lg transition-opacity group-hover:opacity-90"
                    style={{
                      background: 'radial-gradient(circle at center, transparent 0%, transparent 50%, rgba(0,0,0,0.12) 100%)',
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  {/* Subtle border frame effect for entire card */}
                  <div 
                    className="absolute inset-0 z-10 border-4 border-white/40 rounded-lg pointer-events-none transition-all group-hover:border-white/60"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  
                  <div className="relative h-[280px] w-full flex justify-center items-center overflow-hidden bg-gradient-to-b from-gray-50 to-white">
                    <Image
                      src={f.img}
                      alt={`${f.name} - ${f.role} at Taypro, leading Solar Panel Cleaning Robot manufacturer`}
                      title={`${f.name} - ${f.role} at Taypro`}
                      height={280}
                      width={220}
                      className="object-cover object-center transition-transform group-hover:scale-110 relative z-0"
                      style={{ 
                        willChange: 'transform',
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    />
                    {/* Additional bottom vignette for depth on image */}
                    <div 
                      className="absolute inset-0 z-10 bg-gradient-to-t from-black/15 via-transparent to-transparent pointer-events-none opacity-70 group-hover:opacity-50 transition-opacity"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                      }}
                    ></div>
                    {/* Corner vignette effects on image */}
                    <div className="absolute inset-0 z-10 bg-gradient-to-br from-black/10 via-transparent to-transparent pointer-events-none opacity-50"></div>
                    <div className="absolute inset-0 z-10 bg-gradient-to-tl from-black/10 via-transparent to-transparent pointer-events-none opacity-50"></div>
                  </div>
                  <div 
                    className="relative z-20 w-full flex flex-col items-center px-4 pb-4 pt-4 transition-transform group-hover:-translate-y-2"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  >
                    <div 
                      className="font-semibold text-xl mb-1 text-center text-[#052638] transition-all group-hover:text-2xl group-hover:mb-2"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >{f.name}</div>
                    <div 
                      className="text-[#7be117] text-base mb-3 text-center transition-all group-hover:text-lg group-hover:mb-4"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                    >
                      {f.role}
                    </div>
                    <a
                      href={f.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                opacity-100 pointer-events-auto translate-y-0
                md:opacity-0 md:pointer-events-none md:translate-y-4 
                md:group-hover:opacity-100 md:group-hover:pointer-events-auto md:group-hover:translate-y-0 
                transition-all flex items-center gap-2 text-[#7be117] hover:text-[#a8ef17]"
                      style={{
                        transitionDuration: '600ms',
                        transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                      }}
                      aria-label={`LinkedIn of ${f.name}`}
                    >
                      <Linkedin 
                        size={20} 
                        className="transition-transform group-hover:scale-[1.8] md:group-hover:scale-[1.8]"
                        style={{
                          transitionDuration: '600ms',
                          transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      />
                    </a>
                  </div>
                  {/* Corner vignette effects for entire card */}
                  <div 
                    className="absolute inset-0 z-10 bg-gradient-to-br from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                  <div 
                    className="absolute inset-0 z-10 bg-gradient-to-tl from-black/8 via-transparent to-transparent pointer-events-none opacity-60 rounded-lg transition-opacity group-hover:opacity-40"
                    style={{
                      transitionDuration: '600ms',
                      transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  ></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full py-16 bg-white overflow-x-hidden">
          <div className="max-w-7xl mx-auto px-4 flex flex-col lg:flex-row justify-between items-start gap-10">
            {/* Left: Title, description, button */}
            <div className="flex flex-col w-full lg:w-2/5">
              <h3 className="text-[#052638] font-semibold text-5xl mb-5">
                Resources
              </h3>
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
                          alt={`${r.title} - Solar Panel Cleaning Robot technology and solar energy resource article by Taypro`}
                          title={`${r.title} - Solar Panel Cleaning Robot Energy Resource`}
                          fill
                          sizes="sm"
                          className="object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-105"
                          priority
                        />
                        <h4 className="absolute bottom-4 left-4 text-white text-sm font-semibold bg-opacity-30 px-3 py-1 transition-transform duration-300 transform translate-y-4 group-hover:translate-y-0">
                          {r.title}
                        </h4>
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
