export { MANUAL_ALIASES, buildAliasMap, resolveAlias } from "@/lib/url-recovery/aliases";
export { applyRecovery } from "@/lib/url-recovery/apply-recovery";
export {
  MIN_REDIRECT_SCORE,
  AMBIGUITY_SCORE_GAP,
  RECOVERY_BLOCKLIST,
} from "@/lib/url-recovery/constants";
export { log404Hit } from "@/lib/url-recovery/log-404";
export { normalizePath, normalizeSlug } from "@/lib/url-recovery/normalize";
export {
  recoverBlogSlug,
  recoverProjectSlug,
  recoverStaticPath,
  findClosestSlug,
} from "@/lib/url-recovery/recover";
export { scoreSlugSimilarity } from "@/lib/url-recovery/slug-match";
export { isRecoveryBlocked } from "@/lib/url-recovery/static-match";
export type { RecoveryReason, RecoveryResult } from "@/lib/url-recovery/types";
export { resolveNotFoundRecovery } from "@/lib/url-recovery/resolve-not-found";
export type { NotFoundRecoveryContext } from "@/lib/url-recovery/resolve-not-found";
export { findSimilarBlogsForMissingSlug } from "@/lib/url-recovery/similar-blogs";
export { shouldShowRecoveryNotFound } from "@/lib/url-recovery/should-show-recovery-not-found";
