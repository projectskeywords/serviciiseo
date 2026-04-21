'use client';

export default function ExportButtons() {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <a href="/api/admin/export?format=xlsx" className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>
        📥 Excel
      </a>
      <a href="/api/admin/export?format=csv" className="btn-secondary" style={{ fontSize: 13, padding: '8px 14px' }}>
        📥 CSV
      </a>
    </div>
  );
}
