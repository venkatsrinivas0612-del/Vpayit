import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Loader2, BarChart3, Receipt, PiggyBank, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL    = 'demo@vpayit.co.uk';
const DEMO_PASSWORD = 'demo123';

const FEATURES = [
  { icon: Receipt,   title: 'Auto-detect bills',   desc: 'Connects to your bank via Open Banking and identifies recurring bills automatically.' },
  { icon: BarChart3, title: 'Spending insights',   desc: 'See exactly where your money goes each month with category breakdowns and trends.' },
  { icon: PiggyBank, title: 'Find savings',        desc: 'Compare your bills against market rates and get personalised switching recommendations.' },
  { icon: Shield,    title: 'Bank-level security', desc: 'FCA-regulated Open Banking via TrueLayer. We never store your bank credentials.' },
];

export default function Welcome() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState('');

  useEffect(() => { document.title = 'Vpayit — Smart bill management for UK businesses'; }, []);

  // Already logged in → go straight to dashboard
  useEffect(() => {
    if (user) navigate('/dashboard', { replace: true });
  }, [user, navigate]);

  async function handleDemo() {
    setDemoError('');
    setDemoLoading(true);
    try {
      await signIn(DEMO_EMAIL, DEMO_PASSWORD);
      navigate('/dashboard', { replace: true });
    } catch {
      setDemoError('Demo account unavailable — please try logging in manually.');
    } finally {
      setDemoLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 md:px-12 h-16 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900">Vpayit</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/pricing"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Pricing
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            About
          </Link>
          <Link
            to="/auth/login"
            className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/auth/register"
            className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create account
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="max-w-4xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-medium text-blue-700 mb-8">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          Smart bill management for UK businesses
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
          All your business bills.<br />
          <span className="text-blue-600">One smart dashboard.</span>
        </h1>

        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Connect your bank, auto-detect recurring bills, find savings opportunities, and never miss a payment.
          Built for UK SMEs.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link
            to="/auth/register"
            className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-colors"
          >
            Get started free →
          </Link>

          <button
            onClick={handleDemo}
            disabled={demoLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-base transition-colors disabled:opacity-60"
          >
            {demoLoading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading demo…</>
              : '▶  View live demo'}
          </button>
        </div>

        {demoError && (
          <p className="mt-3 text-sm text-red-600">{demoError}</p>
        )}

        <p className="mt-4 text-xs text-slate-400">
          Free to get started · No credit card required · FCA-regulated Open Banking
        </p>
      </div>

      {/* Features */}
      <div className="max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-slate-900 text-white py-16">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to take control of your bills?</h2>
          <p className="text-slate-400 mb-8">Join UK businesses already saving time and money with Vpayit.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth/register"
              className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
            >
              Create free account
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="px-8 py-3.5 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
            >
              {demoLoading ? 'Loading…' : 'View demo'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-100 py-6 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Vpayit Ltd · <a href="https://vpayit.co.uk" className="hover:text-blue-600">vpayit.co.uk</a>
      </div>
    </div>
  );
}
