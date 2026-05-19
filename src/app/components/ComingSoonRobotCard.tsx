import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Bell } from "lucide-react";

type ComingSoonRobot = {
  model: string;
  marketingName: string;
  description: string;
  imgPath: string;
  href: string;
  comingSoonLabel: string;
  ctaLabel: string;
};

export function ComingSoonRobotCard({
  robot,
  className = "",
}: {
  robot: ComingSoonRobot;
  className?: string;
}) {
  return (
    <article
      className={`group flex flex-col h-full w-full rounded-2xl border border-gray-200/90 bg-white shadow-sm overflow-hidden hover:border-[#A8C117]/80 hover:shadow-md transition-all duration-300 ${className}`.trim()}
    >
      <div className="relative w-full h-[13.5rem] sm:h-[14.25rem] shrink-0 overflow-hidden bg-[#0a2a38]">
        <span className="absolute top-3 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-[#A8C117] px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#052638]">
          <Bell className="h-3.5 w-3.5" aria-hidden />
          {robot.comingSoonLabel}
        </span>
        <div className="absolute inset-0 p-5 sm:p-6">
          <div className="relative w-full h-full">
            <Image
              src={robot.imgPath}
              alt={`Taypro ${robot.marketingName}`}
              title={`${robot.model} — Taypro`}
              fill
              className="object-contain object-center opacity-90 transition-transform duration-300 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 320px"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col flex-1 bg-[#052638] p-5">
        <p className="text-[#A8C117] text-[11px] font-semibold uppercase tracking-wider mb-1">
          {robot.model}
        </p>
        <h3 className="text-[15px] sm:text-base font-semibold text-white leading-snug line-clamp-2 mb-2 min-h-[2.5rem]">
          {robot.marketingName}
        </h3>
        <p className="text-sm text-white/85 leading-relaxed line-clamp-3 min-h-[4.125rem] mb-4">
          {robot.description}
        </p>
        <Link
          href={robot.href}
          className="mt-auto inline-flex items-center justify-center min-h-[40px] w-full px-4 rounded-lg border border-[#A8C117]/60 bg-transparent text-[#A8C117] text-sm font-semibold hover:bg-[#A8C117]/10 transition text-center"
        >
          {robot.ctaLabel}
        </Link>
      </div>
    </article>
  );
}
