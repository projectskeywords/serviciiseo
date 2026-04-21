import type { SiteCheckResult } from './sitecheck';

type Lang = 'ro' | 'ru' | 'en';
type Priority = 'high' | 'medium' | 'low';

export interface Recommendation {
  priority: Priority;
  text: string;
}

/* ─── Recommendation texts ─────────────────────────────────── */

const RECS: Record<string, Record<Lang, string>> = {
  // PageSpeed
  perf_critical: {
    ro: '🚀 Performanță critică: convertește imaginile în WebP, activează cache-ul browser-ului și minifică JavaScript + CSS. Impactul cel mai mare asupra vitezei.',
    ru: '🚀 Критическая производительность: конвертируйте изображения в WebP, включите кеширование браузера и минифицируйте JS + CSS.',
    en: '🚀 Critical performance: convert images to WebP, enable browser caching, and minify JavaScript + CSS. Biggest impact on speed.',
  },
  perf_medium: {
    ro: '🖼️ Comprimă imaginile înainte de upload și consideră un CDN pentru fișierele statice. Poate reduce timpul de încărcare cu 30–50%.',
    ru: '🖼️ Сжимайте изображения перед загрузкой и рассмотрите CDN для статических файлов.',
    en: '🖼️ Compress images before uploading and consider a CDN for static files. Can reduce load time by 30–50%.',
  },
  seo_critical: {
    ro: '📋 SEO critic: adaugă meta title și meta description unice pe fiecare pagină și creează un sitemap.xml. Esențial pentru indexarea Google.',
    ru: '📋 Критический SEO: добавьте уникальные meta title и description на каждую страницу, создайте sitemap.xml.',
    en: '📋 Critical SEO: add unique meta title and description to each page, and create a sitemap.xml. Essential for Google indexing.',
  },
  seo_medium: {
    ro: '🔗 Îmbunătățește structura headings (H1→H2), adaugă schema markup JSON-LD pentru afacerea ta locală și optimizează URL-urile.',
    ru: '🔗 Улучшите структуру заголовков (H1→H2), добавьте JSON-LD schema для бизнеса и оптимизируйте URL.',
    en: '🔗 Improve heading structure (H1→H2), add JSON-LD schema markup for your local business, and optimize URL structure.',
  },
  acc_critical: {
    ro: '♿ Accesibilitate slabă: adaugă atribute alt la imagini, mărește contrastul textului și adaugă etichete la câmpurile de formular.',
    ru: '♿ Плохая доступность: добавьте атрибуты alt, увеличьте контрастность текста и добавьте метки полей форм.',
    en: '♿ Poor accessibility: add alt attributes to images, increase text contrast ratio, and add labels to form fields.',
  },
  bp_medium: {
    ro: '🛡️ Bune practici: asigură-te că site-ul rulează pe HTTPS, elimină librăriile JavaScript vulnerabile și rezolvă erorile din consolă.',
    ru: '🛡️ Лучшие практики: убедитесь в HTTPS, удалите уязвимые JS-библиотеки и исправьте ошибки консоли.',
    en: '🛡️ Best practices: ensure HTTPS, remove vulnerable JavaScript libraries, and fix console errors.',
  },
  rank_low: {
    ro: '📈 Ești în a doua jumătate a clasamentului. Rezolvând problemele de mai sus poți urca rapid în topul concurenților.',
    ru: '📈 Вы во второй половине рейтинга. Устранив проблемы выше, вы можете быстро подняться.',
    en: '📈 You are in the bottom half of the rankings. Fixing the issues above can quickly move you up.',
  },
  all_good: {
    ro: '✅ Scor excelent! Site-ul tău este bine optimizat. Monitorizează periodic performanța și continuă să publici conținut relevant.',
    ru: '✅ Отличный балл! Ваш сайт хорошо оптимизирован. Периодически следите за производительностью.',
    en: '✅ Excellent score! Your site is well optimized. Monitor performance periodically and keep publishing relevant content.',
  },

  // SSL / HTTPS
  no_ssl: {
    ro: '🔓 Site-ul nu are SSL/HTTPS activ. Google penalizează site-urile fără certificat SSL și vizitatorii văd un avertisment "Nesecurizat". Instalează Let\'s Encrypt (gratuit) imediat.',
    ru: '🔓 Сайт не имеет SSL/HTTPS. Google штрафует такие сайты и пользователи видят предупреждение «Небезопасно». Установите Let\'s Encrypt (бесплатно).',
    en: '🔓 No SSL/HTTPS active. Google penalizes sites without SSL and visitors see a "Not Secure" warning. Install Let\'s Encrypt (free) immediately.',
  },
  no_https_redirect: {
    ro: '↩️ HTTP nu redirecționează automat la HTTPS. Configurează un redirect 301 permanent: orice vizitator pe http:// trebuie trimis automat la https://',
    ru: '↩️ HTTP не перенаправляет на HTTPS автоматически. Настройте постоянный редирект 301: http:// → https://',
    en: '↩️ HTTP does not redirect to HTTPS. Set up a permanent 301 redirect: all http:// visitors should go to https://',
  },

  // Security headers
  no_security_headers: {
    ro: '🛡️ Lipsesc header-e de securitate importante (HSTS, CSP, X-Frame-Options). Acestea protejează împotriva atacurilor XSS și clickjacking. Adaugă-le în configurația serverului sau Vercel/Netlify headers.',
    ru: '🛡️ Отсутствуют важные заголовки безопасности (HSTS, CSP, X-Frame-Options). Они защищают от XSS и clickjacking. Добавьте их в конфигурацию сервера.',
    en: '🛡️ Missing important security headers (HSTS, CSP, X-Frame-Options). These protect against XSS and clickjacking attacks. Add them in your server or Vercel/Netlify headers config.',
  },
  no_hsts: {
    ro: '🔒 Lipsește HSTS (Strict-Transport-Security). Adaugă header-ul pentru a forța browserele să folosească exclusiv HTTPS pe site-ul tău.',
    ru: '🔒 Отсутствует HSTS (Strict-Transport-Security). Добавьте заголовок, чтобы браузеры использовали только HTTPS.',
    en: '🔒 Missing HSTS (Strict-Transport-Security). Add this header to force browsers to use HTTPS only on your site.',
  },

  // SEO on-page
  no_title: {
    ro: '📝 Lipsește tag-ul <title> pe pagina principală. Titlul paginii este cel mai important factor SEO on-page — apare în tab-ul browserului și în rezultatele Google.',
    ru: '📝 Отсутствует тег <title> на главной странице. Это важнейший SEO-фактор — он отображается в вкладке браузера и в результатах Google.',
    en: '📝 Missing <title> tag on the homepage. Page title is the most important on-page SEO factor — it appears in the browser tab and Google results.',
  },
  no_meta_desc: {
    ro: '📄 Lipsește meta description. Fără aceasta, Google generează automat un text aleatoriu în rezultate. Adaugă 150–160 caractere care descriu clar serviciul tău.',
    ru: '📄 Отсутствует meta description. Без неё Google генерирует случайный текст в результатах. Добавьте 150–160 символов с описанием вашего сервиса.',
    en: '📄 Missing meta description. Without it, Google auto-generates random text in search results. Add 150–160 characters describing your service clearly.',
  },
  no_h1: {
    ro: '📌 Lipsește heading-ul H1 pe pagina principală. H1 spune Google despre ce este pagina. Adaugă un H1 clar cu cuvântul cheie principal al afacerii tale.',
    ru: '📌 Отсутствует заголовок H1 на главной странице. H1 сообщает Google о чём страница. Добавьте чёткий H1 с основным ключевым словом.',
    en: '📌 Missing H1 heading on the homepage. H1 tells Google what the page is about. Add a clear H1 with your main business keyword.',
  },
  no_og_image: {
    ro: '🖼️ Lipsește og:image (Open Graph Image). Când cineva distribuie site-ul pe Facebook sau WhatsApp, nu apare nicio imagine. Adaugă o imagine reprezentativă de 1200×630px.',
    ru: '🖼️ Отсутствует og:image (Open Graph Image). При репосте в Facebook или WhatsApp не будет изображения. Добавьте изображение 1200×630px.',
    en: '🖼️ Missing og:image (Open Graph Image). When sharing on Facebook or WhatsApp, no image appears. Add a representative 1200×630px image.',
  },
  no_jsonld: {
    ro: '📊 Lipsește schema JSON-LD. Markup-ul structurat ajută Google să afișeze informații extra (stele, adresă, ore de funcționare) direct în rezultatele de căutare.',
    ru: '📊 Отсутствует JSON-LD schema. Структурированная разметка помогает Google показывать дополнительную информацию (звёзды, адрес, часы) прямо в результатах поиска.',
    en: '📊 Missing JSON-LD schema. Structured markup helps Google display extra info (stars, address, hours) directly in search results.',
  },

  // Technical
  no_sitemap: {
    ro: '🗺️ Lipsește sitemap.xml. Fără sitemap, Google poate rata pagini importante ale site-ului tău. Creează un sitemap și trimite-l în Google Search Console.',
    ru: '🗺️ Отсутствует sitemap.xml. Без него Google может пропустить важные страницы. Создайте sitemap и отправьте в Google Search Console.',
    en: '🗺️ Missing sitemap.xml. Without it, Google may miss important pages on your site. Create a sitemap and submit it in Google Search Console.',
  },
  no_robots: {
    ro: '🤖 Lipsește robots.txt. Deși nu e critic, robots.txt ajută motoarele de căutare să înțeleagă ce pagini pot indexa. Adaugă un fișier robots.txt de bază.',
    ru: '🤖 Отсутствует robots.txt. Хотя это не критично, он помогает поисковым системам понять, что индексировать. Добавьте базовый robots.txt.',
    en: '🤖 Missing robots.txt. While not critical, robots.txt helps search engines understand which pages to index. Add a basic robots.txt file.',
  },
  no_viewport: {
    ro: '📱 Lipsește meta viewport. Site-ul tău poate apărea nefuncțional pe telefoane mobile — Google folosește Mobile-First Indexing, deci impactul SEO este semnificativ.',
    ru: '📱 Отсутствует meta viewport. Сайт может некорректно отображаться на мобильных — Google использует Mobile-First Indexing, что значительно влияет на SEO.',
    en: '📱 Missing meta viewport. Your site may display incorrectly on mobile devices — Google uses Mobile-First Indexing, so the SEO impact is significant.',
  },
  no_contact: {
    ro: '📞 Nu este vizibilă nicio informație de contact (telefon sau email) pe pagina principală. Afișarea unui număr de telefon vizibil crește rata de conversie și credibilitatea afacerii.',
    ru: '📞 На главной странице не видны контактные данные (телефон или email). Видимый номер телефона повышает конверсию и доверие к бизнесу.',
    en: '📞 No contact information (phone or email) visible on the homepage. Displaying a visible phone number increases conversion rate and business credibility.',
  },
  slow_ttfb: {
    ro: '⏱️ Timp de răspuns al serverului lent (TTFB > 2s). Serverul durează prea mult să răspundă. Consideră upgrade hosting, activează cache-ul de server (Redis/Varnish) sau migrează la un provider mai rapid.',
    ru: '⏱️ Медленное время ответа сервера (TTFB > 2с). Рассмотрите обновление хостинга, включение серверного кеша (Redis/Varnish) или переезд к более быстрому провайдеру.',
    en: '⏱️ Slow server response time (TTFB > 2s). Consider upgrading hosting, enabling server-side caching (Redis/Varnish), or migrating to a faster provider.',
  },
  medium_ttfb: {
    ro: '⏱️ Timp de răspuns al serverului mediu (TTFB 800ms–2s). Poate fi îmbunătățit prin activarea cache-ului de server și optimizarea bazei de date.',
    ru: '⏱️ Среднее время ответа сервера (TTFB 800мс–2с). Можно улучшить через серверное кеширование и оптимизацию базы данных.',
    en: '⏱️ Medium server response time (TTFB 800ms–2s). Can be improved by enabling server-side caching and optimizing the database.',
  },
};

/* ─── Main function ─────────────────────────────────────────── */

export function getRecommendations(
  scores: { performance: number; seo: number; accessibility: number; bestPractices: number },
  rankPosition: number,
  rankTotal: number,
  lang: Lang,
  siteCheck?: SiteCheckResult
): Recommendation[] {
  const recs: Recommendation[] = [];

  // ── PageSpeed-based ─────────────────────────────────────────
  if (scores.performance < 50)       recs.push({ priority: 'high',   text: RECS.perf_critical[lang] });
  else if (scores.performance < 75)  recs.push({ priority: 'medium', text: RECS.perf_medium[lang] });

  if (scores.seo < 50)               recs.push({ priority: 'high',   text: RECS.seo_critical[lang] });
  else if (scores.seo < 80)          recs.push({ priority: 'medium', text: RECS.seo_medium[lang] });

  if (scores.accessibility < 70)     recs.push({ priority: 'high',   text: RECS.acc_critical[lang] });
  if (scores.bestPractices < 75)     recs.push({ priority: 'medium', text: RECS.bp_medium[lang] });

  // ── Site Health–based ────────────────────────────────────────
  if (siteCheck) {
    // SSL
    if (!siteCheck.ssl)
      recs.push({ priority: 'high', text: RECS.no_ssl[lang] });

    if (siteCheck.ssl && !siteCheck.httpsRedirect)
      recs.push({ priority: 'medium', text: RECS.no_https_redirect[lang] });

    // Security headers — group if multiple are missing
    const missingHeaders = [!siteCheck.hsts, !siteCheck.csp, !siteCheck.xFrame].filter(Boolean).length;
    if (missingHeaders >= 2) {
      recs.push({ priority: 'medium', text: RECS.no_security_headers[lang] });
    } else if (!siteCheck.hsts) {
      recs.push({ priority: 'low', text: RECS.no_hsts[lang] });
    }

    // SEO on-page
    if (!siteCheck.metaTitle)  recs.push({ priority: 'high',   text: RECS.no_title[lang] });
    if (!siteCheck.metaDesc)   recs.push({ priority: 'high',   text: RECS.no_meta_desc[lang] });
    if (!siteCheck.h1)         recs.push({ priority: 'medium', text: RECS.no_h1[lang] });
    if (!siteCheck.ogImage)    recs.push({ priority: 'medium', text: RECS.no_og_image[lang] });
    if (!siteCheck.jsonLd)     recs.push({ priority: 'medium', text: RECS.no_jsonld[lang] });

    // Technical
    if (!siteCheck.sitemap)    recs.push({ priority: 'medium', text: RECS.no_sitemap[lang] });
    if (!siteCheck.robots)     recs.push({ priority: 'low',    text: RECS.no_robots[lang] });
    if (!siteCheck.mobileViewport) recs.push({ priority: 'high', text: RECS.no_viewport[lang] });

    if (!siteCheck.hasPhone && !siteCheck.hasEmail)
      recs.push({ priority: 'medium', text: RECS.no_contact[lang] });

    if (siteCheck.ttfb > 2000)
      recs.push({ priority: 'medium', text: RECS.slow_ttfb[lang] });
    else if (siteCheck.ttfb > 800 && siteCheck.ttfb <= 2000)
      recs.push({ priority: 'low', text: RECS.medium_ttfb[lang] });
  }

  // ── Ranking ──────────────────────────────────────────────────
  if (rankPosition > Math.ceil(rankTotal / 2)) {
    recs.push({ priority: 'medium', text: RECS.rank_low[lang] });
  }

  if (recs.length === 0) {
    recs.push({ priority: 'low', text: RECS.all_good[lang] });
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique = recs.filter(r => {
    if (seen.has(r.text)) return false;
    seen.add(r.text);
    return true;
  });

  // Sort: high → medium → low
  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  unique.sort((a, b) => order[a.priority] - order[b.priority]);

  // Return up to 8 (increased from 6 to show more sitecheck items)
  return unique.slice(0, 8);
}
