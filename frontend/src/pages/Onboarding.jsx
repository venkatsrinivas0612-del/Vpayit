import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Shield, CheckCircle2, ArrowRight, ArrowLeft, Loader2, Zap, TrendingDown, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import { api } from '../lib/api';

const BUSINESS_TYPES = ['Sole Trader', 'Limited Company', 'Partnership', 'LLP', 'CIC', 'Charity', 'Other'];

const STEPS = [
  { id: 1, label: 'Welcome'      },
  { id: 2, label: 'Connect bank' },
  { id: 3, label: 'All set!'     },
];

export default function Onboarding() {
  const { user, profile, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]         = useState(1);
  const [saving, setSaving]     = useState(false);
  const [connecting, setConn]   = useState(false);
  const [bankError, setBankError] = useState('');

  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
  });

  useEffect(() => {
    document.title = 'Welcome to Vpayit';
    if (profile) {
      setForm({
        business_name: profile.business_name || '',
        business_type: profile.business_type || '',
      });
    }
  }, [profile]);

  async function handleSaveProfile() {
    if (!form.business_name.trim()) return;
    setSaving(true);
    try {
      await supabase.from('users').upsert(
        { id: user.id, email: user.email, ...form },
        { onConflict: 'id' },
      );
      await fetchProfile(user.id);
      setStep(2);
    } catch { /* proceed anyway */ }
    finally { setSaving(false); }
  }

  async function handleConnectBank() {
    setConn(true);
    setBankError('');
    try {
      const { url } = await api.banks.authUrl();
      localStorage.setItem('vpayit_onboarding_bank_pending', '1');
      window.location.href = url;
    } catch (err) {
      setBankError(err.message || 'Could not start bank connection. Please try again.');
      setConn(false);
    }
  }

  function handleSkipBank() {
    setStep(3);
  }

  function handleFinish() {
    localStorage.setItem('vpayit_onboarding_completed', '1');
    navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-slate-900">Vpayit</span>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                step === s.id
                  ? 'bg-blue-600 text-white'
                  : step > s.id
                  ? 'bg-green-100 text-green-700'
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{s.id}</span>}
                {s.label}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-6 h-0.5 ${step > s.id ? 'bg-green-300' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden">

          {/* ── Step 1: Welcome ── */}
          {step === 1 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900">Welcome to Vpayit!</h1>
                <p className="text-slate-500 text-sm mt-2">
                  Let's start by setting up your business profile. This takes 30 seconds.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.business_name}
                    onChange={e => setForm(f => ({ ...f, business_name: e.target.value }))}
                    placeholder="e.g. Acme Plumbing Ltd"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Business type
                  </label>
                  <select
                    value={form.business_type}
                    onChange={e => setForm(f => ({ ...f, business_type: e.target.value }))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white cursor-pointer"
                  >
                    <option value="">Select type…</option>
                    {BUSINESS_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={saving || !form.business_name.trim()}
                className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Continue'}
                {!saving && <ArrowRight className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* ── Step 2: Connect bank ── */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Connect your bank</h2>
                <p className="text-slate-500 text-sm mt-2">
                  Link your business bank account to automatically detect bills and find savings.
                </p>
              </div>

              <div className="space-y-3 mb-6">
                {[
                  { icon: '🔒', title: 'Bank-grade security',    desc: 'Powered by TrueLayer — FCA regulated Open Banking' },
                  { icon: '👁️', title: 'Read-only access',       desc: 'We can see your transactions, but never move money' },
                  { icon: '⚡', title: 'Instant bill detection', desc: 'We automatically identify all your recurring bills' },
                ].map(item => (
                  <div key={item.title} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl">
                    <span className="text-xl">{item.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {bankError && (
                <p className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">{bankError}</p>
              )}

              <button
                onClick={handleConnectBank}
                disabled={connecting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                {connecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {connecting ? 'Redirecting…' : 'Connect bank securely'}
              </button>

              <div className="flex items-center gap-4 mt-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1 text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button
                  onClick={handleSkipBank}
                  className="ml-auto text-sm text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  Skip for now →
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3: All set ── */}
          {step === 3 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">You're all set!</h2>
                <p className="text-slate-500 text-sm mt-2">
                  Welcome{form.business_name ? `, ${form.business_name}` : ''}. Here's what Vpayit will do for you:
                </p>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  {
                    icon: Zap,
                    colour: 'blue',
                    title: 'Detect your bills automatically',
                    desc:  'We scan your bank transactions and identify every recurring bill — energy, insurance, rates, telecoms, and more.',
                  },
                  {
                    icon: TrendingDown,
                    colour: 'green',
                    title: 'Find you cheaper alternatives',
                    desc:  'Vpayit compares your bills to the market and surfaces better deals. UK SMEs save an average of £1,900/year.',
                  },
                  {
                    icon: BarChart3,
                    colour: 'purple',
                    title: 'Track your spending over time',
                    desc:  'Monthly reports show exactly where your money goes and how your bills are trending.',
                  },
                ].map(({ icon: Icon, colour, title, desc }) => {
                  const colours = {
                    blue:   'bg-blue-50 text-blue-600',
                    green:  'bg-green-50 text-green-600',
                    purple: 'bg-purple-50 text-purple-600',
                  };
                  return (
                    <div key={title} className="flex items-start gap-3">
                      <div className={`${colours[colour]} p-2 rounded-lg shrink-0`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors cursor-pointer"
              >
                Go to my dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By using Vpayit you agree to our{' '}
          <a href="https://vpayit.co.uk/terms.html" className="underline hover:text-slate-600">Terms</a>{' '}
          and{' '}
          <a href="https://vpayit.co.uk/privacy.html" className="underline hover:text-slate-600">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
