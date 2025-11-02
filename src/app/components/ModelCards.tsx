import Link from "next/link";
import Image from "next/image";

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
  const getAltText = (label: string) => {
    if (label.toLowerCase().includes("model-a") || label.toLowerCase().includes("automatic")) {
      return `${label} - Taypro Automatic Solar Panel Cleaning Robot product card`;
    } else if (label.toLowerCase().includes("model-b") || label.toLowerCase().includes("semi")) {
      return `${label} - Taypro Semi-Automatic Solar Panel Cleaning Robot product card`;
    } else if (label.toLowerCase().includes("model-t") || label.toLowerCase().includes("tracker")) {
      return `${label} - Taypro Single-Axis Tracker Solar Panel Cleaning Robot product card`;
    }
    return `${label} - Taypro Solar Panel Cleaning Robot product card`;
  };

  return (
    <section className="w-full pt-5 py-30 flex flex-col items-center bg-white">
      {title && (
        <h3 className="font-semibold text-[#052638] text-5xl text-center mb-15">
          {title}
        </h3>
      )}

      <div className="flex flex-col gap-8 w-full max-w-full px-4 sm:px-6 lg:px-0 items-center">
        {cards.map((item, idx) => (
          <Link
            key={idx}
            href={item.href}
            title={`${item.label} Solar Panel Cleaning Robot`}
            className="flex w-full max-w-xl sm:max-w-3xl h-[130px] overflow-hidden transition-transform duration-300 transform hover:-translate-y-3 cursor-pointer"
          >
            <h3 className="flex items-center justify-center bg-[#91bc00] w-3/5 sm:w-3/5 h-full text-white text-2xl sm:text-4xl font-extrabold tracking-wider">
              {item.label}
            </h3>

            {/* Image side */}
            <div className="relative w-[40%] h-full transition-transform duration-300 transform hover:-translate-y-3 overflow-hidden">
              <Image
                src={item.image}
                alt={getAltText(item.label)}
                title={`${item.label} - Taypro Solar Panel Cleaning Robot`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
