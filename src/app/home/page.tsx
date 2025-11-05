import Image from "next/image";
import dynamic from "next/dynamic";
import { robots, features, otherFeatures } from "@/app/data";
import { RobotCard } from "@/app/components/RobotCard";
import { VideoObjectSchema, ProductSchema } from "@/app/components/StructuredData";
import HomePageInteractive from "./HomePageInteractive";

// Dynamically import AnimateOnScroll (client component) with SSR enabled
const AnimateOnScroll = dynamic(
  () => import("@/app/components/AnimateOnScroll").then(mod => ({ default: mod.AnimateOnScroll })),
  { ssr: true }
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

export default function HomePage() {
  return (
    <>
      <VideoObjectSchema
        name="TAYPRO - Robotic Solar Panel Cleaning - Solar Panel Cleaning Robot"
        description="Watch how Taypro's Solar Panel Cleaning Robot autonomously cleans solar panels at utility-scale solar farms. Our waterless robotic cleaning system increases efficiency up to 30% with AI-powered scheduling."
        thumbnailUrl="https://img.youtube.com/vi/PiXJhQ_MYgk/maxresdefault.jpg"
        uploadDate="2024-01-01"
        embedUrl="https://www.youtube.com/embed/PiXJhQ_MYgk"
        contentUrl="https://www.youtube.com/watch?v=PiXJhQ_MYgk"
      />
      <ProductSchema
        name="Solar Panel Cleaning Robot - Model A"
        description="Autonomous waterless Solar Panel Cleaning Robot with AI-powered scheduling. Increases solar plant efficiency up to 30% with highest uptime guarantee."
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand="Taypro"
        sku="MODEL-A"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
        siteUrl={siteUrl}
      />
      <div className="min-h-screen overflow-x-hidden">
        {/* Hero Section - Server Rendered */}
        <section className="relative overflow-hidden px-4 sm:px-8 lg:px-15 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12 items-center">
            <AnimateOnScroll animation="fadeInRight" delay={0} className="text-white space-y-6 lg:space-y-12 lg:col-span-2">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-8xl font-semibold">
                Delivering{" "}
                <span className="text-[#39D600]">
                  Solar Panel Cleaning Robots With
                </span>
                <br className="hidden sm:block" />
                <span className="sm:hidden"> </span>
                Highest Up-Time Guarantee.
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-gray-300 leading-relaxed max-w-full lg:max-w-3xl">
                Our autonomous Solar Panel Cleaning Robot delivers greater plant performance ratio, unstoppable power generation and intelligent AI & ML driven robotic cleaning for solar farms.
              </p>
            </AnimateOnScroll>

            <AnimateOnScroll animation="fadeInLeft" delay={100} className="lg:col-span-1 flex justify-center lg:justify-end">
              <Image
                src="/tayprorobots/robot-hero.png"
                alt="Taypro Autonomous Solar Panel Cleaning Robot - Waterless robotic cleaning system for solar farms"
                title="Solar Panel Cleaning Robot by Taypro"
                width={600}
                height={900}
                priority
                quality={85}
                className="w-full h-auto"
              />
            </AnimateOnScroll>
          </div>
        </section>

        {/* Robots Section - Server Rendered with Client Animation */}
        <section className="pt-12 lg:pt-40 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-8 lg:mb-12">
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                High-Tech Solar Panel Cleaning Robots
              </h3>
            </AnimateOnScroll>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0">
              {robots.slice(0, 3).map((robot, idx) => (
                <AnimateOnScroll key={robot.model} animation="scaleIn" delay={idx * 150}>
                  <RobotCard robot={robot} />
                </AnimateOnScroll>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-center items-center space-y-6 sm:space-y-0 sm:space-x-6 px-4 sm:px-0 mt-8">
              {robots.slice(3).map((robot, idx) => (
                <AnimateOnScroll key={robot.model} animation="scaleIn" delay={(idx + 3) * 150}>
                  <RobotCard robot={robot} />
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Sections - Client Component */}
        <HomePageInteractive 
          features={features}
          otherFeatures={otherFeatures}
        />
      </div>
    </>
  );
}
