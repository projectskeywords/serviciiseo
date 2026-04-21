'use client';

import { useState } from 'react';

interface Lead {
  id: number;
  created_at: string;
  email: string;
  website_url: string;
  category: string;
  language: string;
  status: string;
  score_overall: number;
  score_performance: number;
  score_seo: number;
  score_accessibility: number;
  score_best_practices: number;
  fcp: string;
  lcp: string;
  tbt: string;
  rank_position: number;
  rank_total: number;
  ip_address: string;
  competitors_json: string;
}

interface Props {
  leads: Lead[];
  total: number;
  page: number;
  pages: number;
  onPageChange: (p: number) => void;
}

function statusBadge(s: string) {
  const map: Record<string, { bg: string; color: string; label: string }> = {
    completed: { bg: '#DCFCE7', color: '#166534', label: 'Completat' },
    pending:   { bg: '#FEF3C7', color: '#92400E', label: 'În așteptare' },
    failed:    { bg: '#FEE2E2', color: '#B91C1C', label: 'Eșuat' },
  };
  const style = map[s] || { bg: '#F3F4F6', color: '#374151', label: s };
  return (
    <span style={{ background: style.bg, color: style.color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>
      {style.label}
    </span>
  );
}

function scoreColor(s: number) {
  if (s >= 75) return 'var(--success)';
  if (s >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

function hostname(url: string) {
  try { return new URL(url).hostname.replace('www.', ''); }
  catch { return url; }
}

function formatDate(dt: string) {
  const d = new Date(dt);
  return d.toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function LeadsTable({ leads, total, page, pages, onPageChange }: Props) {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 12, fontSize: 14, color: 'var(--text-secondary)' }}>
        Total: <strong>{total}</strong> analize
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
              {['#', 'Email', 'Site', 'Scor', 'Limbă', 'Status', 'Data', ''].map(h => (
                <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <>
                <tr
                  key={lead.id}
                  style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
                  onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
                >
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-tertiary)' }}>{lead.id}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-primary)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lead.email}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{hostname(lead.website_url)}</td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{ fontWeight: 700, color: scoreColor(lead.score_overall), fontSize: 15 }}>{lead.score_overall || '—'}</span>
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)' }}>{lead.language?.toUpperCase()}</td>
                  <td style={{ padding: '12px 14px' }}>{statusBadge(lead.status)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{formatDate(lead.created_at)}</td>
                  <td style={{ padding: '12px 14px', fontSize: 13, color: 'var(--accent)' }}>{expanded === lead.id ? '▲' : '▼'}</td>
                </tr>
                {expanded === lead.id && (
                  <tr key={`exp-${lead.id}`} style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
                    <td colSpan={8} style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13 }}>
                        <div><strong>Categorie:</strong> {lead.category || '—'}</div>
                        <div><strong>IP:</strong> {lead.ip_address || '—'}</div>
                        <div><strong>Poziție:</strong> #{lead.rank_position} din {lead.rank_total}</div>
                        <div><strong>Performance:</strong> {lead.score_performance}</div>
                        <div><strong>SEO:</strong> {lead.score_seo}</div>
                        <div><strong>Accesibilitate:</strong> {lead.score_accessibility}</div>
                        <div><strong>Best Practices:</strong> {lead.score_best_practices}</div>
                        <div><strong>FCP:</strong> {lead.fcp} | <strong>LCP:</strong> {lead.lcp} | <strong>TBT:</strong> {lead.tbt}</div>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 20 }}>
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page > 1 ? 'pointer' : 'not-allowed', opacity: page <= 1 ? 0.4 : 1, fontFamily: 'inherit', fontSize: 14 }}
          >
            ←
          </button>
          {Array.from({ length: Math.min(pages, 7) }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              style={{
                padding: '6px 12px', borderRadius: 7, border: '1px solid var(--border)', cursor: 'pointer', fontFamily: 'inherit', fontSize: 14,
                background: p === page ? 'var(--accent)' : 'var(--bg-primary)',
                color: p === page ? '#fff' : 'var(--text-primary)',
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pages}
            style={{ padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--bg-primary)', cursor: page < pages ? 'pointer' : 'not-allowed', opacity: page >= pages ? 0.4 : 1, fontFamily: 'inherit', fontSize: 14 }}
          >
            →
          </button>
        </div>
      )}
    </div>
  );
}
