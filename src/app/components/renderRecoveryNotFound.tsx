import { getTranslations } from "next-intl/server";
import RecoveryNotFoundView from "@/app/components/RecoveryNotFoundView";
import { buildNotFoundLabels } from "@/lib/not-found-labels";
import type { NotFoundRecoveryContext } from "@/lib/url-recovery/resolve-not-found";

export async function renderRecoveryNotFound(
  locale: string,
  context: NotFoundRecoveryContext
) {
  const t = await getTranslations({ locale, namespace: "NotFoundPage" });
  const labels = buildNotFoundLabels((key) => t(key));

  return (
    <RecoveryNotFoundView
      labels={labels}
      suggestion={context.suggestion}
      similarBlogs={context.similarBlogs}
      currentBlogSlug={context.currentBlogSlug}
    />
  );
}
