import Link from "next/link";

type ModelCardItem = {
  label: string;
  href: string;
  image: string;
};

type ModelCardsProps = {
  title?: string;
  cards: ModelCardItem[];
};

export default function ModelCards({ title, cards }: ModelCardsProps) {
  return (
    <section className="w-full py-30 flex flex-col items-center bg-white">
      {title && (
        <div className="font-semibold text-[#052638] text-5xl text-center mb-15">
          {title}
        </div>
      )}

      <div className="flex flex-col gap-8 w-full items-center">
        {cards.map((item, idx) => (
          <Link
            key={idx}
            href={item.href} // 👈 redirect path
            className="flex w-[900px] max-w-full h-[130px] overflow-hidden transition-transform duration-300 transform hover:-translate-y-3 cursor-pointer"
          >
            {/* Green side */}
            <div
              className="flex items-center justify-center bg-[#91bc00] w-[60%] h-full text-white"
              style={{
                fontSize: "2.7rem",
                fontWeight: 700,
                letterSpacing: 2,
              }}
            >
              {item.label}
            </div>

            {/* Image side */}
            <div
              className="w-[40%] h-full transition-transform duration-300 transform hover:-translate-y-3"
              style={{
                backgroundImage: `url('${item.image}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                position: "relative",
              }}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
