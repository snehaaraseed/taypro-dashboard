"use client";

type EnvCard = {
  shortLabel: string;
  value: string;
  detail: string;
};

type RoiEnvironmentalCardsProps = {
  heading: string;
  cards: EnvCard[];
};

export function RoiEnvironmentalCards({
  heading,
  cards,
}: RoiEnvironmentalCardsProps) {
  return (
    <section className="mt-6">
      <h4 className="text-white font-semibold text-base sm:text-lg mb-3">
        {heading}
      </h4>
      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((card) => (
          <article
            key={card.shortLabel}
            className="rounded-lg border border-white/15 bg-[#0f4a5c] p-4 min-w-0"
          >
            <p className="text-[#A8C117] text-xs font-semibold uppercase tracking-wide mb-2">
              {card.shortLabel}
            </p>
            <p className="text-white text-xl sm:text-2xl font-semibold tabular-nums leading-tight mb-2">
              {card.value}
            </p>
            <p className="text-white/55 text-xs leading-relaxed">{card.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
