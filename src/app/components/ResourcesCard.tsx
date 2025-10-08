import Link from "next/link";
import { resources } from "../data";

export default function ResourcesCard() {
  return (
    <section className="w-full py-20 pb-30 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16">
          <div className="text-[#052638] font-semibold text-4xl md:text-5xl mb-6 md:mb-0">
            Resources
          </div>
          <Link
            href="/blog"
            className="bg-[#A8C117] text-[#052638] px-8 py-3 rounded-lg text-lg transition-all duration-200 hover:bg-lime-500 transition cursor-pointer"
          >
            View all resources
          </Link>
        </div>

        {/* Resources grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-y-8 gap-x-8 md:gap-x-16">
          {resources.map((resource, index) => (
            <div key={index} className="border-b border-gray-300 pb-6">
              <Link
                href={resource.href}
                className="text-[#052638] text-md font-medium transition-colors duration-200 hover:text-[#A8C117] cursor-pointer block"
              >
                {resource.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
