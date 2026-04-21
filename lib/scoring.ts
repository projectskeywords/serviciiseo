import type { SiteCheckResult } from './sitecheck';

type Lang = 'ro' | 'ru' | 'en';
type Priority = 'high' | 'medium' | 'low';

export interface Recommendation {
  priority: Priority;
  text: string;
}

const RECS: Record<string, Record<Lang, string>> = {
  perf_critical: {
    ro: 'Performanță critică: convertește imaginile în format WebP, activează cache-ul browser-ului și minifică fișierele JavaScript și CSS.',
    ru: 'Критическая производительность: конвертируйте изображения в формат WebP, включите кеширование браузера и минифицируйте JavaScript и CSS.',
    en: 'Critical performance: convert images to WebP format, enable browser caching, and minify JavaScript and CSS files.',
  },
  perf_medium: {
    ro: 'Comprimă imaginile înainte de upload și consideră utilizarea unui CDN pentru fișierele statice.',
    ru: 'Сжимайте изображения перед загрузкой и рассмотрите использование CDN для статических файлов.',
    en: 'Compress images before uploading and consider using a CDN for static files.',
  },
  seo_critical: {
    ro: 'SEO critic: adaugă meta title și meta description unice pe fiecare pagină, creează un fișier sitemap.xml și corectează linkurile rupte.',
    ru: 'Критический SEO: добавьте уникальные meta title и meta description на каждую страницу, создайте sitemap.xml и исправьте битые ссылки.',
    en: 'Critical SEO: add unique meta title and description to each page, create a sitemap.xml file, and fix broken links.',
  },
  seo_medium: {
    ro: 'Îmbunătățește structura de headings (H1/H2), adaugă schema markup pentru afacerea ta locală și optimizează URL-urile.',
    ru: 'Улучшите структуру заголовков (H1/H2), добавьте разметку schema для вашего локального бизнеса и оптимизируйте URL.',
    en: 'Improve heading structure (H1/H2), add schema markup for your local business, and optimize URL structure.',
  },
  acc_critical: {
    ro: 'Accesibilitate slabă: adaugă atribute alt la toate imaginile, mărește contrastul textului față de fundal și adaugă etichete la câmpurile de formular.',
    ru: 'Плохая доступность: добавьте атрибуты alt ко всем изображениям, увеличьте контрастность текста и добавьте метки к полям форм.',
    en: 'Poor accessibility: add alt attributes to all images, increase text contrast ratio, and add labels to all form fields.',
  },
  bp_medium: {
    ro: 'Bune practici: asigură-te că site-ul rulează pe HTTPS, elimină librăriile JavaScript cu vulnerabilități cunoscute și rezolvă erorile din consolă.',
    ru: 'Лучшие практики: убедитесь, что сайт работает на HTTPS, удалите библиотеки JavaScript с известными уязвимостями и исправьте ошибки консоли.',
    en: 'Best practices: ensure your site runs on HTTPS, remove JavaScript libraries with known vulnerabilities, and fix console errors.',
  },
  rank_low: {
    ro: 'Ești în a doua jumătate a clasamentului. Concentrează-te pe îmbunătățirile de mai sus pentru a urca rapid.',
    ru: 'Вы находитесь во второй половине рейтинга. Сосредоточьтесь на улучшениях выше, чтобы быстро подняться.',
    en: 'You are in the bottom half of the rankings. Focus on the improvements above to move up quickly.',
  },
  all_good: {
    ro: 'Scor excelent! Menține optimizările actuale și monitorizează periodic performanța site-ului.',
    ru: 'Отличный балл! Поддерживайте текущие оптимизации и периодически отслеживайте производительность сайта.',
    en: 'Excellent score! Maintain your current optimizations and periodically monitor site performance.',
  },
  // Site-health–derived recommendations
  no_ssl: {
    ro: 'Site-ul nu rulează pe HTTPS — afectează negativ pozițiile în Google și securitatea vizitatorilor. Instalează un certificat SSL gratuit (Let\'s Encrypt).',
    ru: 'Сайт не работает на HTTPS — это негативно влияет на позиции в Google и безопасность пользователей. Установите бесплатный сертификат SSL (Let\'s Encrypt).',
    en: 'Your site does not run on HTTPS — this hurts Google rankings and visitor security. Install a free SSL certificate (Let\'s Encrypt).',
  },
  no_viewport: {
    ro: 'Lipsește meta viewport — site-ul poate apărea incorect pe dispozitive mobile, afectând direct Google Rankings (Mobile-First Indexing).',
    ru: 'Отсутствует meta viewport — сайт может некорректно отображаться на мобильных устройствах, что напрямую влияет на Google Rankings.',
    en: 'Missing meta viewport — the site may display incorrectly on mobile devices, directly affecting Google Rankings (Mobile-First Indexing).',
  },
  no_sitemap: {
    ro: 'Lipsește sitemap.xml — motoarele de căutare nu pot indexa eficient paginile site-ului tău. Creează și trimite un sitemap în Google Search Console.',
    ru: 'Отсутствует sitemap.xml — поисковые системы не могут эффективно индексировать страницы вашего сайта. Создайте и отправьте карту сайта в Google Search Console.',
    en: 'Missing sitemap.xml — search engines cannot efficiently index your pages. Create and submit a sitemap in Google Search Console.',
  },
  no_title: {
    ro: 'Lipsește tag-ul <title> pe pagina principală — esențial pentru SEO și rata de click din rezultatele Google.',
    ru: 'Отсутствует тег <title> на главной странице — он необходим для SEO и кликабельности в результатах Google.',
    en: 'Missing <title> tag on the homepage — essential for SEO and click-through rates from Google search results.',
  },
  no_meta_desc: {
    ro: 'Lipsește meta description — nu ai control asupra textului afișat în rezultatele Google. Adaugă o descriere de 150–160 caractere pentru fiecare pagină.',
    ru: 'Отсутствует meta description — у вас нет контроля над текстом в результатах Google. Добавьте описание из 150–160 символов для каждой страницы.',
    en: 'Missing meta description — you have no control over the text shown in Google results. Add a 150–160 character description to each page.',
  },
  no_contact: {
    ro: 'Nu este vizibilă informația de contact (telefon/email) pe pagina principală. Un număr de telefon vizibil crește semnificativ rata de conversie.',
    ru: 'На главной странице не видна контактная информация (телефон/email). Видимый номер телефона значительно повышает конверсию.',
    en: 'No contact information (phone/email) visible on the homepage. A visible phone number significantly increases conversion rates.',
  },
  slow_ttfb: {
    ro: 'Timp de răspuns al serverului lent (TTFB > 2s). Consideră upgrade hosting, activează cache-ul de server sau migrează pe un plan mai performant.',
    ru: 'Медленное время ответа сервера (TTFB > 2с). Рассмотрите обновление хостинга, включение серверного кеша или миграцию на более производительный план.',
    en: 'Slow server response time (TTFB > 2s). Consider upgrading your hosting, enabling server-side caching, or migrating to a better-performing plan.',
  },
};

export function getRecommendations(
  scores: { performance: number; seo: number; accessibility: number; bestPractices: number },
  rankPosition: number,
  rankTotal: number,
  lang: Lang,
  siteCheck?: SiteCheckResult
): Recommendation[] {
  const recs: Recommendation[] = [];

  // PageSpeed-based recommendations
  if (scores.performance < 50) recs.push({ priority: 'high', text: RECS.perf_critical[lang] });
  else if (scores.performance < 75) recs.push({ priority: 'medium', text: RECS.perf_medium[lang] });

  if (scores.seo < 50) recs.push({ priority: 'high', text: RECS.seo_critical[lang] });
  else if (scores.seo < 80) recs.push({ priority: 'medium', text: RECS.seo_medium[lang] });

  if (scores.accessibility < 70) recs.push({ priority: 'high', text: RECS.acc_critical[lang] });
  if (scores.bestPractices < 75) recs.push({ priority: 'medium', text: RECS.bp_medium[lang] });

  // Site-health–based recommendations
  if (siteCheck) {
    if (!siteCheck.ssl) recs.push({ priority: 'high', text: RECS.no_ssl[lang] });
    if (!siteCheck.mobileViewport) recs.push({ priority: 'high', text: RECS.no_viewport[lang] });
    if (!siteCheck.metaTitle) recs.push({ priority: 'high', text: RECS.no_title[lang] });
    if (!siteCheck.metaDesc) recs.push({ priority: 'medium', text: RECS.no_meta_desc[lang] });
    if (!siteCheck.sitemap) recs.push({ priority: 'medium', text: RECS.no_sitemap[lang] });
    if (!siteCheck.hasPhone && !siteCheck.hasEmail) {
      recs.push({ priority: 'medium', text: RECS.no_contact[lang] });
    }
    if (siteCheck.ttfb > 2000) recs.push({ priority: 'medium', text: RECS.slow_ttfb[lang] });
  }

  if (rankPosition > Math.ceil(rankTotal / 2)) {
    recs.push({ priority: 'medium', text: RECS.rank_low[lang] });
  }

  if (recs.length === 0) {
    recs.push({ priority: 'low', text: RECS.all_good[lang] });
  }

  // De-duplicate and cap at 6
  const seen = new Set<string>();
  const unique = recs.filter(r => {
    if (seen.has(r.text)) return false;
    seen.add(r.text);
    return true;
  });

  // Sort: high first, then medium, then low
  const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
  unique.sort((a, b) => order[a.priority] - order[b.priority]);

  return unique.slice(0, 6);
}
