import type { CreatorRecord } from "./types";
import { normalizeFeedUrl } from "./normalize-url";

function hostOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Match a citation `source` URL to registered feed/content URLs. */
export function resolveCreatorsForSource(
  source: string,
  creators: CreatorRecord[],
): CreatorRecord[] {
  const norm = normalizeFeedUrl(source);
  const sourceHost = hostOf(norm);

  const matches = creators.filter((c) => {
    const feed = normalizeFeedUrl(c.feedUrl);
    if (norm === feed || norm.startsWith(`${feed}/`)) return true;
    if (feed.startsWith(`${norm}/`) || norm.startsWith(feed)) return true;
    const feedHost = hostOf(feed);
    return sourceHost && feedHost && sourceHost === feedHost;
  });

  if (matches.length > 0) return matches;

  // Prefix match on path for RSS item under feed root
  return creators.filter((c) => {
    const feed = normalizeFeedUrl(c.feedUrl);
    return norm.includes(feed) || feed.includes(norm);
  });
}

export function toPayeeSplits(creators: CreatorRecord[]) {
  return creators.map((c) => ({
    creatorId: c.id,
    name: c.name,
    wallet: c.wallet,
    feedUrl: c.feedUrl,
    splitBps: c.splitBps,
  }));
}
