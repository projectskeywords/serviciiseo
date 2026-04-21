'use client';

interface FilterState {
  from: string;
  to: string;
  lang: string;
  status: string;
  search: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}

export default function Filters({ filters, onChange }: Props) {
  function set(key: keyof FilterState, val: string) {
    onChange({ ...filters, [key]: val });
  }

  return (
    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
      <input
        className="input"
        type="date"
        placeholder="De la"
        value={filters.from}
        onChange={e => set('from', e.target.value)}
        style={{ width: 150 }}
      />
      <input
        className="input"
        type="date"
        placeholder="Până la"
        value={filters.to}
        onChange={e => set('to', e.target.value)}
        style={{ width: 150 }}
      />
      <select className="input" value={filters.lang} onChange={e => set('lang', e.target.value)} style={{ width: 110 }}>
        <option value="">Limbă</option>
        <option value="ro">RO</option>
        <option value="ru">RU</option>
        <option value="en">EN</option>
      </select>
      <select className="input" value={filters.status} onChange={e => set('status', e.target.value)} style={{ width: 130 }}>
        <option value="">Status</option>
        <option value="completed">Completat</option>
        <option value="pending">În așteptare</option>
        <option value="failed">Eșuat</option>
      </select>
      <input
        className="input"
        type="text"
        placeholder="Caută email sau site..."
        value={filters.search}
        onChange={e => set('search', e.target.value)}
        style={{ flex: 1, minWidth: 200 }}
      />
    </div>
  );
}
