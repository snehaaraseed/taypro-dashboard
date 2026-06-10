import "server-only";

import { permanentRedirect } from "next/navigation";
import type { RecoveryResult } from "@/lib/url-recovery/types";

/** Issue a 301 when recovery confidence is high enough. */
export function applyRecovery(result: RecoveryResult): void {
  if (result.kind === "redirect") {
    permanentRedirect(result.destination);
  }
}
