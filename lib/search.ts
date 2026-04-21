/**
 * Google Custom Search API — finds real competitors based on search ranking.
 * Requires GOOGLE_SEARCH_ENGINE_ID (cx) env var.
 * Uses the same GOOGLE_PAGESPEED_API_KEY for auth.
 * Falls back to empty array if unconfigured (competitors.ts uses hardcoded map).
 */

const SKIP_DOMAINS = new Set([
  'google.com', 'google.md', 'google.ro', 'google.ru',
  'facebook.com', 'instagram.com', 'youtube.com', 'tiktok.com',
  'wikipedia.org', 'wikimedia.org',
  'tripadvisor.com', 'tripadvisor.co.uk',
  'yelp.com', 'foursquare.com',
  'booking.com', 'airbnb.com',
  'maps.google.com',
  '2gis.md', '2gis.ro',
  'paginiaurii.ro', 'aurii.md',
  'linkedin.com', 'twitter.com', 'x.com',
]);

function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function isSkipped(domain: string): boolean {
  if (!domain) return true;
  if (SKIP_DOMAINS.has(domain)) return true;
  // Skip social/directory-like TLDs
  if (/\.(app|io|dev)$/.test(domain)) return true;
  return false;
}

async function fetchWithTimeout(url: string, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
  } finally {
    clearTimeout(t);
  }
}

export async function searchCompetitors(query: string): Promise<string[]> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;
  const cx = process.env.GOOGLE_SEARCH_ENGINE_ID;

  if (!apiKey || !cx) return [];

  try {
    const searchUrl =
      `https://www.googleapis.com/customsearch/v1` +
      `?key=${encodeURIComponent(apiKey)}` +
      `&cx=${encodeURIComponent(cx)}` +
      `&q=${encodeURIComponent(query)}` +
      `&num=10` +
      `&gl=md`; // geolocation Moldova

    const res = await fetchWithTimeout(searchUrl, 8000);
    if (!res.ok) {
      console.warn(`[Search] API returned ${res.status} for query "${query}"`);
      return [];
    }

    const data: { items?: { link: string }[] } = await res.json();
    const domains = (data.items || [])
      .map(item => extractDomain(item.link))
      .filter(d => !isSkipped(d));

    // Deduplicate, take first 4
    const seen = new Set<string>();
    const result: string[] = [];
    for (const d of domains) {
      if (!seen.has(d)) {
        seen.add(d);
        result.push(d);
      }
      if (result.length >= 4) break;
    }

    return result;
  } catch (err) {
    console.warn('[Search] searchCompetitors error:', err);
    return [];
  }
}
