import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";
import { Container } from "@/app/components/Container";

type CompanyPageHeroProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  bodyBeforeLink: string;
  bodyLink: string;
  bodyAfterLink: string;
  imageAlt: string;
};

export function CompanyPageHero({
  eyebrow,
  title,
  subtitle,
  bodyBeforeLink,
  bodyLink,
  bodyAfterLink,
  imageAlt,
}: CompanyPageHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#052638]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(168,193,23,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,193,23,0.07) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full bg-[#A8C117]/15 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-[#0a6a8a]/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#052638] via-[#052638] to-[#0a3548]"
        aria-hidden
      />

      <Container className="relative">
        <div className="grid items-center gap-10 py-14 md:py-20 lg:grid-cols-12 lg:gap-14 lg:py-24">
          <AnimateOnScroll
            animation="fadeInUp"
            eager
            className="lg:col-span-7 xl:col-span-6"
          >
            <div
              className="mb-6 h-1 w-14 rounded-full bg-gradient-to-r from-[#A8C117] to-[#7be117]/60"
              aria-hidden
            />
            <p className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#A8C117]">
              {eyebrow}
            </p>
            <h1 className="mb-5 font-semibold text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-[3.25rem]">
              {title}
            </h1>
            <p className="mb-6 max-w-2xl text-base font-medium leading-relaxed text-[#c3e052] sm:text-lg md:text-xl">
              {subtitle}
            </p>
            <p className="max-w-2xl text-base leading-relaxed text-white/78 sm:text-lg [&_a]:font-medium [&_a]:text-[#c3e052] [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:no-underline">
              {bodyBeforeLink}{" "}
              <Link href="/solar-panel-cleaning-system">{bodyLink}</Link>{" "}
              {bodyAfterLink}
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll
            animation="fadeInUp"
            eager
            delay={120}
            className="lg:col-span-5 xl:col-span-6"
          >
            <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
              <div
                className="absolute -inset-3 rounded-[1.35rem] bg-gradient-to-br from-[#A8C117] to-[#7be117] opacity-20 blur-2xl"
                aria-hidden
              />
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a3548]/50 shadow-2xl shadow-black/30 ring-1 ring-white/10">
                <div className="relative aspect-[5/4] sm:aspect-[4/3]">
                  <Image
                    src="/tayprosolarpanel/taypro-about1.jpg"
                    alt={imageAlt}
                    fill
                    className="object-cover"
                    style={{ objectPosition: "center 40%" }}
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#052638]/75 via-[#052638]/10 to-transparent" />
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </Container>

      <div
        className="h-px w-full bg-gradient-to-r from-transparent via-[#A8C117]/35 to-transparent"
        aria-hidden
      />
    </section>
  );
}
