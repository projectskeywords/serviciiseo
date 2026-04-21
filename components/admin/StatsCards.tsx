'use client';

interface Stats {
  total: number;
  today: number;
  avgScore: number;
  completionRate: number;
}

interface Props { stats: Stats }

export default function StatsCards({ stats }: Props) {
  const cards = [
    { label: 'Total analize', value: stats.total, icon: '📊' },
    { label: 'Azi', value: stats.today, icon: '📅' },
    { label: 'Scor mediu', value: stats.avgScore, icon: '⭐' },
    { label: 'Completate %', value: `${stats.completionRate}%`, icon: '✅' },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 24 }}>
      {cards.map(c => (
        <div key={c.label} className="card" style={{ padding: '20px 24px' }}>
          <div style={{ fontSize: 22, marginBottom: 8 }}>{c.icon}</div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1 }}>{c.value}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>{c.label}</div>
        </div>
      ))}
    </div>
  );
}
