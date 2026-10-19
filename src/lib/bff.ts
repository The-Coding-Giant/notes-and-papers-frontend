/** Pure helpers for the BFF route handler (kept out of the route file so they can be unit tested). */

/** First path segments the browser may reach. `internal` and `dev` are deliberately absent. */
const ALLOWED = new Set(["me", "uploads", "admin", "reports", "contact", "bookmarks", "events"]);

export function isAllowedPath(segments: string[]) {
  return (
    segments.length > 0 &&
    ALLOWED.has(segments[0]) &&
    segments.every((s) => s && s !== ".." && s !== ".")
  );
}

/** CSRF defence for cookie-authenticated writes: the request must originate from this site. */
export function isSameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).host === (req.headers.get("host") ?? new URL(req.url).host);
  } catch {
    return false;
  }
}
