import "server-only";

import {
  getServiceAccountAccessToken,
  loadServiceAccountCredentials,
} from "@/lib/gsc/google-service-account";
import { getGscOAuthAccessToken, hasGscOAuthConnection } from "@/lib/gsc/oauth-tokens";
import { isGscOAuthClientConfigured } from "@/lib/gsc/oauth-config";

export { getGscSiteUrl } from "@/lib/gsc/google-service-account";

export type GscAuthMethod = "oauth" | "service_account" | "none";

export function getGscAuthMethod(): GscAuthMethod {
  if (hasGscOAuthConnection()) return "oauth";
  if (loadServiceAccountCredentials()) return "service_account";
  return "none";
}

export function isGscConfigured(): boolean {
  if (hasGscOAuthConnection()) return true;
  return Boolean(loadServiceAccountCredentials());
}

export function isGscOAuthReady(): boolean {
  return isGscOAuthClientConfigured();
}

/** Prefer OAuth (personal Google); fall back to service account if present. */
export async function getSearchConsoleAccessToken(): Promise<{
  token: string;
  method: GscAuthMethod;
}> {
  const oauthToken = await getGscOAuthAccessToken();
  if (oauthToken) {
    return { token: oauthToken, method: "oauth" };
  }

  const saToken = await getServiceAccountAccessToken();
  return { token: saToken, method: "service_account" };
}
