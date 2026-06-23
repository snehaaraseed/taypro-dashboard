"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/navigation";
import { CheckCircle2 } from "lucide-react";
import { trackGenerateLead } from "@/lib/analytics/track-event";
import { RESUME_ACCEPT } from "@/lib/erpnext/resume-validation";

type CareersApplyFormProps = {
  jobOpeningName: string;
  jobTitle: string;
};

const INITIAL_FORM = {
  name: "",
  email: "",
  phone: "",
  coverLetter: "",
};

export default function CareersApplyForm({
  jobOpeningName,
  jobTitle,
}: CareersApplyFormProps) {
  const t = useTranslations("CareersPage.apply");
  const pathname = usePathname();
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [resume, setResume] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleResumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setResume(file);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const name = formData.name.trim();
      const email = formData.email.trim();
      const phone = formData.phone.trim();

      if (!name || !email || !phone) {
        setErrorMsg(t("requiredError"));
        setLoading(false);
        return;
      }

      if (!resume) {
        setErrorMsg(t("resumeRequired"));
        setLoading(false);
        return;
      }

      const body = new FormData();
      body.append("name", name);
      body.append("email", email);
      body.append("phone", phone);
      body.append("job_opening", jobOpeningName);
      if (formData.coverLetter.trim()) {
        body.append("cover_letter", formData.coverLetter.trim());
      }
      body.append("resume", resume);

      const response = await fetch("/api/careers/apply", {
        method: "POST",
        body,
      });

      const payload = (await response.json().catch(() => ({}))) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(payload.message || t("genericError"));
      }

      trackGenerateLead({
        formType: "careers_apply",
        pagePath: pathname,
        topic: jobTitle,
      });

      setSubmitted(true);
      setFormData(INITIAL_FORM);
      setResume(null);
    } catch (error) {
      setErrorMsg(
        error instanceof Error ? error.message : t("genericError")
      );
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="rounded-xl border border-[#A8C117]/40 bg-[#f4f7f9] p-8 text-center"
        role="status"
        aria-live="polite"
      >
        <CheckCircle2
          className="mx-auto mb-4 h-12 w-12 text-[#5a8f00]"
          aria-hidden
        />
        <h3 className="mb-2 text-xl font-semibold text-[#052638]">
          {t("thankYouTitle")}
        </h3>
        <p className="text-[#27415c]">{t("thankYouMessage")}</p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-medium text-[#5a8f00] hover:underline"
        >
          {t("submitAnother")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div>
        <h3 className="mb-1 text-xl font-semibold text-[#052638]">
          {t("title")}
        </h3>
        <p className="text-sm text-[#27415c]">{t("subtitle", { job: jobTitle })}</p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-[#052638]">
            {t("name")}*
          </span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            autoComplete="name"
            className="w-full border-b border-gray-300 bg-transparent py-2 text-[#052638] outline-none focus:border-[#A8C117]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#052638]">
            {t("email")}*
          </span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            className="w-full border-b border-gray-300 bg-transparent py-2 text-[#052638] outline-none focus:border-[#A8C117]"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-[#052638]">
            {t("phone")}*
          </span>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            autoComplete="tel"
            className="w-full border-b border-gray-300 bg-transparent py-2 text-[#052638] outline-none focus:border-[#A8C117]"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-[#052638]">
            {t("resume")}*
          </span>
          <input
            type="file"
            name="resume"
            accept={RESUME_ACCEPT}
            onChange={handleResumeChange}
            required
            className="w-full text-sm text-[#27415c] file:mr-4 file:rounded-md file:border-0 file:bg-[#052638] file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-[#0a3a4a]"
          />
          <span className="mt-1 block text-xs text-gray-500">{t("resumeHint")}</span>
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-sm font-medium text-[#052638]">
            {t("coverLetter")}
          </span>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={4}
            className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-[#052638] outline-none focus:border-[#A8C117]"
            placeholder={t("coverLetterPlaceholder")}
          />
        </label>
      </div>

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#A8C117] px-6 py-3 font-semibold text-[#052638] transition-colors hover:bg-[#95ad14] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {loading ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
