import Image from "next/image";
import { Check } from "lucide-react";
import { robots, features, otherFeatures } from "@/app/data";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { RobotCard } from "@/app/components/RobotCard";
import ClientsCard from "@/app/components/ClientsCard";
import SEO from "@/app/components/SEO";

export default function HomePage() {
  const breadcrumbs = [{ name: "Home", href: "/" }];
  return (
    <>
      <SEO
        title="Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency."
        description="Taypro is a Solar Panel Cleaning Company. We provide end to end ROI Solar Cleaning Service to improve Solar Plant Efficiency."
        keywords="solar panel cleaning service, automatic solar robot, taypro"
        url="http://localhost:3000/solar-robots/solar-panel-cleaning-service"
        breadcrumbs={breadcrumbs}
      />
      <div className="min-h-screen">
        <section className="relative overflow-hidden px-15">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
            {/* Left Content - Now takes 2/3 of the width */}
            <div className="text-white space-y-10 lg:col-span-2">
              <div className="text-5xl lg:text-6xl lg:text-8xl font-semibold ">
                Delivering{" "}
                <span className="text-[#39D600]">
                  Solar Cleaning Robots With
                </span>
                <br />
                Highest Up-Time Guarantee.
              </div>

              <p className="text-lg lg:text-xl text-gray-300 leading-relaxed max-w-3xl">
                For Greater Plant Performance Ratio, Unstoppable Power
                Generation and Intelligent AI & ML Driven Robotics.
              </p>
            </div>

            {/* Right Content - Robot Image - Takes 1/3 of the width */}
            <div className="lg:col-span-1">
              <Image
                src="/robot-hero.png"
                alt="Solar Panel Cleaning Robot"
                width={600}
                height={900}
                priority
              />
            </div>
          </div>
        </section>

        {/* Features Section with Video */}
        <section className="p-16 lg:py-24 bg-white">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-semibold text-[#052638] mb-4">
              Driving Unstoppable Power Generation.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content - Video */}
            <div className="aspect-video m-auto h-70 w-120 overflow-hidden shadow-2xl ">
              <iframe
                src="https://www.youtube.com/embed/PiXJhQ_MYgk?si=69CgiggHsM73CRl_"
                title="TAYPRO - Robotic Solar Panel Cleaning"
                className="flex justify-center items-center w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>

            {/* Right Content - Features List */}
            <div className="space-y-8">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <Check className="text-[#39D600]" strokeWidth={2} />
                  </div>
                  <div>
                    <div className="text-xl font-semibold text-[#052638] italic">
                      {feature.title}
                    </div>
                    <span className="text-gray-600 leading-relaxed italic">
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

        {/* third section */}
        <section className="p-5 mx-10">
          {/* Section Title */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 m-30 items-center">
            {/* Right Content - Features List */}
            <div className="space-y-8">
              <h5 className="text-4xl lg:text-4xl font-semibold text-white ml-25">
                Our Robotics technology
              </h5>
              {otherFeatures.map((feature, idx) => (
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

            {/* Left Content - Video */}
            <div className="">
              <Image
                src="/robots.png"
                alt="Solar Panel Cleaning Robot"
                width={600}
                height={900}
                priority
              />
            </div>
          </div>
        </section>

        {/* forth section */}
        <section className="pt-16 bg-white">
          <div className="text-center my-12">
            <h6 className="text-4xl font-semibold">
              High-Tech Solar Cleaning Robots
            </h6>
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

        {/* fifth section */}
        <section className="py-16 bg-white">
          <div className="text-center ">
            <h1 className="text-3xl lg:text-5xl lg:text-3xl font-bold ">
              Calculate How Much Can Solar Cleaning <br /> Robots Save?
            </h1>
            <h3 className="text-gray-700 my-6 text-lg">
              Solar Cleaning robots not only increase the overall efficiency of
              the solar power plant but also save significant <br /> costs.
            </h3>
          </div>
        </section>

        {/* sixth section */}
        <ClientsCard />

        {/* seventh section */}
        <RequestEstimateForm />
      </div>
    </>
  );
}
