'use client';

import type { T } from '@/translations';

interface SiteResult {
  url: string;
  overall: number;
  isUser: boolean;
}

interface Props {
  competitors: SiteResult[];
  tr: T;
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

export default function CompetitorTable({ competitors, tr }: Props) {
  const sorted = [...competitors].sort((a, b) => b.overall - a.overall);

  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)' }}>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 48 }}>{tr.competitor_col_rank}</th>
            <th style={{ padding: '10px 16px', textAlign: 'left', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{tr.competitor_col_site}</th>
            <th style={{ padding: '10px 16px', textAlign: 'right', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', width: 80 }}>{tr.competitor_col_score}</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((site, i) => (
            <tr
              key={site.url}
              style={{
                borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none',
                background: site.isUser ? 'var(--accent-light)' : 'transparent',
              }}
            >
              <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)' }}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
              </td>
              <td style={{ padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: site.isUser ? 600 : 400 }}>
                    {hostname(site.url)}
                  </span>
                  {site.isUser && (
                    <span style={{ background: 'var(--accent)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '1px 7px', borderRadius: 20 }}>
                      {tr.you_badge}
                    </span>
                  )}
                </div>
              </td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: scoreColor(site.overall) }}>
                  {site.overall}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
