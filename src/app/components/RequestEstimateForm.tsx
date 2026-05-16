"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2 } from "lucide-react";

export type RequestEstimateFormProps = {
  variant?: "fullPage" | "embedded";
  eyebrow?: string;
  title?: string;
  className?: string;
  /** When embedded, show the small eyebrow + title above the fields. Default true. */
  showEmbeddedHeading?: boolean;
  /** Embedded: single column + tighter spacing for narrow panels (e.g. slide-in). */
  stackedEmbedded?: boolean;
  /** Embedded: extra compact spacing (narrow slide-in, no internal scroll). */
  compactEmbedded?: boolean;
  /** Embedded: no outer white box — parent supplies surface (e.g. plant-check modal). */
  embeddedFlush?: boolean;
  /** Override primary submit button label. */
  submitLabel?: string;
  messageRows?: number;
  /** Label above the free-text field (site details, constraints, pain). */
  messageLabel?: string;
  /** Placeholder for the free-text field. */
  messagePlaceholder?: string;
  /** Focus first name field on mount (e.g. after opening a slide-in form step). */
  autoFocus?: boolean;
  /**
   * When true, redirect to /contact/thank-you after a successful submission.
   * Default is `false` — the form shows an inline thank-you state so the
   * user stays on the same page / inside the same modal.
   */
  redirectOnSuccess?: boolean;
  onSuccess?: () => void;
  /** Override the inline thank-you panel heading. */
  thankYouTitle?: string;
  /** Override the inline thank-you panel body text. */
  thankYouMessage?: string;
  /** Hide the "Send another request" link in the inline thank-you state. */
  hideResetAfterSuccess?: boolean;
};

const INITIAL_FORM = {
  firstName: "",
  companyName: "",
  email: "",
  phone: "",
  message: "",
};

export default function RequestEstimateForm({
  variant = "fullPage",
  eyebrow,
  title,
  className = "",
  showEmbeddedHeading = true,
  stackedEmbedded = false,
  compactEmbedded = false,
  embeddedFlush = false,
  submitLabel,
  messageRows = 3,
  messageLabel,
  messagePlaceholder,
  autoFocus = false,
  redirectOnSuccess = false,
  onSuccess,
  thankYouTitle,
  thankYouMessage,
  hideResetAfterSuccess = false,
}: RequestEstimateFormProps = {}) {
  const t = useTranslations("Forms");
  const router = useRouter();
  const [formData, setFormData] = useState(INITIAL_FORM);

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
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

    try {
      const name = formData.firstName.trim();
      const email = formData.email.trim();
      const phone = formData.phone.trim();
      const company_name = formData.companyName.trim();
      const comments = formData.message.trim();

      if (!name || !email || !phone) {
        setErrorMsg(t("requiredError"));
        setLoading(false);
        return;
      }

      const response = await fetch("/api/saleslead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          company_name,
          comments,
        }),
      });

      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          (typeof payload.message === "string" && payload.message) ||
            t("genericError")
        );
      }

      onSuccess?.();
      if (redirectOnSuccess) {
        router.push("/contact/thank-you");
        return;
      }
      setSubmitted(true);
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

  const resolvedThankYouTitle =
    thankYouTitle ?? t("thankYouDefaultTitle");
  const resolvedThankYouMessage =
    thankYouMessage ?? t("thankYouDefaultMessage");
  const resolvedEyebrow = eyebrow ?? "Let's Get Started";
  const resolvedTitle = title ?? "Request a detailed estimate";
  const resolvedMessageLabel =
    messageLabel ?? "Your plant, constraints, and what hurts output";
  const resolvedMessagePlaceholder =
    messagePlaceholder ??
    "For example: MW capacity, fixed-tilt or trackers, soiling or dust, water limits, current cleaning approach, and the gap you want to close.";

  const gridClass =
    variant === "embedded" && stackedEmbedded
      ? compactEmbedded
        ? "grid grid-cols-1 gap-y-2.5 mb-3"
        : "grid grid-cols-1 gap-y-4 mb-5"
      : "grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-6 md:gap-x-10 mb-6 md:mb-8";

  const labelClass = compactEmbedded
    ? "block text-[#052638] mb-0.5 text-xs"
    : "block text-[#052638] mb-1 text-sm sm:text-base";

  const fieldClass = compactEmbedded
    ? "w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-1.5 text-sm text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent"
    : "w-full border-b border-[#D4DADA] focus:border-[#A8C117] outline-none py-2 text-[#052638] placeholder:text-[#C4CFD3] font-normal bg-transparent";

  const thankYouPanel = (
    <div
      role="status"
      aria-live="polite"
      className="rounded-xl border border-[#A8C117]/40 bg-[#f7faea] p-6 sm:p-8 text-center thank-you-panel-enter"
    >
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#A8C117] text-[#052638] thank-you-icon-pop">
        <CheckCircle2 className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="text-[#052638] font-semibold text-xl sm:text-2xl mb-2">
        {resolvedThankYouTitle}
      </h3>
      <p className="text-[#475569] text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        {resolvedThankYouMessage}
      </p>
      {!hideResetAfterSuccess && (
        <button
          type="button"
          onClick={() => {
            setSubmitted(false);
            setErrorMsg("");
          }}
          className="mt-5 text-sm font-medium text-[#052638] underline underline-offset-4 hover:text-[#0a4a66]"
        >
          {t("sendAnother")}
        </button>
      )}
    </div>
  );

  const embeddedWrapClass =
    variant === "embedded"
      ? compactEmbedded
        ? `bg-white w-full px-0 py-0 ${className}`
        : embeddedFlush
          ? `w-full px-0 py-0 ${className}`
          : `bg-white w-full px-4 sm:px-6 ${stackedEmbedded ? "py-4" : "py-5"} ${className}`
      : `bg-white rounded-[12px] shadow-lg px-4 sm:px-8 md:px-12 lg:px-16 py-6 sm:py-8 md:py-10 lg:py-12 w-full ${className}`;

  const formInner = (
    <div className={embeddedWrapClass}>
      {variant === "embedded" && showEmbeddedHeading && (
        <div className="mb-5 text-center sm:text-left">
          <div className="text-[#A8C117] text-sm mb-1">{resolvedEyebrow}</div>
          <h2 className="font-semibold text-[#052638] text-xl sm:text-2xl">
            {resolvedTitle}
          </h2>
        </div>
      )}
      {submitted ? (
        thankYouPanel
      ) : (
        <form onSubmit={handleSubmit}>
          <div className={gridClass}>
            <div>
              <label className={labelClass}>{t("firstName")}</label>
              <input
                type="text"
                name="firstName"
                placeholder={t("firstNamePlaceholder")}
                value={formData.firstName}
                onChange={handleChange}
                suppressHydrationWarning
                autoFocus={autoFocus}
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("companyName")}</label>
              <input
                type="text"
                name="companyName"
                placeholder={t("companyPlaceholder")}
                value={formData.companyName}
                onChange={handleChange}
                suppressHydrationWarning
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("email")}</label>
              <input
                type="email"
                name="email"
                placeholder={t("emailPlaceholder")}
                value={formData.email}
                onChange={handleChange}
                suppressHydrationWarning
                className={fieldClass}
              />
            </div>
            <div>
              <label className={labelClass}>{t("phone")}</label>
              <input
                type="tel"
                name="phone"
                placeholder={t("phonePlaceholder")}
                value={formData.phone}
                onChange={handleChange}
                suppressHydrationWarning
                className={fieldClass}
              />
            </div>
          </div>

          <div
            className={
              compactEmbedded
                ? "mb-2.5"
                : stackedEmbedded
                  ? "mb-4"
                  : "mb-6 md:mb-8"
            }
          >
            <label className={labelClass}>{resolvedMessageLabel}</label>
            <textarea
              rows={messageRows}
              name="message"
              value={formData.message}
              onChange={handleChange}
              suppressHydrationWarning
              placeholder={resolvedMessagePlaceholder}
              className={
                compactEmbedded ? `${fieldClass} min-h-[2.5rem]` : fieldClass
              }
            />
          </div>

          {errorMsg && (
            <div
              className={`text-red-500 text-xs ${compactEmbedded ? "mb-2" : "mb-4 text-sm"}`}
            >
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={
              compactEmbedded
                ? "w-full mt-2 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-sm rounded-md py-2.5 transition-colors cursor-pointer disabled:opacity-50"
                : stackedEmbedded
                  ? "w-full mt-4 sm:mt-5 rounded-xl bg-[#A8C117] py-3.5 text-center text-base sm:text-lg font-semibold text-[#052638] shadow-md transition hover:bg-[#b8cf3d] hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-[#052638] focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  : "w-full mt-4 sm:mt-5 bg-[#A8C117] hover:bg-[#B8CC31] text-[#052638] font-semibold text-base sm:text-lg rounded-[4px] py-3 transition-colors cursor-pointer disabled:opacity-50"
            }
          >
            {loading ? t("submitting") : submitLabel ?? t("submit")}
          </button>
        </form>
      )}
    </div>
  );

  if (variant === "embedded") {
    return formInner;
  }

  return (
    <section
      className="bg-white min-h-[100vh] pt-20 flex flex-col items-center justify-start relative overflow-x-hidden"
      style={{
        background:
          "url('/tayprobglayout/taypro-bg.png') no-repeat center center",
        backgroundSize: "cover",
      }}
    >
      <div className="py-8 sm:pt-10 px-4 text-center">
        <div className="text-[#A8C117] text-[14px] sm:text-[16px] mb-3 sm:mb-4">
          {resolvedEyebrow}
        </div>
        <h2 className="block font-semibold text-[#052638] text-2xl sm:text-3xl md:text-4xl lg:text-5xl mb-8 sm:mb-7">
          {resolvedTitle}
        </h2>
      </div>

      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-0 max-w-[900px] pt-10 sm:pt-12 md:pt-16 mb-20 sm:mb-32">
        {formInner}
      </div>

      <div className="absolute bottom-0 left-0 right-0 overflow-hidden pointer-events-none">
        <svg
          className="w-full h-20 sm:h-24 md:h-32 lg:h-40"
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path fill="#052638" d="M0,224L1440,96L1440,320L0,320Z" />
        </svg>
      </div>
    </section>
  );
}
