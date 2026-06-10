/** Minimum similarity score (0–1) to issue a 301 redirect. */
export const MIN_REDIRECT_SCORE = 0.88;

/** Two candidates within this score gap are treated as ambiguous. */
export const AMBIGUITY_SCORE_GAP = 0.05;

/** Paths that should never be auto-recovered (scanners, exploits). */
export const RECOVERY_BLOCKLIST: RegExp[] = [
  /\.php$/i,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc/i,
  /\.env/i,
  /\.git/i,
  /\/admin\b/i,
  /\/api\b/i,
];
