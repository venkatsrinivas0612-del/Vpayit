import { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import {
  Receipt, TrendingDown, Building, AlertCircle,
  RefreshCw, ArrowRight, Plus, Loader2, CheckCircle2, X,
  Zap, Sparkles, CreditCard, ArrowUpRight, BarChart3, Bell,
} from 'lucide-react';
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const CATEGORY_COLOURS = {
  energy:    '#10b981',
  water:     '#3b82f6',
  rates:     '#ef4444',
  telecoms:  '#8b5cf6',
  insurance: '#f59e0b',
  software:  '#06b6d4',
  rent:      '#f97316',
  mortgage:  '#64748b',
  waste:     '#84cc16',
  unknown:   '#94a3b8',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function StatCard({ icon: Icon, label, value, sub, colour = 'blue', loading }) {
  const colours = {
    blue:   'bg-blue-50 text-blue-600',
    green:  'bg-green-50 text-green-600',
    amber:  'bg-amber-50 text-amber-600',
    purple: 'bg-purple-50 text-purple-600',
  };
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-4">
      <div className={`${colours[colour]} p-2.5 rounded-lg shrink-0`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        {loading
          ? <div className="h-7 w-24 bg-slate-100 rounded animate-pulse mt-1" />
          : <p className="text-2xl font-bold text-slate-900 mt-0.5">{value}</p>
        }
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

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
    // Check if onboarding was pending from bank connect flow
    if (localStorage.getItem('vpayit_onboarding_bank_pending') === '1') {
      localStorage.removeItem('vpayit_onboarding_bank_pending');
      localStorage.setItem('vpayit_onboarding_completed', '1');
      // fall through to dashboard (bank was just connected)
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
        api.transactions.list({ limit: 5 }),
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
    setDetecting(true);
    setActionMsg('');
    try {
      const res = await api.bills.detect();
      setActionMsg(`✓ ${res.data.detected} recurring bills found, ${res.data.created} new records created.`);
      const billsRes = await api.bills.list({ status: 'active' });
      setBills(billsRes.data ?? []);
    } catch (err) {
      setActionMsg(`Error: ${err.message}`);
    } finally { setDetecting(false); }
  }

  async function handleFindSavings() {
    setGenerating(true);
    setActionMsg('');
    try {
      const res = await api.savings.generate();
      setActionMsg(`✓ ${res.meta.generated} savings opportunities found.`);
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

  // Deduplicate: when a supplier bill and a category-only bill share the same
  // category, show only the supplier-named one.
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

  const noBanks = !loading && banks.length === 0;

  // Quick lookup: bank_connection_id → provider name
  const bankMap = Object.fromEntries(banks.map(b => [b.id, b.provider]));

  // Bills due within 3 days (for alert banner)
  const urgentBills = !loading ? upcomingBills.filter(b => {
    const diff = (new Date(b.next_due_date) - new Date()) / 86_400_000;
    return diff >= 0 && diff <= 3;
  }) : [];

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {getGreeting()}{profile?.business_name ? `, ${profile.business_name}` : ''}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        {banks.length > 0 && (
          <button className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4" /> Sync transactions
          </button>
        )}
      </div>

      {/* Bank-connected success banner */}
      {justConnected && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
            <div>
              <p className="font-semibold text-green-800 text-sm">Bank account connected</p>
              <p className="text-green-700 text-xs mt-0.5">
                Your transactions have been imported and bills detected automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => setSearchParams({})}
            className="p-1 rounded hover:bg-green-100 text-green-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Urgent bills alert banner */}
      {urgentBills.length > 0 && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="font-semibold text-amber-800 text-sm">
              {urgentBills.length === 1 ? '1 bill due soon' : `${urgentBills.length} bills due soon`}
            </p>
          </div>
          <div className="space-y-1">
            {urgentBills.map(bill => {
              const diff = Math.ceil((new Date(bill.next_due_date) - new Date()) / 86_400_000);
              const when = diff <= 0 ? 'today' : diff === 1 ? 'tomorrow' : `in ${diff} days`;
              const name = bill.supplier?.name || bill.category;
              return (
                <p key={bill.id} className="text-sm text-amber-700">
                  ⚠️ <strong>{name}</strong> ({fmt(bill.current_amount)}) is due <strong>{when}</strong>
                </p>
              );
            })}
          </div>
        </div>
      )}

      {/* Connect bank banner */}
      {noBanks && (
        <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-5 flex items-center justify-between">
          <div className="text-white">
            <p className="font-semibold text-lg">Connect your bank account</p>
            <p className="text-blue-100 text-sm mt-0.5">
              Link your business account via Open Banking to automatically detect bills and find savings.
            </p>
          </div>
          <Link
            to="/settings"
            className="shrink-0 ml-4 bg-white text-blue-700 hover:bg-blue-50 font-semibold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Connect bank
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          icon={Receipt}
          label="Bills this month"
          value={fmt(summary?.billSpend)}
          sub={`${bills.length} active bills`}
          colour="blue"
          loading={loading}
        />
        <StatCard
          icon={TrendingDown}
          label="Savings found"
          value={fmt(savings?.meta?.totalAnnualSaving)}
          sub="Potential annual saving"
          colour="green"
          loading={loading}
        />
        <StatCard
          icon={Building}
          label="Bank accounts"
          value={banks.length}
          sub={banks.length === 0 ? 'None connected' : `${banks.filter(b => b.status === 'active').length} active`}
          colour="purple"
          loading={loading}
        />
        <StatCard
          icon={AlertCircle}
          label="Due in 7 days"
          value={upcomingBills.filter(b => {
            const diff = (new Date(b.next_due_date) - new Date()) / 86_400_000;
            return diff >= 0 && diff <= 7;
          }).length}
          sub="Upcoming payments"
          colour="amber"
          loading={loading}
        />
      </div>

      {/* Quick actions */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-3">Quick actions</h2>
        {actionMsg && (
          <p className={`mb-3 text-sm px-3 py-2 rounded-lg ${
            actionMsg.startsWith('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}>
            {actionMsg}
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleDetect}
            disabled={detecting}
            className="flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {detecting ? 'Detecting…' : 'Detect bills'}
          </button>
          <button
            onClick={handleFindSavings}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-medium text-sm rounded-lg transition-colors disabled:opacity-60"
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {generating ? 'Finding…' : 'Find savings'}
          </button>
          <Link
            to="/payments"
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm rounded-lg transition-colors"
          >
            <CreditCard className="w-4 h-4" /> View payments
          </Link>
          <Link
            to="/reports"
            className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-sm rounded-lg transition-colors"
          >
            <BarChart3 className="w-4 h-4" /> View reports
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Spending by category */}
        <div className="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">Bills by category</h2>
            <span className="text-xs text-slate-400">
              {new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
            </span>
          </div>
          {loading ? (
            <div className="h-48 bg-slate-50 rounded-lg animate-pulse" />
          ) : categoryData.length ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={v => `£${v}`} />
                <Tooltip formatter={(v) => [fmt(v), 'Amount']} />
                <Bar dataKey="amount" radius={[4, 4, 0, 0]}>
                  {categoryData.map((entry, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={CATEGORY_COLOURS[entry.name.toLowerCase()] ?? '#3b82f6'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-slate-400 text-sm">
              No bill data yet — connect your bank account to get started.
            </div>
          )}
        </div>

        {/* Right column: Upcoming bills + Recent transactions */}
        <div className="space-y-6">
          {/* Upcoming bills */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Upcoming bills</h2>
              <Link to="/bills" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : upcomingBills.length ? (
              <div className="space-y-2">
                {upcomingBills.map(bill => {
                  const daysUntil = Math.ceil(
                    (new Date(bill.next_due_date) - new Date()) / 86_400_000
                  );
                  const isUrgent = daysUntil <= 3;
                  return (
                    <div
                      key={bill.id}
                      className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {bill.supplier?.name || bill.category}
                        </p>
                        <p className={`text-xs ${isUrgent ? 'text-red-500 font-medium' : 'text-slate-400'}`}>
                          {daysUntil <= 0 ? 'Due today' : `${daysUntil}d`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold text-slate-900 shrink-0 ml-2">
                        {fmt(bill.current_amount)}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No upcoming bills detected.</p>
            )}
          </div>

          {/* Recent transactions */}
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-slate-900">Recent transactions</h2>
              <Link to="/payments" className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-10 bg-slate-50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : transactions.length ? (
              <div className="space-y-2">
                {transactions.slice(0, 5).map(txn => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-slate-800 truncate">{txn.description}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(txn.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        {bankMap[txn.bank_connection_id] && (
                          <span className="ml-1.5 text-slate-300">·</span>
                        )}
                        {bankMap[txn.bank_connection_id] && (
                          <span className="ml-1.5">{bankMap[txn.bank_connection_id]}</span>
                        )}
                      </p>
                    </div>
                    <span className={`text-sm font-semibold ml-2 shrink-0 flex items-center gap-0.5 ${
                      txn.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {txn.amount < 0 && <ArrowUpRight className="w-3 h-3" />}
                      {new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(txn.amount ?? 0))}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 py-6 text-center">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
