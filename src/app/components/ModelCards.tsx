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
    <section className="w-full pt-5 py-30 flex flex-col items-center bg-white">
      {title && (
        <div className="font-semibold text-[#052638] text-5xl text-center mb-15">
          {title}
        </div>
      )}

      <div className="flex flex-col gap-8 w-full max-w-full px-4 sm:px-6 lg:px-0 items-center">
        {cards.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            title="Robot Type"
            className="flex w-full max-w-xl sm:max-w-3xl h-[130px] overflow-hidden transition-transform duration-300 transform hover:-translate-y-3 cursor-pointer"
          >
            <div className="flex items-center justify-center bg-[#91bc00] w-3/5 sm:w-3/5 h-full text-white text-2xl sm:text-4xl font-extrabold tracking-wider">
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
