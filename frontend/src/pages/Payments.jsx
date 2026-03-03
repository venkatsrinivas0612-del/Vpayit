import { useEffect, useState } from 'react';
import { Loader2, Search, ArrowDownLeft, ArrowUpRight, CreditCard } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(n ?? 0));

const fmtSigned = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

const DATE_RANGES = [
  { label: '30 days',   value: '30d' },
  { label: '3 months',  value: '90d' },
  { label: '6 months',  value: '180d' },
  { label: 'All time',  value: 'all' },
];

const BILL_CATEGORIES = [
  { label: 'All categories',    value: '' },
  { label: 'Energy',            value: 'energy' },
  { label: 'Water',             value: 'water' },
  { label: 'Telecoms',          value: 'telecoms' },
  { label: 'Insurance',         value: 'insurance' },
  { label: 'Software',          value: 'software' },
  { label: 'Business Rates',    value: 'rates' },
  { label: 'Rent',              value: 'rent' },
  { label: 'Waste',             value: 'waste' },
  { label: 'Tax',               value: 'tax' },
  { label: 'Other',             value: 'unknown' },
];

function getDateFrom(range) {
  if (range === 'all') return null;
  const d = new Date();
  d.setDate(d.getDate() - parseInt(range));
  return d.toISOString().slice(0, 10);
}

export default function Payments() {
  const { addToast } = useToast();
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [page, setPage]               = useState(1);
  const [search, setSearch]           = useState('');
  const [billsOnly, setBillsOnly]     = useState(false);
  const [dateRange, setDateRange]     = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('');

  useEffect(() => {
    document.title = 'Payments | Vpayit';
  }, []);

  async function load(p, isB, range) {
    setLoading(true);
    try {
      const dateFrom = getDateFrom(range);
      const params = {
        page: p,
        limit: 50,
        ...(isB && { is_bill: true }),
        ...(dateFrom && { date_from: dateFrom }),
      };
      const res = await api.transactions.list(params);
      setTransactions(res.data ?? []);
      setMeta(res.meta);
    } catch (err) {
      addToast(`Failed to load transactions: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(page, billsOnly, dateRange); }, [page, billsOnly, dateRange]);

  const filtered = transactions.filter(t => {
    if (search.trim() && !t.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter && t.bill_category !== categoryFilter) return false;
    return true;
  });

  const totalFiltered = filtered.reduce((s, t) => s + (t.amount || 0), 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">All transactions from your connected bank accounts</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 mb-4">
        {/* Date range pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-slate-500 uppercase tracking-wide shrink-0">Period:</span>
          {DATE_RANGES.map(r => (
            <button
              key={r.value}
              onClick={() => { setDateRange(r.value); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                dateRange === r.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Search + filters row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search transactions…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-52"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer"
          >
            {BILL_CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={billsOnly}
              onChange={e => { setBillsOnly(e.target.checked); setPage(1); }}
              className="rounded text-blue-600 cursor-pointer"
            />
            Bills only
          </label>

          {meta && (
            <span className="ml-auto text-xs text-slate-400">{meta.total} transactions</span>
          )}
        </div>
      </div>

      {/* ── Table — md+ ── */}
      <div className="hidden md:block bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Connect your bank account to import transactions.</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Date', 'Description', 'Supplier', 'Type', 'Amount'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(txn => (
                  <tr key={txn.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(txn.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="px-4 py-3 text-slate-900 max-w-xs truncate">
                      {txn.description}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {txn.supplier?.name || '—'}
                    </td>
                    <td className="px-4 py-3">
                      {txn.is_bill ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                          {txn.bill_category || 'Bill'}
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                          General
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium whitespace-nowrap">
                      <span className={`flex items-center gap-1 ${txn.amount < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {txn.amount < 0
                          ? <ArrowUpRight className="w-3 h-3" />
                          : <ArrowDownLeft className="w-3 h-3" />}
                        {fmt(txn.amount)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Running total + pagination */}
            <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">{filtered.length} shown</span>
              <span className="text-sm font-semibold text-slate-700">
                Total:{' '}
                <span className={totalFiltered < 0 ? 'text-red-600' : 'text-green-600'}>
                  {fmtSigned(totalFiltered)}
                </span>
              </span>
            </div>

            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">Page {meta.page} of {meta.pages}</span>
                <button
                  disabled={page === meta.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Card layout — mobile only ── */}
      <div className="md:hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <CreditCard className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No transactions found</p>
            <p className="text-sm mt-1">Connect your bank account to import transactions.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {filtered.map(txn => (
                <div key={txn.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{txn.description}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(txn.date).toLocaleDateString('en-GB')}
                        {txn.supplier?.name && ` · ${txn.supplier.name}`}
                      </p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 flex items-center gap-1 ${
                      txn.amount < 0 ? 'text-red-600' : 'text-green-600'
                    }`}>
                      {txn.amount < 0
                        ? <ArrowUpRight className="w-3 h-3" />
                        : <ArrowDownLeft className="w-3 h-3" />}
                      {fmt(txn.amount)}
                    </span>
                  </div>
                  {txn.is_bill && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                        {txn.bill_category || 'Bill'}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile total */}
            <div className="mt-3 bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
              <span className="text-sm text-slate-500">{filtered.length} transactions</span>
              <span className="text-sm font-semibold text-slate-700">
                Total:{' '}
                <span className={totalFiltered < 0 ? 'text-red-600' : 'text-green-600'}>
                  {fmtSigned(totalFiltered)}
                </span>
              </span>
            </div>

            {/* Mobile pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between mt-3">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">Page {meta.page} of {meta.pages}</span>
                <button
                  disabled={page === meta.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
