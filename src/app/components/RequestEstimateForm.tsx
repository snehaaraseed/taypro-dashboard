// "use client";

// import Link from "next/link";

// export default function RequestEstimateForm() {
//   return (
//     <section
//       className="bg-white min-h-[100vh] flex flex-col items-center justify-start relative"
//       style={{
//         background: "url('/taypro-bg.png') no-repeat center center",
//         backgroundSize: "cover",
//       }}
//     >
//       <div className="pt-10">
//         <div className="text-[#A8C117] text-center text-[16px] mb-4">
//           Let&apos;s Get Started
//         </div>
//         <span className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
//           Request a detailed estimate
//         </span>
//       </div>
//       <div className="flex flex-col items-center pt-20 mb-40 px-6 w-500 max-w-[900px] bg-transparent">
//         <div className="bg-white rounded-[12px] shadow-lg px-8 py-9 md:px-16 md:py-12 w-full">
//           <form>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 mb-8">
//               <div>
//                 <label className="block text-[#052638] mb-1">First Name</label>
//                 <input
//                   type="text"
//                   placeholder="Praveen"
//                   className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-[#052638] mb-1">
//                   Company Name
//                 </label>
//                 <input
//                   type="text"
//                   placeholder="My Company Private Limited"
//                   className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-[#052638] mb-1">
//                   Email Address
//                 </label>
//                 <input
//                   type="email"
//                   placeholder="info@company.com"
//                   className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
//                 />
//               </div>
//               <div>
//                 <label className="block text-[#052638] mb-1">
//                   Phone Number
//                 </label>
//                 <input
//                   type="tel"
//                   placeholder="+123-456-7890"
//                   className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
//                 />
//               </div>
//             </div>
//             <div className="mb-8">
//               <label className="block text-[#052638] mb-1">
//                 How can we help you?
//               </label>
//               <textarea
//                 rows={2}
//                 placeholder=""
//                 className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] bg-transparent"
//               />
//             </div>
//             <Link href="/contact/thank-you">
//               <button
//                 type="submit"
//                 className="w-full mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-lg rounded-[4px] py-3 transition-colors"
//               >
//                 Send Request
//               </button>
//             </Link>
//           </form>
//         </div>
//       </div>

//       {/* Add curve SVG or image beneath the form */}
//       <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
//         <svg
//           className="w-full h-24 md:h-40"
//           viewBox="0 0 1440 320"
//           xmlns="http://www.w3.org/2000/svg"
//           preserveAspectRatio="none"
//         >
//           <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
//         </svg>
//       </div>
//     </section>
//   );
// }

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
      className="bg-white min-h-[100vh] flex flex-col items-center justify-start relative"
      style={{
        background: "url('/taypro-bg.png') no-repeat center center",
        backgroundSize: "cover",
      }}
    >
      <div className="pt-10">
        <div className="text-[#A8C117] text-center text-[16px] mb-4">
          Let&apos;s Get Started
        </div>
        <span className="font-semibold text-[#052638] text-4xl md:text-5xl mb-7 text-center">
          Request a detailed estimate
        </span>
      </div>

      <div className="flex flex-col items-center pt-20 mb-40 px-6 w-500 max-w-[900px] bg-transparent">
        <div className="bg-white rounded-[12px] shadow-lg px-8 py-9 md:px-16 md:py-12 w-full">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-7 mb-8">
              <div>
                <label className="block text-[#052638] mb-1">First Name</label>
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
                <label className="block text-[#052638] mb-1">
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
                <label className="block text-[#052638] mb-1">
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
                <label className="block text-[#052638] mb-1">
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

            <div className="mb-8">
              <label className="block text-[#052638] mb-1">
                How can we help you?
              </label>
              <textarea
                rows={2}
                name="message"
                value={formData.message}
                onChange={handleChange}
                className="w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] bg-transparent"
              />
            </div>

            {/* <Link href="/contact/thank-you"> */}
            <button
              type="submit"
              className="w-full mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-lg rounded-[4px] py-3 transition-colors cursor-pointer"
            >
              Send Request
            </button>
            {/* </Link> */}
          </form>
        </div>
      </div>

      {/* Curve SVG */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-24 md:h-40"
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
