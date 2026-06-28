import Image from "next/image";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { Container } from "./Container";

export type ProductVisualSectionProps = {
  imageSrc: string;
  imageAlt: string;
  eyebrow?: string;
  title?: string;
  caption?: string;
  imageAspectRatio?: string;
  imagePresentation?: "robot-standard" | "robot-wide";
  className?: string;
};

export function ProductVisualSection({
  imageSrc,
  imageAlt,
  eyebrow,
  title,
  caption,
  imageAspectRatio,
  imagePresentation = "robot-standard",
  className = "",
}: ProductVisualSectionProps) {
  const isWide = imagePresentation === "robot-wide";
  const frameStyle = imageAspectRatio
    ? { aspectRatio: imageAspectRatio }
    : isWide
      ? { aspectRatio: "2.2 / 1" }
      : { aspectRatio: "4 / 3" };

  return (
    <section
      id="product-visual"
      className={`bg-[#f4f7f9] py-12 sm:py-16 scroll-mt-24 ${className}`}
      aria-label={title ?? imageAlt}
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="mx-auto max-w-5xl">
          {eyebrow ? (
            <p className="text-[#A8C117] text-base sm:text-lg font-medium mb-3 text-center">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h2 className="text-[#052638] font-semibold text-2xl sm:text-3xl md:text-4xl mb-8 leading-tight text-center">
              {title}
            </h2>
          ) : null}
          <div className="rounded-2xl bg-white p-4 sm:p-8 shadow-lg ring-1 ring-black/5">
            <div className="relative w-full" style={frameStyle}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 92vw, 896px"
              />
            </div>
            {caption ? (
              <p className="mt-4 text-center text-gray-500 text-sm sm:text-base leading-relaxed">
                {caption}
              </p>
            ) : null}
          </div>
        </AnimateOnScroll>
      </Container>
    </section>
  );
}
