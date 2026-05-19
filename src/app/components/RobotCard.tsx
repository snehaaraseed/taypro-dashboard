import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { productAltText } from "@/lib/products/catalog";

type Robot = {
  model: string;
  marketingName?: string;
  description: string;
  imgPath: string;
  href: string;
};

type ImagePresentation = "robot-standard" | "robot-wide" | "photo" | "screenshot";

function getImagePresentation(imgPath: string): ImagePresentation {
  if (imgPath.includes("modelB") || imgPath.includes("modelT")) {
    return "robot-wide";
  }
  if (imgPath.includes("opex")) {
    return "photo";
  }
  if (imgPath.includes("console")) {
    return "screenshot";
  }
  return "robot-standard";
}

const mediaStyles: Record<
  ImagePresentation,
  { bg: string; image: string; pad: string }
> = {
  "robot-standard": {
    bg: "bg-[#0a2a38]",
    pad: "p-5 sm:p-6",
    image:
      "object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]",
  },
  "robot-wide": {
    bg: "bg-[#0a2a38]",
    pad: "p-4 sm:p-5",
    image:
      "object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]",
  },
  photo: {
    bg: "bg-[#0c3040]",
    pad: "p-0",
    image:
      "object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]",
  },
  screenshot: {
    bg: "bg-[#e8eef4]",
    pad: "p-4 sm:p-5",
    image:
      "object-contain object-center transition-transform duration-300 group-hover:scale-[1.02]",
  },
};

export function RobotCard({
  robot,
  priority = false,
  preferGenericTitle = false,
  className = "",
}: {
  robot: Robot;
  priority?: boolean;
  preferGenericTitle?: boolean;
  className?: string;
}) {
  const showGeneric =
    preferGenericTitle && Boolean(robot.marketingName?.trim());
  const cardTitle = showGeneric ? robot.marketingName! : robot.model;
  const presentation = getImagePresentation(robot.imgPath);
  const media = mediaStyles[presentation];

  const getAltText = () => {
    if (showGeneric && robot.marketingName) {
      return `Taypro ${robot.marketingName}`;
    }
    return productAltText(robot.model, robot.marketingName);
  };

  return (
    <article
      className={`group flex flex-col h-full w-full rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden hover:border-[#A8C117]/80 hover:shadow-md transition-all duration-300 ${className}`.trim()}
    >
      {/* Fixed-height media frame — same footprint for every card */}
      <div
        className={`relative w-full h-[13.5rem] sm:h-[14.25rem] shrink-0 overflow-hidden ${media.bg}`}
      >
        <div className={`absolute inset-0 ${media.pad}`}>
          <div className="relative w-full h-full">
            <Image
              src={robot.imgPath}
              alt={getAltText()}
              title={`${cardTitle} — Taypro`}
              fill
              className={`transition-transform duration-300 ${media.image}`}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
              priority={priority}
              loading={priority ? "eager" : "lazy"}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-[#052638] p-5">
        <div className="min-h-[3.5rem] mb-2">
          {showGeneric ? (
            <p className="text-[#A8C117] text-[11px] font-semibold uppercase tracking-wider mb-1">
              {robot.model}
            </p>
          ) : null}
          <h3 className="text-[15px] sm:text-base font-semibold text-white leading-snug line-clamp-2">
            {cardTitle}
          </h3>
        </div>
        <p className="text-sm text-white/85 leading-relaxed line-clamp-3 min-h-[4.125rem] mb-4">
          {robot.description}
        </p>
        <Link
          href={robot.href}
          className="mt-auto inline-flex items-center justify-center min-h-[40px] w-full px-4 rounded-lg bg-[#A8C117] text-[#052638] text-sm font-semibold hover:bg-[#b3cf3d] transition text-center"
        >
          Explore {cardTitle}
        </Link>
      </div>
    </article>
  );
}
