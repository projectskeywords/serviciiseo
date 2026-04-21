'use client';

import { useState } from 'react';
import type { Lang, T } from '@/translations';
import ScoreRing from './ScoreRing';
import MetricCards from './MetricCards';
import CompetitorTable from './CompetitorTable';
import Recommendations from './Recommendations';
import CTABlock from './CTABlock';

interface SiteResult {
  url: string;
  overall: number;
  performance: number;
  seo: number;
  accessibility: number;
  bestPractices: number;
  fcp: string;
  lcp: string;
  tbt: string;
  isUser: boolean;
  error?: string;
}

interface SiteCheck {
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
  ttfb: number;
  mobileViewport: boolean;
  hasPhone: boolean;
  hasEmail: boolean;
  siteScore: number;
}

interface AnalysisData {
  user: SiteResult;
  competitors: SiteResult[];
  rankPosition: number;
  rankTotal: number;
  competitorAvg: number;
  isDemo?: boolean;
  siteCheck?: SiteCheck | null;
  recommendations: Array<{ priority: 'high' | 'medium' | 'low'; text: string }>;
}

interface Props {
  data: Record<string, unknown>;
  lang: Lang;
  tr: T;
  onReset: () => void;
}


type Tab = 'overview' | 'details' | 'actions';

function scoreColor(s: number) {
  if (s >= 75) return 'var(--success)';
  if (s >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

export default function ResultsDashboard({ data, lang, tr, onReset }: Props) {
  const [tab, setTab] = useState<Tab>('overview');
  const d = data as unknown as AnalysisData;

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: tr.tab_overview },
    { id: 'details', label: tr.tab_details },
    { id: 'actions', label: tr.tab_actions },
  ];

  const hasError = d.user.error && d.user.overall === 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="fade-up">

      {/* Demo data notice */}
      {d.isDemo && (
        <div style={{ background: '#FFFBEB', border: '1px solid #FCD34D', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#92400E', lineHeight: 1.6 }}>
          <strong>⚠️ Date estimate</strong> — Google PageSpeed API a atins limita zilnică de cereri gratuite.
          Scorurile afișate sunt <strong>estimări orientative</strong> bazate pe parametri tipici pentru tipul site-ului.
          Pentru date reale, adaugă o cheie API gratuită Google în <code style={{ background: 'rgba(0,0,0,0.07)', padding: '1px 5px', borderRadius: 4 }}>.env.local</code> →{' '}
          <a href="https://developers.google.com/speed/docs/insights/v5/get-started" target="_blank" rel="noopener" style={{ color: '#92400E', fontWeight: 700 }}>
            ghid aici ↗
          </a>
        </div>
      )}

      {/* Error notice */}
      {hasError && !d.isDemo && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 18px', fontSize: 14, color: '#B91C1C' }}>
          ⚠️ Nu am putut accesa datele pentru site-ul tău. {d.user.error}
        </div>
      )}

      {/* Score summary card */}
      <div className="card" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap', marginBottom: 24 }}>
          <ScoreRing score={d.user.overall} size={110} strokeWidth={10} />
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>{tr.score_label}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 12 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: 44, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1, letterSpacing: '-0.03em' }}>{d.user.overall}</span>
              <span style={{ fontSize: 18, color: 'var(--text-tertiary)', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{tr.rank_label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>#{d.rankPosition} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>{tr.rank_of} {d.rankTotal}</span></div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{tr.avg_label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{d.competitorAvg}<span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>/100</span></div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 8 }}>
              🌐 {hostname(d.user.url)}
            </div>
          </div>
        </div>

        {/* Mini score pills */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: tr.metric_performance, val: d.user.performance },
            { label: tr.metric_seo, val: d.user.seo },
            { label: tr.metric_accessibility, val: d.user.accessibility },
            { label: tr.metric_bestpractices, val: d.user.bestPractices },
          ].map(m => (
            <div key={m.label} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px 8px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: scoreColor(m.val), letterSpacing: '-0.02em' }}>{m.val}</div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.3, fontWeight: 500 }}>{m.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, border: '1px solid var(--border)' }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none', cursor: 'pointer',
            fontSize: 14, fontWeight: 600, fontFamily: 'inherit',
            background: tab === t.id ? 'var(--bg-primary)' : 'transparent',
            color: tab === t.id ? 'var(--accent)' : 'var(--text-secondary)',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="fade-up" key={tab}>
        {tab === 'overview' && <CompetitorTable competitors={d.competitors} tr={tr} />}
        {tab === 'details' && (
          <MetricCards
            metrics={{ performance: d.user.performance, seo: d.user.seo, accessibility: d.user.accessibility, bestPractices: d.user.bestPractices, fcp: d.user.fcp, lcp: d.user.lcp, tbt: d.user.tbt }}
            siteCheck={d.siteCheck}
            tr={tr}
          />
        )}
        {tab === 'actions' && <Recommendations recommendations={d.recommendations} tr={tr} />}
      </div>

      {/* CTA */}
      <CTABlock tr={tr} />

      {/* Reset */}
      <div style={{ textAlign: 'center', paddingBottom: 8 }}>
        <button onClick={onReset} style={{ background: 'none', border: 'none', color: 'var(--accent)', fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>
          ← {lang === 'ru' ? 'Анализировать другой сайт' : lang === 'en' ? 'Analyze another site' : 'Analizează alt site'}
        </button>
      </div>
    </div>
  );
}
