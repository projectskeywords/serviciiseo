import * as XLSX from 'xlsx';
import { sql, ensureTables } from './db';

interface Lead {
  id: number;
  created_at: string;
  email: string;
  website_url: string;
  category: string;
  language: string;
  score_overall: number;
  score_performance: number;
  score_seo: number;
  score_accessibility: number;
  score_best_practices: number;
  fcp: string;
  lcp: string;
  tbt: string;
  rank_position: number;
  rank_total: number;
  ip_address: string;
  status: string;
  competitors_json: string;
}

const HEADERS = [
  'ID', 'Data', 'Email', 'Website', 'Categorie', 'Limbă',
  'Scor Total', 'Performanță', 'SEO', 'Accesibilitate', 'Bune practici',
  'FCP', 'LCP', 'TBT', 'Poziție', 'Total concurenți',
  'IP', 'Status', 'Concurenți (JSON)',
];

function leadToRow(lead: Lead): (string | number)[] {
  const date = new Date(lead.created_at);
  const formatted = `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(2, '0')}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

  return [
    lead.id,
    formatted,
    lead.email,
    lead.website_url,
    lead.category  || '',
    lead.language  || '',
    lead.score_overall        || 0,
    lead.score_performance    || 0,
    lead.score_seo            || 0,
    lead.score_accessibility  || 0,
    lead.score_best_practices || 0,
    lead.fcp || '',
    lead.lcp || '',
    lead.tbt || '',
    lead.rank_position || 0,
    lead.rank_total    || 0,
    lead.ip_address || '',
    lead.status     || '',
    lead.competitors_json || '',
  ];
}

export async function generateXLSX(): Promise<Buffer> {
  await ensureTables();
  const leads = (await sql`SELECT * FROM leads ORDER BY created_at DESC`) as Lead[];

  const wb = XLSX.utils.book_new();
  const wsData = [HEADERS, ...leads.map(leadToRow)];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
    const addr = XLSX.utils.encode_cell({ r: 0, c: C });
    if (!ws[addr]) continue;
    ws[addr].s = { font: { bold: true }, fill: { fgColor: { rgb: 'EEF4FF' } } };
  }

  ws['!cols'] = [
    { wch: 6 }, { wch: 18 }, { wch: 28 }, { wch: 30 }, { wch: 20 }, { wch: 8 },
    { wch: 10 }, { wch: 12 }, { wch: 8  }, { wch: 14 }, { wch: 14 },
    { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 8  }, { wch: 14 },
    { wch: 16 }, { wch: 10 }, { wch: 40 },
  ];

  XLSX.utils.book_append_sheet(wb, ws, 'Leads keywords.md');
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

export async function generateCSV(): Promise<string> {
  await ensureTables();
  const leads = (await sql`SELECT * FROM leads ORDER BY created_at DESC`) as Lead[];

  const BOM = '\uFEFF';
  const escape = (v: string | number) => {
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n')
      ? `"${s.replace(/"/g, '""')}"`
      : s;
  };

  const rows = [HEADERS, ...leads.map(leadToRow)]
    .map(row => row.map(escape).join(','))
    .join('\n');

  return BOM + rows;
}
