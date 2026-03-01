import { useEffect, useState } from 'react';
import { Loader2, Search, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { api } from '../lib/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(Math.abs(n ?? 0));

export default function Payments() {
  const [transactions, setTransactions] = useState([]);
  const [meta, setMeta]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [billsOnly, setBillsOnly] = useState(false);

  async function load(p, isB) {
    setLoading(true);
    try {
      const params = { page: p, limit: 50, ...(isB && { is_bill: true }) };
      const res = await api.transactions.list(params);
      setTransactions(res.data ?? []);
      setMeta(res.meta);
    } catch { /* no-op */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(page, billsOnly); }, [page, billsOnly]);

  const filtered = search.trim()
    ? transactions.filter(t =>
        t.description?.toLowerCase().includes(search.toLowerCase())
      )
    : transactions;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm mt-0.5">All transactions from your connected bank accounts</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search transactions…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={billsOnly}
            onChange={e => { setBillsOnly(e.target.checked); setPage(1); }}
            className="rounded text-blue-600"
          />
          Bills only
        </label>
        {meta && (
          <span className="ml-auto text-xs text-slate-400">{meta.total} transactions</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
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

            {/* Pagination */}
            {meta && meta.pages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-xs text-slate-400">
                  Page {meta.page} of {meta.pages}
                </span>
                <button
                  disabled={page === meta.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="text-sm text-slate-600 hover:text-slate-900 disabled:opacity-40"
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
