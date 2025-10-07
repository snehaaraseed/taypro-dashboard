"use client";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Contact",
    href: "/contact",
  },
  {
    name: "Thank You",
    href: "",
  },
];

export default function ThankYouPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="">
        <section className="w-full bg-white py-10 pb-20">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <h2 className="text-[#052638] font-semibold text-5xl text-center mb-4 leading-tight">
              Thank You
            </h2>
            <div className="text-[#3c8152] text-lg mb-10">
              Our team will get in touch with you Shortly.
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
