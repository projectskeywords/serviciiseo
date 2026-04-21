'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginClient() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        setError('Parolă incorectă. Încearcă din nou.');
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('Eroare de conexiune.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div className="card fade-up" style={{ width: '100%', maxWidth: 380, padding: 40 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontFamily: 'var(--font-instrument-serif, serif)', fontSize: 24, color: 'var(--text-primary)', marginBottom: 6 }}>
            keywords.md
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)' }}>Admin Panel</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 6 }}>
              Parolă admin
            </label>
            <input
              className="input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p style={{ color: 'var(--danger)', fontSize: 13 }}>{error}</p>}
          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ justifyContent: 'center', padding: '12px 24px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Se conectează...' : 'Intră în admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
