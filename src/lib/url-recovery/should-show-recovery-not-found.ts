import type { NotFoundRecoveryContext } from "@/lib/url-recovery/resolve-not-found";

export function shouldShowRecoveryNotFound(
  context: NotFoundRecoveryContext
): boolean {
  if (context.suggestion?.kind === "suggest") return true;
  if ((context.similarBlogs?.length ?? 0) > 0) return true;
  return false;
}
