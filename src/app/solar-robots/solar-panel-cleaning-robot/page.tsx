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
import SEO from "@/app/components/SEO";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Solar Panel Cleaning Robots", href: "" },
];

export default function SolarPanelCleaningRobot() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <>
      <SEO
        title="Solar Panel Cleaning Robot | Taypro"
        description="Solar Module Cleaning System by Taypro has highest Uptime and Return on Investment by using Solar Panel Cleaning Robots for efficiency. Enquire Today!"
        keywords="solar panel cleaning robot, automatic solar robot, taypro, predictive solar cleaning, battery efficiency, semi automatic, capex"
        url="http://localhost:3000/solar-robots/solar-panel-cleaning-robot"
        breadcrumbs={breadcrumbs}
        faqs={[faqs, moreFaqs]}
      />
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="pt-2 pb-20 bg-white">
          <div className="text-center my-12">
            <h2 className="text-6xl font-semibold">
              Solar Panel Cleaning System <br /> With Highest Uptime
            </h2>
            <h1 className="text-green-700 my-6 text-lg">
              We design and deliver efficient Solar Panel Cleaning Robots with
              the highest up-time guarantee. We offer tech- <br /> driven and
              AI-oriented cleaning solutions for unstoppable power generation.
              Discover more about our waterless <br />
              solar panel cleaning robots.
            </h1>
          </div>
          <div className="flex justify-center align-center px-4">
            {robots.slice(0, 3).map((robot) => (
              <RobotCard key={robot.model} robot={robot} />
            ))}
          </div>

          <div className="flex justify-center align-center px-4">
            {robots.slice(3).map((robot) => (
              <RobotCard key={robot.model} robot={robot} />
            ))}
          </div>
        </section>

        <CallbackCard
          headerText={
            <>
              Calculate How Much Can Solar Cleaning <br /> Robots Save?
            </>
          }
        />

        <ClientsCard />

        <section className="p-5 mx-10">
          {/* Section Title */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 m-30 items-center">
            {/* Right Content - Features List */}
            <div className="space-y-8">
              <div className="text-4xl lg:text-4xl font-semibold text-white ml-10">
                Features of Taypro’s Solar Panel Cleaning Robots
              </div>
              {robotFeatures.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Check className="text-[#39D600]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-white">
                      {feature.title}
                    </div>
                    <span className="text-gray-600 leading-relaxed text-white/90">
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {/* left content  */}
            <div className="">
              <Image
                src="/taypro-robotFeature.jpg"
                alt="Taypro Robot Feature"
                width={600}
                height={900}
                priority
              />
            </div>
          </div>
        </section>

        <section className="p-16 lg:py-24 bg-white">
          {/* <div className="container mx-auto px-4"> */}
          {/* Section Title */}
          <div className="text-center mb-16">
            <div className="text-4xl lg:text-5xl font-semibold text-[#052638] mb-4">
              Driving Unstoppable Power Generation.
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Video */}
            {/* <div className="aspect-video m-auto h-70 w-120 overflow-hidden shadow-2xl"> */}
            <div className="">
              <Image
                src="/taypro-solar-panel.jpg"
                alt="Taypro Solar Panel Robot"
                width={600}
                height={600}
                priority
              />
            </div>

            {/* Right Content - Features List */}
            <div className="space-y-8">
              {robotsAdvantages.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Check className="text-[#39D600]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-[#052638]">
                      {feature.title}
                    </div>
                    <span className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* </div> */}

          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#39D600]/5 rounded-full blur-3xl -translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#052638]/5 rounded-full blur-3xl translate-x-32 translate-y-32"></div>
        </section>

        <section className="py-10 bg-white">
          <div className="text-start m-30 ">
            <div className="mt-10 text-3xl lg:text-5xl lg:text-3xl font-semibold ">
              How Long Does It Take To Install The Solar Panel Cleaning Robots?
            </div>

            <div className="text-gray-600 my-6 text-xl">
              It takes around a few hours to a day to install solar panel
              cleaning robots on the roof. The involved time depends on the
              nature of the cleaning robots, the base of the solar panels, and
              the installation site accessibility.
              <br />
              <br />A simple and smooth panel layout enables reliable and quick
              robot installations. The model of the robots also plays a major
              role in determining the overall installation time.
            </div>

            <div className="mt-30 text-3xl lg:text-5xl lg:text-3xl font-semibold ">
              What Is The ROI For Installing Solar Panel Cleaning Robots?
            </div>

            <div className="text-gray-600 my-6 text-xl">
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
              You can check the ROI by using our Solar Panel Cleaning{" "}
              <span style={{ color: "#A8C117" }}>
                Robots ROI Calculator.
              </span>{" "}
            </div>

            <div className="mt-30 text-3xl lg:text-5xl lg:text-3xl font-semibold ">
              What Are Solar Panel Cleaning Robots?
            </div>

            <div className="text-gray-600 my-6 text-xl">
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

            <div className="mt-30 text-3xl lg:text-5xl lg:text-3xl font-semibold ">
              How Does Solar Panel Cleaning Robot Work?
            </div>

            <div className="text-gray-600 my-6 text-xl">
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

            <div className="mt-30 text-3xl lg:text-5xl lg:text-3xl font-semibold ">
              How Often Does The Solar Panel Needs To Be Cleaned?
            </div>

            <div className="text-gray-600 my-6 text-xl">
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

        <section className="w-full items-center py-24 bg-[#052638] bg-center">
          {/* Decorative SVG lines (right side) */}

          {/* Content Block */}
          <div className="w-500 max-w-6xl mx-auto px-6">
            <div className="text-white font-semibold text-5xl md:text-5xl text-start mb-5">
              What Are The Things To Keep In Mind While Cleaning Solar Panels?
            </div>
            <div className="text-white/90 text-lg md:text-lg text-start mb-12">
              There are many vital aspects to consider while cleaning solar
              panels. These are mentioned below:
            </div>

            {toDoFeatures.map((feature, idx) => (
              <div key={idx} className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Check className="text-[#39D600]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-white/90 mb-7 text-start text-lg">
                    {feature.title}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full mr-50 pb-30 items-center p-50 py-30 bg-white bg-center ">
          <div className="font-semibold text-[#052638] text-5xl mb-8">FAQs</div>
          <div>
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-gray-300">
                <button
                  className={`flex items-center w-full py-2 text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold  rounded-sm mr-4 text-xl select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  {faq.question}
                </button>
                <div
                  className={`pl-16 pr-4 pb-6 text-base text-[#052638] transition-all duration-200 ${
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
                  className={`flex items-center w-full py-2 text-xl font-medium transition-colors duration-200 text-[#052638] hover:text-[#A8C117] cursor-pointer`}
                  onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                >
                  <span className="flex items-center justify-center w-6 h-6 bg-[#052638] text-white font-semibold  rounded-sm mr-4 text-xl select-none">
                    {openIndex === idx ? "-" : "+"}
                  </span>
                  {faq.question}
                </button>
                <div
                  className={`pl-16 pr-4 pb-6 text-base text-[#052638] transition-all duration-200 ${
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
