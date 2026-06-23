const MAX_RESUME_BYTES = 5 * 1024 * 1024;

const ALLOWED_RESUME_EXTENSIONS = new Set(["pdf", "doc", "docx"]);

const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export function validateResumeFile(file: File): string | null {
  if (!file || file.size === 0) {
    return "Please attach your resume.";
  }

  if (file.size > MAX_RESUME_BYTES) {
    return "Resume must be 5 MB or smaller.";
  }

  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (!ALLOWED_RESUME_EXTENSIONS.has(extension)) {
    return "Resume must be a PDF, DOC, or DOCX file.";
  }

  if (file.type && !ALLOWED_RESUME_MIME_TYPES.has(file.type)) {
    return "Resume must be a PDF, DOC, or DOCX file.";
  }

  return null;
}

export const RESUME_ACCEPT = ".pdf,.doc,.docx";
