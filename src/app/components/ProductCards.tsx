import Image from "next/image";
import TrackedLink from "@/app/components/TrackedLink";
import { productAltText, ROBOT_CARD_IMAGE_CLASS } from "@/lib/products/catalog";

type ProductCardItem = {
  label: string;
  href: string;
  image: string;
};

type ProductCardsProps = {
  title?: string;
  cards: ProductCardItem[];
};

export default function ProductCards({ title, cards }: ProductCardsProps) {
  const getAltText = (label: string) => {
    return `${productAltText(label)} product card`;
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
          <TrackedLink
            key={idx}
            href={item.href}
            title={`${item.label} Solar Panel Cleaning Robot`}
            trackTitle={item.label}
            trackLocation="product_page"
            trackType="product"
            className="flex w-full max-w-xl sm:max-w-3xl h-[130px] overflow-hidden transition-transform duration-300 transform hover:-translate-y-3 cursor-pointer"
          >
            <h3 className="flex items-center justify-center bg-[#91bc00] w-3/5 sm:w-3/5 h-full text-white text-2xl sm:text-4xl font-extrabold tracking-wider">
              {item.label}
            </h3>

            <div className="relative w-[40%] h-full bg-[#0a2a38] overflow-hidden">
              <Image
                src={item.image}
                alt={getAltText(item.label)}
                title={`${item.label} - Taypro Solar Panel Cleaning Robot`}
                fill
                className={ROBOT_CARD_IMAGE_CLASS}
                sizes="(max-width: 768px) 100vw, 400px"
              />
            </div>
          </TrackedLink>
        ))}
      </div>
    </section>
  );
}
