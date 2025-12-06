/**
 * Simple in-memory rate limiter
 * Tracks login attempts per IP address
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Configuration
const MAX_ATTEMPTS = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes

/**
 * Get client IP from request
 */
function getClientIP(request: Request | { headers: Headers }): string {
  // Try to get IP from various headers (for proxy/load balancer scenarios)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  
  // Fallback - use a default key for rate limiting
  // In production behind nginx, x-real-ip should always be set
  return "unknown";
}

/**
 * Check if request should be rate limited
 * @returns rate limit info with limited flag, remaining attempts, and reset time
 */
export function checkRateLimit(request: Request | { headers: Headers }): { limited: boolean; remaining: number; resetTime: number } | null {
  const ip = getClientIP(request);
  const now = Date.now();
  
  // Clean up old entries
  if (rateLimitStore.size > 1000) {
    // Prevent memory leak - remove expired entries
    for (const [key, entry] of rateLimitStore.entries()) {
      if (entry.resetTime < now) {
        rateLimitStore.delete(key);
      }
    }
  }
  
  const entry = rateLimitStore.get(ip);
  
  if (!entry || entry.resetTime < now) {
    // No entry or expired - create new entry
    rateLimitStore.set(ip, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    return { limited: false, remaining: MAX_ATTEMPTS - 1, resetTime: now + WINDOW_MS };
  }
  
  // Entry exists and is valid
  if (entry.count >= MAX_ATTEMPTS) {
    return { limited: true, remaining: 0, resetTime: entry.resetTime };
  }
  
  // Increment count
  entry.count++;
  rateLimitStore.set(ip, entry);
  
  return { limited: false, remaining: MAX_ATTEMPTS - entry.count, resetTime: entry.resetTime };
}

/**
 * Reset rate limit for an IP (useful after successful login)
 */
export function resetRateLimit(request: Request | { headers: Headers }): void {
  const ip = getClientIP(request);
  rateLimitStore.delete(ip);
}

