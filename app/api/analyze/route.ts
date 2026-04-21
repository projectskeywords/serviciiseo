import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureTables } from '@/lib/db';
import { checkRateLimit, getClientIP } from '@/lib/ratelimit';
import { fetchPageSpeed } from '@/lib/pagespeed';
import { checkSite } from '@/lib/sitecheck';
import { getCompetitors } from '@/lib/competitors';
import { getRecommendations } from '@/lib/scoring';
import type { Lang } from '@/translations';

export const maxDuration = 60;

function isValidUrl(url: string): boolean {
  try {
    const normalized = url.trim().startsWith('http') ? url.trim() : `https://${url.trim()}`;
    const u = new URL(normalized);
    return u.hostname.includes('.');
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/** Safe DB insert — returns lead ID or null if DB is not configured */
async function dbInsertLead(
  normalizedUrl: string, email: string, category: string,
  lang: string, ip: string, ua: string
): Promise<number | null> {
  try {
    await ensureTables();
    const rows = await sql`
      INSERT INTO leads (website_url, email, category, language, ip_address, user_agent, status)
      VALUES (${normalizedUrl}, ${email}, ${category}, ${lang}, ${ip}, ${ua}, 'pending')
      RETURNING id
    `;
    return (rows[0] as { id: number }).id;
  } catch (err) {
    console.error('[DB] insert lead failed:', err);
    return null;
  }
}

async function dbUpdateLead(leadId: number, data: Record<string, unknown>): Promise<void> {
  try {
    await sql`
      UPDATE leads SET
        status               = 'completed',
        completed_at         = NOW(),
        score_overall        = ${data.overall as number},
        score_performance    = ${data.performance as number},
        score_seo            = ${data.seo as number},
        score_accessibility  = ${data.accessibility as number},
        score_best_practices = ${data.bestPractices as number},
        fcp                  = ${data.fcp as string},
        lcp                  = ${data.lcp as string},
        tbt                  = ${data.tbt as string},
        rank_position        = ${data.rankPosition as number},
        rank_total           = ${data.rankTotal as number},
        competitors_json     = ${data.competitorsJson as string}
      WHERE id = ${leadId}
    `;
  } catch (err) {
    console.error('[DB] update lead failed:', err);
  }
}

async function dbFailLead(leadId: number): Promise<void> {
  try {
    await sql`UPDATE leads SET status = 'failed' WHERE id = ${leadId}`;
  } catch { /* ignore */ }
}

export async function POST(req: NextRequest) {
  const ip = getClientIP(req.headers);

  // Rate limit — gracefully allow if DB unavailable
  let rateCheck = { allowed: true, remaining: 999, resetAt: 'never' };
  try {
    rateCheck = await checkRateLimit(ip);
  } catch (err) {
    console.error('[RateLimit] error (allowing request):', err);
  }

  if (!rateCheck.allowed) {
    return NextResponse.json(
      {
        error: 'rate_limit_exceeded',
        message: 'Maximum 3 analyses per day per IP address.',
        remaining: 0,
        resetAt: new Date(new Date().setHours(24, 0, 0, 0)).toISOString(),
      },
      { status: 429 }
    );
  }

  let body: { website_url?: string; email?: string; category?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { website_url, email, category, language = 'ro' } = body;
  const lang = (['ro', 'ru', 'en'].includes(language as string) ? language : 'ro') as Lang;

  const errors: Record<string, string> = {};
  if (!website_url || !isValidUrl(website_url)) errors.website_url = 'invalid_url';
  if (!email || !isValidEmail(email)) errors.email = 'invalid_email';
  if (!category || category.trim().length === 0) errors.category = 'invalid_category';

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: 'validation_failed', errors }, { status: 422 });
  }

  const ua = req.headers.get('user-agent') || '';
  const rawUrl = website_url!.trim();
  const normalizedUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`;

  // Insert lead (DB is optional — analysis runs even without DB)
  const leadId = await dbInsertLead(normalizedUrl, email!, category!, lang, ip, ua);

  try {
    const competitorDomains = await getCompetitors(category!);

    // Run PageSpeed + SiteCheck for user, PageSpeed for competitors — all in parallel
    const [userPageSpeedSettled, userSiteCheckSettled, ...compFetches] =
      await Promise.allSettled([
        fetchPageSpeed(normalizedUrl),
        checkSite(normalizedUrl),
        ...competitorDomains.map(d => fetchPageSpeed(d)),
      ]);

    const userResult =
      userPageSpeedSettled.status === 'fulfilled'
        ? userPageSpeedSettled.value
        : {
            url: normalizedUrl,
            performance: 0, seo: 0, accessibility: 0, bestPractices: 0,
            fcp: 'N/A', lcp: 'N/A', tbt: 'N/A', overall: 0,
            error: 'Failed to fetch',
          };

    const siteCheck =
      userSiteCheckSettled.status === 'fulfilled' ? userSiteCheckSettled.value : null;

    if (userSiteCheckSettled.status === 'rejected') {
      console.error('[SiteCheck] failed:', userSiteCheckSettled.reason);
    }

    const isDemo = userResult.isDemo === true;

    const competitorResults = compFetches
      .filter(r => r.status === 'fulfilled')
      .map(r => (r as PromiseFulfilledResult<typeof userResult>).value)
      .filter(r => r.overall > 0);

    const allResults = [
      { ...userResult, isUser: true },
      ...competitorResults.map(r => ({ ...r, isUser: false })),
    ];
    allResults.sort((a, b) => b.overall - a.overall);

    const rankPosition = allResults.findIndex(r => r.isUser) + 1;
    const rankTotal = allResults.length;
    const competitorAvg =
      competitorResults.length > 0
        ? Math.round(competitorResults.reduce((s, r) => s + r.overall, 0) / competitorResults.length)
        : userResult.overall;

    const recommendations = getRecommendations(
      { performance: userResult.performance, seo: userResult.seo, accessibility: userResult.accessibility, bestPractices: userResult.bestPractices },
      rankPosition, rankTotal, lang, siteCheck ?? undefined
    );

    // Persist to DB (non-blocking — analysis result is returned regardless)
    if (leadId !== null) {
      await dbUpdateLead(leadId, {
        overall: userResult.overall, performance: userResult.performance,
        seo: userResult.seo, accessibility: userResult.accessibility,
        bestPractices: userResult.bestPractices,
        fcp: userResult.fcp, lcp: userResult.lcp, tbt: userResult.tbt,
        rankPosition, rankTotal,
        competitorsJson: JSON.stringify(allResults.filter(r => !r.isUser)),
      });
    }

    return NextResponse.json({
      user: userResult, competitors: allResults,
      rankPosition, rankTotal, competitorAvg,
      recommendations, remaining: rateCheck.remaining,
      isDemo, siteCheck,
    });
  } catch (err) {
    if (leadId !== null) await dbFailLead(leadId);
    console.error('[Analyze] error:', err);
    return NextResponse.json({ error: 'analysis_failed', message: String(err) }, { status: 500 });
  }
}
