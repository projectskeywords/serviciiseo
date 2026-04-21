import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { t, type Lang } from '@/translations';
import AnalyzerForm from '@/components/AnalyzerForm';

const LANGS: Lang[] = ['ro', 'ru', 'en'];

export async function generateStaticParams() {
  return LANGS.map(lang => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) return {};
  const tr = t(lang as Lang);
  const titles: Record<Lang, string> = {
    ro: 'StrategyProbe — Analiza Concurenților Online Gratuit',
    ru: 'StrategyProbe — Бесплатный Анализ Конкурентов Онлайн',
    en: 'StrategyProbe — Free Competitor Analysis Online',
  };
  return {
    title: titles[lang as Lang],
    description: tr.hero_subtitle,
    alternates: { canonical: `/${lang}`, languages: { ro: '/ro', ru: '/ru', en: '/en' } },
  };
}

/* ─── Static data ─────────────────────────────────────────── */

const FEATURES: Record<Lang, { icon: string; title: string; desc: string }[]> = {
  ro: [
    { icon: '⚡', title: 'Analiză în timp real', desc: 'Algoritmul StrategyProbe colectează date actualizate direct de pe site-ul tău. Niciun cache, niciun compromis.' },
    { icon: '🎯', title: 'Concurenți relevanți', desc: 'Identificăm automat competitorii din nișa ta și îi comparăm direct cu site-ul tău.' },
    { icon: '📊', title: '10+ metrici esențiale', desc: 'Performanță, SEO, Accesibilitate, SSL, securitate, viteza serverului — tot ce contează pentru Google.' },
    { icon: '🗺️', title: 'Plan de acțiune', desc: 'Primești recomandări concrete, prioritizate, pe care le poți implementa imediat.' },
    { icon: '📱', title: 'Focus pe mobile', desc: 'Analiza se face pe versiunea mobilă, care contează cel mai mult pentru Google Rankings.' },
    { icon: '🔒', title: '100% gratuit', desc: 'Fără carduri, fără cont. Trei analize complete pe zi, gratuit, fără trucuri.' },
  ],
  ru: [
    { icon: '⚡', title: 'Анализ в реальном времени', desc: 'Алгоритм StrategyProbe собирает актуальные данные прямо с вашего сайта. Никакого кеша, никаких компромиссов.' },
    { icon: '🎯', title: 'Релевантные конкуренты', desc: 'Автоматически определяем конкурентов в вашей нише и сравниваем их с вашим сайтом.' },
    { icon: '📊', title: '10+ ключевых метрик', desc: 'Производительность, SEO, доступность, SSL, безопасность, скорость сервера — всё, что важно для Google.' },
    { icon: '🗺️', title: 'План действий', desc: 'Конкретные приоритизированные рекомендации, которые можно внедрить немедленно.' },
    { icon: '📱', title: 'Фокус на мобильных', desc: 'Анализ выполняется для мобильной версии — наиболее важной для Google Rankings.' },
    { icon: '🔒', title: '100% бесплатно', desc: 'Без карт, без аккаунта. Три полных анализа в день, бесплатно.' },
  ],
  en: [
    { icon: '⚡', title: 'Real-time analysis', desc: "The StrategyProbe algorithm collects live data directly from your site. No cache, no shortcuts." },
    { icon: '🎯', title: 'Relevant competitors', desc: 'We automatically identify competitors in your niche and compare them to your site.' },
    { icon: '📊', title: '10+ essential metrics', desc: 'Performance, SEO, Accessibility, SSL, security, server speed — everything that matters for Google.' },
    { icon: '🗺️', title: 'Action plan', desc: 'Concrete, prioritized recommendations you can implement immediately.' },
    { icon: '📱', title: 'Mobile-first', desc: 'Analysis runs on the mobile version, which matters most for Google Rankings.' },
    { icon: '🔒', title: '100% free', desc: 'No cards, no account. Three full analyses per day, free, no tricks.' },
  ],
};

const STEPS: Record<Lang, { n: string; title: string; desc: string }[]> = {
  ro: [
    { n: '01', title: 'Introdu site-ul tău', desc: 'Adaugă URL-ul, emailul și domeniul de activitate. Durează 30 de secunde.' },
    { n: '02', title: 'Analizăm automat', desc: 'Algoritmul nostru verifică performanța, SEO-ul, SSL-ul, securitatea și structura site-ului tău și a principalilor concurenți.' },
    { n: '03', title: 'Primești raportul', desc: 'Scor comparat, clasament, detalii tehnice și plan de acțiune personalizat — în câteva secunde.' },
  ],
  ru: [
    { n: '01', title: 'Введите адрес сайта', desc: 'Добавьте URL, email и сферу деятельности. Займёт 30 секунд.' },
    { n: '02', title: 'Автоматический анализ', desc: 'Наш алгоритм проверяет производительность, SEO, SSL, безопасность и структуру вашего сайта и основных конкурентов.' },
    { n: '03', title: 'Получите отчёт', desc: 'Сравнительный балл, рейтинг, технические детали и план действий — за секунды.' },
  ],
  en: [
    { n: '01', title: 'Enter your website', desc: 'Add your URL, email and business category. Takes 30 seconds.' },
    { n: '02', title: 'We analyze automatically', desc: 'Our algorithm checks performance, SEO, SSL, security and site structure — for your site and top niche competitors.' },
    { n: '03', title: 'Get your report', desc: 'Comparative score, ranking, technical details and personalized action plan — in seconds.' },
  ],
};

const FAQ: Record<Lang, { q: string; a: string }[]> = {
  ro: [
    { q: 'Cum funcționează analiza concurenților?', a: 'Algoritmul StrategyProbe analizează site-ul tău și 3–4 concurenți relevanți din nișa ta. Evaluăm performanța, SEO, accesibilitatea, SSL-ul, securitatea, viteza serverului, structura paginii și vizibilitatea contactului, apoi te plasăm în clasament.' },
    { q: 'Ce date sunt analizate?', a: 'Analizăm peste 15 factori: viteză de încărcare, scor SEO, accesibilitate, certificate SSL, header-e de securitate (CSP, HSTS), meta tags, H1, schema JSON-LD, sitemap.xml, robots.txt, timp de răspuns server, viewport mobil și informații de contact.' },
    { q: 'Ce înseamnă scorul de performanță?', a: 'Scorul de performanță (0–100) reflectă cât de rapid se încarcă site-ul pe dispozitive mobile. Un scor peste 75 este considerat bun de Google, sub 50 necesită îmbunătățiri urgente. Afectează direct poziția în căutările Google.' },
    { q: 'Cât de des pot folosi StrategyProbe?', a: 'Poți efectua 3 analize complete pe zi, gratuit, de pe același dispozitiv. Dacă ai nevoie de mai multe analize sau un raport detaliat, contactează echipa keywords.md.' },
    { q: 'Ce sunt Core Web Vitals?', a: 'Core Web Vitals sunt metrici care măsoară experiența utilizatorului: FCP (First Contentful Paint) — primul conținut, LCP (Largest Contentful Paint) — elementul principal, TBT (Total Blocking Time) — timpul de blocare al thread-ului principal. Afectează direct pozițiile în Google.' },
    { q: 'Analiza afectează site-ul meu?', a: 'Nu. StrategyProbe face doar cereri de citire publică a site-ului tău (ca orice vizitator obișnuit). Nu accesează datele tale private și nu modifică nimic pe site.' },
  ],
  ru: [
    { q: 'Как работает анализ конкурентов?', a: 'Алгоритм StrategyProbe анализирует ваш сайт и 3–4 конкурентов в нише. Оцениваем производительность, SEO, доступность, SSL, безопасность, скорость сервера, структуру страницы и видимость контактов.' },
    { q: 'Какие данные анализируются?', a: 'Более 15 факторов: скорость загрузки, SEO, доступность, SSL-сертификат, заголовки безопасности (CSP, HSTS), meta tags, H1, JSON-LD schema, sitemap.xml, robots.txt, TTFB, мобильный viewport и контактная информация.' },
    { q: 'Что означает балл производительности?', a: 'Балл производительности (0–100) отражает скорость загрузки сайта на мобильных устройствах. Выше 75 — хорошо по меркам Google, ниже 50 — требует срочных улучшений.' },
    { q: 'Как часто можно использовать StrategyProbe?', a: 'Вы можете проводить 3 полных анализа в день бесплатно с одного устройства. Для большего числа анализов свяжитесь с командой keywords.md.' },
    { q: 'Что такое Core Web Vitals?', a: 'Core Web Vitals — метрики пользовательского опыта: FCP (первый контент), LCP (основной элемент), TBT (блокирующее время). Напрямую влияют на позиции в Google.' },
    { q: 'Анализ влияет на мой сайт?', a: 'Нет. StrategyProbe делает только публичные запросы на чтение (как обычный посетитель). Никаких изменений на вашем сайте не происходит.' },
  ],
  en: [
    { q: 'How does competitor analysis work?', a: 'The StrategyProbe algorithm analyzes your site and 3–4 relevant competitors in your niche. We evaluate performance, SEO, accessibility, SSL, security, server speed, page structure and contact visibility.' },
    { q: 'What data is analyzed?', a: '15+ factors: page load speed, SEO score, accessibility, SSL certificate, security headers (CSP, HSTS), meta tags, H1, JSON-LD schema, sitemap.xml, robots.txt, TTFB, mobile viewport and contact information.' },
    { q: 'What does the performance score mean?', a: 'The performance score (0–100) reflects how fast your site loads on mobile. Above 75 is considered good by Google, below 50 needs urgent improvements. Directly affects your Google rankings.' },
    { q: 'How often can I use StrategyProbe?', a: 'You can run 3 full analyses per day for free from the same device. For more analyses or a detailed report, contact the keywords.md team.' },
    { q: 'What are Core Web Vitals?', a: 'Core Web Vitals are metrics measuring user experience: FCP (First Contentful Paint), LCP (Largest Contentful Paint), and TBT (Total Blocking Time). They directly affect Google search rankings.' },
    { q: 'Does the analysis affect my site?', a: "No. StrategyProbe only makes public read requests (like any regular visitor). It makes no changes to your site's data or content." },
  ],
};

const STATS: Record<Lang, { value: string; label: string }[]> = {
  ro: [
    { value: '94%', label: 'din site-uri au scoruri SEO sub 80' },
    { value: '3s', label: 'limita Google pentru LCP pe mobile' },
    { value: '53%', label: 'utilizatori abandonează site-urile lente' },
    { value: '3×', label: 'mai mult trafic pentru site-urile optimizate' },
  ],
  ru: [
    { value: '94%', label: 'сайтов имеют SEO-балл ниже 80' },
    { value: '3s', label: 'лимит Google для LCP на мобильных' },
    { value: '53%', label: 'пользователей покидают медленные сайты' },
    { value: '3×', label: 'больше трафика у оптимизированных сайтов' },
  ],
  en: [
    { value: '94%', label: 'of sites have SEO scores below 80' },
    { value: '3s', label: "Google's LCP limit for mobile" },
    { value: '53%', label: 'of users abandon slow-loading sites' },
    { value: '3×', label: 'more traffic for optimized sites' },
  ],
};

const LABELS: Record<Lang, Record<string, string>> = {
  ro: { features: 'De ce StrategyProbe?', howItWorks: 'Cum funcționează?', faq: 'Întrebări frecvente', trustLine: 'Gratuit · Fără cont · 3 analize/zi', simpleAndFast: 'SIMPLU ȘI RAPID', featuresTag: 'FUNCȚIONALITĂȚI', faqTag: 'FAQ' },
  ru: { features: 'Почему StrategyProbe?', howItWorks: 'Как это работает?', faq: 'Часто задаваемые вопросы', trustLine: 'Бесплатно · Без аккаунта · 3 анализа/день', simpleAndFast: 'ПРОСТО И БЫСТРО', featuresTag: 'ВОЗМОЖНОСТИ', faqTag: 'FAQ' },
  en: { features: 'Why StrategyProbe?', howItWorks: 'How does it work?', faq: 'Frequently Asked Questions', trustLine: 'Free · No account · 3 analyses/day', simpleAndFast: 'SIMPLE & FAST', featuresTag: 'FEATURES', faqTag: 'FAQ' },
};

/* ─── Component ───────────────────────────────────────────── */

export default async function LangPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!LANGS.includes(lang as Lang)) notFound();
  const currentLang = lang as Lang;
  const tr = t(currentLang);
  const features = FEATURES[currentLang];
  const steps = STEPS[currentLang];
  const faq = FAQ[currentLang];
  const stats = STATS[currentLang];
  const labels = LABELS[currentLang];

  /* shared inline style tokens */
  const C = {
    accent: '#5B4FE8',
    accentHover: '#4A3FD4',
    accentLight: '#EEF0FF',
    textPrimary: '#0F0E1A',
    textSecondary: '#5C5980',
    textTertiary: '#9B99B8',
    border: '#E8E7F5',
    bgSecondary: '#F8F7FF',
    bgTertiary: '#F0EFF8',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    darkBg: '#0F0E1A',
    darkBg2: '#1A1830',
  } as const;

  return (
    <div style={{ background: '#fff', fontFamily: "var(--font-body, 'Space Grotesk', system-ui, sans-serif)", color: C.textPrimary }}>
      {/* Mobile-responsive overrides — inline styles can't do media queries */}
      <style>{`
        @media (max-width: 640px) {
          .sp-hero { padding: 56px 16px 72px !important; }
          .sp-hero-form { padding: 24px 18px !important; }
          .sp-stats-grid { display: flex !important; flex-direction: column !important; }
          .sp-stats-item { border-right: none !important; border-bottom: 1px solid var(--border, #E8E7F5) !important; }
          .sp-stats-item:last-child { border-bottom: none !important; }
          .sp-faq-item { padding: 18px 20px !important; }
          .sp-footer-row { flex-direction: column !important; align-items: flex-start !important; }
          .sp-section-pad { padding: 56px 16px !important; }
          .sp-header-inner { padding: 0 14px !important; }
        }
      `}</style>

      {/* ── HEADER ─────────────────────────────────────────── */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: 'rgba(15,14,26,0.93)', backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div className="sp-header-inner" style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px', height: 62, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <a href={`/${currentLang}`} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.25" stroke="#fff" strokeWidth="1.5"/><path d="M9 6.5v2.75l1.75 1.75" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </div>
            <span style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)", fontSize: 19, color: '#fff', fontWeight: 700, letterSpacing: '-0.01em' }}>StrategyProbe</span>
          </a>
          <nav style={{ display: 'flex', gap: 4 }}>
            {LANGS.map(l => (
              <a key={l} href={`/${l}`} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 13, fontWeight: 600,
                textDecoration: 'none', transition: 'all 0.15s',
                color: l === currentLang ? '#fff' : 'rgba(255,255,255,0.4)',
                background: l === currentLang ? 'rgba(91,79,232,0.5)' : 'transparent',
                border: `1px solid ${l === currentLang ? 'rgba(91,79,232,0.55)' : 'transparent'}`,
              }}>
                {l.toUpperCase()}
              </a>
            ))}
          </nav>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="sp-hero" style={{
        background: 'linear-gradient(135deg, #0F0E1A 0%, #1E1B4B 55%, #312E81 100%)',
        padding: '80px 24px 100px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* decorative orbs */}
        <div style={{ position: 'absolute', top: -160, right: -80, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,79,232,0.22) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -60, width: 360, height: 360, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,107,107,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          {/* pill badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(91,79,232,0.18)', border: '1px solid rgba(91,79,232,0.38)', borderRadius: 99, padding: '6px 16px', marginBottom: 28 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#818CF8', display: 'inline-block', flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: '#C4C7FF', fontWeight: 500, letterSpacing: '0.02em' }}>
              {currentLang === 'ru' ? 'Алгоритм анализа StrategyProbe' : currentLang === 'en' ? 'StrategyProbe Analysis Algorithm' : 'Algoritmul de analiză StrategyProbe'}
            </span>
          </div>

          <h1 style={{ fontFamily: "var(--font-display, 'Fraunces', Georgia, serif)", fontSize: 'clamp(2.1rem, 5.5vw, 3.5rem)', lineHeight: 1.1, color: '#ffffff', fontWeight: 700, marginBottom: 18, letterSpacing: '-0.025em' }}>
            {tr.hero_title}
          </h1>
          <p style={{ fontSize: 17, color: 'rgba(255,255,255,0.62)', lineHeight: 1.7, maxWidth: 500, margin: '0 auto 44px' }}>
            {tr.hero_subtitle}
          </p>

          {/* Form card */}
          <div className="sp-hero-form" style={{ background: '#ffffff', border: `1px solid ${C.border}`, borderRadius: 16, padding: '32px 28px', maxWidth: 540, margin: '0 auto', boxShadow: '0 8px 40px rgba(0,0,0,0.3)', textAlign: 'left' }}>
            <AnalyzerForm lang={currentLang} tr={tr} />
          </div>

          <p style={{ marginTop: 18, fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>✓ {labels.trustLine}</p>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────── */}
      <section style={{ background: C.bgSecondary, borderBottom: `1px solid ${C.border}`, padding: '48px 24px' }}>
        <div className="sp-stats-grid" style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          {stats.map((s, i) => (
            <div key={i} className="sp-stats-item" style={{ padding: '20px 24px', textAlign: 'center', borderRight: i < stats.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ fontFamily: "var(--font-display, serif)", fontSize: 38, fontWeight: 700, color: C.accent, marginBottom: 6, letterSpacing: '-0.02em' }}>{s.value}</div>
              <div style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.5 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section className="sp-section-pad" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{labels.simpleAndFast}</p>
            <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>{labels.howItWorks}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24 }}>
            {steps.map((step, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '28px 24px', boxShadow: '0 1px 4px rgba(15,14,26,0.05)', transition: 'box-shadow 0.2s, transform 0.2s', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ color: '#fff', fontSize: 14, fontWeight: 800 }}>{step.n}</span>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.textTertiary, letterSpacing: '0.07em', textTransform: 'uppercase' }}>
                    {currentLang === 'ro' ? `Pasul ${i + 1}` : currentLang === 'ru' ? `Шаг ${i + 1}` : `Step ${i + 1}`}
                  </span>
                </div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: C.textPrimary }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section className="sp-section-pad" style={{ padding: '80px 24px', background: C.bgSecondary }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{labels.featuresTag}</p>
            <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>{labels.features}</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px 22px', boxShadow: '0 1px 4px rgba(15,14,26,0.05)', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ fontSize: 26, flexShrink: 0, marginTop: 2, lineHeight: 1 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 6 }}>{f.title}</h3>
                  <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.65 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────── */}
      <section className="sp-section-pad" style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>{labels.faqTag}</p>
            <h2 style={{ fontFamily: "var(--font-display, serif)", fontSize: 'clamp(1.8rem, 3vw, 2.5rem)', fontWeight: 700, color: C.textPrimary, letterSpacing: '-0.02em' }}>{labels.faq}</h2>
          </div>
          <div style={{ background: '#fff', border: `1px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(15,14,26,0.05)' }}>
            {faq.map((item, i) => (
              <div key={i} className="sp-faq-item" style={{ padding: '22px 28px', borderBottom: i < faq.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 8, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span style={{ color: C.accent, fontSize: 16, flexShrink: 0, marginTop: 1 }}>↗</span>
                  {item.q}
                </h3>
                <p style={{ fontSize: 14, color: C.textSecondary, lineHeight: 1.75, paddingLeft: 26 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={{ background: '#0F0E1A', padding: '52px 24px 32px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div className="sp-footer-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 32, marginBottom: 40 }}>
            <div style={{ maxWidth: 340 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: C.accent, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="14" height="14" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="6.25" stroke="#fff" strokeWidth="1.5"/><path d="M9 6.5v2.75l1.75 1.75" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontFamily: "var(--font-display, serif)", fontSize: 17, color: '#fff', fontWeight: 700 }}>StrategyProbe</span>
              </div>
              <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>{tr.footer_disclaimer}</p>
            </div>
            <div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>{tr.footer_built}</p>
              <a href="https://keywords.md" target="_blank" rel="noopener" style={{ color: '#818CF8', textDecoration: 'none', fontSize: 16, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                keywords.md
                <svg width="12" height="12" viewBox="0 0 13 13" fill="none"><path d="M2 11 11 2M11 2H5M11 2v6" stroke="#818CF8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            </div>
          </div>
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.22)' }}>© 2025 StrategyProbe</p>
            <div style={{ display: 'flex', gap: 20 }}>
              {LANGS.map(l => (
                <a key={l} href={`/${l}`} style={{ fontSize: 13, color: l === currentLang ? 'rgba(255,255,255,0.65)' : 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>
                  {l === 'ro' ? 'Română' : l === 'ru' ? 'Русский' : 'English'}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
