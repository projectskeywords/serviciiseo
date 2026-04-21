'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import StatsCards from '@/components/admin/StatsCards';
import LeadsTable from '@/components/admin/LeadsTable';
import Filters from '@/components/admin/Filters';
import ExportButtons from '@/components/admin/ExportButtons';

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, today: 0, avgScore: 0, completionRate: 0 });
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [filters, setFilters] = useState({ from: '', to: '', lang: '', status: '', search: '' });
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/admin/stats');
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setStats(data);
  }, [router]);

  const fetchLeads = useCallback(async (p: number) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p) });
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    if (filters.lang) params.set('lang', filters.lang);
    if (filters.status) params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);

    const res = await fetch(`/api/admin/leads?${params}`);
    if (res.status === 401) { router.push('/admin'); return; }
    const data = await res.json();
    setLeads(data.leads);
    setTotal(data.total);
    setPages(data.pages);
    setLoading(false);
  }, [filters, router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { setPage(1); fetchLeads(1); }, [filters]);
  useEffect(() => { fetchLeads(page); }, [page]);

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin');
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
      {/* Header */}
      <header style={{ background: 'var(--bg-primary)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ fontFamily: 'var(--font-instrument-serif, serif)', fontSize: 20, color: 'var(--text-primary)' }}>
          🔑 keywords.md <span style={{ fontSize: 14, color: 'var(--text-secondary)', fontFamily: 'inherit' }}>Admin Panel</span>
        </div>
        <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: 13, padding: '6px 14px' }}>
          Deconectare →
        </button>
      </header>

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
        <StatsCards stats={stats} />

        <div className="card" style={{ padding: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' }}>Analize</h2>
            <ExportButtons />
          </div>

          <Filters filters={filters} onChange={f => { setFilters(f); }} />

          {loading
            ? <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Se încarcă...</div>
            : <LeadsTable leads={leads} total={total} page={page} pages={pages} onPageChange={setPage} />
          }
        </div>
      </main>
    </div>
  );
}
