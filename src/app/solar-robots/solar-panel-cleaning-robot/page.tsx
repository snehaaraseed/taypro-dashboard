"use client";
import Image from "next/image";
import CallbackCard from "@/app/components/CallbackCard";
import ClientsCard from "@/app/components/ClientsCard";
import { RobotCard } from "@/app/components/RobotCard";
import {
  faqs,
  moreFaqs,
  robotFeatures,
  robots,
  robotsAdvantages,
  toDoFeatures,
} from "@/app/data";
import { Check } from "lucide-react";
import { useState } from "react";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import ROITayproCalculator from "@/app/components/ROICalculator";
import Link from "next/link";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Solar Panel Cleaning Robots", href: "" },
];

export default function SolarPanelCleaningRobot() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="pt-2 pb-20 bg-white px-4 sm:px-6 lg:px-0">
          <div className="text-center my-12 px-2 sm:px-0">
            <h2 className="text-4xl sm:text-6xl font-semibold">
              Solar Panel Cleaning System <br /> With Highest Uptime
            </h2>
            <h1 className="text-green-700 my-6 text-base sm:text-lg px-4 sm:px-0 leading-relaxed">
              We design and deliver efficient Solar Panel Cleaning Robots with
              the highest up-time guarantee. We offer tech- <br /> driven and
              AI-oriented cleaning solutions for unstoppable power generation.
              Discover more about our waterless <br />
              solar panel cleaning robots.
            </h1>
          </div>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
            {robots.slice(0, 3).map((robot) => (
              <RobotCard key={robot.model} robot={robot} />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0 mt-8">
            {robots.slice(3).map((robot) => (
              <RobotCard key={robot.model} robot={robot} />
            ))}
          </div>
        </section>

        <section className="py-12 lg:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-semibold leading-tight mb-4">
                Calculate How Much Can Solar Cleaning Robots Save?
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>Robots Save?
              </h1>
            </div>
          </div>

          <ROITayproCalculator />
        </section>

        <CallbackCard headerText={""} />
        <ClientsCard />
        <section className="p-5 mx-4 sm:mx-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 m-0 sm:m-30 items-center">
            {/* Right Content - Features List */}
            <div className="space-y-6 sm:space-y-8">
              <div className="text-2xl sm:text-4xl font-semibold text-white ml-0 sm:ml-10">
                Features of Taypro’s Solar Panel Cleaning Robots
              </div>
              {robotFeatures.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 sm:space-x-4"
                >
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
                </div>
              ))}
            </div>
            {/* left content  */}
            <div className="px-0 sm:px-0">
              <Image
                src="/tayproasset/taypro-robotFeature.jpg"
                alt="Taypro Robot Feature"
                title="Taypro Robot Feature"
                width={400}
                height={600}
                priority
                className="w-full h-auto"
              />
            </div>
          </div>
        </section>
        <section className="p-8 sm:p-16 lg:py-24 bg-white">
          <div className="text-center mb-10 sm:mb-16 px-4 sm:px-0">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-[#052638] mb-3 sm:mb-4">
              Driving Unstoppable Power Generation.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center px-4 sm:px-0">
            {/* Left Content - Image */}
            <div className="">
              <Image
                src="/tayprosolarpanel/taypro-solar-panel.jpg"
                alt="Taypro Solar Panel Robot"
                title="Taypro Solar Panel Robot"
                width={400}
                height={400}
                priority
                className="w-full h-auto"
              />
            </div>

            {/* Right Content - Features List */}
            <div className="space-y-5 sm:space-y-8">
              {robotsAdvantages.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start space-x-3 sm:space-x-4"
                >
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
                </div>
              ))}
            </div>
          </div>

          {/* Background decorative elements hidden on mobile */}
          <div className="hidden sm:block absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
          <div className="hidden sm:block absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32"></div>
        </section>
        <section className="py-10 bg-white px-4 sm:px-0">
          <div className="text-start m-0 sm:m-30">
            <div className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              How Long Does It Take To Install The Solar Panel Cleaning Robots?
            </div>

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

            <div className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              What Is The ROI For Installing Solar Panel Cleaning Robots?
            </div>

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

            <div className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              What Are Solar Panel Cleaning Robots?
            </div>

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

            <div className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              How Does Solar Panel Cleaning Robot Work?
            </div>

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

            <div className="mt-10 text-2xl sm:text-3xl lg:text-5xl font-semibold">
              How Often Does The Solar Panel Needs To Be Cleaned?
            </div>

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
          </div>
        </section>
        <section className="w-full items-center py-24 bg-[#052638] bg-center px-4 sm:px-6 lg:px-0">
          <div className="max-w-5xl mx-auto px-2 sm:px-6">
            <div className="text-white font-semibold text-3xl sm:text-5xl text-start mb-8 sm:mb-12">
              What Are The Things To Keep In Mind While Cleaning Solar Panels?
            </div>
            <div className="text-white/90 text-base sm:text-lg text-start mb-10 sm:mb-12">
              There are many vital aspects to consider while cleaning solar
              panels. These are mentioned below:
            </div>

            {toDoFeatures.map((feature, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 sm:space-x-4 mb-6 sm:mb-8"
              >
                <div className="flex-shrink-0 mt-1">
                  <Check className="text-[#39D600]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white/90 text-sm sm:text-lg leading-relaxed">
                    {feature.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="w-full px-4 sm:px-0 py-10 bg-white">
          <div className="font-semibold text-[#052638] text-2xl sm:text-5xl mb-6 sm:mb-8 text-center px-2 sm:px-0">
            FAQs
          </div>
          <div className="max-w-5xl mx-auto px-2 sm:px-0">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-3 text-base sm:text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-lg select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  {faq.question}
                </button>
                <div
                  className={`pl-12 pr-4 pb-6 text-sm sm:text-base text-[#052638] transition-all duration-200 ${
                    openIndex === idx
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}

            {moreFaqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-3 text-base sm:text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold rounded-sm mr-4 text-lg select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  {faq.question}
                </button>
                <div
                  className={`pl-12 pr-4 pb-6 text-sm sm:text-base text-[#052638] transition-all duration-200 ${
                    openIndex === idx
                      ? "max-h-40 opacity-100"
                      : "max-h-0 opacity-0 overflow-hidden"
                  }`}
                >
                  {faq.answer}
                </div>
              </div>
            ))}
          </div>
        </section>
        <RequestEstimateForm />
      </div>
    </>
  );
}
