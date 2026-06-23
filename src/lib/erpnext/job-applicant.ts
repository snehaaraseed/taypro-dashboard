import { erpnextFetch } from "./client";
import type {
  CreateJobApplicantInput,
  FrappeDocResponse,
  FrappeUploadResponse,
} from "./types";

type JobApplicantDoc = {
  name: string;
};

export async function uploadResume(
  file: Blob,
  fileName: string
): Promise<string> {
  const formData = new FormData();
  formData.append("file", file, fileName);
  formData.append("is_private", "1");
  formData.append("doctype", "Job Applicant");

  const result = await erpnextFetch<FrappeUploadResponse>(
    "/api/method/upload_file",
    {
      method: "POST",
      body: formData,
    }
  );

  const fileUrl = result.message?.file_url;
  if (!fileUrl) {
    throw new Error("Resume upload succeeded but no file URL was returned.");
  }
  return fileUrl;
}

export async function createJobApplicant(
  input: CreateJobApplicantInput
): Promise<string> {
  const payload: Record<string, string> = {
    applicant_name: input.name,
    email_id: input.email,
    phone_number: input.phone,
    job_title: input.jobOpeningName,
    source: "Website Listing",
    status: "Open",
    resume_attachment: input.resumeUrl,
  };

  if (input.coverLetter?.trim()) {
    payload.cover_letter = input.coverLetter.trim();
  }

  const result = await erpnextFetch<FrappeDocResponse<JobApplicantDoc>>(
    "/api/resource/Job Applicant",
    {
      method: "POST",
      body: JSON.stringify(payload),
    }
  );

  return result.data.name;
}
