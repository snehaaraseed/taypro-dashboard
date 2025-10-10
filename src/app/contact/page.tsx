"use client";
import RequestEstimateForm from "@/app/components/RequestEstimateForm";
import { Breadcrumbs } from "@/app/components/Breadcrumbs";
import { Factory, Users } from "lucide-react";
import dynamic from "next/dynamic";

const breadcrumbs = [
  { name: "Home", href: "/" },
  {
    name: "Contact",
    href: "",
  },
];

const Map = dynamic(() => import("@/app/components/Map"), { ssr: false });

export default function ContactUsPage() {
  return (
    <>
      <Breadcrumbs items={breadcrumbs} />
      <div className="min-h-screen">
        <section className="w-full bg-white py-10">
          <div className="max-w-5xl mx-auto flex flex-col items-center">
            <h1 className="text-[#052638] font-semibold text-6xl md:text-7xl text-center mb-8 leading-tight">
              The future of energy begins <br /> now.
            </h1>
            <h2 className="text-[#3c8152] text-2xl mb-8">
              Let&apos;s Work Together!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full mt-6">
              {/* Manufacturing Unit */}
              <div className="flex flex-col items-center text-center">
                <Factory size={60} color="#B5CF22" className="mb-3" />
                <div className="text-[#b2cb19] text-lg mb-3">
                  Manufacturing Unit
                </div>
                <div className="text-[#22405a] font-semibold text-lg mb-2">
                  TAYPRO MANUFACTURING HUB
                </div>
                <div className="text-[#22405a] text-lg">
                  Plot No 87, Survey No 286/2, near Saint Gobain, Chakan, Pune,
                  Maharashtra,
                  <br />
                  India-410501
                </div>
              </div>
              {/* Working Hours */}
              <div className="flex flex-col items-center text-center">
                <Users size={60} color="#B5CF22" className="mb-3" />
                <div className="text-[#b2cb19] text-lg mb-3">Working Hours</div>
                <div className="text-[#22405a] font-semibold text-lg mb-2">
                  Monday – Friday
                </div>
                <div className="text-[#22405a] text-lg">9am – 6pm</div>
              </div>
            </div>
          </div>
        </section>

        <section
          style={{
            width: "100%",
            backgroundColor: "white",
            padding: "2.5rem 0",
            position: "relative",
            zIndex: 0, // lower zIndex so header overlays map
          }}
        >
          <div
            style={{
              width: "80%",
              margin: "2.5rem auto",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              position: "relative",
              zIndex: 1,
            }}
          >
            <Map />
          </div>
        </section>

        <RequestEstimateForm />
      </div>
    </>
  );
}
