/**
 * In-memory rate limiter (per-instance; use Redis at scale).
 */

import { getClientIp } from "@/lib/security";

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const LOGIN_MAX_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

const API_LIMITS: Record<string, { max: number; windowMs: number }> = {
  saleslead: { max: 10, windowMs: 60 * 60 * 1000 },
  careers: { max: 5, windowMs: 60 * 60 * 1000 },
};

function pruneStore(now: number): void {
  if (rateLimitStore.size <= 1000) return;
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}

function checkLimit(
  bucketKey: string,
  max: number,
  windowMs: number
): { limited: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  pruneStore(now);

  const entry = rateLimitStore.get(bucketKey);

  if (!entry || entry.resetTime < now) {
    const resetTime = now + windowMs;
    rateLimitStore.set(bucketKey, { count: 1, resetTime });
    return { limited: false, remaining: max - 1, resetTime };
  }

  if (entry.count >= max) {
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }

  entry.count++;
  rateLimitStore.set(bucketKey, entry);
  return {
    limited: false,
    remaining: max - entry.count,
    resetTime: entry.resetTime,
  };
}

export function checkRateLimit(
  request: Request | { headers: Headers }
): { limited: boolean; remaining: number; resetTime: number } | null {
  const ip = getClientIp(request);
  return checkLimit(`login:${ip}`, LOGIN_MAX_ATTEMPTS, LOGIN_WINDOW_MS);
}

export function resetRateLimit(request: Request | { headers: Headers }): void {
  const ip = getClientIp(request);
  rateLimitStore.delete(`login:${ip}`);
}

export function checkApiRateLimit(
  request: Request | { headers: Headers },
  apiName: keyof typeof API_LIMITS
): { limited: boolean; remaining: number; resetTime: number } {
  const config = API_LIMITS[apiName];
  const ip = getClientIp(request);
  return checkLimit(`${apiName}:${ip}`, config.max, config.windowMs);
}
