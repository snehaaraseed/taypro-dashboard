"use client";

import { useState, useId } from "react";

export interface FAQItem {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  className?: string;
}

export default function FAQAccordion({ faqs, className = "" }: FAQAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const baseId = useId();

  return (
    <div className={className}>
      {faqs.map((faq, idx) => {
        const panelId = `${baseId}-panel-${idx}`;
        return (
        <div key={`${faq.question}-${idx}`} className="border-b border-gray-200 py-5">
          <button
            type="button"
            onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
            className="w-full flex justify-between items-start text-left gap-4"
            aria-expanded={openIndex === idx}
            aria-controls={panelId}
          >
            <h3 className="text-[#052638] font-medium text-lg sm:text-xl">
              {faq.question}
            </h3>
            <span className="text-[#A8C117] text-2xl leading-none shrink-0">
              {openIndex === idx ? "−" : "+"}
            </span>
          </button>
          <div
            id={panelId}
            className={`grid transition-[grid-template-rows] duration-300 ease-in-out ${
              openIndex === idx ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div className="overflow-hidden">
              <p className="text-[#27415c] text-base sm:text-lg leading-relaxed pt-4">
                {faq.answer}
              </p>
            </div>
          </div>
        </div>
      );
      })}
    </div>
  );
}
