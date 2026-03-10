import { useEffect, useState, Fragment } from 'react';
import {
  Loader2, RefreshCw, Filter, TrendingUp, TrendingDown, Receipt,
  ChevronDown, ChevronUp,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const CATEGORY_LABELS = {
  energy:             'Energy',
  water:              'Water',
  telecoms:           'Telecoms',
  insurance:          'Insurance',
  software:           'Software',
  rates:              'Business Rates',
  tax:                'Tax',
  postage:            'Postage',
  payment_processing: 'Payment Processing',
  compliance:         'Compliance',
  rent:               'Rent',
  mortgage:           'Mortgage',
  waste:              'Waste',
  unknown:            'Other',
};

const FREQ_LABELS = {
  monthly: 'Monthly', quarterly: 'Quarterly',
  annual: 'Annual', weekly: 'Weekly', irregular: 'Irregular',
};

const CATEGORY_COLOURS = {
  energy:   'bg-orange-100 text-orange-700',
  water:    'bg-blue-100 text-blue-700',
  telecoms: 'bg-purple-100 text-purple-700',
  insurance:'bg-green-100 text-green-700',
  software: 'bg-indigo-100 text-indigo-700',
  rates:    'bg-red-100 text-red-700',
  rent:     'bg-amber-100 text-amber-700',
  waste:    'bg-lime-100 text-lime-700',
  default:  'bg-slate-100 text-slate-600',
};

function Badge({ category }) {
  const cls = CATEGORY_COLOURS[category] || CATEGORY_COLOURS.default;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}

function BillHistoryChart({ historyData, loading }) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 py-4 text-slate-400 text-sm">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading price history…
      </div>
    );
  }

  // Defensive: treat missing/empty months as no-data
  const months = Array.isArray(historyData?.months) ? historyData.months : [];
  if (!historyData || months.length === 0) {
    return (
      <p className="text-xs text-slate-400 py-3">No transaction history available yet.</p>
    );
  }

  const { months: historyMonths, trend, trendPct } = historyData;

  const trendLabel =
    trend === 'up'   ? `Trending up ${Math.abs(trendPct)}% over 6 months` :
    trend === 'down' ? `Trending down ${Math.abs(trendPct)}% over 6 months` :
                       'Stable over 6 months';
  const trendColour =
    trend === 'up' ? 'text-red-600' : trend === 'down' ? 'text-green-600' : 'text-slate-500';
  const TrendIcon = trend === 'up' ? TrendingUp : trend === 'down' ? TrendingDown : null;

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          12-month price history
        </p>
        <div className={`flex items-center gap-1 text-xs font-semibold ${trendColour}`}>
          {TrendIcon && <TrendIcon className="w-3 h-3" />}
          {trendLabel}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <LineChart data={historyMonths} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `£${v}`}
            width={50}
          />
          <Tooltip
            formatter={v => [new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(v), 'Amount']}
            contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 3 }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Bills() {
  const { addToast } = useToast();
  const [bills, setBills]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [detecting, setDetect]    = useState(false);
  const [category, setCategory]   = useState('');
  const [msg, setMsg]             = useState('');
  const [expandedId, setExpandedId]   = useState(null);
  // billHistories: { [billId]: { months, trend, trendPct } | 'loading' }
  const [billHistories, setBillHistories] = useState({});

  useEffect(() => { document.title = 'Bills | Vpayit'; }, []);
  useEffect(() => { load(category); }, [category]);

  async function load(cat) {
    setLoading(true);
    try {
      const params = { status: 'active', ...(cat && { category: cat }) };
      const res = await api.bills.list(params);
      setBills(res.data ?? []);
    } catch (err) {
      addToast(`Failed to load bills: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }

  async function runDetect() {
    setDetect(true);
    setMsg('');
    try {
      const res = await api.bills.detect();
      const msg = `Detection complete — ${res.data.detected} recurring bills found, ${res.data.created} new records created.`;
      setMsg(msg);
      await load(category);
      // Clear cached histories so they refresh
      setBillHistories({});
    } catch (err) {
      setMsg(`Error: ${err.message}`);
      addToast(`Detect bills failed: ${err.message}`, 'error');
    } finally {
      setDetect(false);
    }
  }

  async function toggleExpand(bill) {
    if (expandedId === bill.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(bill.id);
    // Fetch history if not already cached
    if (!billHistories[bill.id]) {
      setBillHistories(h => ({ ...h, [bill.id]: 'loading' }));
      try {
        const res = await api.bills.history(bill.id);
        setBillHistories(h => ({ ...h, [bill.id]: res.data }));
      } catch {
        setBillHistories(h => ({ ...h, [bill.id]: { months: [], trend: 'stable', trendPct: 0 } }));
      }
    }
  }

  const totalMonthly = bills.reduce((s, b) => {
    if (b.frequency === 'monthly')   return s + (b.current_amount || 0);
    if (b.frequency === 'quarterly') return s + (b.current_amount || 0) / 3;
    if (b.frequency === 'annual')    return s + (b.current_amount || 0) / 12;
    return s;
  }, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-500 text-sm mt-0.5">Recurring payments detected from your bank transactions</p>
        </div>
        <button
          onClick={runDetect}
          disabled={detecting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {detecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {detecting ? 'Detecting…' : 'Detect bills'}
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm">
          {msg}
        </div>
      )}

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Active bills',      value: bills.length },
          { label: 'Monthly est.',      value: fmt(totalMonthly) },
          { label: 'Savings available', value: bills.filter(b => b.savings_available).length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{label}</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-slate-400 shrink-0" />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* ── Table — visible on md+ ── */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bills detected yet</p>
            <p className="text-sm mt-1">Connect your bank and click "Detect bills" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {['', 'Supplier', 'Category', 'Frequency', 'Current', 'Change', 'Next due', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => {
                const change = bill.previous_amount
                  ? ((bill.current_amount - bill.previous_amount) / bill.previous_amount) * 100
                  : null;
                const isUp = change > 0;
                const isExpanded = expandedId === bill.id;

                return (
                  <Fragment key={bill.id}>
                    <tr
                      onClick={() => toggleExpand(bill)}
                      className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-3 py-3 text-slate-400">
                        {isExpanded
                          ? <ChevronUp className="w-4 h-4" />
                          : <ChevronDown className="w-4 h-4" />}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-900">
                        {bill.supplier?.name || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Badge category={bill.category} />
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {FREQ_LABELS[bill.frequency] || bill.frequency || '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {fmt(bill.current_amount)}
                      </td>
                      <td className="px-4 py-3">
                        {change !== null ? (
                          <span className={`flex items-center gap-1 ${isUp ? 'text-red-600' : 'text-green-600'}`}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change).toFixed(1)}%
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {bill.next_due_date
                          ? new Date(bill.next_due_date).toLocaleDateString('en-GB')
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium
                          ${bill.savings_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {bill.savings_available ? '💡 Savings' : 'Active'}
                        </span>
                      </td>
                    </tr>

                    {/* Expanded history row */}
                    {isExpanded && (
                      <tr className="bg-slate-50">
                        <td colSpan={8} className="px-8 py-4 border-b border-slate-100">
                          <BillHistoryChart
                            historyData={billHistories[bill.id] !== 'loading' ? billHistories[bill.id] : null}
                            loading={billHistories[bill.id] === 'loading'}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Card layout — visible on mobile only ── */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : bills.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No bills detected yet</p>
            <p className="text-sm mt-1">Connect your bank and click "Detect bills" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const change = bill.previous_amount
                ? ((bill.current_amount - bill.previous_amount) / bill.previous_amount) * 100
                : null;
              const isUp = change > 0;
              const isExpanded = expandedId === bill.id;

              return (
                <div
                  key={bill.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden"
                >
                  <div
                    className="p-4 cursor-pointer"
                    onClick={() => toggleExpand(bill)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">
                          {bill.supplier?.name || '—'}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <Badge category={bill.category} />
                          <span className="text-xs text-slate-400">
                            {FREQ_LABELS[bill.frequency] || bill.frequency}
                          </span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-slate-900">{fmt(bill.current_amount)}</p>
                        {change !== null && (
                          <p className={`text-xs flex items-center justify-end gap-0.5 ${isUp ? 'text-red-600' : 'text-green-600'}`}>
                            {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(change).toFixed(1)}%
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        {bill.next_due_date && (
                          <span>Due {new Date(bill.next_due_date).toLocaleDateString('en-GB')}</span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full font-medium
                          ${bill.savings_available ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                          {bill.savings_available ? '💡 Savings' : 'Active'}
                        </span>
                      </div>
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4 text-slate-400" />
                        : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-100 pt-3 bg-slate-50">
                      <BillHistoryChart
                        historyData={billHistories[bill.id] !== 'loading' ? billHistories[bill.id] : null}
                        loading={billHistories[bill.id] === 'loading' || billHistories[bill.id] === undefined}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
