import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Check, ArrowRight, Loader2, Sun } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api/v1';

const BUSINESS_TYPES = [
  { value: 'ltd',          label: 'Limited Company (Ltd)' },
  { value: 'sole_trader',  label: 'Sole Trader' },
  { value: 'partnership',  label: 'Partnership' },
  { value: 'llp',          label: 'LLP' },
];

export default function MorningBrief() {
  const [form, setForm]       = useState({ name: '', email: '', company_name: '', business_type: 'ltd' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { document.title = 'Free Morning Brief — Helm by Vpayit'; }, []);

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`${API}/brief/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccess(true);
    } catch {
      setError('Could not connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Vpayit</span>
          </Link>
          <Link to="/auth/login" className="text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors">
            Log in
          </Link>
        </div>
      </nav>

      {/* Hero + Form */}
      <section className="pt-20 pb-24 px-6" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.06), transparent)' }}>
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">

          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8">
              <Sun className="w-4 h-4" />
              Free morning brief
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-5">
              Your business,<br />
              <span className="text-blue-600">briefed every morning</span>
            </h1>

            <p className="text-lg text-slate-500 leading-relaxed mb-8">
              Every morning at 8am, Helm sends you a personalised briefing — cash position, overdue invoices, upcoming UK compliance deadlines, and what needs your attention today.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'Personalised to your company name and business type',
                'UK compliance deadlines — VAT, Companies House, Corporation Tax',
                'Sent from hello@vpayit.co.uk every morning at 8am',
                'Free. No credit card. No spam.',
              ].map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-slate-600">
                  <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right — form or success */}
          <div>
            {success ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-10 text-center">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-7 h-7 text-emerald-600" />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 mb-3">You're in!</h2>
                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                  Your first morning brief will land in your inbox tomorrow at 8am. Keep an eye on your spam folder the first time — add <strong>hello@vpayit.co.uk</strong> to your contacts to make sure it always arrives.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700"
                >
                  Back to home <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm"
              >
                <h2 className="text-xl font-extrabold text-slate-900 mb-1">Sign up free</h2>
                <p className="text-sm text-slate-400 mb-7">Takes 30 seconds. Cancel anytime.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Your name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      placeholder="e.g. Sarah Chen"
                      value={form.name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email address</label>
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="you@yourcompany.co.uk"
                      value={form.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Company name</label>
                    <input
                      name="company_name"
                      type="text"
                      required
                      placeholder="e.g. Helm Ltd"
                      value={form.company_name}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Business type</label>
                    <select
                      name="business_type"
                      value={form.business_type}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white"
                    >
                      {BUSINESS_TYPES.map(({ value, label }) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60 shadow-lg shadow-blue-600/25"
                >
                  {loading
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing you up...</>
                    : <>Get my free morning brief <ArrowRight className="w-4 h-4" /></>}
                </button>

                <p className="mt-4 text-xs text-center text-slate-400">
                  No spam. No credit card. Unsubscribe anytime.
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">Vpayit</span>
          </div>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Vpayit Ltd &middot; Your AI Chief of Staff
          </p>
        </div>
      </footer>

    </div>
  );
}
