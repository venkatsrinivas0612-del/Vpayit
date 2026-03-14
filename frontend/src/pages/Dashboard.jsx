import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Receipt, TrendingDown, Building, AlertCircle,
  RefreshCw, ArrowRight, Plus, Loader2, CheckCircle2, X,
  Zap, Sparkles, CreditCard, ArrowUpRight, ArrowDownLeft,
  BarChart3, Bell, TrendingUp,
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const CATEGORY_COLOURS = {
  energy:    '#818cf8',
  water:     '#38bdf8',
  rates:     '#f87171',
  telecoms:  '#c084fc',
  insurance: '#fbbf24',
  software:  '#34d399',
  rent:      '#fb923c',
  mortgage:  '#64748b',
  waste:     '#a3e635',
  unknown:   '#475569',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/* ── Animated number counter ──────────────────────────────────────────────── */
function AnimatedValue({ value, prefix = '', suffix = '' }) {
  const [display, setDisplay] = useState('—');
  const rafRef = useRef(null);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const isNum = typeof value === 'number';
    if (!isNum) { setDisplay(value); return; }

    const start   = 0;
    const end     = value;
    const dur     = 900;
    const startTs = performance.now();

    function tick(now) {
      const elapsed = now - startTs;
      const progress = Math.min(elapsed / dur, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const cur = start + (end - start) * eased;
      setDisplay(prefix + Math.round(cur) + suffix);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);

  return <span>{display}</span>;
}

/* ── Stat card with sparkline ─────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, rawValue, displayValue, sub, trend, sparkData, colour, loading, delay = 0 }) {
  const palettes = {
    indigo:  { orb: 'rgba(99,102,241,0.18)',  icon: '#818cf8', glow: 'rgba(99,102,241,0.25)',  line: '#818cf8' },
    emerald: { orb: 'rgba(16,185,129,0.18)',  icon: '#34d399', glow: 'rgba(16,185,129,0.25)',  line: '#34d399' },
    violet:  { orb: 'rgba(139,92,246,0.18)',  icon: '#c084fc', glow: 'rgba(139,92,246,0.25)',  line: '#c084fc' },
    amber:   { orb: 'rgba(251,191,36,0.18)',  icon: '#fbbf24', glow: 'rgba(251,191,36,0.25)',  line: '#fbbf24' },
  };
  const p = palettes[colour] || palettes.indigo;

  return (
    <div
      className="glass glass-hover relative overflow-hidden p-5 flex flex-col gap-3 cursor-default"
      style={{
        opacity:         0,
        animation:       `fade-up 0.5s ease ${delay}s forwards`,
        boxShadow:       `0 0 0 1px rgba(255,255,255,0.05), 0 4px 24px rgba(0,0,0,0.3)`,
      }}
    >
      {/* Background glow */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: p.glow, filter: 'blur(32px)', transform: 'translate(25%, -25%)' }}
      />

      <div className="flex items-start justify-between">
        <div
          className="icon-orb"
          style={{ background: p.orb }}
        >
          <Icon className="w-5 h-5" style={{ color: p.icon }} />
        </div>
        {trend !== undefined && !loading && (
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1"
            style={{
              background: trend >= 0 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
              color:      trend >= 0 ? '#34d399' : '#f87171',
            }}
          >
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>

      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider mb-1" style={{ color: 'rgba(148,163,184,0.7)' }}>
            {label}
          </p>
          {loading ? (
            <div className="skeleton h-8 w-28" />
          ) : (
            <p className="text-2xl font-bold text-white leading-none">
              {displayValue}
            </p>
          )}
          {sub && !loading && (
            <p className="text-xs mt-1" style={{ color: 'rgba(100,116,139,0.9)' }}>{sub}</p>
          )}
        </div>

        {/* Sparkline */}
        {sparkData && !loading && (
          <div className="w-24 h-12 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                <defs>
                  <linearGradient id={`spark-${colour}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={p.line} stopOpacity={0.4} />
                    <stop offset="95%" stopColor={p.line} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="v"
                  stroke={p.line}
                  strokeWidth={1.5}
                  dot={false}
                  fill={`url(#spark-${colour})`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Custom bar chart tooltip ─────────────────────────────────────────────── */
function DarkTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-xl text-sm"
      style={{
        background:   'rgba(15,15,30,0.95)',
        border:       '1px solid rgba(255,255,255,0.1)',
        backdropFilter: 'blur(16px)',
        boxShadow:    '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      <p className="text-slate-400 text-xs mb-0.5">{label}</p>
      <p className="font-semibold text-white">{fmt(payload[0].value)}</p>
    </div>
  );
}

/* ── Main Dashboard ───────────────────────────────────────────────────────── */
export default function Dashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [summary, setSummary]           = useState(null);
  const [bills, setBills]               = useState([]);
  const [savings, setSavings]           = useState(null);
  const [banks, setBanks]               = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [detecting, setDetecting]       = useState(false);
  const [generating, setGenerating]     = useState(false);
  const [actionMsg, setActionMsg]       = useState('');
  const justConnected = searchParams.get('connected') === '1';

  useEffect(() => {
    document.title = 'Dashboard | Vpayit';
    if (localStorage.getItem('vpayit_onboarding_bank_pending') === '1') {
      localStorage.removeItem('vpayit_onboarding_bank_pending');
      localStorage.setItem('vpayit_onboarding_completed', '1');
    }
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const [sumRes, billsRes, savRes, bankRes, txnRes] = await Promise.allSettled([
        api.transactions.summary(),
        api.bills.list({ status: 'active' }),
        api.savings.list(),
        api.banks.list(),
        api.transactions.list({ limit: 6 }),
      ]);
      if (sumRes.status   === 'fulfilled') setSummary(sumRes.value.data);
      if (billsRes.status === 'fulfilled') setBills(billsRes.value.data ?? []);
      if (savRes.status   === 'fulfilled') setSavings(savRes.value);
      if (bankRes.status  === 'fulfilled') setBanks(bankRes.value.data ?? []);
      if (txnRes.status   === 'fulfilled') setTransactions(txnRes.value.data ?? []);
    } catch { /* no-op */ }
    finally { setLoading(false); }
  }

  async function handleDetect() {
    setDetecting(true); setActionMsg('');
    try {
      const res = await api.bills.detect();
      setActionMsg(`${res.data.detected} recurring bills found — ${res.data.created} new records created.`);
      const billsRes = await api.bills.list({ status: 'active' });
      setBills(billsRes.data ?? []);
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally { setDetecting(false); }
  }

  async function handleFindSavings() {
    setGenerating(true); setActionMsg('');
    try {
      const res = await api.savings.generate();
      setActionMsg(`${res.meta.generated} savings opportunities found.`);
      navigate('/savings');
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally { setGenerating(false); }
  }

  const categoryData = summary?.byCategory
    ? Object.entries(summary.byCategory).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        amount: parseFloat(value.toFixed(2)),
      }))
    : [];

  const upcomingBills = bills
    .filter(b => b.next_due_date)
    .sort((a, b) => new Date(a.next_due_date) - new Date(b.next_due_date))
    .filter((bill, _i, arr) => {
      if (!bill.supplier_id) {
        return !arr.some(b => b.supplier_id && b.category === bill.category);
      }
      return true;
    })
    .slice(0, 5);

  const noBanks   = !loading && banks.length === 0;
  const bankMap   = Object.fromEntries(banks.map(b => [b.id, b.provider]));
  const urgentBills = !loading ? upcomingBills.filter(b => {
    const diff = (new Date(b.next_due_date) - new Date()) / 86_400_000;
    return diff >= 0 && diff <= 3;
  }) : [];

  // Mock sparkline data from category totals
  const spendSpark = categoryData.length > 0
    ? categoryData.slice(0, 6).map((c, i) => ({ v: c.amount * (0.7 + Math.sin(i) * 0.3) }))
    : [1,2,3,4,5,6].map((_, i) => ({ v: 0 }));

  const totalBillSpend = summary?.billSpend ?? 0;
  const totalSaving    = savings?.meta?.totalAnnualSaving ?? 0;
  const dueIn7         = upcomingBills.filter(b => {
    const diff = (new Date(b.next_due_date) - new Date()) / 86_400_000;
    return diff >= 0 && diff <= 7;
  }).length;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">

      {/* ── Header ──────────────────────────────────────────── */}
      <div
        className="flex items-start md:items-center justify-between mb-6 gap-4"
        style={{ opacity: 0, animation: 'fade-up 0.4s ease 0s forwards' }}
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">
            {getGreeting()}
            {profile?.business_name && (
              <span className="gradient-text">, {profile.business_name}</span>
            )}
          </h1>
          <p className="mt-1 text-sm" style={{ color: 'rgba(100,116,139,0.9)' }}>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {banks.length > 0 && (
          <button
            onClick={load}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-xl transition-all cursor-pointer shrink-0"
            style={{
              background:   'rgba(99,102,241,0.12)',
              color:        '#818cf8',
              border:       '1px solid rgba(99,102,241,0.2)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.2)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
          >
            <RefreshCw className="w-4 h-4" />
            Sync
          </button>
        )}
      </div>

      {/* ── Success banner ──────────────────────────────────── */}
      {justConnected && (
        <div
          className="mb-5 rounded-2xl p-4 flex items-center justify-between"
          style={{
            background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(6,182,212,0.08))',
            border:     '1px solid rgba(16,185,129,0.25)',
            animation:  'fade-up 0.4s ease forwards',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-1.5 rounded-lg"
              style={{ background: 'rgba(16,185,129,0.2)' }}
            >
              <CheckCircle2 className="w-4 h-4" style={{ color: '#34d399' }} />
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: '#34d399' }}>Bank account connected</p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(52,211,153,0.7)' }}>
                Transactions imported and bills detected automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="p-1 rounded-lg cursor-pointer transition-colors"
            style={{ color: 'rgba(52,211,153,0.6)' }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Urgent bills alert ──────────────────────────────── */}
      {urgentBills.length > 0 && (
        <div
          className="mb-5 rounded-2xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(251,146,60,0.06))',
            border:     '1px solid rgba(251,191,36,0.22)',
            animation:  'fade-up 0.45s ease 0.05s forwards',
            opacity:    0,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4" style={{ color: '#fbbf24' }} />
            <p className="font-semibold text-sm" style={{ color: '#fbbf24' }}>
              {urgentBills.length === 1 ? '1 bill due soon' : `${urgentBills.length} bills due soon`}
            </p>
          </div>
          <div className="space-y-1">
            {urgentBills.map(bill => {
              const diff = Math.ceil((new Date(bill.next_due_date) - new Date()) / 86_400_000);
              const when = diff <= 0 ? 'today' : diff === 1 ? 'tomorrow' : `in ${diff} days`;
              const name = bill.supplier?.name || bill.category;
              return (
                <p key={bill.id} className="text-sm" style={{ color: 'rgba(251,191,36,0.8)' }}>
                  <strong className="text-white">{name}</strong>{' '}
                  ({fmt(bill.current_amount)}) is due <strong className="text-white">{when}</strong>
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Connect bank CTA ────────────────────────────────── */}
      {noBanks && (
        <div
          className="mb-5 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.12))',
            border:     '1px solid rgba(99,102,241,0.3)',
            animation:  'fade-up 0.4s ease forwards',
          }}
        >
          <div
            className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.2), transparent)', filter: 'blur(24px)', transform: 'translate(30%,-30%)' }}
          />
          <div className="text-white relative">
            <p className="font-bold text-lg">Connect your bank account</p>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(165,180,252,0.8)' }}>
              Link via Open Banking to automatically detect bills and find savings.
            </p>
          </div>
          <Link
            to="/settings"
            className="shrink-0 ml-4 flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer relative"
            style={{ background: 'white', color: '#4f46e5' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(99,102,241,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            <Plus className="w-4 h-4" /> Connect bank
          </Link>
        </div>
      )}

      {/* ── Stat cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        <StatCard
          icon={Receipt}
          label="Bills this month"
          displayValue={fmt(totalBillSpend)}
          rawValue={totalBillSpend}
          sub={`${bills.length} active bills`}
          colour="indigo"
          sparkData={spendSpark}
          loading={loading}
          delay={0.05}
        />
        <StatCard
          icon={TrendingDown}
          label="Annual savings found"
          displayValue={fmt(totalSaving)}
          rawValue={totalSaving}
          sub="Potential annual saving"
          colour="emerald"
          sparkData={spendSpark.map((s, i) => ({ v: s.v * 0.4 + i * 50 }))}
          loading={loading}
          delay={0.1}
        />
        <StatCard
          icon={Building}
          label="Bank accounts"
          displayValue={String(banks.length)}
          rawValue={banks.length}
          sub={banks.length === 0 ? 'None connected' : `${banks.filter(b => b.status === 'active').length} active`}
          colour="violet"
          loading={loading}
          delay={0.15}
        />
        <StatCard
          icon={AlertCircle}
          label="Due in 7 days"
          displayValue={String(dueIn7)}
          rawValue={dueIn7}
          sub="Upcoming payments"
          colour="amber"
          loading={loading}
          delay={0.2}
        />
      </div>

      {/* ── Quick actions ────────────────────────────────────── */}
      <div
        className="glass mb-5 p-5"
        style={{ opacity: 0, animation: 'fade-up 0.5s ease 0.22s forwards' }}
      >
        <h2 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider" style={{ color: 'rgba(148,163,184,0.7)' }}>
          Quick Actions
        </h2>
        {actionMsg && (
          <div
            className="mb-3 text-sm px-4 py-2.5 rounded-xl"
            style={{
              background: actionMsg.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)',
              border:     `1px solid ${actionMsg.startsWith('Error') ? 'rgba(239,68,68,0.2)' : 'rgba(16,185,129,0.2)'}`,
              color:      actionMsg.startsWith('Error') ? '#f87171' : '#34d399',
            }}
          >
            {actionMsg}
          </div>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))',
              color:      '#818cf8',
              border:     '1px solid rgba(99,102,241,0.25)',
            }}
            onMouseEnter={e => !detecting && (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.22))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.15))')}
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {detecting ? 'Detecting…' : 'Detect bills'}
          </button>
          <button
            onClick={handleFindSavings}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
            style={{
              background: 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.12))',
              color:      '#34d399',
              border:     '1px solid rgba(16,185,129,0.25)',
            }}
            onMouseEnter={e => !generating && (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.3), rgba(6,182,212,0.2))')}
            onMouseLeave={e => (e.currentTarget.style.background = 'linear-gradient(135deg, rgba(16,185,129,0.2), rgba(6,182,212,0.12))')}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Finding…' : 'Find savings'}
          </button>
          <Link
            to="/payments"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color:      'rgba(148,163,184,0.9)',
              border:     '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(148,163,184,0.9)'; }}
          >
            <CreditCard className="w-4 h-4" /> Payments
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer"
            style={{
              background: 'rgba(255,255,255,0.04)',
              color:      'rgba(148,163,184,0.9)',
              border:     '1px solid rgba(255,255,255,0.07)',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'white'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(148,163,184,0.9)'; }}
          >
            <BarChart3 className="w-4 h-4" /> Reports
          </Link>
        </div>
      </div>

      {/* ── Bento grid ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

        {/* Bills by category chart */}
        <div
          className="glass xl:col-span-2 p-5"
          style={{ opacity: 0, animation: 'fade-up 0.5s ease 0.28s forwards' }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-white">Bills by category</h2>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
                {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
              </p>
            </div>
            <Link
              to="/bills"
              className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.15)' }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="skeleton h-52 w-full" />
          ) : categoryData.length ? (
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={categoryData} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                <defs>
                  {categoryData.map((entry, i) => (
                    <linearGradient key={i} id={`bar-${i}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={CATEGORY_COLOURS[entry.name.toLowerCase()] ?? '#818cf8'} stopOpacity={1} />
                      <stop offset="100%" stopColor={CATEGORY_COLOURS[entry.name.toLowerCase()] ?? '#818cf8'} stopOpacity={0.5} />
                    </linearGradient>
                  ))}
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: 'rgba(100,116,139,0.8)', fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'rgba(100,116,139,0.8)', fontFamily: 'Inter' }}
                  axisLine={false} tickLine={false}
                  tickFormatter={v => `£${v}`}
                />
                <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {categoryData.map((_, i) => (
                    <Cell key={`cell-${i}`} fill={`url(#bar-${i})`} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-52 flex flex-col items-center justify-center gap-2" style={{ color: 'rgba(100,116,139,0.7)' }}>
              <BarChart3 className="w-8 h-8 opacity-30" />
              <p className="text-sm">No bill data yet — connect your bank to get started.</p>
            </div>
          )}
        </div>

        {/* Upcoming bills */}
        <div
          className="glass p-5"
          style={{ opacity: 0, animation: 'fade-up 0.5s ease 0.32s forwards' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Upcoming bills</h2>
            <Link
              to="/bills"
              className="flex items-center gap-1 text-xs cursor-pointer transition-colors"
              style={{ color: 'rgba(99,102,241,0.8)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.8)'; }}
            >
              All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-11" />)}
            </div>
          ) : upcomingBills.length ? (
            <div className="space-y-1">
              {upcomingBills.map(bill => {
                const daysUntil = Math.ceil((new Date(bill.next_due_date) - new Date()) / 86_400_000);
                const isUrgent  = daysUntil <= 3;
                return (
                  <div
                    key={bill.id}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors cursor-default"
                    style={{ border: '1px solid transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {bill.supplier?.name || bill.category}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: isUrgent ? '#f87171' : 'rgba(100,116,139,0.8)' }}>
                        {daysUntil <= 0 ? 'Due today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil}d`}
                        {isUrgent && ' ·  urgent'}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-white shrink-0 ml-2">
                      {fmt(bill.current_amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-32 gap-2" style={{ color: 'rgba(100,116,139,0.6)' }}>
              <Receipt className="w-7 h-7 opacity-30" />
              <p className="text-sm">No upcoming bills detected.</p>
            </div>
          )}
        </div>

        {/* Recent transactions */}
        <div
          className="glass p-5 xl:col-span-3"
          style={{ opacity: 0, animation: 'fade-up 0.5s ease 0.36s forwards' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">Recent transactions</h2>
            <Link
              to="/payments"
              className="flex items-center gap-1 text-xs cursor-pointer transition-colors"
              style={{ color: 'rgba(99,102,241,0.8)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(99,102,241,0.8)'; }}
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {[1,2,3].map(i => <div key={i} className="skeleton h-14" />)}
            </div>
          ) : transactions.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {transactions.slice(0, 6).map(txn => (
                <div
                  key={txn.id}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-default"
                  style={{ border: '1px solid transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent'; }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: txn.amount < 0
                        ? 'rgba(239,68,68,0.12)'
                        : 'rgba(16,185,129,0.12)',
                    }}
                  >
                    {txn.amount < 0
                      ? <ArrowUpRight   className="w-4 h-4" style={{ color: '#f87171' }} />
                      : <ArrowDownLeft  className="w-4 h-4" style={{ color: '#34d399' }} />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-white truncate">{txn.description}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(100,116,139,0.8)' }}>
                      {new Date(txn.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      {bankMap[txn.bank_connection_id] && ` · ${bankMap[txn.bank_connection_id]}`}
                    </p>
                  </div>
                  <span
                    className="text-sm font-bold shrink-0"
                    style={{ color: txn.amount < 0 ? '#f87171' : '#34d399' }}
                  >
                    {txn.amount < 0 ? '−' : '+'}
                    {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(txn.amount ?? 0))}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-24 gap-2" style={{ color: 'rgba(100,116,139,0.6)' }}>
              <CreditCard className="w-7 h-7 opacity-30" />
              <p className="text-sm">No transactions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
