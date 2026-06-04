import "server-only";

export const GSC_OAUTH_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";

export function getGscOAuthClientId(): string | null {
  return process.env.GSC_OAUTH_CLIENT_ID?.trim() || null;
}

export function getGscOAuthClientSecret(): string | null {
  return process.env.GSC_OAUTH_CLIENT_SECRET?.trim() || null;
}

export function isGscOAuthClientConfigured(): boolean {
  return Boolean(getGscOAuthClientId() && getGscOAuthClientSecret());
}

/** Must match an authorized redirect URI in Google Cloud Console → OAuth client. */
export function getGscOAuthRedirectUri(): string {
  const explicit = process.env.GSC_OAUTH_REDIRECT_URI?.trim();
  if (explicit) return explicit;

  const site =
    process.env.NEXT_PUBLIC_SITE_URL?.trim() || "http://localhost:3000";
  const base = site.replace(/\/$/, "");
  return `${base}/api/admin/gsc/oauth/callback`;
}

export function buildGscOAuthAuthorizeUrl(state: string): string {
  const clientId = getGscOAuthClientId();
  if (!clientId) {
    throw new Error("GSC_OAUTH_CLIENT_ID is not set");
  }

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getGscOAuthRedirectUri(),
    response_type: "code",
    scope: GSC_OAUTH_SCOPE,
    access_type: "offline",
    prompt: "consent",
    state,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}
