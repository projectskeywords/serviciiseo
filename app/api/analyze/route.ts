import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
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

export async function POST(req: NextRequest) {
  const ip = getClientIP(req.headers);
  const rateCheck = checkRateLimit(ip);

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

  const leadInsert = db.prepare(`
    INSERT INTO leads (website_url, email, category, language, ip_address, user_agent, status)
    VALUES (?, ?, ?, ?, ?, ?, 'pending')
  `).run(normalizedUrl, email, category, lang, ip, ua);

  const leadId = leadInsert.lastInsertRowid;

  try {
    const competitorDomains = getCompetitors(category!);

    // Run PageSpeed + SiteCheck for user, PageSpeed for competitors — all in parallel
    const [userPageSpeedSettled, userSiteCheckSettled, ...compFetches] = await Promise.allSettled([
      fetchPageSpeed(normalizedUrl),
      checkSite(normalizedUrl),
      ...competitorDomains.map(d => fetchPageSpeed(d)),
    ]);

    const userResult =
      userPageSpeedSettled.status === 'fulfilled'
        ? userPageSpeedSettled.value
        : {
            url: normalizedUrl,
            performance: 0,
            seo: 0,
            accessibility: 0,
            bestPractices: 0,
            fcp: 'N/A',
            lcp: 'N/A',
            tbt: 'N/A',
            overall: 0,
            error: 'Failed to fetch',
          };

    const siteCheck =
      userSiteCheckSettled.status === 'fulfilled' ? userSiteCheckSettled.value : null;

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
        ? Math.round(
            competitorResults.reduce((s, r) => s + r.overall, 0) / competitorResults.length
          )
        : userResult.overall;

    const recommendations = getRecommendations(
      {
        performance: userResult.performance,
        seo: userResult.seo,
        accessibility: userResult.accessibility,
        bestPractices: userResult.bestPractices,
      },
      rankPosition,
      rankTotal,
      lang,
      siteCheck ?? undefined
    );

    db.prepare(`
      UPDATE leads SET
        status = 'completed',
        completed_at = CURRENT_TIMESTAMP,
        score_overall = ?,
        score_performance = ?,
        score_seo = ?,
        score_accessibility = ?,
        score_best_practices = ?,
        fcp = ?, lcp = ?, tbt = ?,
        rank_position = ?,
        rank_total = ?,
        competitors_json = ?
      WHERE id = ?
    `).run(
      userResult.overall,
      userResult.performance,
      userResult.seo,
      userResult.accessibility,
      userResult.bestPractices,
      userResult.fcp,
      userResult.lcp,
      userResult.tbt,
      rankPosition,
      rankTotal,
      JSON.stringify(allResults.filter(r => !r.isUser)),
      leadId
    );

    return NextResponse.json({
      user: userResult,
      competitors: allResults,
      rankPosition,
      rankTotal,
      competitorAvg,
      recommendations,
      remaining: rateCheck.remaining,
      isDemo,
      siteCheck,
    });
  } catch (err) {
    db.prepare(`UPDATE leads SET status = 'failed' WHERE id = ?`).run(leadId);
    return NextResponse.json({ error: 'analysis_failed', message: String(err) }, { status: 500 });
  }
}
