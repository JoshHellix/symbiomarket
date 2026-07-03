export type RegistryCreator = {
  id: string;
  name: string;
  feedUrl: string;
  wallet: string;
  registeredAt?: string;
  splitBps?: number;
};

export const CITATION_USDC = 0.001;

export function isDemoWallet(wallet: string): boolean {
  return wallet.startsWith("0x000000000000000000000000000000000000");
}

export function filterRealCreators(creators: RegistryCreator[]): RegistryCreator[] {
  return creators.filter((c) => !isDemoWallet(c.wallet));
}

export function feedKind(url: string): string {
  const u = url.toLowerCase();
  if (u.match(/\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/)) return "Photo";
  if (u.match(/\.(mp3|wav|flac|ogg|m4a)(\?|$)/)) return "Audio";
  if (u.match(/\.(mp4|webm|mov|m4v)(\?|$)/)) return "Video";
  if (u.includes("spotify.com") || u.includes("soundcloud.com") || u.includes("bandcamp.com"))
    return "Music";
  if (u.includes("youtube.com") || u.includes("youtu.be") || u.includes("vimeo.com"))
    return "Video";
  if (u.includes("unsplash.com") || u.includes("flickr.com") || u.includes("/photos/"))
    return "Photo";
  if (u.includes("feed") || u.includes("rss") || u.endsWith(".xml")) return "RSS";
  if (u.includes("newsletter") || u.includes("substack")) return "Newsletter";
  if (u.includes("medium.com") || u.includes("/blog") || u.includes("/post")) return "Article";
  return "Content";
}

export function estMonthly(citationsPerMonth: number): string {
  return (citationsPerMonth * CITATION_USDC).toFixed(2);
}
