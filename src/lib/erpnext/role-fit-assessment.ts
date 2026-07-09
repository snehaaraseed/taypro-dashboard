import { erpnextFetch } from "./client";

export type AssessmentQuestion = {
  question: string;
  type: "Multiple Choice" | "Yes/No" | "Free Text";
  options: string[];
};

export type GetAssessmentResponse = {
  already_done: boolean;
  status?: string;
  applicant_name?: string;
  assessment_name?: string;
  intro?: string;
  duration?: number;
  questions?: AssessmentQuestion[];
};

export type AssessmentAnswerInput = {
  question: string;
  type: string;
  answer: string;
};

export type SubmitAssessmentResponse = {
  success: boolean;
  status?: string;
  score?: number;
};

type FrappeMethodResponse<T> = {
  message: T;
};

/** Public candidate URL (set this pattern in ERPNext Phase 8 link). */
export function buildRoleFitAssessmentUrl(token: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "") ||
    "https://taypro.in";
  return `${base}/careers/assessment?token=${encodeURIComponent(token)}`;
}

export async function getRoleFitAssessment(
  token: string
): Promise<GetAssessmentResponse> {
  const result = await erpnextFetch<FrappeMethodResponse<GetAssessmentResponse>>(
    `/api/method/role_fit_get_assessment?token=${encodeURIComponent(token)}`,
    { cache: "no-store" }
  );

  return result.message;
}

export async function submitRoleFitAssessment(
  token: string,
  answers: AssessmentAnswerInput[]
): Promise<SubmitAssessmentResponse> {
  const result = await erpnextFetch<
    FrappeMethodResponse<SubmitAssessmentResponse>
  >("/api/method/role_fit_submit_assessment", {
    method: "POST",
    body: JSON.stringify({ token, answers }),
    cache: "no-store",
  });

  return result.message;
}
