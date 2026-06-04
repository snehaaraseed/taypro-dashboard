import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/app/utils/auth";
import { getGscSiteUrl } from "@/lib/gsc/google-service-account";
import {
  getGscAuthMethod,
  isGscConfigured,
  isGscOAuthReady,
} from "@/lib/gsc/gsc-auth";
import { getGscOAuthRedirectUri } from "@/lib/gsc/oauth-config";
import { loadGscOAuthTokens } from "@/lib/gsc/oauth-tokens";
import { loadGscEditorialHint } from "@/lib/seo/gsc-sync";
import fs from "fs";
import path from "path";
import { getDeploymentRoot } from "@/app/utils/deploymentRoot";

function lastSyncFromBoostFile(): string | null {
  const boostPath = path.join(getDeploymentRoot(), "data", "seo-gsc-boost.json");
  if (!fs.existsSync(boostPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(boostPath, "utf8")) as {
      updatedAt?: string;
    };
    return raw.updatedAt ?? null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const auth = await requireAuth(request);
  if (auth) return auth;

  const oauth = loadGscOAuthTokens();

  return NextResponse.json({
    configured: isGscConfigured(),
    authMethod: getGscAuthMethod(),
    oauthClientConfigured: isGscOAuthReady(),
    oauthConnected: Boolean(oauth),
    connectedEmail: oauth?.email ?? null,
    connectedAt: oauth?.connected_at ?? null,
    siteUrl: getGscSiteUrl(),
    redirectUri: isGscOAuthReady() ? getGscOAuthRedirectUri() : null,
    lastSyncAt: lastSyncFromBoostFile(),
    hasEditorialHint: Boolean(loadGscEditorialHint()),
  });
}
