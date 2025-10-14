"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface DemoSectionProps {
  headerText: React.ReactNode;
}

export default function CallbackCard({ headerText }: DemoSectionProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const response = await fetch(
        "https://console.taypro.in/api/v1/saleslead",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.firstName,
            email: formData.email,
            phone: formData.phone,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Please fill the required fields");
      }

      const data = await response.json();
      setSuccessMsg(data.message || "Request submitted successfully.");
      router.push("/contact/thank-you");
    } catch (error) {
      if (error instanceof Error) {
        setErrorMsg(error.message);
      } else {
        setErrorMsg(String(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className="bg-white relative pt-30 p-12 z-2 flex flex-col items-center"
      style={{
        backgroundImage: "url('/tayprobglayout/taypro-bg.png')",
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
              <label className="text-white text-base">Full Name*</label>
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
                <label className="text-white text-base">Email Address*</label>
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
                <label className="text-white text-base">Phone Number*</label>
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

            {errorMsg && (
              <div className="mb-4 text-red-500 text-sm">{errorMsg}</div>
            )}
            {successMsg && (
              <div className="mb-4 text-green-600 text-sm">{successMsg}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 sm:mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-base sm:text-lg rounded-[4px] py-3 transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? "Sending..." : "Get a Callback"}
            </button>
          </form>
        </div>

        <div
          className="relative flex-1 min-h-[400px] md:min-h-[500px] overflow-hidden md:mb-10"
          style={{ marginTop: "40px" }}
        >
          <Image
            src="/tayprosolarpanel/taypro-panel.jpg"
            alt="solar panel demo"
            title="Solar Panel Demo"
            fill
            sizes="sm"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
