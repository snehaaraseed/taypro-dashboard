"use client";

import { useState } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  /**
   * - "classic" — square `+` button on the left (used on Model-A/B/T, OPEX).
   * - "modern" — minimal row with `+/-` on the right (hub, Console).
   */
  variant?: "classic" | "modern";
  className?: string;
}

export default function FAQAccordion({
  faqs,
  variant = "classic",
  className = "",
}: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (variant === "modern") {
    return (
      <div className={className}>
        {faqs.map((faq, idx) => (
          <div key={`${faq.question}-${idx}`} className="border-b border-gray-200 py-5">
            <button
              type="button"
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="w-full flex justify-between items-start text-left gap-4"
              aria-expanded={openIndex === idx}
            >
              <h3 className="text-[#052638] font-medium text-lg sm:text-xl">
                {faq.question}
              </h3>
              <span className="text-[#A8C117] text-2xl leading-none shrink-0">
                {openIndex === idx ? "−" : "+"}
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
                openIndex === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="text-gray-600 text-base sm:text-lg leading-relaxed pt-4">
                  {faq.answer}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={className}>
      {faqs.map((faq, idx) => (
        <div key={`${faq.question}-${idx}`} className="border-b border-gray-300">
          <button
            type="button"
            className="flex items-start w-full py-3 text-left text-base sm:text-xl font-medium text-[#052638] hover:text-[#A8C117] cursor-pointer gap-3"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            aria-expanded={openIndex === idx}
          >
            <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 shrink-0 bg-[#052638] text-white font-semibold rounded-sm text-lg select-none mt-0.5">
              {openIndex === idx ? "−" : "+"}
            </span>
            <h3 className="leading-snug">{faq.question}</h3>
          </button>
          <div
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              openIndex === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <div className="pl-10 sm:pl-11 pr-2 pb-6 text-sm sm:text-base text-[#435063] leading-relaxed">
                {faq.answer}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
