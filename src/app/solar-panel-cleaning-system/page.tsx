"use client";
import Image from "next/image";
import CallbackCard from "@/app/components/CallbackCard";
import ClientsCard from "@/app/components/ClientsCard";
import { RobotCard } from "@/app/components/RobotCard";
import {
  faqs,
  moreFaqs,
  robotFeatures,
  robotProducts,
  robotSolutions,
  robotsAdvantages,
  toDoFeatures,
} from "@/app/data";
import { Check } from "lucide-react";
import { useState } from "react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import Link from "next/link";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Solar Panel Cleaning Robots", href: "" },
];

export default function SolarPanelCleaningRobot() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [openMoreFaqIndex, setOpenMoreFaqIndex] = useState<number | null>(null);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="pt-2 pb-20 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center my-12">
              <h1 className="text-4xl sm:text-6xl font-semibold">
                Solar Panel Cleaning Robot <br /> With Highest Uptime
              </h1>
              <div className="text-green-700 my-6 text-base sm:text-lg leading-relaxed">
                We design and deliver efficient Solar Panel Cleaning Robots with
                the highest up-time guarantee. We offer tech-driven and
                AI-oriented cleaning solutions for unstoppable power generation.
                Discover more about our waterless solar panel cleaning robots.
              </div>
            </AnimateOnScroll>
            <div className="mt-12">
              <AnimateOnScroll animation="fadeInUp" className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#052638]">
                  Our Cleaning Robots
                </h2>
              </AnimateOnScroll>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch gap-6">
                {robotProducts.map((robot, idx) => (
                  <AnimateOnScroll key={robot.model} animation="scaleIn" delay={idx * 150}>
                    <RobotCard robot={robot} priority={idx === 0} />
                  </AnimateOnScroll>
                ))}
              </div>
            </div>

            <div className="mt-16">
              <AnimateOnScroll animation="fadeInUp" className="mb-6 text-center">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-[#052638]">
                  Software & Services
                </h2>
              </AnimateOnScroll>
              <div className="flex flex-col sm:flex-row flex-wrap justify-center items-stretch gap-6">
                {robotSolutions.map((robot, idx) => (
                  <AnimateOnScroll key={robot.model} animation="scaleIn" delay={idx * 150}>
                    <RobotCard robot={robot} />
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </Container>
        </section>

        <section className="py-12 lg:py-16 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight mb-4">
                Calculate How Much Solar Cleaning Robots Can Save
              </h2>
            </AnimateOnScroll>
          </Container>

          <ROITayproCalculator />
        </section>

        <CallbackCard headerText={""} />

        <ClientsCard />

        <section className="py-16 sm:py-24">
          <Container>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              {/* Right Content - Features List */}
              <div className="space-y-6 sm:space-y-8">
                <AnimateOnScroll animation="fadeInUp">
                  <h2 className="text-2xl sm:text-4xl font-semibold text-white">
                    Features of Taypro&rsquo;s Solar Panel Cleaning Robots
                  </h2>
                </AnimateOnScroll>
                {robotFeatures.map((feature, idx) => (
                  <AnimateOnScroll key={idx} animation="fadeInLeft" delay={idx * 100} className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-white">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-white/90 text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
              {/* left content  */}
              <AnimateOnScroll animation="fadeInRight" delay={100}>
                <Image
                  src="/tayproasset/taypro-robotFeature.jpg"
                  alt="Taypro Solar Panel Cleaning Robot Features - Autonomous waterless cleaning with AI-powered scheduling"
                  title="Solar Panel Cleaning Robot Features by Taypro"
                  width={400}
                  height={600}
                  className="w-full h-auto"
                />
              </AnimateOnScroll>
            </div>
          </Container>
        </section>
        <section className="py-16 sm:py-24 bg-white relative overflow-hidden">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10 sm:mb-16">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#052638] mb-3 sm:mb-4">
                Advantages Of Using Solar Panel Cleaning Robots
              </h2>
            </AnimateOnScroll>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              {/* Left Content - Image */}
              <AnimateOnScroll animation="fadeInLeft" delay={100}>
                <Image
                  src="/tayprosolarpanel/taypro-solar-panel.jpg"
                  alt="Taypro Solar Panel Cleaning Robot cleaning solar panels at solar farm - Increase efficiency up to 30%"
                  title="Solar Panel Cleaning Robot by Taypro"
                  width={400}
                  height={400}
                  className="w-full h-auto"
                />
              </AnimateOnScroll>

              {/* Right Content - Features List */}
              <div className="space-y-5 sm:space-y-8">
                {robotsAdvantages.map((feature, idx) => (
                  <AnimateOnScroll key={idx} animation="fadeInRight" delay={idx * 100} className="flex items-start space-x-3 sm:space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      <Check className="text-[#39D600]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-lg sm:text-xl font-semibold text-[#052638]">
                        {feature.title}
                      </div>
                      <span className="leading-relaxed text-gray-600 text-sm sm:text-base">
                        {feature.description}
                      </span>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </Container>

          {/* Background decorative elements hidden on mobile */}
          <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32 pointer-events-none"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32 pointer-events-none"></div>
        </section>
        <section className="py-10 bg-white">
          <Container>
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                How Long Does It Take To Install The Solar Panel Cleaning Robots?
              </h2>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-sm sm:text-xl leading-relaxed">
              It takes around a few hours to a day to install solar panel
              cleaning robots on the roof. The involved time depends on the
              nature of the cleaning robots, the base of the solar panels, and
              the installation site accessibility.
              <br />
              <br />A simple and smooth panel layout enables reliable and quick
              robot installations. The model of the robots also plays a major
              role in determining the overall installation time.
            </div>

            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                What Is The ROI For Installing Solar Panel Cleaning Robots?
              </h2>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-sm sm:text-xl leading-relaxed">
              Solar Panel Cleaning Robots help save human resources and labour
              costs. A single solar panel cleaning robot can be an alternative
              to 8-10 skilled labourers. The cleaning through robotics ensures
              complete safety and quality. It saves time and effort.
              <br />
              <br />
              The tech-oriented solar panel cleaning further fosters power
              generation at lower costs and longevity of solar panels. This
              results in greater returns on investment.
              <br />
              <br />
              You can check the ROI by using our Solar Panel Cleaning
              <Link
                href="/solar-panel-cleaning-robot-price-calculator"
                passHref
              >
                <span style={{ color: "#A8C117" }}>Robots ROI Calculator.</span>
              </Link>
            </div>

            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                What Are Solar Panel Cleaning Robots?
              </h2>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-sm sm:text-xl leading-relaxed">
              Solar Panel Cleaning Robots are tech-based automated machines to
              clean the surface of large solar panels. Solar panel cleaning
              robots ensure maximum efficiency and at lower cost and zero damage
              to panels.
              <br />
              <br />
              These robots work on automated service portals while integrating
              AI and ML intelligence. These robots offer semi-automated and
              automated cleaning solutions without the usage of water.
            </div>

            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                How Does Solar Panel Cleaning Robot Work?
              </h2>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-sm sm:text-xl leading-relaxed">
              Solar panel cleaning robots work utilising ML systems. It
              comprises a dual-pass method of cleaning. It uses air pressure and
              microfibre cloth.
              <br />
              <br />
              Most of the solar panel cleaning robots have in-built charging
              systems. This provides an eco-friendly approach to cleaning solar
              panels.
              <br />
              <br />
              The cleaning robot functions through the automated system that
              controls and inspects the operations of the robots on the solar
              panels. The advanced technology in the cleaning robots results in
              smooth movements from one panel to another panel.
            </div>

            <AnimateOnScroll animation="fadeInUp">
              <h2 className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
                How Often Does The Solar Panel Needs To Be Cleaned?
              </h2>
            </AnimateOnScroll>

            <div className="text-gray-600 my-6 text-sm sm:text-xl leading-relaxed">
              The solar panels should be cleaned frequently to ensure their
              efficiency. Depending on the location, we can plan its schedule of
              cleaning. The soiling on the solar panels can reduce its
              efficiency and overall energy output.
              <br />
              <br />
              If the project is in a more dusty area, then the panel needs to be
              cleaned more frequently. Even during monsoons, there is a need to
              maintain the cleanliness of the solar panels as the rain also
              carries dust. Thus, it is always recommended to use cleaning
              robots for solar panels due to their huge efficiency and
              compatibility.
            </div>
          </Container>
        </section>
        <section className="w-full items-center py-24 bg-[#052638] bg-center">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <h2 className="text-white font-semibold text-3xl sm:text-5xl text-start mb-8 sm:mb-12">
                What Are The Things To Keep In Mind While Cleaning Solar Panels?
              </h2>
              <div className="text-white/90 text-base sm:text-lg text-start mb-10 sm:mb-12">
                There are many vital aspects to consider while cleaning solar
                panels. These are mentioned below:
              </div>
            </AnimateOnScroll>

            {toDoFeatures.map((feature, idx) => (
              <AnimateOnScroll key={idx} animation="fadeInLeft" delay={idx * 100} className="flex items-start space-x-3 sm:space-x-4 mb-6 sm:mb-8">
                <div className="flex-shrink-0 mt-1">
                  <Check className="text-[#39D600]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white/90 text-sm sm:text-lg leading-relaxed">
                    {feature.title}
                  </p>
                </div>
              </AnimateOnScroll>
            ))}
          </Container>
        </section>
        <section className="w-full py-10 bg-white">
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp" className="font-semibold text-[#052638] text-2xl sm:text-5xl mb-6 sm:mb-8 text-center">
              <h2>FAQs</h2>
            </AnimateOnScroll>
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-3 text-base sm:text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-lg select-none">
                    {openFaqIndex === idx ? "-" : "+"}
                  </span>
                  <h3>{faq.question}</h3>
                </button>
                <div
                  className={`grid pl-12 pr-4 text-sm sm:text-base text-[#052638] transition-all duration-200 ${
                    openFaqIndex === idx
                      ? "grid-rows-[1fr] opacity-100 pb-6"
                      : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <div className="overflow-hidden">{faq.answer}</div>
                </div>
              </div>
            ))}

            {moreFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-3 text-base sm:text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenMoreFaqIndex(openMoreFaqIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-lg select-none">
                    {openMoreFaqIndex === idx ? "-" : "+"}
                  </span>
                  <h3>{faq.question}</h3>
                </button>
                <div
                  className={`grid pl-12 pr-4 text-sm sm:text-base text-[#052638] transition-all duration-200 ${
                    openMoreFaqIndex === idx
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

        <RequestEstimateForm />
      </div>
    </>
  );
}
