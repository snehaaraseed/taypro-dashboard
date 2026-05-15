import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { robots, features, otherFeatures, tayproTrustedByStatsStrip } from "@/app/data";
import { RobotCard } from "@/app/components/RobotCard";
import { Container } from "@/app/components/Container";
import {
  VideoObjectSchema,
  ProductSchema,
  FAQPageSchema,
} from "@/app/components/StructuredData";
import DynamicProjectsRollup from "@/app/components/DynamicProjectsRollup";
import { listAllBlogs } from "@/lib/cms/blogService";
import { getBlogFeaturedImageAlt } from "@/app/utils/imageAlt";
import HomePageInteractive from "./HomePageInteractive";
import HomeHeroCTAs from "./HomeHeroCTAs";
import HomeHeroVideo from "@/app/components/HomeHeroVideo";

const AnimateOnScroll = dynamic(
  () =>
    import("@/app/components/AnimateOnScroll").then((mod) => ({
      default: mod.AnimateOnScroll,
    })),
  { ssr: true }
);

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";
const HERO_VIDEO_ID = "y9iRhH2bLwY";

const homeFaqs = [
  {
    question: "What is a solar panel cleaning robot?",
    answer:
      "A solar panel cleaning robot autonomously removes dust and soiling from PV modules—typically without water. On Indian utility-scale plants, soiling can suppress generation significantly; robotic dry cleaning helps recover yield with predictable cycles and lower O&M friction than manual crews.",
  },
  {
    question: "Which solar panel cleaning robot is right for my plant?",
    answer:
      "Fixed and seasonal-tilt utility plants typically use fully automatic waterless robots. Single-axis tracker sites need tracker-compatible autonomous robots. Scattered or smaller blocks often suit semi-automatic portable robots. You can also choose robotic cleaning as a managed Opex service. Compare options on the solar panel cleaning robots hub.",
  },
  {
    question: "Do Taypro robots use water?",
    answer:
      "No. Taypro uses patented dual-pass dry cleaning—airflow plus microfiber—so you avoid water tankers, module thermal shock, and scarcity constraints in dry regions.",
  },
  {
    question: "How do I estimate ROI before buying?",
    answer:
      "Use the free solar panel cleaning robot ROI calculator on taypro.in, then contact our applications team with your layout for a plant-specific quote and SLA draft.",
  },
  {
    question: "Where are Taypro robots made and supported?",
    answer:
      "Taypro designs and manufactures in Chakan, Pune, with pan-India commissioning, spares, and same-day breakdown targets backed by Taypro Console remote diagnostics.",
  },
];

async function getLatestBlogs(limit = 3) {
  const rows = await listAllBlogs(false);
  return rows.slice(0, limit).map((b) => ({
    title: b.title,
    description: b.description,
    imageAlt: getBlogFeaturedImageAlt({
      title: b.title,
      featuredImageAlt: b.featuredImageAlt,
    }),
    href: `/blog/${b.slug}`,
    date: new Date(b.updatedAt || b.publishDate).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
    image:
      b.featuredImage && b.featuredImage.trim() !== "" ? b.featuredImage : null,
  }));
}

export default async function HomePage() {
  const latestBlogs = await getLatestBlogs(3);

  return (
    <>
      <VideoObjectSchema
        name="TAYPRO - Autonomous Solar Panel Cleaning Robot"
        description="How Taypro's waterless solar panel cleaning robots clean utility-scale plants in India—autonomous dry cleaning with AI scheduling and fleet monitoring."
        thumbnailUrl={`https://img.youtube.com/vi/${HERO_VIDEO_ID}/maxresdefault.jpg`}
        uploadDate="2024-01-01"
        embedUrl={`https://www.youtube.com/embed/${HERO_VIDEO_ID}`}
        contentUrl={`https://www.youtube.com/watch?v=${HERO_VIDEO_ID}`}
      />
      <ProductSchema
        name="Taypro Solar Panel Cleaning Robot"
        description="Autonomous and semi-automatic waterless solar panel cleaning robots with dual-pass dry cleaning and fleet monitoring for utility-scale plants in India."
        image={`${siteUrl}/tayproasset/taypro-robotImage.png`}
        brand="Taypro"
        sku="SOLAR-PANEL-CLEANING-ROBOT"
        offers={{
          price: "Contact for pricing",
          priceCurrency: "INR",
          availability: "https://schema.org/InStock",
        }}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={homeFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        {/* Hero */}
        <section className="relative px-4 sm:px-6 lg:px-8 py-10 md:py-14">
          <Container className="!px-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
              <AnimateOnScroll
                animation="fadeInRight"
                className="text-white space-y-5 lg:space-y-6"
              >
                <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide">
                  Made in India · 5 GW+ deployed
                </p>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
                  Autonomous{" "}
                  <span className="text-[#A8C117]">
                    solar panel cleaning robots
                  </span>{" "}
                  for utility-scale plants
                </h1>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl">
                  Waterless dry cleaning, AI-driven scheduling, and the highest
                  uptime guarantee—built for fixed tilt, seasonal tilt, and
                  single-axis tracker sites across India. Explore{" "}
                  <Link
                    href="/projects"
                    className="text-[#A8C117] font-medium hover:underline"
                  >
                    live projects
                  </Link>{" "}
                  or read insights on our{" "}
                  <Link href="/blog" className="text-[#A8C117] font-medium hover:underline">
                    blog
                  </Link>
                  .
                </p>
                <HomeHeroCTAs />
              </AnimateOnScroll>

              <AnimateOnScroll
                animation="fadeInLeft"
                delay={100}
                className="flex justify-center lg:justify-end"
              >
                <div className="w-full max-w-[720px] aspect-video rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                  <HomeHeroVideo
                    videoId={HERO_VIDEO_ID}
                    title="Taypro autonomous solar panel cleaning robot — waterless utility-scale cleaning"
                  />
                </div>
              </AnimateOnScroll>
            </div>
          </Container>
        </section>

        {/* Stats */}
        <section className="w-full py-10 md:py-12 bg-[#0a3a4a] border-y border-white/10">
          <Container>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <p className="text-[#A8C117] font-semibold text-2xl sm:text-3xl md:text-4xl mb-1">
                    {stat.value}
                  </p>
                  <p className="text-white/80 text-xs sm:text-sm">{stat.label}</p>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        {/* Robots */}
        <section
          className="py-14 md:py-20 bg-white"
          aria-labelledby="robots-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center max-w-3xl mx-auto mb-8">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                Product lineup
              </p>
              <h2
                id="robots-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3"
              >
                Solar panel cleaning robots &amp; services
              </h2>
              <p className="text-[#27415c] text-base md:text-lg leading-relaxed">
                Automatic, semi-automatic, and tracker-ready solar panel cleaning
                robots—plus managed cleaning service and fleet software.{" "}
                <Link
                  href="/solar-panel-cleaning-system"
                  className="text-[#5a8f00] font-medium hover:underline"
                >
                  Compare solar panel cleaning robots
                </Link>
                .
              </p>
            </AnimateOnScroll>

            <div className="space-y-12">
              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  Waterless cleaning robots
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
                  {robots.slice(0, 3).map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className="h-full"
                    >
                      <RobotCard
                        robot={robot}
                        priority={idx === 0}
                        preferGenericTitle
                      />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[#5a7a8f] font-medium text-xs uppercase tracking-wider mb-5 text-center">
                  Service &amp; fleet software
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-8 items-stretch lg:grid-cols-6">
                  {robots.slice(3).map((robot, idx) => (
                    <AnimateOnScroll
                      key={robot.model}
                      animation="fadeInUp"
                      delay={idx * 70}
                      className={`h-full lg:col-span-2 ${
                        idx === 0 ? "lg:col-start-2" : "lg:col-start-4"
                      }`}
                    >
                      <RobotCard robot={robot} preferGenericTitle />
                    </AnimateOnScroll>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>

        <HomePageInteractive
          features={features}
          otherFeatures={otherFeatures}
          homeFaqs={homeFaqs}
        />

        <DynamicProjectsRollup
          eyebrow="Proven in the field"
          heading="Utility-scale cleaning robot deployments"
          subheading="Browse case studies from Indian solar plants using Taypro autonomous and semi-automatic robots."
          limit={4}
          background="white"
        />

        {/* Latest blog */}
        {latestBlogs.length > 0 && (
          <section
            className="py-14 md:py-16 bg-white border-t border-gray-100"
            aria-labelledby="latest-blog-heading"
          >
            <Container>
              <AnimateOnScroll
                animation="fadeInUp"
                className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10"
              >
                <div>
                  <h2
                    id="latest-blog-heading"
                    className="text-[#052638] font-semibold text-3xl md:text-4xl mb-2"
                  >
                    From the blog
                  </h2>
                  <p className="text-[#27415c]">
                    O&amp;M guides, soiling, and robotic cleaning economics.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-2 text-[#5a8f00] font-medium hover:underline shrink-0"
                >
                  View all articles
                  <span aria-hidden>→</span>
                </Link>
              </AnimateOnScroll>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {latestBlogs.map((post, idx) => (
                  <AnimateOnScroll
                    key={post.href}
                    animation="fadeInUp"
                    delay={idx * 80}
                  >
                    <Link
                      href={post.href}
                      className="group flex flex-col h-full rounded-xl border border-gray-200 overflow-hidden bg-[#f8fafb] hover:border-[#A8C117] hover:shadow-md transition"
                    >
                      <div className="relative aspect-[16/10] bg-[#eef3f8]">
                        {post.image ? (
                          <Image
                            src={post.image}
                            alt={post.imageAlt}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        ) : null}
                      </div>
                      <div className="p-5 flex flex-col flex-1">
                        <time className="text-xs text-[#5a8f00] font-medium mb-2">
                          {post.date}
                        </time>
                        <h3 className="text-[#052638] font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#5a8f00] transition-colors">
                          {post.title}
                        </h3>
                        {post.description ? (
                          <p className="text-[#27415c] text-sm line-clamp-2 flex-1">
                            {post.description}
                          </p>
                        ) : null}
                      </div>
                    </Link>
                  </AnimateOnScroll>
                ))}
              </div>
            </Container>
          </section>
        )}
      </div>
    </>
  );
}
