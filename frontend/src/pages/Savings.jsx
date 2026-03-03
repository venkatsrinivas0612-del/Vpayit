import { useEffect, useState, useRef } from 'react';
import { Loader2, PiggyBank, ExternalLink, X, Sparkles, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';
import { useToast } from '../context/ToastContext';

const fmt = (n) =>
  new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP' }).format(n ?? 0);

// Animates a number from 0 → target over ~600ms
function AnimatedAmount({ target }) {
  const [displayed, setDisplayed] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!target) { setDisplayed(0); return; }
    const duration = 600;
    const start = performance.now();
    const from = 0;

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(from + (target - from) * eased);
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target]);

  return <>{fmt(displayed)}</>;
}

export default function Savings() {
  const { addToast } = useToast();
  const [opps, setOpps]               = useState([]);
  const [meta, setMeta]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [generating, setGen]          = useState(false);
  const [msg, setMsg]                 = useState('');
  const [confirmDismissId, setConfirm] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const res = await api.savings.list();
      setOpps(res.data ?? []);
      setMeta(res.meta);
    } catch (err) {
      addToast(`Failed to load savings: ${err.message}`, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { document.title = 'Savings | Vpayit'; load(); }, []);

  async function generate() {
    setGen(true);
    setMsg('');
    try {
      const res = await api.savings.generate();
      setMsg(`Generated ${res.meta.generated} new saving opportunities.`);
      await load();
    } catch (err) {
      setMsg(`Error: ${err.message}`);
      addToast(`Failed to generate savings: ${err.message}`, 'error');
    } finally { setGen(false); }
  }

  async function dismiss(id) {
    try {
      await api.savings.update(id, 'dismissed');
      setOpps(o => o.filter(x => x.id !== id));
      setConfirm(null);
    } catch (err) {
      addToast(`Failed to dismiss: ${err.message}`, 'error');
    }
  }

  async function markApplied(id) {
    try {
      await api.savings.update(id, 'applied');
      setOpps(o => o.map(x => x.id === id ? { ...x, status: 'applied' } : x));
    } catch (err) {
      addToast(`Failed to update status: ${err.message}`, 'error');
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings opportunities</h1>
          <p className="text-slate-500 text-sm mt-0.5">Switch suppliers and save money on your business bills</p>
        </div>
        <button
          onClick={generate}
          disabled={generating}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer"
        >
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {generating ? 'Generating…' : 'Find savings'}
        </button>
      </div>

      {msg && (
        <div className={`mb-4 p-3 rounded-lg text-sm border ${
          msg.startsWith('Error')
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          {msg}
        </div>
      )}

      {/* Total saving banner with animated counter */}
      {meta?.totalAnnualSaving > 0 && (
        <div className="mb-6 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-5 text-white">
          <p className="text-green-100 text-sm font-medium">Potential annual saving</p>
          <p className="text-4xl font-bold mt-1">
            <AnimatedAmount target={meta.totalAnnualSaving} />
          </p>
          <p className="text-green-100 text-sm mt-1">
            across {opps.length} {opps.length === 1 ? 'opportunity' : 'opportunities'}
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
              className={`bg-white rounded-xl border p-5 relative transition-all ${
                opp.status === 'applied'
                  ? 'border-green-300 bg-green-50/30'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
              }`}
            >
              {/* Top-right: dismiss confirm OR applied badge OR X button */}
              {opp.status === 'applied' ? (
                <span className="absolute top-3 right-3 flex items-center gap-1 text-xs font-medium px-2 py-0.5 bg-green-100 text-green-700 rounded-full">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Applied
                </span>
              ) : confirmDismissId === opp.id ? (
                /* Inline confirmation */
                <div className="absolute top-2 right-2 bg-white border border-slate-200 rounded-xl shadow-lg p-3 z-10 w-44">
                  <p className="text-xs text-slate-700 font-medium mb-2">Remove this opportunity?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => dismiss(opp.id)}
                      className="flex-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      onClick={() => setConfirm(null)}
                      className="flex-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1.5 rounded-lg font-semibold transition-colors cursor-pointer"
                    >
                      Keep
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirm(opp.id)}
                  className="absolute top-3 right-3 p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3 pr-8">
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

              <div className="bg-green-50 rounded-xl p-3 mb-4">
                <p className="text-xs text-green-700 font-medium">Annual saving</p>
                <p className="text-2xl font-bold text-green-700">{fmt(opp.annual_saving)}</p>
              </div>

              {opp.status === 'applied' ? (
                <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 font-semibold py-2 rounded-xl text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Switch applied
                </div>
              ) : (
                <button
                  onClick={() => markApplied(opp.id)}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-xl text-sm transition-colors cursor-pointer"
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
