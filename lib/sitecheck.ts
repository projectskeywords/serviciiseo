export interface SiteCheckResult {
  ssl: boolean;
  httpsRedirect: boolean;
  hsts: boolean;
  csp: boolean;
  xFrame: boolean;
  metaTitle: boolean;
  metaDesc: boolean;
  h1: boolean;
  ogImage: boolean;
  jsonLd: boolean;
  sitemap: boolean;
  robots: boolean;
  ttfb: number; // ms, 0 = failed
  mobileViewport: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  siteScore: number; // 0–100
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
  opts: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      signal: controller.signal,
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StrategyProbe/1.0; +https://strategyprobe.com)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      ...opts,
    });
  } finally {
    clearTimeout(timer);
  }
}

function getOrigin(url: string): string {
  try {
    return new URL(url).origin;
  } catch {
    return url;
  }
}

/** Extract plain text from HTML (strips tags) */
function htmlToText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
}

function calcSiteScore(r: Omit<SiteCheckResult, 'siteScore'>): number {
  let score = 0;
  if (r.ssl) score += 15;
  if (r.hsts) score += 5;
  if (r.csp) score += 5;
  if (r.xFrame) score += 5;
  if (r.metaTitle) score += 10;
  if (r.metaDesc) score += 10;
  if (r.h1) score += 5;
  if (r.ogImage) score += 5;
  if (r.mobileViewport) score += 15;
  if (r.sitemap) score += 8;
  if (r.robots) score += 4;
  if (r.hasPhone || r.hasEmail) score += 8;
  // TTFB bonus: fast response = up to 5 points
  if (r.ttfb > 0 && r.ttfb < 800) score += 5;
  else if (r.ttfb >= 800 && r.ttfb < 2000) score += 2;
  return Math.min(100, score);
}

export async function checkSite(url: string): Promise<SiteCheckResult> {
  const normalized = normalizeUrl(url);
  const isHttps = normalized.startsWith('https://');
  const origin = getOrigin(normalized);

  const partial: Omit<SiteCheckResult, 'siteScore'> = {
    ssl: false,
    httpsRedirect: false,
    hsts: false,
    csp: false,
    xFrame: false,
    metaTitle: false,
    metaDesc: false,
    h1: false,
    ogImage: false,
    jsonLd: false,
    sitemap: false,
    robots: false,
    ttfb: 0,
    mobileViewport: false,
    hasPhone: false,
    hasEmail: false,
  };

  // ── 1. Main HTML fetch ────────────────────────────────────────────
  const mainFetch = (async () => {
    const t0 = Date.now();
    try {
      const res = await fetchWithTimeout(normalized, 15000, { redirect: 'follow' });
      partial.ttfb = Date.now() - t0;
      if (isHttps && res.ok) partial.ssl = true;

      // Security headers
      const hsts = res.headers.get('strict-transport-security');
      if (hsts) partial.hsts = true;
      const csp = res.headers.get('content-security-policy');
      if (csp) partial.csp = true;
      const xfo = (res.headers.get('x-frame-options') || '').toUpperCase();
      if (xfo === 'DENY' || xfo === 'SAMEORIGIN') partial.xFrame = true;

      // HTML parsing (regex — no jsdom needed)
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('text/html')) {
        const html = await res.text();

        partial.metaTitle = /<title[^>]*>\s*[^<\s][^<]*<\/title>/i.test(html);

        partial.metaDesc =
          /<meta[^>]+name=["']description["'][^>]*content=["'][^"']{5,}["']/i.test(html) ||
          /<meta[^>]+content=["'][^"']{5,}["'][^>]*name=["']description["']/i.test(html);

        partial.h1 = /<h1[\s>]/i.test(html);

        partial.ogImage =
          /<meta[^>]+property=["']og:image["'][^>]*content=["'][^"']+["']/i.test(html) ||
          /<meta[^>]+content=["'][^"']+["'][^>]*property=["']og:image["']/i.test(html);

        partial.jsonLd = /<script[^>]+type=["']application\/ld\+json["']/i.test(html);

        partial.mobileViewport = /<meta[^>]+name=["']viewport["']/i.test(html);

        const text = htmlToText(html);
        // Phone: at least 7 digits, may include +, spaces, dashes, parens
        partial.hasPhone = /(\+?\d[\d\s\-().]{5,}\d)/.test(text);
        // Email
        partial.hasEmail = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/.test(text);
      }
    } catch {
      partial.ttfb = Date.now() - t0;
    }
  })();

  // ── 2. HTTP → HTTPS redirect check ──────────────────────────────
  const redirectCheck = isHttps
    ? (async () => {
        const httpUrl = normalized.replace(/^https:\/\//, 'http://');
        try {
          const res = await fetchWithTimeout(httpUrl, 8000, { redirect: 'manual' });
          const loc = res.headers.get('location') || '';
          if ([301, 302, 307, 308].includes(res.status) && loc.startsWith('https://')) {
            partial.httpsRedirect = true;
          }
        } catch {
          // ignore — some servers don't respond on HTTP at all
        }
      })()
    : Promise.resolve();

  // ── 3. robots.txt + sitemap.xml ──────────────────────────────────
  const robotsCheck = (async () => {
    try {
      const res = await fetchWithTimeout(`${origin}/robots.txt`, 6000);
      if (res.ok) {
        const body = await res.text();
        // Must look like a real robots.txt
        partial.robots = body.trim().length > 0 && /user-agent/i.test(body);
      }
    } catch { /* ignore */ }
  })();

  const sitemapCheck = (async () => {
    try {
      const res = await fetchWithTimeout(`${origin}/sitemap.xml`, 6000);
      if (res.ok) {
        const body = await res.text();
        partial.sitemap = /<\?xml|<urlset|<sitemapindex/i.test(body);
      }
    } catch {
      // Also check if sitemap is listed in robots.txt (simplified)
    }
  })();

  await Promise.allSettled([mainFetch, redirectCheck, robotsCheck, sitemapCheck]);

  return { ...partial, siteScore: calcSiteScore(partial) };
}
