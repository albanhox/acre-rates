// Builds rates.json from public national-average series on FRED (Federal Reserve Bank of St. Louis).
// No API key needed: the fredgraph.csv endpoint is public. Runs daily via GitHub Actions.
//
//   node fetch-rates.js          -> writes rates.json next to this file
//
// Series:
//   MORTGAGE30US  Freddie Mac PMMS 30-year fixed, weekly (Thursdays)
//   MORTGAGE15US  Freddie Mac PMMS 15-year fixed, weekly (Thursdays)
//   DGS10         10-year Treasury constant maturity, daily
const fs = require('fs');
const path = require('path');

const SERIES = [
  { key: 'fixed30', id: 'MORTGAGE30US', name: '30-year fixed', sub: 'National average, Freddie Mac', period: 'week' },
  { key: 'fixed15', id: 'MORTGAGE15US', name: '15-year fixed', sub: 'National average, Freddie Mac', period: 'week' },
  { key: 'treasury10', id: 'DGS10', name: '10-year Treasury', sub: 'The benchmark mortgage rates follow', period: 'day' }
];

async function series(id) {
  const res = await fetch('https://fred.stlouisfed.org/graph/fredgraph.csv?id=' + id, { headers: { 'user-agent': 'acre-rates/1.0' } });
  if (!res.ok) throw new Error(id + ' HTTP ' + res.status);
  const rows = (await res.text()).trim().split('\n').slice(1)
    .map(l => l.split(','))
    .filter(([d, v]) => d && v && v !== '.')
    .map(([d, v]) => ({ date: d, value: Number(v) }));
  if (rows.length < 2) throw new Error(id + ' too few rows');
  return rows;
}

(async () => {
  const items = [];
  for (const s of SERIES) {
    const rows = await series(s.id);
    const last = rows[rows.length - 1], prev = rows[rows.length - 2];
    items.push({ key: s.key, name: s.name, sub: s.sub, period: s.period, rate: last.value, prev: prev.value,
      change: Number((last.value - prev.value).toFixed(2)), asOf: last.date, series: s.id });
  }
  const out = {
    updated: new Date().toISOString(),
    asOf: items[0].asOf,
    source: 'Freddie Mac Primary Mortgage Market Survey and U.S. Treasury, via FRED (Federal Reserve Bank of St. Louis)',
    note: 'National averages for informational use only. Not an offer to lend. Your rate depends on credit, down payment, property and program.',
    items
  };
  fs.writeFileSync(path.join(__dirname, 'rates.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(items.map(i => `${i.name}: ${i.rate}% (${i.change >= 0 ? '+' : ''}${i.change}) as of ${i.asOf}`).join('\n'));
})().catch(e => { console.error(e); process.exit(1); });
