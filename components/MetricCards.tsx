'use client';

import type { T } from '@/translations';
import type { SiteCheckResult } from '@/lib/sitecheck';

interface Metrics {
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  fcp: string;
  lcp: string;
  tbt: string;
}

interface Props {
  metrics: Metrics;
  siteCheck?: SiteCheckResult | null;
  tr: T;
}

function scoreColor(s: number) {
  if (s >= 75) return 'var(--success)';
  if (s >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function MetricBar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>{label}</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: scoreColor(value) }}>{value}</span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${value}%`, background: scoreColor(value) }} />
      </div>
    </div>
  );
}

function VitalCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</div>
    </div>
  );
}

function CheckItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid var(--border)',
    }}>
      <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{label}</span>
      <span style={{
        flexShrink: 0,
        width: 22, height: 22, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 700, marginLeft: 12,
        background: ok ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.1)',
        color: ok ? '#16a34a' : '#dc2626',
      }}>
        {ok ? '✓' : '✗'}
      </span>
    </div>
  );
}

function ttfbLabel(ms: number, tr: T): string {
  if (ms === 0) return '—';
  const label = ms < 800 ? tr.sitehealth_ttfb_fast : ms < 2000 ? tr.sitehealth_ttfb_medium : tr.sitehealth_ttfb_slow;
  const color = ms < 800 ? '#16a34a' : ms < 2000 ? '#d97706' : '#dc2626';
  return `${ms}ms · ${label}`;
}

function SiteHealthSection({ sc, tr }: { sc: SiteCheckResult; tr: T }) {
  const scoreCol = scoreColor(sc.siteScore);

  return (
    <div className="card" style={{ padding: 24 }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>{tr.sitehealth_title}</h3>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-secondary)', border: '1px solid var(--border)',
          borderRadius: 8, padding: '5px 12px',
        }}>
          <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{tr.sitehealth_score}</span>
          <span style={{ fontSize: 18, fontWeight: 800, color: scoreCol }}>{sc.siteScore}</span>
        </div>
      </div>

      {/* Score bar */}
      <div style={{ marginBottom: 20 }}>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${sc.siteScore}%`, background: scoreCol }} />
        </div>
      </div>

      {/* TTFB */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '9px 0', borderBottom: '1px solid var(--border)', marginBottom: 4,
      }}>
        <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tr.sitehealth_ttfb}</span>
        <span style={{
          fontSize: 13, fontWeight: 600,
          color: sc.ttfb === 0 ? 'var(--text-tertiary)' : sc.ttfb < 800 ? '#16a34a' : sc.ttfb < 2000 ? '#d97706' : '#dc2626',
        }}>
          {sc.ttfb === 0 ? '—' : `${sc.ttfb}ms · ${sc.ttfb < 800 ? tr.sitehealth_ttfb_fast : sc.ttfb < 2000 ? tr.sitehealth_ttfb_medium : tr.sitehealth_ttfb_slow}`}
        </span>
      </div>

      {/* Security */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 4px' }}>
        {tr.sitehealth_section_security}
      </p>
      <CheckItem label={tr.sitehealth_ssl} ok={sc.ssl} />
      <CheckItem label={tr.sitehealth_redirect} ok={sc.httpsRedirect} />
      <CheckItem label={tr.sitehealth_hsts} ok={sc.hsts} />
      <CheckItem label={tr.sitehealth_csp} ok={sc.csp} />
      <CheckItem label={tr.sitehealth_xframe} ok={sc.xFrame} />

      {/* SEO On-Page */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 4px' }}>
        {tr.sitehealth_section_seo}
      </p>
      <CheckItem label={tr.sitehealth_title_tag} ok={sc.metaTitle} />
      <CheckItem label={tr.sitehealth_metadesc} ok={sc.metaDesc} />
      <CheckItem label={tr.sitehealth_h1} ok={sc.h1} />
      <CheckItem label={tr.sitehealth_ogimage} ok={sc.ogImage} />
      <CheckItem label={tr.sitehealth_jsonld} ok={sc.jsonLd} />

      {/* Technical */}
      <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.07em', margin: '16px 0 4px' }}>
        {tr.sitehealth_section_tech}
      </p>
      <CheckItem label={tr.sitehealth_sitemap} ok={sc.sitemap} />
      <CheckItem label={tr.sitehealth_robots} ok={sc.robots} />
      <CheckItem label={tr.sitehealth_viewport} ok={sc.mobileViewport} />
      <div style={{ borderBottom: 'none' }}>
        <CheckItem label={tr.sitehealth_contact} ok={sc.hasPhone || sc.hasEmail} />
      </div>
    </div>
  );
}

export default function MetricCards({ metrics, siteCheck, tr }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* PageSpeed scores */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          {tr.tab_details}
        </h3>
        <MetricBar label={tr.metric_performance} value={metrics.performance} />
        <MetricBar label={tr.metric_seo} value={metrics.seo} />
        <MetricBar label={tr.metric_accessibility} value={metrics.accessibility} />
        <MetricBar label={tr.metric_bestpractices} value={metrics.bestPractices} />
      </div>

      {/* Core Web Vitals */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>Core Web Vitals</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <VitalCard label="FCP" value={metrics.fcp} />
          <VitalCard label="LCP" value={metrics.lcp} />
          <VitalCard label="TBT" value={metrics.tbt} />
        </div>
      </div>

      {/* Site Health */}
      {siteCheck && <SiteHealthSection sc={siteCheck} tr={tr} />}
    </div>
  );
}
