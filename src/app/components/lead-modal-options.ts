/** Options when opening the global lead capture modal. */
export interface LeadModalOpenOptions {
  /** Short label shown as an eyebrow chip on the modal (e.g. "Request a quote"). */
  topic?: string;
  /** Free-form analytics source string. */
  source?: string;
  /** Override the modal heading. */
  title?: string;
  /** Override the modal sub-heading. */
  subtitle?: string;
  /** Hidden lead context intent (defaults to topic). */
  leadIntent?: string;
  /** Prompt above the form fields. */
  formPrompt?: string;
  showMessageField?: boolean;
  showCompanyField?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
  submitLabel?: string;
  thankYouTitle?: string;
  thankYouMessage?: string;
  analyticsFormType?: string;
}

export const DEFAULT_LEAD_MODAL_TITLE = "Tell us about your plant";
export const DEFAULT_LEAD_MODAL_SUBTITLE =
  "A few quick details and our applications team will reach out with the right Solar Panel Cleaning Robot fit for your site.";
export const DEFAULT_LEAD_MODAL_FORM_PROMPT =
  "Where should we send your fit check?";
