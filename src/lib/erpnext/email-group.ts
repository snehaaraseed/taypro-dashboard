import { erpnextFetch, ErpNextError } from "./client";
import type { FrappeDocResponse } from "./types";

const DEFAULT_NEWSLETTER_GROUP = "Website Newsletter Subscribers";

type EmailGroupMemberDoc = {
  name: string;
  email: string;
  email_group: string;
};

export function getNewsletterEmailGroup(): string {
  return (
    process.env.ERPNEXT_NEWSLETTER_EMAIL_GROUP?.trim() ||
    DEFAULT_NEWSLETTER_GROUP
  );
}

function isDuplicateSubscriptionError(error: ErpNextError): boolean {
  return (
    error.excType === "UniqueValidationError" ||
    /duplicate entry/i.test(error.message) ||
    /unique/i.test(error.message)
  );
}

/** Adds subscriber to the ERPNext Email Group (welcome email sent per group settings). */
export async function subscribeToNewsletter(
  email: string
): Promise<{ alreadySubscribed: boolean }> {
  const emailGroup = getNewsletterEmailGroup();

  try {
    await erpnextFetch<FrappeDocResponse<EmailGroupMemberDoc>>(
      "/api/resource/Email Group Member",
      {
        method: "POST",
        body: JSON.stringify({ email, email_group: emailGroup }),
      }
    );
    return { alreadySubscribed: false };
  } catch (error) {
    if (error instanceof ErpNextError && isDuplicateSubscriptionError(error)) {
      return { alreadySubscribed: true };
    }
    throw error;
  }
}
