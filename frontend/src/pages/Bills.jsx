import { useEffect, useState } from 'react';
import { Loader2, RefreshCw, Filter, TrendingUp, TrendingDown, Receipt } from 'lucide-react';
import { api } from '../lib/api';

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
  unknown:            'Other',
};

const FREQ_LABELS = { monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', weekly: 'Weekly', irregular: 'Irregular' };

const CATEGORY_COLOURS = {
  energy:   'bg-orange-100 text-orange-700',
  water:    'bg-blue-100 text-blue-700',
  telecoms: 'bg-purple-100 text-purple-700',
  insurance:'bg-green-100 text-green-700',
  software: 'bg-indigo-100 text-indigo-700',
  rates:    'bg-red-100 text-red-700',
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

export default function Bills() {
  const [bills, setBills]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [detecting, setDetect]  = useState(false);
  const [category, setCategory] = useState('');
  const [msg, setMsg]           = useState('');

  async function load(cat) {
    setLoading(true);
    try {
      const params = { status: 'active', ...(cat && { category: cat }) };
      const res = await api.bills.list(params);
      setBills(res.data ?? []);
    } catch { /* no-op */ }
    finally { setLoading(false); }
  }

  useEffect(() => { document.title = 'Bills | Vpayit'; }, []);
  useEffect(() => { load(category); }, [category]);

  async function runDetect() {
    setDetect(true);
    setMsg('');
    try {
      const res = await api.bills.detect();
      setMsg(`Detection complete — ${res.data.detected} recurring bills found, ${res.data.created} new records created.`);
      await load(category);
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally {
      setDetect(false);
    }
  }

  const totalMonthly = bills.reduce((s, b) => {
    if (b.frequency === 'monthly')   return s + (b.current_amount || 0);
    if (b.frequency === 'quarterly') return s + (b.current_amount || 0) / 3;
    if (b.frequency === 'annual')    return s + (b.current_amount || 0) / 12;
    return s;
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bills</h1>
          <p className="text-slate-500 text-sm mt-0.5">Recurring payments detected from your bank transactions</p>
        </div>
        <button
          onClick={runDetect}
          disabled={detecting}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
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
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Active bills',     value: bills.length },
          { label: 'Monthly est.',     value: fmt(totalMonthly) },
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
        <Filter className="w-4 h-4 text-slate-400" />
        <select
          value={category}
          onChange={e => setCategory(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        >
          <option value="">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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
                {['Supplier', 'Category', 'Frequency', 'Current', 'Change', 'Next due', 'Status'].map(h => (
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
                return (
                  <tr key={bill.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
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
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
