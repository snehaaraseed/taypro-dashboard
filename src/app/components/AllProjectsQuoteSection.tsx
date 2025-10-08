// "use client";

// interface ProjectQuoteSectionProps {
//   quote: string;
//   author: string;
// }

// export default function ProjectQuoteSection({
//   quote,
//   author,
// }: ProjectQuoteSectionProps) {
//   return (
//     <section className="w-full py-20 bg-white">
//       <div className="max-w-5xl mx-auto px-6">
//         <div className="relative pl-8">
//           <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>

//           <div className="mb-12">
//             <div className="text-[#0c2f42] font-semibold text-4xl md:text-4xl lg:text-5xl leading-tight mb-8">
//               “{quote}”
//             </div>
//           </div>

//           <div className="text-[#0c2f42] text-md font-medium">{author}</div>
//         </div>
//       </div>
//     </section>
//   );
// }

// ProjectQuoteSection - Mobile Responsive
"use client";

interface ProjectQuoteSectionProps {
  quote: string;
  author: string;
}

export default function ProjectQuoteSection({
  quote,
  author,
}: ProjectQuoteSectionProps) {
  return (
    <section className="w-full py-12 sm:py-16 lg:py-20 bg-white overflow-x-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="relative pl-4 sm:pl-6 lg:pl-8">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-gray-300"></div>

          <div className="mb-8 sm:mb-10 lg:mb-12">
            <div className="text-[#0c2f42] font-semibold text-2xl sm:text-3xl lg:text-4xl xl:text-5xl leading-tight mb-6 sm:mb-8">
              “{quote}”
            </div>
          </div>

          <div className="text-[#0c2f42] text-sm sm:text-base lg:text-md font-medium">
            {author}
          </div>
        </div>
      </div>
    </section>
  );
}
