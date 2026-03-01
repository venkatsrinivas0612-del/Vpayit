import { useEffect, useState } from 'react';
import { Loader2, PiggyBank, ExternalLink, X, Sparkles } from 'lucide-react';
import { api } from '../lib/api';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

export default function Savings() {
  const [opps, setOpps]       = useState([]);
  const [meta, setMeta]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGen]  = useState(false);
  const [msg, setMsg]         = useState('');

  async function load() {
    setLoading(true);
    try {
      const res = await api.savings.list();
      setOpps(res.data ?? []);
      setMeta(res.meta);
    } catch { /* no-op */ }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function generate() {
    setGen(true);
    setMsg('');
    try {
      const res = await api.savings.generate();
      setMsg(`Generated ${res.meta.generated} new saving opportunities.`);
      await load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
    } finally { setGen(false); }
  }

  async function dismiss(id) {
    await api.savings.update(id, 'dismissed');
    setOpps(o => o.filter(x => x.id !== id));
  }

  async function markApplied(id) {
    await api.savings.update(id, 'applied');
    setOpps(o => o.map(x => x.id === id ? { ...x, status: 'applied' } : x));
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings opportunities</h1>
          <p className="text-slate-500 text-sm mt-0.5">Switch suppliers and save money on your business bills</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating…' : 'Find savings'}
        </button>
      </div>

      {msg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {msg}
        </div>
      )}

      {/* Total saving banner */}
      {meta?.totalAnnualSaving > 0 && (
        <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm font-medium">Potential annual saving</p>
          <p className="text-4xl font-bold mt-1">{fmt(meta.totalAnnualSaving)}</p>
          <p className="text-green-100 text-sm mt-1">
            across {opps.length} opportunities
          </p>
        </div>
      )}

      {/* Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
        </div>
      ) : opps.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <PiggyBank className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-slate-600">No savings opportunities yet</p>
          <p className="text-sm mt-1">Click "Find savings" after your bills are detected.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {opps.map(opp => (
            <div
              key={opp.id}
              className={`bg-white rounded-xl border p-5 relative
                ${opp.status === 'applied' ? 'border-green-300 bg-green-50/30' : 'border-slate-200'}`}
            >
              {/* Dismiss */}
              {opp.status !== 'applied' && (
                <button
                  onClick={() => dismiss(opp.id)}
                  className="absolute top-3 right-3 p-1 rounded hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {opp.status === 'applied' && (
                <span className="absolute top-3 right-3 text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  Applied ✓
                </span>
              )}

              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">
                {opp.bill?.supplier?.category || opp.bill?.category || 'Bill'}
              </p>

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <p className="text-xs text-slate-400">Current provider</p>
                  <p className="font-semibold text-slate-900">{opp.bill?.supplier?.name || '—'}</p>
                  <p className="text-sm text-slate-600 mt-0.5">{fmt(opp.bill?.current_amount)}/mo</p>
                </div>
                <div className="text-slate-300 font-light text-lg mt-3">→</div>
                <div>
                  <p className="text-xs text-slate-400">Switch to</p>
                  <p className="font-semibold text-slate-900">{opp.alternative_supplier}</p>
                  <p className="text-sm text-green-600 font-medium mt-0.5">{fmt(opp.alternative_cost)}/mo</p>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <p className="text-xs text-green-700 font-medium">Annual saving</p>
                <p className="text-2xl font-bold text-green-700">{fmt(opp.annual_saving)}</p>
              </div>

              {opp.status !== 'applied' && (
                <button
                  onClick={() => markApplied(opp.id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors"
                >
                  {opp.referral_url && <ExternalLink className="w-4 h-4" />}
                  Switch now
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
