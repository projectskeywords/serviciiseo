'use client';

import type { Lang, T } from '@/translations';

interface Props { tr: T; lang: Lang; }

export default function RateLimitMessage({ tr }: Props) {
  const site = process.env.NEXT_PUBLIC_KEYWORDS_SITE || 'https://keywords.md';
  const phone = process.env.NEXT_PUBLIC_KEYWORDS_PHONE || '+37369123456';
  const C = { accent: '#5B4FE8', border: '#E8E7F5', textPrimary: '#0F0E1A', textSecondary: '#5C5980' };

  return (
    <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: 32, textAlign: 'center', boxShadow: '0 1px 4px rgba(15,14,26,0.06)' }}>
      <div style={{ fontSize: 44, marginBottom: 16 }}>⏱️</div>
      <h3 style={{ fontFamily: "var(--font-display, serif)", fontSize: 22, color: C.textPrimary, fontWeight: 700, marginBottom: 10 }}>{tr.limit_title}</h3>
      <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.7, maxWidth: 400, margin: '0 auto 24px' }}>{tr.limit_body}</p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <a href={site} target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.accent, color: '#fff', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{tr.cta_btn}</a>
        <a href={`tel:${phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', color: C.accent, border: `1.5px solid ${C.accent}`, borderRadius: 10, padding: '10px 20px', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>{tr.cta_phone}</a>
      </div>
    </div>
  );
}
