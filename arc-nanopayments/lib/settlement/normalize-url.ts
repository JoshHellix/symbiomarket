/**
 * Canonical feed/content URL for registry dedup and citation resolve.
 */

export function normalizeFeedUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;

  try {
    const u = new URL(trimmed);
    u.hash = "";
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]) {
      u.searchParams.delete(key);
    }
    if (u.protocol === "http:") {
      u.protocol = "https:";
    }
    let href = u.href;
    if (href.endsWith("/") && u.pathname !== "/") {
      href = href.slice(0, -1);
    }
    return href;
  } catch {
    return trimmed.replace(/\/$/, "");
  }
}

export function feedUrlsMatch(a: string, b: string): boolean {
  return normalizeFeedUrl(a) === normalizeFeedUrl(b);
}
