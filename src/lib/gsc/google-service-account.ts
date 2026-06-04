import "server-only";

import fs from "fs";
import jwt from "jsonwebtoken";

const SEARCH_CONSOLE_SCOPE =
  "https://www.googleapis.com/auth/webmasters.readonly";

export type ServiceAccountCredentials = {
  client_email: string;
  private_key: string;
};

export function loadServiceAccountCredentials(): ServiceAccountCredentials | null {
  const jsonInline = process.env.GSC_SERVICE_ACCOUNT_JSON?.trim();
  if (jsonInline) {
    try {
      return JSON.parse(jsonInline) as ServiceAccountCredentials;
    } catch {
      throw new Error("GSC_SERVICE_ACCOUNT_JSON is not valid JSON");
    }
  }

  const path = process.env.GSC_SERVICE_ACCOUNT_PATH?.trim();
  if (path && fs.existsSync(path)) {
    return JSON.parse(
      fs.readFileSync(path, "utf8")
    ) as ServiceAccountCredentials;
  }

  return null;
}

export function getGscSiteUrl(): string {
  const explicit = process.env.GSC_SITE_URL?.trim();
  if (explicit) return explicit;
  // Taypro domain property in Search Console
  return "sc-domain:taypro.in";
}

/** Service account JWT access token (fallback when OAuth not connected). */
export async function getServiceAccountAccessToken(): Promise<string> {
  const credentials = loadServiceAccountCredentials();
  if (!credentials?.client_email || !credentials?.private_key) {
    throw new Error(
      "GSC not configured: set GSC_SERVICE_ACCOUNT_PATH or GSC_SERVICE_ACCOUNT_JSON and add the service account email as a user in Search Console"
    );
  }

  const now = Math.floor(Date.now() / 1000);
  const assertion = jwt.sign(
    {
      iss: credentials.client_email,
      scope: SEARCH_CONSOLE_SCOPE,
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    },
    credentials.private_key,
    { algorithm: "RS256" }
  );

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const data = (await response.json()) as {
    access_token?: string;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(
      `GSC auth failed: ${data.error_description || data.error || response.statusText}`
    );
  }

  return data.access_token;
}
