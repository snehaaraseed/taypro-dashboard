/**
 * ERPNext / Frappe REST client.
 *
 * Requires server env:
 * - ERPNEXT_API_URL — instance base URL (e.g. https://app.taypro.in)
 * - ERPNEXT_API_KEY
 * - ERPNEXT_API_SECRET
 */

export class ErpNextError extends Error {
  readonly status: number;
  readonly excType?: string;

  constructor(message: string, status: number, excType?: string) {
    super(message);
    this.name = "ErpNextError";
    this.status = status;
    this.excType = excType;
  }
}

export function getErpNextConfig(): {
  baseUrl: string;
  apiKey: string;
  apiSecret: string;
} {
  const baseUrl = process.env.ERPNEXT_API_URL?.trim().replace(/\/$/, "");
  const apiKey = process.env.ERPNEXT_API_KEY?.trim();
  const apiSecret = process.env.ERPNEXT_API_SECRET?.trim();

  if (!baseUrl || !apiKey || !apiSecret) {
    throw new ErpNextError(
      "ERPNext integration is not configured (ERPNEXT_API_URL, ERPNEXT_API_KEY, ERPNEXT_API_SECRET).",
      500
    );
  }

  return { baseUrl, apiKey, apiSecret };
}

function authHeader(): string {
  const { apiKey, apiSecret } = getErpNextConfig();
  return `token ${apiKey}:${apiSecret}`;
}

async function parseFrappeError(
  response: Response
): Promise<{ message: string; excType?: string }> {
  const text = await response.text();
  try {
    const payload = JSON.parse(text) as {
      message?: string;
      exc_type?: string;
      _server_messages?: string;
    };
    if (typeof payload.message === "string" && payload.message) {
      return { message: payload.message, excType: payload.exc_type };
    }
    if (payload._server_messages) {
      const messages = JSON.parse(payload._server_messages) as Array<{
        message?: string;
      }>;
      const first = messages[0]?.message;
      if (first) return { message: first, excType: payload.exc_type };
    }
  } catch {
    // fall through
  }
  return {
    message: text || `ERPNext request failed (${response.status})`,
    excType: undefined,
  };
}

export async function erpnextFetch<T>(
  path: string,
  init?: RequestInit & { next?: { revalidate?: number; tags?: string[] } }
): Promise<T> {
  const { baseUrl } = getErpNextConfig();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: authHeader(),
      Accept: "application/json",
      ...(init?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const { message, excType } = await parseFrappeError(response);
    throw new ErpNextError(message, response.status, excType);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
