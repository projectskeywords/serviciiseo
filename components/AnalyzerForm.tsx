'use client';

import { useState } from 'react';
import type { Lang, T } from '@/translations';
import LoadingSteps from './LoadingSteps';
import ResultsDashboard from './ResultsDashboard';
import RateLimitMessage from './RateLimitMessage';

interface Props { lang: Lang; tr: T; }
interface FormErrors { website_url?: string; email?: string; category?: string; }

const C = {
  accent: '#5B4FE8', border: '#E8E7F5', textPrimary: '#0F0E1A',
  textSecondary: '#5C5980', textTertiary: '#9B99B8', danger: '#EF4444',
  bgSecondary: '#F8F7FF',
} as const;

export default function AnalyzerForm({ lang, tr }: Props) {
  const [url, setUrl] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<null | Record<string, unknown>>(null);
  const [rateLimited, setRateLimited] = useState(false);

  function validate(): boolean {
    const e: FormErrors = {};
    if (!/^(https?:\/\/)?[\w-]+(\.[\w-]+)+/.test(url.trim())) e.website_url = tr.error_url;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = tr.error_email;
    if (!category.trim()) e.category = tr.error_category;
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true); setStep(1); setResult(null); setRateLimited(false);
    [1400, 4000, 8000].forEach((d, i) => setTimeout(() => setStep(i + 2), d));
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website_url: url.trim(), email: email.trim(), category: category.trim(), language: lang }),
      });
      if (res.status === 429) { setRateLimited(true); return; }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Analysis failed');
      setResult(data);
    } catch (err) {
      setErrors({ website_url: err instanceof Error ? err.message : 'Eroare. Încearcă din nou.' });
    } finally {
      setLoading(false); setStep(0);
    }
  }

  if (rateLimited) return <RateLimitMessage tr={tr} lang={lang} />;
  if (result) return <ResultsDashboard data={result} lang={lang} tr={tr} onReset={() => setResult(null)} />;
  if (loading) return <LoadingSteps steps={[tr.analyzing_step1, tr.analyzing_step2, tr.analyzing_step3, tr.analyzing_step4]} currentStep={step} />;

  const inputStyle = (hasError: boolean) => ({
    width: '100%', border: `1.5px solid ${hasError ? C.danger : C.border}`, borderRadius: 10,
    padding: '12px 14px', fontSize: 15, fontFamily: 'inherit', color: C.textPrimary,
    background: '#fff', outline: 'none', transition: 'border-color 0.15s, box-shadow 0.15s',
  });

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {[
        { label: tr.input_website, placeholder: tr.input_website_placeholder, value: url, set: setUrl, err: errors.website_url, type: 'text', auto: 'url' },
        { label: tr.input_email, placeholder: tr.input_email_placeholder, value: email, set: setEmail, err: errors.email, type: 'email', auto: 'email' },
        { label: tr.input_category, placeholder: tr.input_category_placeholder, value: category, set: setCategory, err: errors.category, type: 'text', auto: 'off' },
      ].map(field => (
        <div key={field.label}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: C.textPrimary, marginBottom: 6, letterSpacing: '0.01em' }}>
            {field.label}
          </label>
          <input
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            autoComplete={field.auto}
            onChange={e => field.set(e.target.value)}
            style={inputStyle(!!field.err)}
            onFocus={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(91,79,232,0.12)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = field.err ? C.danger : C.border; e.currentTarget.style.boxShadow = 'none'; }}
          />
          {field.err && <p style={{ color: C.danger, fontSize: 12, marginTop: 5, fontWeight: 500 }}>{field.err}</p>}
        </div>
      ))}
      <button
        type="submit"
        style={{
          marginTop: 4, width: '100%', padding: '14px 24px', fontSize: 15, fontWeight: 700,
          background: C.accent, color: '#fff', border: 'none', borderRadius: 10,
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: 8, fontFamily: 'inherit', transition: 'background 0.15s',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = '#4A3FD4')}
        onMouseLeave={e => (e.currentTarget.style.background = C.accent)}
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
        </svg>
        {tr.btn_analyze}
      </button>
    </form>
  );
}
