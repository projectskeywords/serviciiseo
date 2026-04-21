const COMPETITOR_MAP = [
  {
    keywords: ['restaurant', 'cafenea', 'cafe', 'ресторан', 'кафе', 'food', 'mancare', 'mâncare', 'bistro', 'pizza'],
    competitors: ['mafia.md', 'vatra.md', 'smokehouse.md']
  },
  {
    keywords: ['hotel', 'cazare', 'отель', 'accommodation', 'hostel', 'motel'],
    competitors: ['leogrand.md', 'acces-travel.md', 'agentia-de-turism.md']
  },
  {
    keywords: ['stomatolog', 'dental', 'dinti', 'dinți', 'стоматолог', 'зубы', 'dentist'],
    competitors: ['dentexpert.md', 'medpark.md', 'imsp.md']
  },
  {
    keywords: ['salon', 'beauty', 'frumusete', 'frumusețe', 'красота', 'coafor', 'hair', 'spa', 'machiaj'],
    competitors: ['lookbook.md', 'saloane.md', 'beauty-salon.md']
  },
  {
    keywords: ['gym', 'fitness', 'sport', 'фитнес', 'спорт', 'antrenament', 'sala'],
    competitors: ['worldclass.md', 'sport.md', 'fitlife.md']
  },
  {
    keywords: ['farmacie', 'pharmacy', 'аптека', 'medicamente', 'лекарства'],
    competitors: ['farmacia-familiei.md', 'catena.md', 'belladonna.md']
  },
  {
    keywords: ['imobil', 'imobiliar', 'недвижимость', 'real estate', 'apartament', 'casa', 'casă', 'chirie'],
    competitors: ['imobiliare.md', '999.md', 'lara.md']
  },
  {
    keywords: ['transport', 'curier', 'livrare', 'доставка', 'логистика', 'logistics', 'cargo'],
    competitors: ['urgent-cargus.md', 'nova-poshta.md', 'posta.md']
  },
  {
    keywords: ['magazin', 'shop', 'store', 'магазин', 'online', 'ecommerce', 'cumparaturi', 'cumpărături'],
    competitors: ['maksimus.md', 'darwin.md', 'xo.md']
  },
  {
    keywords: ['agentie', 'agenție', 'marketing', 'digital', 'seo', 'web', 'design', 'рекламa', 'реклама'],
    competitors: ['keywords.md', 'webit.md', 'digital-agency.md']
  },
  {
    keywords: ['juridic', 'avocat', 'legal', 'юрист', 'адвокат', 'notariat', 'notar'],
    competitors: ['avocatmd.com', 'legaladvice.md', 'notar.md']
  },
  {
    keywords: ['constructii', 'construcții', 'строительство', 'renovation', 'renovare', 'reparatie', 'reparație'],
    competitors: ['constructii.md', 'renovare.md', 'buildit.md']
  },
];

const DEFAULT_COMPETITORS = ['gov.md', 'unimedia.md', 'publika.md'];

export function getCompetitors(category: string): string[] {
  const lower = category.toLowerCase();
  for (const entry of COMPETITOR_MAP) {
    if (entry.keywords.some(kw => lower.includes(kw))) {
      return entry.competitors;
    }
  }
  return DEFAULT_COMPETITORS;
}
