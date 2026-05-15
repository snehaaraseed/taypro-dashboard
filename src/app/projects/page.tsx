import Link from "next/link";
import { getAllFileProjects } from "@/app/utils/projectFileUtils";
import { tayproTrustedByStatsStrip } from "@/app/data";
import { Breadcrumbs } from "../components/Breadcrumbs";
import {
  CollectionPageSchema,
  FAQPageSchema,
  ItemListSchema,
} from "@/app/components/StructuredData";
import { AnimateOnScroll } from "../components/AnimateOnScroll";
import { Container } from "../components/Container";
import ProjectsGrid from "../components/ProjectsGrid";
import CallbackCard from "../components/CallbackCard";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://taypro.in";

const breadcrumbs = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "" },
];

const projectCategories = [
  {
    title: "Automatic",
    href: "/projects/automatic",
    description:
      "Autonomous Model-A and Model-T deployments with AI scheduling, waterless dual-pass cleaning, and fleet monitoring via Taypro Console.",
  },
  {
    title: "Semi-Automatic",
    href: "/projects/semi-automatic",
    description:
      "Model-B portable dry cleaning for scattered blocks, difficult terrain, and plants that need flexible crew-assisted coverage.",
  },
  {
    title: "CAPEX",
    href: "/projects/capex",
    description:
      "Developer-owned robot purchases with Taypro commissioning, training, and pan-India spare support—documented ROI and uptime targets.",
  },
] as const;

const projectsFaqs = [
  {
    question: "What types of solar plants does Taypro document in this portfolio?",
    answer:
      "Our case studies cover utility-scale ground-mount sites, single-axis tracker arrays, and multi-block plants across India—typically 50 MW and above where soiling, water scarcity, or manual O&M costs justify robotic cleaning.",
  },
  {
    question: "What is the difference between automatic, semi-automatic, and CAPEX project listings?",
    answer:
      "Automatic listings highlight fully autonomous robots (Model-A, Model-T). Semi-automatic listings feature Model-B portable systems. CAPEX listings describe plants where the developer purchased robots outright; the same site may also use Taypro Opex as an operator-led service—browse each category or the individual case study for the exact deployment model.",
  },
  {
    question: "How do Taypro cleaning robots affect plant performance ratio?",
    answer:
      "Consistent, weather-aware cleaning reduces soiling losses that can otherwise suppress performance ratio by several percentage points on dusty sites. Case studies note cleaning efficiency targets, cycle frequency, and how waterless methods avoid logistics tied to manual washing.",
  },
  {
    question: "How can I evaluate Taypro for my own solar project?",
    answer:
      "Review the relevant case study for your plant type (fixed tilt vs trackers), explore Model-A, Model-B, or Model-T specifications on the solar panel cleaning system pages, use the ROI calculator, or contact Taypro with your DC capacity and layout for a site-specific proposal.",
  },
];

export default async function ProjectPage() {
  const projects = await getAllFileProjects();

  const itemListEntries = projects.map((p) => ({
    name: p.title,
    url: p.href,
    image: p.img.startsWith("http") ? p.img : p.img,
  }));

  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <CollectionPageSchema
        name="Solar Panel Cleaning Robot Installation Projects"
        description="View Taypro's portfolio of solar panel cleaning robot installation projects across India—automatic, semi-automatic, and CAPEX deployments on utility-scale plants."
        siteUrl={siteUrl}
        url={`${siteUrl}/projects`}
      />
      <ItemListSchema
        scriptId="item-list-schema-projects-hub"
        name="Taypro solar panel cleaning robot installation projects"
        description="Utility-scale solar plants where Taypro robotic cleaning systems are deployed across India."
        items={itemListEntries}
        siteUrl={siteUrl}
      />
      <FAQPageSchema faqs={projectsFaqs} />

      <div className="min-h-screen overflow-x-hidden">
        <section className="relative min-h-[50vh] flex flex-col items-center justify-start overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: "url('/tayprobglayout/taypro-project.png')",
            }}
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-white/90 sm:bg-white/85"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/75"
            aria-hidden
          />

          <AnimateOnScroll
            animation="fadeInUp"
            className="relative z-10 pt-10 px-4 max-w-4xl mx-auto pb-28"
          >
            <p className="text-[#A8C117] text-center text-[16px] mb-4 uppercase tracking-wide">
              Deployments across India
            </p>
            <h1 className="font-semibold text-[#052638] text-4xl md:text-5xl mb-6 text-center leading-tight">
              Solar panel cleaning robot
              <br />
              installation projects
            </h1>
            <p className="text-[#22405a] text-center text-lg md:text-xl leading-relaxed">
              Taypro documents real utility-scale deployments where autonomous and
              semi-automatic{" "}
              <Link
                href="/solar-panel-cleaning-system"
                className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
              >
                solar panel cleaning robots
              </Link>{" "}
              protect performance ratio, cut water use, and replace labour-intensive
              washing. Browse by deployment type or open a case study for capacity,
              location, and cleaning model details.
            </p>
          </AnimateOnScroll>

          <div className="absolute bottom-0 left-0 right-0 z-20 overflow-hidden pointer-events-none">
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

        <section className="w-full py-14 md:py-16 bg-[#052638]">
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
              <p className="text-[#A8C117] text-sm font-medium uppercase tracking-wide mb-2">
                At a glance
              </p>
              <h2 className="text-white font-semibold text-2xl md:text-3xl">
                Proven scale on Indian solar plants
              </h2>
            </AnimateOnScroll>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10 text-center">
              {[...tayproTrustedByStatsStrip].map((stat, idx) => (
                <AnimateOnScroll
                  key={stat.label}
                  animation="fadeInUp"
                  delay={idx * 80}
                  className="px-2"
                >
                  <div className="text-[#A8C117] font-semibold text-3xl sm:text-4xl mb-2">
                    {stat.value}
                  </div>
                  <div className="text-white/80 text-sm sm:text-base">{stat.label}</div>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="w-full py-14 md:py-16 bg-white"
          aria-labelledby="browse-by-type-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="browse-by-type-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Browse by deployment type
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Each category groups plants that share a similar procurement or
                operating model. Individual case studies below may span more than one
                tag—for example, a CAPEX purchase with automatic Model-A robots on
                fixed-tilt arrays.
              </p>
            </AnimateOnScroll>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {projectCategories.map((cat, idx) => (
                <AnimateOnScroll key={cat.href} animation="fadeInUp" delay={idx * 100}>
                  <Link
                    href={cat.href}
                    className="group flex flex-col h-full rounded-lg border border-gray-200 bg-[#f8fafb] p-6 shadow-sm hover:border-[#A8C117] hover:shadow-md transition"
                  >
                    <h3 className="text-[#052638] font-semibold text-xl mb-3 group-hover:text-[#5a8f00] transition-colors">
                      {cat.title} projects
                    </h3>
                    <p className="text-[#27415c] text-base leading-relaxed flex-1">
                      {cat.description}
                    </p>
                    <span className="mt-4 text-[#5a8f00] font-medium text-sm group-hover:underline">
                      View {cat.title.toLowerCase()} case studies →
                    </span>
                  </Link>
                </AnimateOnScroll>
              ))}
            </div>
          </Container>
        </section>

        <section
          className="px-4 sm:px-6 lg:px-8 py-12 md:py-16 bg-[#f4f7f9] overflow-x-hidden"
          aria-labelledby="featured-projects-heading"
        >
          <Container>
            <AnimateOnScroll animation="fadeInUp" className="max-w-3xl mb-10">
              <h2
                id="featured-projects-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-4"
              >
                Featured installation case studies
              </h2>
              <p className="text-[#27415c] text-lg leading-relaxed">
                Select a plant to read commissioning context, robot models used, and
                operational outcomes. For technology background, see{" "}
                <Link
                  href="/cleaning-technology"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  how Taypro cleaning works
                </Link>{" "}
                or estimate savings with the{" "}
                <Link
                  href="/solar-panel-cleaning-robot-price-calculator"
                  className="text-[#5a8f00] font-medium underline-offset-4 hover:underline"
                >
                  ROI calculator
                </Link>
                .
              </p>
            </AnimateOnScroll>
            <ProjectsGrid projects={projects} />
          </Container>
        </section>

        <section
          className="w-full py-16 md:py-20 bg-white px-4 sm:px-6"
          aria-labelledby="projects-faq-heading"
        >
          <Container size="narrow">
            <AnimateOnScroll animation="fadeInUp">
              <h2
                id="projects-faq-heading"
                className="text-[#052638] font-semibold text-3xl md:text-4xl mb-3 text-center"
              >
                Frequently asked questions
              </h2>
              <p className="text-[#27415c] text-center text-lg mb-10 leading-relaxed">
                Common questions from developers and O&amp;M teams reviewing Taypro
                project references.
              </p>
            </AnimateOnScroll>
            <div className="space-y-6">
              {projectsFaqs.map((faq, idx) => (
                <AnimateOnScroll key={faq.question} animation="fadeInUp" delay={idx * 80}>
                  <article className="bg-[#f8fafb] rounded-lg border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-[#052638] font-semibold text-lg mb-3">
                      {faq.question}
                    </h3>
                    <p className="text-[#27415c] leading-relaxed">{faq.answer}</p>
                  </article>
                </AnimateOnScroll>
              ))}
            </div>
            <AnimateOnScroll animation="fadeInUp" delay={200} className="mt-10 text-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center min-h-[48px] bg-[#b2cb19] text-[#22405a] font-medium px-8 py-3 rounded-lg hover:bg-lime-500 transition"
              >
                Discuss your plant
              </Link>
            </AnimateOnScroll>
          </Container>
        </section>

        <CallbackCard headerText="" />
      </div>
    </>
  );
}
