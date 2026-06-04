import "server-only";

import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";
import {
  getGscOAuthClientId,
  getGscOAuthClientSecret,
  getGscOAuthRedirectUri,
} from "@/lib/gsc/oauth-config";

export type GscOAuthTokenStore = {
  refresh_token: string;
  access_token?: string;
  expiry_date?: number;
  connected_at: string;
  email?: string;
};

let cachedAccessToken: { token: string; expiry: number } | null = null;

function resolveTokenPath(): string {
  const envPath = process.env.GSC_OAUTH_TOKEN_PATH?.trim();
  if (envPath) return path.resolve(envPath);
  return path.join(getDeploymentRoot(), "data", "gsc-oauth-tokens.json");
}

export function loadGscOAuthTokens(): GscOAuthTokenStore | null {
  const filePath = resolveTokenPath();
  if (!fs.existsSync(filePath)) return null;

  try {
    const raw = JSON.parse(
      fs.readFileSync(filePath, "utf8")
    ) as GscOAuthTokenStore;
    if (!raw.refresh_token?.trim()) return null;
    return raw;
  } catch {
    return null;
  }
}

export function saveGscOAuthTokens(tokens: GscOAuthTokenStore): void {
  const filePath = resolveTokenPath();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(tokens, null, 2)}\n`, {
    encoding: "utf8",
    mode: 0o600,
  });
  cachedAccessToken = null;
}

export function clearGscOAuthTokens(): void {
  const filePath = resolveTokenPath();
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  cachedAccessToken = null;
}

export function hasGscOAuthConnection(): boolean {
  return loadGscOAuthTokens() !== null;
}

export async function exchangeCodeForTokens(
  code: string
): Promise<GscOAuthTokenStore> {
  const clientId = getGscOAuthClientId();
  const clientSecret = getGscOAuthClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("GSC OAuth client ID and secret must be set in env");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: getGscOAuthRedirectUri(),
      grant_type: "authorization_code",
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.refresh_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Google did not return a refresh token (try disconnect and connect again with prompt=consent)"
    );
  }

  const expiry =
    data.expires_in != null
      ? Date.now() + data.expires_in * 1000
      : undefined;

  return {
    refresh_token: data.refresh_token,
    access_token: data.access_token,
    expiry_date: expiry,
    connected_at: new Date().toISOString(),
  };
}

function getGscOAuthRedirectUriFromConfig(): string {
  const { getGscOAuthRedirectUri } = require("@/lib/gsc/oauth-config") as {
    getGscOAuthRedirectUri: () => string;
  };
  return getGscOAuthRedirectUri();
}

async function refreshAccessToken(
  refreshToken: string
): Promise<{ access_token: string; expiry_date?: number }> {
  const clientId = getGscOAuthClientId();
  const clientSecret = getGscOAuthClientSecret();
  if (!clientId || !clientSecret) {
    throw new Error("GSC OAuth client ID and secret must be set in env");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      data.error_description ||
        data.error ||
        "Failed to refresh Search Console OAuth token; reconnect in admin"
    );
  }

  return {
    access_token: data.access_token,
    expiry_date:
      data.expires_in != null
        ? Date.now() + data.expires_in * 1000
        : undefined,
  };
}

/** Valid access token from stored OAuth refresh token. */
export async function getGscOAuthAccessToken(): Promise<string | null> {
  const stored = loadGscOAuthTokens();
  if (!stored?.refresh_token) return null;

  if (
    cachedAccessToken &&
    cachedAccessToken.expiry > Date.now() + 60_000
  ) {
    return cachedAccessToken.token;
  }

  if (
    stored.access_token &&
    stored.expiry_date &&
    stored.expiry_date > Date.now() + 60_000
  ) {
    cachedAccessToken = {
      token: stored.access_token,
      expiry: stored.expiry_date,
    };
    return stored.access_token;
  }

  const refreshed = await refreshAccessToken(stored.refresh_token);
  const updated: GscOAuthTokenStore = {
    ...stored,
    access_token: refreshed.access_token,
    expiry_date: refreshed.expiry_date,
  };
  saveGscOAuthTokens(updated);

  cachedAccessToken = {
    token: refreshed.access_token,
    expiry: refreshed.expiry_date ?? Date.now() + 3600_000,
  };

  return refreshed.access_token;
}

/** Optional: verify token can list sites (after connect). */
export async function fetchOAuthUserEmail(
  accessToken: string
): Promise<string | undefined> {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?alt=json`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  if (!response.ok) return undefined;
  const data = (await response.json()) as { email?: string };
  return data.email;
}
