"use client";

import { useState } from "react";
import Link from "next/link";

export default function RequestEstimateForm() {
  const [formData, setFormData] = useState({
    firstName: "",
    companyName: "",
    email: "",
    phone: "",
    message: "",
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
    console.log("Form Data:", formData);
  };

  return (
    <section
      className="bg-white min-h-[100vh] flex flex-col items-center justify-start relative overflow-x-hidden"
      style={{
        background: "url('/taypro-bg.png') no-repeat center center",
        backgroundSize: "cover",
      }}
    >
      {/* Heading */}
      <div className="pt-8 sm:pt-10 px-4 text-center">
        <div className="text-[#A8C117] text-[14px] sm:text-[16px] mb-3 sm:mb-4">
          Let&apos;s Get Started
        </div>
        <span className="block font-semibold text-[#052638] text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-4 sm:mb-7">
          Request a detailed estimate
        </span>
      </div>

      {/* Form Wrapper */}
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0 max-w-[900px] pt-10 sm:pt-12 md:pt-16 mb-20 sm:mb-32">
        <div className="bg-white rounded-[12px] shadow-lg px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12 w-full">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-10 mb-6 md:mb-8">
              <div>
                <label className="block text-[#052638] mb-1 text-sm sm:text-base">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  placeholder="Praveen"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[#052638] mb-1 text-sm sm:text-base">
                  Company Name
                </label>
                <input
                  type="text"
                  name="companyName"
                  placeholder="My Company Private Limited"
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[#052638] mb-1 text-sm sm:text-base">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="info@company.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
                />
              </div>
              <div>
                <label className="block text-[#052638] mb-1 text-sm sm:text-base">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+123-456-7890"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
                />
              </div>
            </div>

            <div className="mb-6 md:mb-8">
              <label className="block text-[#052638] mb-1 text-sm sm:text-base">
                How can we help you?
              </label>
              <textarea
                rows={3}
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] bg-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 sm:mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-base sm:text-lg rounded-[4px] py-3 transition-colors cursor-pointer"
            >
              Send Request
            </button>
          </form>
        </div>
      </div>

      {/* Curve SVG */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-20 sm:h-24 md:h-32 lg:h-40"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
}
