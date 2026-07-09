"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Loader2 } from "lucide-react";
import type {
  AssessmentQuestion,
  GetAssessmentResponse,
} from "@/lib/erpnext/role-fit-assessment";
import { sanitizeBlogHtml } from "@/lib/security/sanitize-html";

type RoleFitAssessmentFormProps = {
  token: string;
};

type LoadState = "loading" | "ready" | "already_done" | "error" | "submitted";

export default function RoleFitAssessmentForm({ token }: RoleFitAssessmentFormProps) {
  const t = useTranslations("CareersPage.assessment");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [data, setData] = useState<GetAssessmentResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const loadAssessment = useCallback(async () => {
    setLoadState("loading");
    setErrorMsg("");

    try {
      const response = await fetch(
        `/api/careers/assessment?token=${encodeURIComponent(token)}`
      );
      const payload = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
        data?: GetAssessmentResponse;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message || t("loadError"));
      }

      if (payload.data.already_done) {
        setData(payload.data);
        setLoadState("already_done");
        return;
      }

      setData(payload.data);
      setLoadState("ready");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : t("loadError"));
      setLoadState("error");
    }
  }, [token, t]);

  useEffect(() => {
    void loadAssessment();
  }, [loadAssessment]);

  const setAnswer = (index: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [index]: value }));
  };

  const validateAnswers = (questions: AssessmentQuestion[]): string | null => {
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (q.type === "Free Text") continue;
      if (!answers[i]?.trim()) {
        return t("requiredQuestion", { number: i + 1 });
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.questions?.length) return;

    const validationError = validateAnswers(data.questions);
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const payload = data.questions.map((q, i) => ({
        question: q.question,
        type: q.type,
        answer: (answers[i] ?? "").trim(),
      }));

      const response = await fetch("/api/careers/assessment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers: payload }),
      });

      const result = (await response.json().catch(() => ({}))) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !result.success) {
        throw new Error(result.message || t("submitError"));
      }

      setLoadState("submitted");
    } catch (error) {
      setErrorMsg(error instanceof Error ? error.message : t("submitError"));
    } finally {
      setSubmitting(false);
    }
  };

  if (loadState === "loading") {
    return (
      <div className="flex items-center justify-center gap-3 py-16 text-[#27415c]">
        <Loader2 className="h-6 w-6 animate-spin text-[#5a8f00]" aria-hidden />
        <span>{t("loading")}</span>
      </div>
    );
  }

  if (loadState === "error") {
    return (
      <div
        className="rounded-xl border border-red-200 bg-red-50 p-8 text-center"
        role="alert"
      >
        <p className="text-red-700">{errorMsg || t("loadError")}</p>
      </div>
    );
  }

  if (loadState === "already_done") {
    return (
      <div
        className="rounded-xl border border-[#A8C117]/40 bg-[#f4f7f9] p-8 text-center"
        role="status"
      >
        <CheckCircle2
          className="mx-auto mb-4 h-12 w-12 text-[#5a8f00]"
          aria-hidden
        />
        <h2 className="mb-2 text-xl font-semibold text-[#052638]">
          {t("alreadyDoneTitle")}
        </h2>
        <p className="text-[#27415c]">
          {t("alreadyDoneMessage", {
            name: data?.applicant_name || "",
            status: data?.status || "",
          })}
        </p>
      </div>
    );
  }

  if (loadState === "submitted") {
    return (
      <div
        className="rounded-xl border border-[#A8C117]/40 bg-[#f4f7f9] p-8 text-center"
        role="status"
      >
        <CheckCircle2
          className="mx-auto mb-4 h-12 w-12 text-[#5a8f00]"
          aria-hidden
        />
        <h2 className="mb-2 text-xl font-semibold text-[#052638]">
          {t("thankYouTitle")}
        </h2>
        <p className="text-[#27415c]">{t("thankYouMessage")}</p>
      </div>
    );
  }

  const questions = data?.questions ?? [];

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      <div>
        <h1 className="mb-2 text-2xl font-semibold text-[#052638]">
          {t("title")}
        </h1>
        <p className="text-[#27415c]">
          {t("greeting", { name: data?.applicant_name || "" })}
        </p>
        {data?.intro ? (
          <div
            className="prose prose-sm mt-4 max-w-none text-[#27415c]"
            dangerouslySetInnerHTML={{
              __html: sanitizeBlogHtml(data.intro),
            }}
          />
        ) : (
          <p className="mt-4 text-[#27415c]">{t("introFallback")}</p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          {t("duration", { minutes: data?.duration ?? 20 })}
        </p>
      </div>

      {questions.map((question, index) => (
        <QuestionField
          key={`${index}-${question.question}`}
          index={index}
          question={question}
          value={answers[index] ?? ""}
          onChange={setAnswer}
        />
      ))}

      {errorMsg ? (
        <p className="text-sm text-red-600" role="alert">
          {errorMsg}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-lg bg-[#A8C117] px-6 py-3 font-semibold text-[#052638] transition-colors hover:bg-[#95ad14] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
      >
        {submitting ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}

function QuestionField({
  index,
  question,
  value,
  onChange,
}: {
  index: number;
  question: AssessmentQuestion;
  value: string;
  onChange: (index: number, value: string) => void;
}) {
  const inputName = `question-${index}`;

  return (
    <fieldset className="rounded-xl border border-gray-200 p-5">
      <legend className="mb-3 block text-base font-semibold text-[#052638]">
        {index + 1}. {question.question}
      </legend>

      {question.type === "Free Text" ? (
        <textarea
          name={inputName}
          value={value}
          onChange={(e) => onChange(index, e.target.value)}
          rows={4}
          className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-[#052638] outline-none focus:border-[#A8C117]"
        />
      ) : question.type === "Yes/No" ? (
        <div className="space-y-2">
          {["Yes", "No"].map((option) => (
            <label key={option} className="flex items-center gap-2 text-[#27415c]">
              <input
                type="radio"
                name={inputName}
                value={option}
                checked={value === option}
                onChange={() => onChange(index, option)}
                className="h-4 w-4 accent-[#5a8f00]"
              />
              {option}
            </label>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {(question.options?.length ? question.options : []).map((option) => (
            <label key={option} className="flex items-center gap-2 text-[#27415c]">
              <input
                type="radio"
                name={inputName}
                value={option}
                checked={value === option}
                onChange={() => onChange(index, option)}
                className="h-4 w-4 accent-[#5a8f00]"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </fieldset>
  );
}
