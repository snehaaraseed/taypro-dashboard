import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { productAltText } from "@/lib/products/catalog";
import type { ProductLineupLayout } from "@/lib/products/build-product-lineup";

export type ProductLineupRowProps = {
  model: string;
  marketingName?: string;
  description: string;
  href: string;
  topViewPath?: string;
  topViewWidth?: number;
  topViewHeight?: number;
  layout: ProductLineupLayout;
  exploreLabel: string;
  priority?: boolean;
};

const DIVIDER = "border-t border-[#052638]/15";

function ExploreCta({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-2 shrink-0"
    >
      <span className="inline-flex min-h-[30px] items-center rounded-full bg-[#e8e8e8] px-4 text-xs font-medium text-[#052638] transition-colors group-hover:bg-[#A8C117] group-hover:font-semibold">
        {label}
      </span>
      <span className="inline-flex size-[38px] items-center justify-center rounded-sm border border-[#052638]/20 bg-[#e8e8e8] text-[#052638] transition-colors group-hover:border-[#A8C117] group-hover:bg-[#A8C117]">
        <ArrowUpRight className="size-4" aria-hidden />
      </span>
    </Link>
  );
}

function ProductName({ model, large = false }: { model: string; large?: boolean }) {
  return (
    <p
      className={`text-[#052638] font-semibold tracking-tight uppercase leading-none ${
        large
          ? "text-3xl sm:text-4xl md:text-[50px] leading-tight normal-case"
          : "text-xl sm:text-2xl"
      }`}
    >
      {model}
    </p>
  );
}

function TopViewImage({
  src,
  alt,
  width,
  height,
  priority,
  className = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex w-full justify-center ${className}`.trim()}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        priority={priority}
        loading={priority ? "eager" : "lazy"}
        sizes={`${width}px`}
        unoptimized
        className="h-auto w-full"
        style={{ maxWidth: width }}
      />
    </div>
  );
}

export default function ProductLineupRow({
  model,
  marketingName,
  description,
  href,
  topViewPath,
  topViewWidth,
  topViewHeight,
  layout,
  exploreLabel,
  priority = false,
}: ProductLineupRowProps) {
  const imageAlt = productAltText(model, marketingName);
  const hasTopView =
    Boolean(topViewPath) &&
    topViewWidth != null &&
    topViewHeight != null &&
    topViewWidth > 0 &&
    topViewHeight > 0;

  if (layout === "text") {
    return (
      <article className="py-8 md:py-10">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-xl space-y-3">
            <ProductName model={model} large />
            <p className="text-[#052638]/80 text-sm sm:text-base leading-relaxed max-w-md">
              {description}
            </p>
          </div>
          <ExploreCta href={href} label={exploreLabel} />
        </div>
        <div className={`${DIVIDER} mt-8 md:mt-10`} />
      </article>
    );
  }

  if (layout === "split" && hasTopView) {
    return (
      <article>
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_1px_minmax(0,0.85fr)] gap-6 md:gap-8 items-center py-6 md:py-8">
          <div className="flex flex-col gap-4 md:pr-2">
            <ProductName model={model} />
            <p className="text-[#052638]/80 text-xs sm:text-sm leading-relaxed max-w-sm">
              {description}
            </p>
            <div className="pt-1">
              <ExploreCta href={href} label={exploreLabel} />
            </div>
          </div>

          <div className="hidden md:block w-px bg-[#052638]/15 self-stretch min-h-[120px]" aria-hidden />

          <TopViewImage
            src={topViewPath!}
            alt={imageAlt}
            width={topViewWidth!}
            height={topViewHeight!}
            priority={priority}
            className="w-full max-w-md md:max-w-none md:justify-self-end"
          />
        </div>
        <div className={DIVIDER} />
      </article>
    );
  }

  return (
    <article>
      <div className="grid grid-cols-1 gap-4 py-6 md:py-8 lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <ProductName model={model} />
        <p className="text-[#052638]/80 text-xs sm:text-sm leading-relaxed lg:max-w-md xl:max-w-lg">
          {description}
        </p>
        <div className="lg:justify-self-end">
          <ExploreCta href={href} label={exploreLabel} />
        </div>
      </div>

      <div className={DIVIDER} />

      {hasTopView ? (
        <TopViewImage
          src={topViewPath!}
          alt={imageAlt}
          width={topViewWidth!}
          height={topViewHeight!}
          priority={priority}
          className="mt-1 mb-4 md:mb-5 w-full"
        />
      ) : null}

      <div className={DIVIDER} />
    </article>
  );
}
