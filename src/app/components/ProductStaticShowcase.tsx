"use client";

import Image from "next/image";
import { AnimateOnScroll } from "./AnimateOnScroll";
import { Container } from "./Container";
import YouTubeEmbed from "./YouTubeEmbed";

type ProductStaticShowcaseProps = {
  imageSrc: string;
  imageAlt: string;
  /** Optional extra gallery images (detail shots). */
  detailImages?: string[];
  eyebrow: string;
  title: string;
  subtitle: string;
  innovationTitle?: string;
  innovationBody?: string;
  tourEyebrow?: string;
  tourTitle?: string;
  tourSubtitleMobile?: string;
  tourSubtitleDesktop?: string;
  sectionBadge?: string;
  sectionTitle?: string;
  /** Native width/height ratio, e.g. "2440 / 987". */
  imageAspectRatio?: string;
  /** Optional YouTube product video; replaces the image gallery when set. */
  youtubeVideoId?: string;
};

export default function ProductStaticShowcase({
  imageSrc,
  imageAlt,
  detailImages,
  eyebrow,
  title,
  subtitle,
  innovationTitle,
  innovationBody,
  tourEyebrow,
  tourTitle,
  tourSubtitleMobile,
  tourSubtitleDesktop,
  sectionBadge,
  sectionTitle,
  imageAspectRatio = "4 / 3",
  youtubeVideoId,
}: ProductStaticShowcaseProps) {
  const hasInnovationPanel = Boolean(innovationTitle && innovationBody);
  const displayEyebrow = tourEyebrow ?? eyebrow;
  const displayTitle = tourTitle ?? title;
  const displaySubtitleMobile = tourSubtitleMobile ?? subtitle;
  const displaySubtitleDesktop = tourSubtitleDesktop ?? subtitle;

  const galleryImages = [imageSrc, ...(detailImages ?? [])];

  const mediaBlock = youtubeVideoId ? (
    <div className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-black/5">
        <YouTubeEmbed
          videoId={youtubeVideoId}
          title={imageAlt}
          location="product_page"
          className="w-full rounded-lg overflow-hidden"
        />
      </div>
    </div>
  ) : (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {galleryImages.map((src, index) => (
        <div
          key={src}
          className="rounded-2xl bg-white p-4 sm:p-6 shadow-lg ring-1 ring-black/5"
        >
          <div
            className="relative w-full"
            style={{ aspectRatio: imageAspectRatio }}
          >
            <Image
              src={src}
              alt={index === 0 ? imageAlt : `${imageAlt}, detail ${index}`}
              fill
              className="object-contain"
              sizes="(max-width: 1024px) 100vw, 640px"
              priority={index === 0}
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (!hasInnovationPanel) {
    return (
      <section
        className="w-full py-20 bg-white"
        style={{
          background: "url('/tayprobglayout/taypro-semi.png') repeat",
          backgroundSize: "auto",
        }}
      >
        <Container>
          <AnimateOnScroll animation="fadeInUp" className="text-center mb-10">
            <div className="text-[#A8C117] text-base sm:text-lg font-medium mb-3">
              {eyebrow}
            </div>
            <h2 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4 leading-tight">
              {title}
            </h2>
            <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
              {subtitle}
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll animation="fadeInUp" delay={100} className="flex justify-center">
            <div className="w-full max-w-4xl">{mediaBlock}</div>
          </AnimateOnScroll>
        </Container>
      </section>
    );
  }

  return (
    <section
      className="w-full py-20 bg-white"
      style={{
        background: "url('/tayprobglayout/taypro-semi.png') repeat",
        backgroundSize: "auto",
      }}
    >
      <Container>
        <AnimateOnScroll animation="fadeInUp" className="text-center mb-12">
          {sectionBadge ? (
            <div className="text-[#A8C117] text-md font-medium mb-6">
              {sectionBadge}
            </div>
          ) : null}
          {sectionTitle ? (
            <h2 className="text-[#052638] font-semibold text-3xl md:text-4xl lg:text-5xl leading-tight max-w-4xl mx-auto">
              {sectionTitle}
            </h2>
          ) : null}
        </AnimateOnScroll>

        <div className="block lg:hidden">
          <AnimateOnScroll animation="fadeInUp" delay={100} className="mb-6">
            <div className="text-center mb-8">
              <div className="text-[#A8C117] text-xl sm:text-2xl font-medium mb-2">
                {displayEyebrow}
              </div>
              <h3 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-4">
                {displayTitle}
              </h3>
              <div className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
                {displaySubtitleMobile}
              </div>
            </div>
            {mediaBlock}
          </AnimateOnScroll>

          <AnimateOnScroll animation="fadeInUp" delay={200} className="bg-[#7da300] p-6">
            <h3 className="text-white text-start text-xl sm:text-2xl mb-4">
              {innovationTitle}
            </h3>
            <div className="text-white text-start text-sm sm:text-base leading-relaxed">
              {innovationBody}
            </div>
          </AnimateOnScroll>
        </div>

        <div className="hidden lg:block">
          <div className="flex flex-col lg:flex-row items-start gap-8 lg:gap-12">
            <AnimateOnScroll
              animation="fadeInLeft"
              delay={100}
              className="flex-1 flex flex-col"
            >
              <div className="text-center mb-3">
                <h3 className="text-[#052638] font-semibold text-3xl sm:text-4xl md:text-5xl mb-2">
                  {displayTitle}
                </h3>
                <div className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto mb-4">
                  {displaySubtitleDesktop}
                </div>
              </div>
              {mediaBlock}
            </AnimateOnScroll>

            <AnimateOnScroll
              animation="fadeInRight"
              delay={200}
              className="flex-1 bg-[#7da300] p-6 max-w-lg h-fit self-center"
            >
              <h3 className="text-white text-start text-2xl mb-4">
                {innovationTitle}
              </h3>
              <div className="text-white text-start text-md leading-relaxed">
                {innovationBody}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </Container>
    </section>
  );
}
