"use client";
import Image from "next/image";
import { clientLogos } from "../data";

export default function ClientsCard() {
  return (
    <section className="bg-white flex flex-col items-center py-14">
      <div className="text-5xl font-semibold text-[#052638] mb-12 text-center">
        Our Esteemed Clients
      </div>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-4 grid-rows-2 w-[70vw]">
          {clientLogos.map((logoSrc, idx) => (
            <div
              key={idx}
              className="flex items-center justify-center border border-[#1c201f] bg-white h-[210px]"
            >
              <Image
                src={logoSrc}
                alt={`Client Logo ${idx + 1}`}
                width={200}
                height={85}
                className="max-h-[120px] max-w-[80%] object-contain"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
