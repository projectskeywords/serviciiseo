'use client';

import type { T } from '@/translations';

interface Rec {
  priority: 'high' | 'medium' | 'low';
  text: string;
}

interface Props {
  recommendations: Rec[];
  tr: T;
}

const PRIORITY_LABEL: Record<Rec['priority'], string> = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
};

const PRIORITY_ICON: Record<Rec['priority'], string> = {
  high: '🔴',
  medium: '🟡',
  low: '🟢',
};

export default function Recommendations({ recommendations, tr }: Props) {
  const priorityLabel = (p: Rec['priority']) => {
    if (p === 'high') return tr.rec_high;
    if (p === 'medium') return tr.rec_medium;
    return tr.rec_low;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {recommendations.map((rec, i) => (
        <div
          key={i}
          className="card"
          style={{ padding: '16px 20px', animationDelay: `${i * 80}ms` }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
            <span style={{ fontSize: 16, flexShrink: 0, marginTop: 1 }}>{PRIORITY_ICON[rec.priority]}</span>
            <div style={{ flex: 1 }}>
              <span className={PRIORITY_LABEL[rec.priority]} style={{ marginBottom: 6, display: 'inline-block' }}>
                {priorityLabel(rec.priority)}
              </span>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: 4 }}>
                {rec.text}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
