import React from 'react';

/*  Chart data helpers (from medication list) */
export function getDaysLeft(expiryDate) {
  if (!expiryDate) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  return Math.floor((exp - today) / (24 * 60 * 60 * 1000));
}

export function computeDonutData(list) {
  let notExpiring = 0, attention = 0, critical = 0;
  list.forEach((m) => {
    const days = getDaysLeft(m.expiryDate);
    if (days == null) return;
    if (days > 120) notExpiring += 1;
    else if (days > 60) attention += 1;
    else critical += 1;
  });
  return [
    { label: 'Not expiring soon\n(120+ days left)', value: Math.max(notExpiring, 0), color: '#a7f0ba' },
    { label: 'Attention needed\n(90 days left)', value: Math.max(attention, 0), color: '#003a56' },
    { label: 'Critical\n(60 days left)', value: Math.max(critical, 0), color: '#dc2626' },
  ];
}

export function computeBarData(list) {
  const buckets = { expired: 0, 30: 0, 60: 0, 90: 0, 120: 0, '120+': 0 };
  list.forEach((m) => {
    const days = getDaysLeft(m.expiryDate);
    if (days == null) return;
    if (days < 0) buckets.expired += 1;
    else if (days <= 30) buckets['30'] += 1;
    else if (days <= 60) buckets['60'] += 1;
    else if (days <= 90) buckets['90'] += 1;
    else if (days <= 120) buckets['120'] += 1;
    else buckets['120+'] += 1;
  });
  return [
    { label: 'Expired', value: buckets.expired, color: '#dc2626' },
    { label: '30', value: buckets['30'], color: '#dc2626' },
    { label: '60', value: buckets['60'], color: '#003a56' },
    { label: '90', value: buckets['90'], color: '#003a56' },
    { label: '120', value: buckets['120'], color: '#a7f0ba' },
    { label: '120+', value: buckets['120+'], color: '#a7f0ba' },
  ];
}

function computeHealthScore(donutData) {
  const total = donutData.reduce((s, d) => s + d.value, 0);
  if (total === 0) return 0;
  const critical = donutData.find((d) => d.color === '#dc2626')?.value ?? 0;
  const attention = donutData.find((d) => d.color === '#003a56')?.value ?? 0;
  const good = donutData.find((d) => d.color === '#a7f0ba')?.value ?? 0;
  const score = Math.round(100 * (good / total) - 10 * (attention / total) - 30 * (critical / total));
  return Math.max(0, Math.min(100, score));
}

const DEFAULT_DONUT = [
  { label: 'Not expiring soon\n(120+ days left)', value: 0, color: '#a7f0ba' },
  { label: 'Attention needed\n(90 days left)', value: 0, color: '#003a56' },
  { label: 'Critical\n(60 days left)', value: 0, color: '#dc2626' },
];

const DEFAULT_BAR = [
  { label: 'Expired', value: 0, color: '#dc2626' },
  { label: '30', value: 0, color: '#dc2626' },
  { label: '60', value: 0, color: '#003a56' },
  { label: '90', value: 0, color: '#003a56' },
  { label: '120', value: 0, color: '#a7f0ba' },
  { label: '120+', value: 0, color: '#a7f0ba' },
];

/* ─── Donut chart (low-level: SVG + data only, no styling) ──────────────────── */
export function DonutChart({ data }) {
  const donutData = data && data.length ? data : DEFAULT_DONUT;
  const total = donutData.reduce((s, d) => s + d.value, 0) || 1;
  const cx = 80, cy = 80, r = 62, inner = 38;
  const circumference = 2 * Math.PI * r;
  let cumulative = 0;
  const slices = donutData.map((d) => {
    const pct = d.value / total;
    const offset = circumference * (1 - cumulative);
    const dash = circumference * pct;
    cumulative += pct;
    return { ...d, pct, offset, dash };
  });
  const healthScore = computeHealthScore(donutData);

  return (
    <div>
      <div style={{ position: 'relative', width: 160, height: 160 }}>
        <svg width={160} height={160} viewBox="0 0 160 160" style={{ transform: 'rotate(-90deg)' }}>
          {slices.map((s, i) => (
            <circle
              key={i}
              cx={cx} cy={cy} r={r}
              fill="none"
              stroke={s.color}
              strokeWidth={r - inner}
              strokeDasharray={`${s.dash} ${circumference - s.dash}`}
              strokeDashoffset={s.offset}
            />
          ))}
        </svg>
        <div style={{ position: 'absolute', left: 0, top: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {healthScore}
        </div>
      </div>
      <ul style={{ listStyle: 'none', padding: 0, margin: '8px 0 0 0' }}>
        {donutData.map((d, i) => (
          <li key={i}>{d.label.replace(/\n/g, ' ')} — {d.value}</li>
        ))}
      </ul>
    </div>
  );
}

/* ─── Bar chart (low-level: SVG + data only, no styling) ────────────────────── */
export function BarChart({ data }) {
  const barData = data && data.length ? data : DEFAULT_BAR;
  const maxVal = Math.max(1, ...barData.map((b) => b.value));
  const chartH = 160;
  const chartW = 320;
  const barW = 34;
  const gap = (chartW - barData.length * barW) / (barData.length + 1);
  const ySteps = [0, Math.ceil(maxVal / 4), Math.ceil(maxVal / 2), Math.ceil((3 * maxVal) / 4), maxVal].filter((v, i, a) => a.indexOf(v) === i);

  return (
    <div>
      <div style={{ marginLeft: 30 }}>
        <svg width={chartW} height={chartH} viewBox={`0 0 ${chartW} ${chartH}`}>
          {ySteps.map((v, i) => (
            <line key={i} x1={0} y1={chartH - (v / maxVal) * chartH} x2={chartW} y2={chartH - (v / maxVal) * chartH} stroke="#eee" strokeWidth={1} />
          ))}
          {barData.map((b, i) => {
            const x = gap + i * (barW + gap);
            const bh = (b.value / maxVal) * chartH;
            const y = chartH - bh;
            return <rect key={i} x={x} y={y} width={barW} height={bh} fill={b.color} />;
          })}
        </svg>
        <div>Days: {barData.map((b) => b.label).join(', ')}</div>
      </div>
    </div>
  );
}
