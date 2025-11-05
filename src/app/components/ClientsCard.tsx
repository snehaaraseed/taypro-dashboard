"use client";
import Image from "next/image";
import { clientLogos } from "../data";
import { AnimateOnScroll } from "./AnimateOnScroll";

export default function ClientsCard() {
  return (
    <section className="bg-white flex flex-col items-center py-20 px-4 md:px-0">
      <AnimateOnScroll animation="fadeInUp" className="text-5xl font-semibold text-[#052638] mb-12 text-center">
        <h2>Our Esteemed Clients</h2>
      </AnimateOnScroll>
      <div className="w-full flex justify-center">
        <div className="grid grid-cols-2 sm:grid-cols-4 grid-rows-2 w-full max-w-7xl mx-auto gap-4">
          {clientLogos.map((logoSrc, idx) => (
            <AnimateOnScroll
              key={idx}
              animation="scaleIn"
              delay={idx * 100}
              className="flex items-center justify-center border border-[#1c201f] bg-white h-[140px] sm:h-[210px] transition-all duration-300 hover:shadow-lg hover:border-[#39D600] transform hover:-translate-y-1"
            >
              <Image
                src={logoSrc}
                alt={`Taypro Solar Panel Cleaning Robot Client ${idx + 1} - Partner using Taypro robotic cleaning solutions`}
                title={`Taypro Solar Panel Cleaning Robot Client ${idx + 1}`}
                width={200}
                height={85}
                className="max-h-[120px] max-w-[80%] object-contain transition-transform duration-300 hover:scale-105"
                loading="lazy"
                style={{ width: "auto", height: "auto" }}
              />
            </AnimateOnScroll>
          ))}
        </div>
      </div>
    </section>
  );
}
