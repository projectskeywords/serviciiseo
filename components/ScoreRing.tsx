'use client';

import { useEffect, useState } from 'react';

interface Props {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
}

function scoreColor(s: number): string {
  if (s >= 75) return 'var(--success)';
  if (s >= 50) return 'var(--warning)';
  return 'var(--danger)';
}

export default function ScoreRing({ score, size = 100, strokeWidth = 9, label }: Props) {
  const [displayed, setDisplayed] = useState(0);
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const fill = (displayed / 100) * circ;

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(score), 150);
    return () => clearTimeout(timer);
  }, [score]);

  const color = scoreColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--bg-tertiary)" strokeWidth={strokeWidth} />
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${fill} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 1s cubic-bezier(.4,0,.2,1)' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: size > 80 ? 26 : 18, fontWeight: 800, color, fontFamily: 'var(--font-body)', letterSpacing: '-0.02em' }}>
            {displayed}
          </span>
        </div>
      </div>
      {label && <span style={{ fontSize: 12, color: 'var(--text-secondary)', textAlign: 'center', maxWidth: size, lineHeight: 1.3 }}>{label}</span>}
    </div>
  );
}
