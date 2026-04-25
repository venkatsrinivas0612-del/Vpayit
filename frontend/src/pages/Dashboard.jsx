import { useState, useEffect, useRef } from 'react';
import {
  ComposedChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceLine, ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../context/AuthContext';

/* ─── Mock fallback data ──────────────────────────────────────────────────── */

const BRIEF_FALLBACK = `Good morning. Your AI Chief of Staff is ready. Connect your bank account and subscribe to the morning brief to receive a personalised daily summary of your cash position, compliance deadlines, and actions needed.`;

const METRICS = [
  {
    id: 'cash',
    label: 'Cash Position',
    value: '£12,840',
    sub: '+£640 this week',
    trend: 'up',
    detail: 'Connect bank via Open Banking to sync live',
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
  { id: 'vat',  label: 'VAT Return',              due: '5 May 2026',  daysLeft: 10,  amount: '~£3,200 estimated', status: 'urgent'   },
  { id: 'conf', label: 'Confirmation Statement',  due: '14 Aug 2026', daysLeft: 111, amount: '£34 filing fee',    status: 'clear'    },
  { id: 'corp', label: 'Corporation Tax',         due: '31 Dec 2026', daysLeft: 250, amount: '~£8,400 estimated', status: 'clear'    },
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

const CASHFLOW_DATA = [
  { month: 'Feb', cash: 9200  },
  { month: 'Mar', cash: 10100 },
  { month: 'Apr', cash: 12840 },
  { month: 'May', cash: 9640  },
  { month: 'Jun', cash: 11200 },
  { month: 'Jul', cash: 14800 },
];

/* ─── Cash flow + compliance chart ───────────────────────────────────────── */

function CashFlowChart() {
  return (
    <div
      className="rounded-2xl border p-6"
      style={{ background: '#FFFFFF', borderColor: '#E8E6E1' }}
    >
      <div className="flex items-baseline justify-between gap-3 mb-5 flex-wrap">
        <h2
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: '#9CA3AF', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Cash Position + Compliance Deadlines
        </h2>
        <span
          className="text-xs"
          style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          Mock data · TrueLayer sync coming soon
        </span>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={CASHFLOW_DATA} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="cashGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#2563EB" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE8" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: 11, fill: '#9CA3AF' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `£${(v / 1000).toFixed(0)}k`}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: '#111',
              border: 'none',
              borderRadius: '10px',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: '12px',
              color: '#fff',
              padding: '8px 12px',
            }}
            formatter={v => [`£${v.toLocaleString()}`, 'Cash']}
            cursor={{ stroke: '#E8E6E1', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="cash"
            stroke="#2563EB"
            strokeWidth={2}
            fill="url(#cashGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#2563EB', stroke: '#fff', strokeWidth: 2 }}
          />
          <ReferenceLine
            x="May"
            stroke="#D97706"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{
              value: 'VAT due',
              position: 'insideTopRight',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontSize: 10,
              fill: '#D97706',
            }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p
        className="text-xs mt-3"
        style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        Amber dashed lines mark upcoming HMRC deadlines. Cash dip in May reflects estimated VAT payment.
      </p>
    </div>
  );
}

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
  const badgeBg   = status === 'action' ? '#FEF3C7' : '#DCFCE7';
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

/* ─── Markdown renderer ───────────────────────────────────────────────────── */

function renderMarkdown(text) {
  function applyInline(str) {
    const parts = str.split(/\*\*(.*?)\*\*/g);
    return parts.map((p, i) =>
      i % 2 === 1
        ? <strong key={i} style={{ fontWeight: 700 }}>{p}</strong>
        : p.replace(/\*(.*?)\*/g, '$1')
    );
  }

  const lines = text.split('\n').filter(l => l.trim() !== '');
  return lines.map((line, i) => {
    if (/^#{1,3}\s+/.test(line)) {
      const content = line.replace(/^#{1,3}\s+/, '');
      return (
        <p key={i} style={{ fontWeight: 700, fontSize: '15px', marginBottom: '6px', color: '#111' }}>
          {applyInline(content)}
        </p>
      );
    }
    if (/^[-*]\s+/.test(line)) {
      return (
        <p key={i} style={{ paddingLeft: '12px', marginBottom: '4px', color: '#333' }}>
          <span style={{ color: '#2563EB', marginRight: '6px' }}>›</span>
          {applyInline(line.replace(/^[-*]\s+/, ''))}
        </p>
      );
    }
    const numMatch = line.match(/^\d+\.\s+(.*)/);
    if (numMatch) {
      return (
        <p key={i} style={{ paddingLeft: '12px', marginBottom: '4px', color: '#333' }}>
          <span style={{ color: '#2563EB', marginRight: '6px' }}>›</span>
          {applyInline(numMatch[1])}
        </p>
      );
    }
    return (
      <p key={i} style={{ marginBottom: '6px', color: '#333' }}>
        {applyInline(line)}
      </p>
    );
  });
}

/* ─── AI ask bar ──────────────────────────────────────────────────────────── */

function AskBar() {
  const [query, setQuery]   = useState('');
  const [reply, setReply]   = useState('');
  const [loading, setLoading] = useState(false);

  const SUGGESTIONS = [
    'What do I owe HMRC this quarter?',
    'Draft a chase email for Acme Corp',
    'Summarise my cash position',
  ];

  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  async function handleAsk(q) {
    const text = q ?? query;
    if (!text.trim() || loading) return;
    setQuery(text);
    setLoading(true);
    setReply('');

    try {
      const res = await fetch(`${API}/api/v1/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
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

      {loading && (
        <div className="mt-4 flex items-center gap-2" style={{ color: '#9CA3AF' }}>
          <span className="inline-flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
          </span>
          <span className="text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Vpayit is thinking…</span>
        </div>
      )}

      {reply && !loading && (
        <div
          className="mt-4 rounded-xl p-4"
          style={{ background: '#F0F4FF', borderLeft: '3px solid #2563EB' }}
        >
          <p className="text-xs font-semibold mb-3" style={{ color: '#2563EB', fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: '0.05em' }}>
            VPAYIT AI
          </p>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: '14px', lineHeight: '1.75' }}>
            {renderMarkdown(reply)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main dashboard ──────────────────────────────────────────────────────── */

export default function Dashboard() {
  const { user, profile } = useAuth();
  const [liveBrief, setLiveBrief] = useState(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  useEffect(() => {
    document.title = 'Dashboard — Vpayit';
  }, []);

  // Fetch latest morning brief for this user
  useEffect(() => {
    if (!user?.email) return;
    setBriefLoading(true);
    fetch(`${API}/api/v1/brief/history?email=${encodeURIComponent(user.email)}`)
      .then(r => r.json())
      .then(data => {
        if (data.briefs?.length > 0) {
          setLiveBrief(data.briefs[0].content);
        }
      })
      .catch(() => {})
      .finally(() => setBriefLoading(false));
  }, [user?.email]);

  const today = new Date().toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const greeting = profile?.business_name
    ? `Good morning, ${profile.business_name}`
    : 'Good morning';

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
              {greeting}
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
          {briefLoading ? (
            <div className="flex items-center gap-2 py-2" style={{ color: '#9CA3AF' }}>
              <span className="inline-flex gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
              <span className="text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Loading your brief…</span>
            </div>
          ) : (
            <p
              className="leading-relaxed"
              style={{
                fontFamily: "'Instrument Serif', serif",
                fontSize: '21px',
                color: '#111',
                lineHeight: '1.65',
              }}
            >
              {liveBrief ?? BRIEF_FALLBACK}
            </p>
          )}
          <p
            className="text-xs mt-4"
            style={{ color: '#C4BFB8', fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            {liveBrief
              ? 'Generated at 08:00 · Based on your Vpayit data'
              : 'Subscribe to the morning brief at vpayit.co.uk/morning-brief to receive your daily summary'}
          </p>
        </div>

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {METRICS.map(m => (
            <MetricCard key={m.id} {...m} />
          ))}
        </div>

        {/* ── Cash flow + compliance chart ── */}
        <CashFlowChart />

        {/* ── Two-col: compliance timeline + threads ── */}
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
