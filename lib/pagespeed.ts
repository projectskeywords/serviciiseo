export interface PageSpeedResult {
  url: string;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  fcp: string;
  lcp: string;
  tbt: string;
  overall: number;
  error?: string;
  isDemo?: boolean;
}

function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function calcScore(p: number, seo: number, a: number, bp: number): number {
  return Math.round(p * 0.40 + seo * 0.35 + a * 0.15 + bp * 0.10);
}

function formatMs(value: number): string {
  if (!value || isNaN(value)) return 'N/A';
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`;
  return `${Math.round(value)}ms`;
}

/** Deterministic pseudo-random score from a URL string */
function hashScore(url: string, salt: number, min: number, max: number): number {
  let h = salt;
  for (let i = 0; i < url.length; i++) {
    h = (h * 31 + url.charCodeAt(i)) & 0xfffffff;
  }
  return min + (h % (max - min + 1));
}

function demoResult(url: string): PageSpeedResult {
  const normalized = normalizeUrl(url);
  const perf = hashScore(normalized, 7, 38, 82);
  const seo  = hashScore(normalized, 13, 55, 91);
  const acc  = hashScore(normalized, 19, 48, 88);
  const bp   = hashScore(normalized, 31, 60, 95);
  const fcpMs = hashScore(normalized, 3, 900, 3800);
  const lcpMs = hashScore(normalized, 5, 1600, 5200);
  const tbtMs = hashScore(normalized, 11, 80, 620);
  return {
    url: normalized,
    performance: perf,
    seo,
    accessibility: acc,
    bestPractices: bp,
    fcp: formatMs(fcpMs),
    lcp: formatMs(lcpMs),
    tbt: formatMs(tbtMs),
    overall: calcScore(perf, seo, acc, bp),
    isDemo: true,
  };
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal, cache: 'no-store' });
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchPageSpeed(url: string): Promise<PageSpeedResult> {
  const normalized = normalizeUrl(url);
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY || '';
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const apiUrl =
    `https://www.googleapis.com/pagespeedonline/v5/runPagespeed` +
    `?url=${encodeURIComponent(normalized)}` +
    `&strategy=mobile` +
    `&category=PERFORMANCE&category=SEO&category=ACCESSIBILITY&category=BEST_PRACTICES` +
    keyParam;

  try {
    const res = await fetchWithTimeout(apiUrl, 55000);

    if (res.status === 429) {
      // Quota exceeded — return deterministic demo data so the UI still works
      console.warn(`[PageSpeed] 429 quota exceeded for ${normalized} — using demo data`);
      return demoResult(normalized);
    }

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`PageSpeed API ${res.status}: ${body.slice(0, 300)}`);
    }

    const data = await res.json();
    const cats = data.lighthouseResult?.categories;
    const audits = data.lighthouseResult?.audits;

    if (!cats) throw new Error('No Lighthouse categories in response');

    const performance   = Math.round((cats.performance?.score  ?? 0) * 100);
    const seo           = Math.round((cats.seo?.score          ?? 0) * 100);
    const accessibility = Math.round((cats.accessibility?.score ?? 0) * 100);
    const bestPractices = Math.round((cats['best-practices']?.score ?? 0) * 100);

    const fcp = formatMs(audits?.['first-contentful-paint']?.numericValue  ?? 0);
    const lcp = formatMs(audits?.['largest-contentful-paint']?.numericValue ?? 0);
    const tbt = formatMs(audits?.['total-blocking-time']?.numericValue      ?? 0);

    return {
      url: normalized,
      performance,
      seo,
      accessibility,
      bestPractices,
      fcp,
      lcp,
      tbt,
      overall: calcScore(performance, seo, accessibility, bestPractices),
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    // Network error or timeout — fall back to demo too
    console.error(`[PageSpeed] Error for ${normalized}: ${msg} — using demo data`);
    return { ...demoResult(normalized) };
  }
}
