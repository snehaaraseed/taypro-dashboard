"use client";

import Image from "next/image";
import { useId, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { trackGenerateLead } from "@/lib/analytics/track-event";
import { buildLeadComments, buildLeadContext } from "@/lib/lead-form-context";

interface CallbackCardProps {
  headerText: ReactNode;
  /** Included in the hidden lead context sent with the submission. */
  leadIntent?: string;
}

const INITIAL_FORM = {
  firstName: "",
  email: "",
  phone: "",
};

function headerTextToString(headerText: ReactNode): string | undefined {
  return typeof headerText === "string" && headerText.trim()
    ? headerText.trim()
    : undefined;
}

export default function CallbackCard({
  headerText,
  leadIntent,
}: CallbackCardProps) {
  const t = useTranslations("Forms.callback");
  const tForms = useTranslations("Forms");
  const pathname = usePathname();
  const formInstanceId = useId();
  const fieldId = (name: string) => `${formInstanceId}-${name}`;
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const resolvedLeadIntent =
    leadIntent ??
    headerTextToString(headerText) ??
    "Callback request";

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

    try {
      const name = formData.firstName.trim();
      const email = formData.email.trim();
      const phone = formData.phone.trim();

      if (!name || !email || !phone) {
        setErrorMsg(tForms("requiredError"));
        setLoading(false);
        return;
      }

      const comments = buildLeadComments(
        buildLeadContext({
          pathname,
          leadIntent: resolvedLeadIntent,
          analyticsFormType: "callback",
          title: t("panelTitle"),
        })
      );

      const response = await fetch("/api/saleslead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company_name: "",
          comments,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (typeof payload.message === "string" && payload.message) ||
            tForms("genericError")
        );
      }

      setSubmitted(true);
      trackGenerateLead({
        formType: "callback",
        pagePath: pathname,
        topic: resolvedLeadIntent,
      });
      setFormData(INITIAL_FORM);
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
      className="bg-white relative pt-30 flex flex-col items-center px-4 md:px-0"
      style={{
        backgroundImage: "url('/tayprobglayout/taypro-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        minHeight: "700px",
        padding: "0 1rem 0 1rem",
        paddingTop: "7.5rem",
      }}
    >
      <h2 className="font-semibold text-[#052638] text-center text-3xl sm:text-4xl md:text-5xl mb-10 [&_*]:text-[#052638]">
        {headerText}
      </h2>

      <div className="max-w-5xl mx-auto w-full h-full flex flex-col md:flex-row shadow-lg bg-transparent relative">
        <div
          className="bg-[#052638] p-10 flex flex-col justify-center flex-1 min-w-[200px] mt-10 md:mb-40"
          style={{
            boxShadow: "0px 8px 32px rgba(0,0,0,0.1)",
          }}
        >
          {submitted ? (
            <div
              role="status"
              aria-live="polite"
              className="text-center text-white py-6"
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#A8C117] text-[#052638]">
                <CheckCircle2 className="h-7 w-7" aria-hidden />
              </div>
              <h2 className="font-semibold text-3xl mb-3">
                {t("thankYouTitle")}
              </h2>
              <p className="text-[#bdc6ce] text-base sm:text-lg leading-relaxed max-w-sm mx-auto">
                {t("thankYouMessage")}
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setErrorMsg("");
                }}
                className="mt-5 text-sm font-medium text-white underline underline-offset-4 hover:text-[#A8C117]"
              >
                {t("sendAnother")}
              </button>
            </div>
          ) : (
            <>
              <p className="text-white font-semibold text-3xl mt-3 mb-6">
                {t("panelTitle")}
              </p>
              <form onSubmit={handleSubmit} className="space-y-7">
                <div>
                  <label
                    htmlFor={fieldId("firstName")}
                    className="text-white text-base"
                  >
                    {t("fullName")}
                  </label>
                  <input
                    id={fieldId("firstName")}
                    type="text"
                    name="firstName"
                    placeholder={t("fullNamePlaceholder")}
                    value={formData.firstName}
                    onChange={handleChange}
                    suppressHydrationWarning
                    className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
                  />
                </div>
                <div className="flex flex-col gap-6 sm:flex-row">
                  <div className="sm:w-1/2">
                    <label
                      htmlFor={fieldId("email")}
                      className="text-white text-base"
                    >
                      {t("email")}
                    </label>
                    <input
                      id={fieldId("email")}
                      type="email"
                      name="email"
                      placeholder={t("emailPlaceholder")}
                      value={formData.email}
                      onChange={handleChange}
                      suppressHydrationWarning
                      className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
                    />
                  </div>
                  <div className="sm:w-1/2">
                    <label
                      htmlFor={fieldId("phone")}
                      className="text-white text-base"
                    >
                      {t("phone")}
                    </label>
                    <input
                      id={fieldId("phone")}
                      type="tel"
                      name="phone"
                      placeholder={t("phonePlaceholder")}
                      value={formData.phone}
                      onChange={handleChange}
                      suppressHydrationWarning
                      className="bg-transparent text-white border-b border-[#A8C117] outline-none w-full py-3 mt-2 placeholder:text-[#bdc6ce] text-lg"
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="mb-4 text-red-400 text-sm">{errorMsg}</div>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 sm:mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-base sm:text-lg rounded-[4px] py-3 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? t("submitting") : t("submit")}
                </button>
              </form>
            </>
          )}
        </div>

        <div
          className="relative flex-1 min-h-[400px] md:min-h-[500px] overflow-hidden md:mb-10"
          style={{ marginTop: "40px" }}
        >
          <Image
            src="/tayprosolarpanel/taypro-panel.jpg"
            alt="Taypro Solar Panel Cleaning Robot demonstration - Cleaning solar panels at solar farm with autonomous robotic system"
            title="Solar Panel Cleaning Robot Demo by Taypro"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
            priority
          />
        </div>
      </div>
    </section>
  );
}
