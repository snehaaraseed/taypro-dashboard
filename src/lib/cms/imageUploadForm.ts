import {
  type UploadContext,
  sanitizeUploadLabel,
} from "@/lib/cms/imageUploadTypes";

/** Attach context-aware naming fields expected by `/api/admin/upload`. */
export function appendImageUploadMeta(
  formData: FormData,
  context: UploadContext,
  label: string
): void {
  formData.append("context", context);
  formData.append("label", sanitizeUploadLabel(label));
}
