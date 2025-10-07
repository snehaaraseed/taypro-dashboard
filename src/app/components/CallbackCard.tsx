"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface DemoSectionProps {
  headerText: React.ReactNode;
}

export default function CallbackCard({ headerText }: DemoSectionProps) {
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // For now just log it, later you can call your API here
    console.log("Form Data:", formData);

    // Example future API call
    // await fetch("/api/contact", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(formData),
    // });

    // Redirect or reset
  };

  return (
    <section
      className="bg-white relative p-12 z-2 flex flex-col items-center"
      style={{
        backgroundImage: "url('/taypro-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "700px",
        padding: "0",
      }}
    >
      <div className="font-semibold text-[#052638] text-center text-5xl md:text-6xl mb-10">
        {headerText}
      </div>

      <div className="max-w-5xl mx-auto w-full h-full flex flex-col md:flex-row shadow-lg bg-transparent relative z-10">
        {/* Left: Form */}

        <div
          className="bg-[#052638] p-10 flex flex-col justify-center flex-1 min-w-[200px] mt-10 md:mb-40"
          style={{
            boxShadow: "0px 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          <div className="text-white font-semibold text-3xl mt-3 mb-6">
            Let us help you
          </div>
          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="text-white text-base">Full Name</label>
              <input
                type="text"
                name="firstName"
                placeholder="Praveen"
                value={formData.firstName}
                onChange={handleChange}
                className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
              />
            </div>
            <div className="flex flex-row gap-6">
              <div className="w-1/2">
                <label className="text-white text-base">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="info@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
                />
              </div>
              <div className="w-1/2">
                <label className="text-white text-base">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+123-456-7890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
                />
              </div>
            </div>
            {/* <div className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  id="agree"
                  className="accent-[#A8C117] w-5 h-5"
                />
                <label htmlFor="agree" className="text-white text-base">
                  I agree to use my personal data.
                </label>
              </div> */}
            {/* <Link href="/contact/thank-you"> */}
            <button
              type="submit"
              className="bg-[#A8C117] w-full mt-3 py-3 rounded text-white text-lg transition hover:bg-[#b4ca3a] cursor-pointer"
            >
              Get a Callback
            </button>
            {/* </Link> */}
          </form>
        </div>

        <div
          className="relative flex-1 min-h-[400px] md:min-h-[500px] overflow-hidden md:mb-10"
          style={{ marginTop: "40px" }}
        >
          <Image
            src="/taypro-panel.jpg"
            alt="solar panel demo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
