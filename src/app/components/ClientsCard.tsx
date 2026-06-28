"use client";

import Image from "next/image";
import { clientPartners } from "@/app/data";
import { AnimateOnScroll } from "@/app/components/AnimateOnScroll";

export type ClientLogoItem = {
  logoSrc: string;
  alt: string;
  title: string;
};

interface ClientsCardProps {
  heading?: string;
  trustedByText?: string;
  logos?: ClientLogoItem[];
}

export default function ClientsCard({
  heading = "Our Esteemed Clients",
  trustedByText,
  logos,
}: ClientsCardProps) {
  const items: ClientLogoItem[] =
    logos ??
    clientPartners.map((partner) => ({
      logoSrc: partner.logoSrc,
      alt: `${partner.name}, Taypro solar cleaning robot customer`,
      title: partner.name,
    }));

  const trustedBy =
    trustedByText ??
    `Trusted by ${clientPartners.map((partner) => partner.name).join(", ")} and other leading solar IPPs, EPCs, and C&I operators across India.`;

  return (
    <section
      className="bg-white flex flex-col items-center py-16 md:py-20 px-4 md:px-0 border-t border-gray-200/80"
      aria-labelledby="clients-heading"
    >
      <AnimateOnScroll
        animation="fadeInUp"
        className="text-3xl md:text-5xl font-semibold text-[#052638] mb-4 text-center max-w-4xl"
      >
        <h2 id="clients-heading">{heading}</h2>
      </AnimateOnScroll>

      {trustedBy ? (
        <p className="text-center text-gray-600 max-w-3xl mx-auto mb-10 px-4 text-sm md:text-base leading-relaxed">
          {trustedBy}
        </p>
      ) : null}

      <div className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 w-full max-w-7xl mx-auto gap-4 md:gap-5">
          {items.map((item, idx) => (
            <AnimateOnScroll
              key={item.logoSrc}
              animation="scaleIn"
              delay={idx * 80}
              className="flex items-center justify-center border border-[#1c201f] bg-white h-[140px] sm:h-[210px] px-4 transition-all duration-300 hover:shadow-lg hover:border-[#39D600] transform hover:-translate-y-1"
            >
              <div className="relative h-[120px] w-full max-w-[80%]">
                <Image
                  src={item.logoSrc}
                  alt={item.alt}
                  title={item.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 160px"
                  className="object-contain transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                />
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
