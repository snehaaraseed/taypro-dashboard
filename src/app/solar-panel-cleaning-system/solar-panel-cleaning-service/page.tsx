"use client";

import { cleaningServiceFaqs, modelBCards } from "@/app/data";
import { useState } from "react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import ModelCards from "@/app/components/ModelCards";
import ClientsCard from "@/app/components/ClientsCard";
import HeroSection from "@/app/components/Herosection";
import FeaturesSection from "@/app/components/FeaturesSection";
import CallbackCard from "@/app/components/CallbackCard";
import ResourcesCard from "@/app/components/ResourcesCard";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import ProjectsCard from "@/app/components/ProjectsCard";
import { ServiceSchema } from "@/app/components/StructuredData";
import { Container } from "@/app/components/Container";
import Link from "next/link";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Solar Panel Cleaning Robots",
    href: "/solar-panel-cleaning-system",
  },
  {
    name: "Solar Panel Cleaning Service",
    href: "",
  },
];

export default function SolarPanelCleaningService() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const benefits = [
    "Ensuring Panel Safety",
    "Enhanced Energy Output",
    "Environmental Sustainability",
    "Seamless Integration into Plant Operations",
    "Cost-Effective and Long-Term Solution",
  ];

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <ServiceSchema
        name="Taypro OPEX - Solar Panel Cleaning Service"
        description="Operator-led robotic solar panel cleaning service for utility-scale solar power plants. AI and ML-driven waterless cleaning, dual-pass technology, dedicated skilled manpower, and same-day breakdown resolution."
        image={`${siteUrl}/tayprosolarpanel/taypro-cleaning-service.png`}
        url={`${siteUrl}/solar-panel-cleaning-system/solar-panel-cleaning-service`}
      />
      <div className="min-h-screen overflow-x-hidden">
        <HeroSection
          title="Solar Panel Cleaning Service: TAYPRO OPEX"
          subtitle="A solar panel cleaning service for utility scale solar power plants."
          imgSrc="/tayprosolarpanel/taypro-cleaning-service.png"
          imgAlt="Taypro Solar Panel Cleaning Service - Professional OPEX robotic cleaning services using Solar Panel Cleaning Robot systems"
          ctaHref="/contact"
          ctaText="Request a quote"
        />

        <FeaturesSection
          headline={
            <>
              Solar Panel
              <br />
              Cleaning Service
            </>
          }
          description={
            <>
              TAYPRO’s solar cleaning service offers an efficient & effective
              solution for cleaning solar panels. The cleaning robots are
              designed with AI and ML technology to prioritise enhancing plant
              performance & maximising power generation by improving solar panel
              efficiency. <br />
              <br /> The solar panel cleaning service, TAYPRO OPEX, uses
              advanced technology with waterless robots to clean large-scale
              solar panels. <br /> <br /> Let’s examine TAYPRO’s solar power
              cleaning service extensively.
            </>
          }
          benefits={benefits}
        />

        <section className="w-full pt-10 pb-24 bg-white">
          <Container>
            <h2 className="font-semibold text-5xl md:text-5xl text-start mb-6">
              Features of TAYPRO&rsquo;s Solar Panel Cleaning Service
            </h2>
            <p className="mb-20 text-start text-lg">
              Here are the key features of TAYPRO&rsquo;s solar panel cleaning
              service.
            </p>
            <div className="mb-16">
              <h3 className="text-2xl mb-5" style={{ color: "#A8C117" }}>
                Dedicated Skilled Manpower for Robot Operation
              </h3>
              <p className="mb-7 text-start text-lg">
                A dedicated skilled manpower is available at site to operate the
                robots ensuring no damage to the solar modules and thorough
                effective cleaning of all the solar panels.
              </p>
            </div>
            <div className="mb-16">
              <h3 className="text-2xl mb-5" style={{ color: "#A8C117" }}>
                Smart & Efficient Cleaning
              </h3>
              <p className="mb-7 text-start text-lg">
                The solar panel cleaning process is fully automated or
                semi-automated, making self-cleaning decisions to optimise
                energy output. The cleaning robots utilise technology that
                analyses weather conditions (wind speed, humidity, and rain
                probability) each time to schedule the cleaning process at the
                most favourable time.
              </p>
            </div>
            <div className="mb-16">
              <h3 className="text-2xl mb-5" style={{ color: "#A8C117" }}>
                Same-Day Breakdown Resolution
              </h3>
              <p className="mb-7 text-start text-lg">
                Our strong team of technical experts all over India ensures that
                we provide resolutions for any robot-related issue. If the robot
                detects any malfunction or technical issue, it automatically
                generates a web-based ticket that can be easily tracked in
                real-time.
              </p>
            </div>
            <div className="mb-16">
              <h3 className="text-2xl mb-5" style={{ color: "#A8C117" }}>
                Dual Pass Cleaning Technology
              </h3>
              <p className="mb-7 text-start text-lg">
                The robots use a patented dual-pass technology, which allows the
                cleaning to be done efficiently in just two stages
                simultaneously. The first pass cleans off the dry dust, while
                the second pass wipes away the sticky dust completely.
              </p>
            </div>
          </Container>
        </section>

        <CallbackCard
          headerText={<>Schedule a solar panel cleaning service</>}
        />

        <section className="w-full pt-24 pb-2 bg-white bg-center">
          <Container size="narrow">
            <h2 className="font-semibold text-5xl md:text-5xl text-start mb-6">
              Calculate the ROI & Savings on a Solar Panel Cleaning Service
            </h2>
            <p className="mb-10 text-start text-lg">
              Along with increasing efficiency, a solar cleaning service also
              helps save a significant amount of money. Here&rsquo;s how you
              can easily calculate your savings.
            </p>
          </Container>
          <ROITayproCalculator />
        </section>

        <section className="w-full py-24 bg-white bg-center">
          <Container>
            <h2 className="font-semibold text-[#052638] text-center text-5xl mb-8">
              FAQs
            </h2>
            {cleaningServiceFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-2 text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-xl select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  <h3>{faq.question}</h3>
                </button>
                <div
                  className={`grid pl-16 pr-4 text-base text-[#052638] transition-all duration-200 ${
                    openIndex === idx
                      ? "grid-rows-[1fr] opacity-100 pb-6"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">{faq.answer}</div>
                </div>
              </div>
            ))}
          </Container>
        </section>

        <ClientsCard />

        <ProjectsCard showHeader={true} headerText="Our Projects" />

        <section className="w-full pt-24 py-12 bg-white">
          <Container>
            <div className="mb-8">
              <h2 className="text-[#052638] font-semibold text-5xl md:text-6xl text-center mb-6">
                Advantages of Using Solar Panel Cleaning Service
              </h2>
              <p className="text-[#435063] text-lg max-w-4xl mx-auto text-center">
                The solar panel cleaning service is beneficial in various ways,
                from cost-effectiveness to high efficiency. Here are the
                advantages of using the solar cleaning service.
              </p>
            </div>

            {/* Benefits List */}
            <div className="mt-10 divide-y divide-[#e8eae8]">
              <div className="py-8 first:pt-0">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Expert handling for best results
                </h3>
                <div className="text-[#435063] text-base">
                  Trained technicians monitor the solar cleaning service, adding
                  a human essence to the result-driven cleaning process of the
                  AI-integrated robots.
                </div>
              </div>
              <div className="py-8">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Maintaining Panel Safety
                </h3>
                <div className="text-[#435063] text-base">
                  We prioritise the panel’s safety by using microfiber cloths to
                  focus on gentle yet impactful solar panel maintenance
                  services.
                </div>
              </div>
              <div className="py-8">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Enhanced Efficiency
                </h3>
                <div className="text-[#435063] text-base">
                  The solar panel cleaning service enhances the plant’s
                  effectiveness by ensuring better results in energy generation.
                </div>
              </div>
              <div className="py-8">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Eco-Friendly Solution
                </h3>
                <div className="text-[#435063] text-base">
                  The eco-friendly robots use a waterless cleaning method that
                  contributes towards a sustainable & environmentally friendly
                  initiative.
                </div>
              </div>
              <div className="py-8">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Hassle-free service
                </h3>
                <div className="text-[#435063] text-base">
                  The solar cleaning service is a smooth & stress-free process
                  which ensures zero interruptions to your plant’s daily
                  operations.
                </div>
              </div>
              <div className="py-8 last:pb-0">
                <h3 className="text-[#b2cb19] text-xl mb-2 font-medium">
                  Value for Money
                </h3>
                <div className="text-[#435063] text-base">
                  The solar panel cleaning service is a cost-effective solution,
                  increasing the lifespan of your panels and making them a smart
                  long-term investment.
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section className="w-full py-12 bg-white">
          <Container>
            <div className="mb-8">
              <h2 className="text-[#052638] font-semibold text-4xl md:text-4xl text-center mb-6">
                How Long Does It Take to Clean Solar Panels with Taypro Opex: A
                Solar Panel Cleaning Service?
              </h2>
              <p className="text-[#435063] text-lg max-w-4xl mx-auto text-center">
                The solar panel cleaning service is a fully automated process
                functioning with the help of cleaning robots. <br /> <br />
                Although the solar panel cleaning service is a quick process,
                the time taken for completion depends on the plant itself.{" "}
                <br /> <br />
                The cleaning robots function at a cleaning speed of 10 to 15
                meters per minute, with a maximum running length of up to 2.2
                km. <br /> <br />
                To obtain peak performance & efficiency of the solar plants, a
                dedicated monthly solar cleaning service is scheduled. <br />{" "}
                <br />
                This schedule consists of seven dry cleaning cycles, focusing on
                maximising energy generation and minimising downtime. <br />{" "}
                <br />
                For large-scale power plants, automatic cleaning can be a
                difficult task. But TAYPRO’s solar panel cleaning is ideal for
                such plants. <br /> <br />
                The cleaning operations for these plants are conducted in the
                morning, with a cooler climate and low sunlight intensity. This
                allows an enhanced cleaning process and no interruptions in the
                plant’s operations. <br /> <br />
                Our cleaning cycles are scheduled based on an automatic
                assessment. It considers the plant’s location, climate and the
                panel’s configurations to ensure the best output for the solar
                plant.
              </p>
            </div>
          </Container>
        </section>

        <section className="w-full py-12 bg-white">
          <Container>
            <div className="mb-8">
              <h2 className="text-[#052638] font-semibold text-4xl md:text-4xl text-center mb-6">
                What is the ROI of using TAYPRO&rsquo;s Solar Panel Cleaning Service?
              </h2>
              <p className="text-[#435063] text-lg max-w-4xl mx-auto text-center">
                TAYPRO&rsquo;s solar panel cleaning service primarily focuses
                on increasing the efficiency & effectiveness of your plant,
                significantly boosting the ROI. <br /> <br />
                The consolidated dust & debris on the panel can lower the panel
                efficiency by 20%, directly impacting the energy output and
                financial returns. <br /> <br />
                TAYPRO&rsquo;s solar panel cleaning service uses AI &
                ML-oriented cleaning robots that use a waterless approach to
                clean your solar panels.
                <br /> <br />
                This ensures resource preservation along with consistent
                cleaning, maximising the energy output significantly more as
                compared to the traditional cleaning methods. <br />
                <br />
                By maintaining clean solar panels, the plants can achieve higher
                performance ratios, leading to higher revenue generation. <br />
                <br />
                TAYPRO&rsquo;s{" "}
                <Link href="/solar-panel-cleaning-robot-price-calculator">
                  <span className="cursor-pointer" style={{ color: "#A8C117" }}>
                    ROI calculator
                  </span>
                </Link>{" "}
                helps in understanding the estimated potential savings and
                efficiency increase by using their solar panel cleaning service.
              </p>
            </div>
          </Container>
        </section>

        <ResourcesCard />

        <section className="w-full bg-white py-20 relative overflow-hidden min-h-[480px]">
          <div className="absolute top-7 left-0 right-0 mx-auto w-[98%] h-[85%] bg-[#f4f1e9] rounded-[36px] z-0"></div>

          <Container className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 items-center min-h-[380px]">
            <div className="flex flex-col justify-center h-full">
              <h2 className="text-[#052638] font-semibold text-4xl md:text-5xl lg:text-6xl mb-2">
                Skillful Operation <br /> for Optimal Results
              </h2>
            </div>
            <div className="flex flex-col justify-center h-full relative">
              <p className="text-[#052638] text-lg md:text-xl leading-relaxed max-w-xl ml-auto">
                TAYPRO OPEX prioritizes the use of soft microfiber cloths in its
                cleaning process. This ensures a gentle touch on solar panels,
                preventing scratches or damage while guaranteeing effective dirt
                and dust removal.
              </p>
              {/* Decorative right-side waves: can use a positioned SVG or background image */}
              <svg
                className="hidden md:block absolute top-0 right-0 h-48 w-72 -z-0 opacity-50"
                viewBox="0 0 320 180"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                preserveAspectRatio="none"
              >
                <path
                  d="M10,30 Q80,80 180,40 Q250,10 300,100"
                  stroke="#e0e0d2"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  d="M0,70 Q100,130 250,60 Q310,50 320,140"
                  stroke="#e0e0d2"
                  strokeWidth="2"
                  fill="none"
                />
              </svg>
            </div>
          </Container>
        </section>

        <ModelCards title="Looking for more solutions?" cards={modelBCards} />

        <RequestEstimateForm />
      </div>
    </>
  );
}
