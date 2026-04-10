import { useState, useEffect, useRef } from 'react';

/* ─── Mock data ───────────────────────────────────────────────────────────── */

const BRIEF = `Good morning, Venkat. Vpayit Ltd is in solid shape this week. Cash reserves are healthy at £12,840 and your compliance score sits at 87 — well above the UK average for businesses at your stage. One item needs your eye today: the Acme Corp invoice has been overdue for 14 days and is worth chasing before the weekend. Your VAT return window opens in 31 days — I'll prompt you again when it's time to gather receipts. Otherwise, a quiet week. Use the time well.`;

const METRICS = [
  {
    id: 'cash',
    label: 'Cash Position',
    value: '£12,840',
    sub: '+£640 this week',
    trend: 'up',
    detail: 'Barclays Business · last synced 6h ago',
  },
  {
    id: 'compliance',
    label: 'Compliance Score',
    value: '87',
    suffix: '/100',
    sub: 'Above average',
    trend: 'up',
    detail: '3 items fully resolved this month',
  },
  {
    id: 'week',
    label: 'This Week',
    value: '2',
    sub: 'Items need action',
    trend: 'neutral',
    detail: '1 overdue invoice · 1 HMRC deadline approaching',
  },
];

const DEADLINES = [
  {
    id: 'vat',
    label: 'VAT Return',
    due: '5 May 2026',
    daysLeft: 31,
    amount: '~£3,200 estimated',
    status: 'upcoming',
  },
  {
    id: 'conf',
    label: 'Confirmation Statement',
    due: '14 Aug 2026',
    daysLeft: 131,
    amount: '£34 filing fee',
    status: 'clear',
  },
  {
    id: 'corp',
    label: 'Corporation Tax',
    due: '31 Dec 2026',
    daysLeft: 270,
    amount: '~£8,400 estimated',
    status: 'clear',
  },
];

const THREADS = [
  {
    id: 't1',
    title: 'Acme Corp Invoice Overdue',
    meta: '£2,400 · 14 days overdue',
    body: 'Invoice #INV-0041 was due 22 March. No response to the first chase. I can draft a second chase email now.',
    status: 'action',
    cta: 'Draft chase email',
  },
  {
    id: 't2',
    title: 'Q1 Board Report Ready',
    meta: 'AI draft complete · Apr 2026',
    body: 'I have compiled your Q1 figures — revenue, expenses, compliance status — into a one-page board summary. Ready to review.',
    status: 'ready',
    cta: 'Review draft',
  },
];

/* ─── Pulse circle ────────────────────────────────────────────────────────── */

function Pulse({ score }) {
  const colour =
    score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';
  const label =
    score >= 80 ? 'Healthy' : score >= 60 ? 'Needs attention' : 'At risk';

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-16 h-16">
        <span
          className="absolute inset-0 rounded-full opacity-20 animate-ping"
          style={{ backgroundColor: colour, animationDuration: '2.4s' }}
        />
        <span
          className="absolute inset-1 rounded-full opacity-30"
          style={{ backgroundColor: colour }}
        />
        <span
          className="absolute inset-3 rounded-full"
          style={{ backgroundColor: colour }}
        />
      </div>
      <span
        className="text-xs font-semibold tracking-wide uppercase"
        style={{ color: colour, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── Metric card ─────────────────────────────────────────────────────────── */

function MetricCard({ label, value, suffix, sub, trend, detail }) {
  const trendColour =
    trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : '#6B7280';
  const trendSymbol = trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→';

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-1"
      style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {label}
      </span>
      <div className="flex items-baseline gap-1 mt-2">
        <span
          className="text-4xl font-extrabold"
          style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '-1px' }}
        >
          {value}
        </span>
        {suffix && (
          <span className="text-lg font-semibold" style={{ color: '#9CA3AF' }}>
            {suffix}
          </span>
        )}
      </div>
      <span
        className="text-sm font-semibold"
        style={{ color: trendColour, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {trendSymbol} {sub}
      </span>
      <span
        className="text-xs mt-1"
        style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {detail}
      </span>
    </div>
  );
}

/* ─── Compliance timeline ─────────────────────────────────────────────────── */

function ComplianceTimeline() {
  const max = 365;

  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
    >
      <h2
        className="text-xs font-bold uppercase tracking-widest mb-5"
        style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        UK Compliance Runway
      </h2>

      <div className="space-y-5">
        {DEADLINES.map((d) => {
          const pct = Math.min(100, (d.daysLeft / max) * 100);
          const barColour =
            d.daysLeft <= 30 ? '#D97706' : d.daysLeft <= 90 ? '#2563EB' : '#16A34A';

          return (
            <div key={d.id}>
              <div className="flex justify-between items-baseline mb-1.5">
                <span
                  className="text-sm font-semibold"
                  style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {d.label}
                </span>
                <span
                  className="text-xs"
                  style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {d.daysLeft} days · {d.due}
                </span>
              </div>
              <div
                className="h-1.5 rounded-full w-full"
                style={{ background: '#F0EDE8' }}
              >
                <div
                  className="h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%`, background: barColour }}
                />
              </div>
              <span
                className="text-xs mt-1 block"
                style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {d.amount}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Thread card ─────────────────────────────────────────────────────────── */

function ThreadCard({ title, meta, body, status, cta }) {
  const badgeBg = status === 'action' ? '#FEF3C7' : '#DCFCE7';
  const badgeText = status === 'action' ? '#92400E' : '#166534';
  const badgeLabel = status === 'action' ? 'Action needed' : 'Ready';

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p
            className="text-sm font-bold"
            style={{ color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {title}
          </p>
          <p
            className="text-xs mt-0.5"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {meta}
          </p>
        </div>
        <span
          className="shrink-0 text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ background: badgeBg, color: badgeText, fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {badgeLabel}
        </span>
      </div>
      <p
        className="text-sm leading-relaxed mb-4"
        style={{ color: '#555', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {body}
      </p>
      <button
        className="text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
        style={{ background: '#F5F4F0', color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        onMouseEnter={e => (e.currentTarget.style.background = '#EBE9E4')}
        onMouseLeave={e => (e.currentTarget.style.background = '#F5F4F0')}
      >
        {cta} →
      </button>
    </div>
  );
}

/* ─── AI ask bar ──────────────────────────────────────────────────────────── */

function AskBar() {
  const [query, setQuery] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = [
    'What do I owe HMRC this quarter?',
    'Draft a chase email for Acme Corp',
    'Summarise my cash position',
  ];

  async function handleAsk(q) {
    const text = q ?? query;
    if (!text.trim() || loading) return;
    setQuery(text);
    setLoading(true);
    setReply('');

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL ?? 'http://localhost:3001'}/api/v1/ask`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: text }),
        }
      );
      const data = await res.json();
      setReply(data.reply ?? data.error ?? 'No response received.');
    } catch {
      setReply('Could not reach Vpayit AI. Please check your connection.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="rounded-2xl border p-5"
      style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
    >
      <p
        className="text-xs font-semibold uppercase tracking-widest mb-3"
        style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Ask your AI Chief of Staff
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => handleAsk(s)}
            className="text-xs px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: '#E8E6E1', color: '#555', background: '#F5F4F0', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            onMouseEnter={e => (e.currentTarget.style.background = '#EBE9E4')}
            onMouseLeave={e => (e.currentTarget.style.background = '#F5F4F0')}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex gap-3">
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything about your business…"
          className="flex-1 px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ borderColor: '#E8E6E1', background: '#FEFDFB', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        />
        <button
          onClick={() => handleAsk()}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          style={{ background: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {loading ? '…' : 'Ask'}
        </button>
      </div>

      {reply && (
        <div
          className="mt-4 p-4 rounded-xl text-sm leading-relaxed"
          style={{ background: '#F5F4F0', color: '#111', fontFamily: "'Plus Jakarta Sans', sans-serif", borderLeft: '3px solid #2563EB' }}
        >
          {reply}
        </div>
      )}
    </div>
  );
}

/* ─── Main dashboard ──────────────────────────────────────────────────────── */

export default function Dashboard() {
  useEffect(() => {
    document.title = 'Dashboard — Vpayit';
  }, []);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div
      className="min-h-screen p-6 md:p-8"
      style={{ background: '#FEFDFB', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
    >
      <div className="max-w-5xl mx-auto space-y-8">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-1"
              style={{ color: '#9CA3AF' }}
            >
              {today}
            </p>
            <h1
              className="text-2xl font-bold"
              style={{ color: '#111', letterSpacing: '-0.5px' }}
            >
              Good morning, Venkat
            </h1>
          </div>
          <Pulse score={87} />
        </div>

        {/* ── Morning Brief ── */}
        <div
          className="rounded-2xl border p-7"
          style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-widest mb-4"
            style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Morning Brief · AI Summary
          </p>
          <p
            className="leading-relaxed"
            style={{
              fontFamily: "'Instrument Serif', serif",
              fontSize: '21px',
              color: '#111',
              lineHeight: '1.65',
            }}
          >
            {BRIEF}
          </p>
          <p
            className="text-xs mt-4"
            style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            Generated at 08:00 · Based on your Vpayit data · Last year this week: cash was £9,200
          </p>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {METRICS.map(m => (
            <MetricCard key={m.id} {...m} />
          ))}
        </div>

        {/* ── Two-col: timeline + threads ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ComplianceTimeline />

          <div className="space-y-4">
            <h2
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: '#9CA3AF' }}
            >
              Open Threads
            </h2>
            {THREADS.map(t => (
              <ThreadCard key={t.id} {...t} />
            ))}
          </div>
        </div>

        {/* ── AI ask bar ── */}
        <AskBar />

      </div>
    </div>
  );
}
