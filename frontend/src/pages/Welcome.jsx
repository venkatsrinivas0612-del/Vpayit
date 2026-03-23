import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, Loader2, BarChart3, Receipt, Shield,
  Check, ArrowRight, Play, TrendingUp,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL    = 'demo@vpayit.co.uk';
const DEMO_PASSWORD = 'demo123';

const STATS = [
  { value: '£1,900', label: 'avg. annual saving per SME' },
  { value: '4+ hrs', label: 'saved per month on admin' },
  { value: '73%',    label: 'of SMEs are overpaying today' },
];

const FEATURES = [
  {
    icon: Receipt,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    title: 'Auto Bill Detection',
    desc: 'Connects securely via Open Banking to scan your transactions and automatically identifies every recurring bill — no manual entry, ever.',
  },
  {
    icon: Shield,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    title: 'Open Banking Security',
    desc: 'FCA-regulated TrueLayer integration means read-only access to your data — Vpayit can never move your money. Bank-grade 256-bit encryption.',
  },
  {
    icon: TrendingUp,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    title: 'Savings Finder',
    desc: 'Compares your current tariffs against the whole UK market and surfaces the best switch with one click.',
  },
  {
    icon: BarChart3,
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    title: 'Spending Reports',
    desc: 'Clear monthly and annual reports showing exactly where your business money goes — ready for accountants and HMRC.',
  },
];

const STEPS = [
  {
    number: '1',
    title: 'Connect your bank',
    desc: "Securely link your UK business bank account via TrueLayer's FCA-authorised Open Banking connection. Read-only. Takes under 2 minutes.",
    tag: 'TrueLayer — 2 min setup',
  },
  {
    number: '2',
    title: 'We detect your bills',
    desc: 'Our engine scans your transaction history, identifies every recurring payment, and categorises them — broadband, energy, insurance, SaaS and more.',
    tag: 'Fully automatic',
  },
  {
    number: '3',
    title: 'You save money',
    desc: 'We surface cheaper alternatives from across the market. Review the saving, approve the switch with one click, and watch the saving land in your account.',
    tag: 'One-click switch',
  },
];

const TESTIMONIALS = [
  {
    quote: '"Set up in minutes and found us £2,100 in annual savings on energy and broadband alone. Couldn\'t believe how easy it was. Wish we\'d found Vpayit sooner."',
    name: 'James Okafor',
    company: 'Hackney Plumbers Ltd',
  },
  {
    quote: '"We were paying over the odds on seven different bills. Vpayit caught them all automatically and the spending report is brilliant — our accountant loves it."',
    name: 'Sarah Brennan',
    company: 'Green Fields Catering',
  },
  {
    quote: '"As a law firm with tight compliance requirements the FCA-regulated connection gave us real confidence. Saved £1,680 in year one. The Pro plan pays for itself in days."',
    name: 'David Whitmore',
    company: 'Midlands Legal LLP',
  },
];

const PLANS = [
  {
    name: 'Free',
    price: '£0',
    period: '/month',
    features: ['Up to 3 bills tracked', '1 bank connection', 'Basic savings alerts', 'Email support'],
    cta: 'Get started free',
    featured: false,
  },
  {
    name: 'Pro',
    price: '£19',
    period: '/month',
    features: ['Unlimited bills tracked', '3 bank connections', 'One-click switching', 'Monthly spending reports', 'Priority email support'],
    cta: 'Start 14-day trial',
    featured: true,
  },
  {
    name: 'Business',
    price: '£49',
    period: '/month',
    features: ['Everything in Pro', 'Unlimited bank connections', 'Multi-user access (5 seats)', 'Accountant export (CSV/PDF)', 'Dedicated account manager'],
    cta: 'View Business plan',
    featured: false,
  },
];

export default function Welcome() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState('');

  useEffect(() => { document.title = 'Vpayit — Smart bill management for UK businesses'; }, []);

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
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-16">
          <a href="https://vpayit.co.uk" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight text-slate-900">Vpayit</span>
          </a>
          <div className="hidden md:flex items-center gap-1">
            <a href="https://vpayit.co.uk/#features" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">Features</a>
            <Link to="/pricing" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">Pricing</Link>
            <a href="https://vpayit.co.uk/about.html" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 rounded-lg transition-colors hover:bg-blue-50">About</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth/login" className="text-sm font-medium text-slate-500 hover:text-blue-600 px-3 py-2 transition-colors">
              Log in
            </Link>
            <Link
              to="/auth/register"
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-16 px-6 text-center" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% -10%, rgba(37,99,235,0.06), transparent)' }}>
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-full px-4 py-1.5 text-sm font-semibold text-blue-700 mb-8">
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

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-8">
            <Link
              to="/auth/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-base transition-colors shadow-lg shadow-blue-600/25"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl text-base transition-colors disabled:opacity-60"
            >
              {demoLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Loading demo</>
                : <><Play className="w-4 h-4" /> View live demo</>}
            </button>
          </div>

          {demoError && <p className="mb-4 text-sm text-red-600">{demoError}</p>}

          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> Free to get started</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> No credit card required</span>
            <span className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500" /> FCA-regulated Open Banking</span>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 bg-slate-50 rounded-2xl border border-slate-200">
            {STATS.map(({ value, label }) => (
              <div key={label} className="py-10 px-8 text-center">
                <div className="text-4xl font-extrabold text-blue-600 tracking-tight mb-2">{value}</div>
                <div className="text-sm text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-6 bg-white" id="features">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Features</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Everything your business needs</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {FEATURES.map(({ icon: Icon, color, bg, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-5`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-6 bg-slate-50" id="how-it-works">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">How it works</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Up and running in <span className="text-blue-600">3 simple steps</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {STEPS.map(({ number, title, desc, tag }) => (
              <div key={number} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm flex flex-col gap-4">
                <div className="w-10 h-10 bg-blue-600 text-white font-extrabold text-lg rounded-xl flex items-center justify-center shrink-0">
                  {number}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
                </div>
                <span className="mt-auto text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 self-start">
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Social proof</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Used by UK businesses like yours</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {TESTIMONIALS.map(({ quote, name, company }) => (
              <div key={name} className="bg-white rounded-2xl p-7 border border-slate-100 shadow-sm">
                <div className="flex gap-0.5 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 fill-amber-400" viewBox="0 0 14 14">
                      <polygon points="7,1 8.8,5.5 13.5,5.5 9.7,8.2 11.2,12.8 7,10 2.8,12.8 4.3,8.2 0.5,5.5 5.2,5.5" />
                    </svg>
                  ))}
                </div>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{quote}</p>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{name}</p>
                  <p className="text-xs text-slate-400">{company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-16 px-6 bg-slate-50" id="pricing">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-bold tracking-widest text-blue-600 uppercase">Pricing</span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-2">
              Simple, <span className="text-blue-600">transparent pricing</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {PLANS.map(({ name, price, period, features, cta, featured }) => (
              <div
                key={name}
                className={`rounded-2xl p-7 flex flex-col gap-6 ${
                  featured
                    ? 'bg-blue-600 shadow-xl shadow-blue-600/30 ring-2 ring-blue-600'
                    : 'bg-white border border-slate-100 shadow-sm'
                }`}
              >
                {featured && (
                  <span className="text-xs font-bold bg-white/20 text-white px-3 py-1 rounded-full self-start">
                    Most popular
                  </span>
                )}
                <div>
                  <div className={`text-sm font-bold mb-1 ${featured ? 'text-blue-100' : 'text-slate-500'}`}>{name}</div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold tracking-tight ${featured ? 'text-white' : 'text-slate-900'}`}>{price}</span>
                    <span className={`text-sm ${featured ? 'text-blue-100' : 'text-slate-400'}`}>{period}</span>
                  </div>
                </div>
                <ul className="flex-1 space-y-2.5">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 shrink-0 ${featured ? 'text-blue-200' : 'text-blue-600'}`} />
                      <span className={featured ? 'text-blue-50' : 'text-slate-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth/register"
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    featured
                      ? 'bg-white text-blue-600 hover:bg-blue-50'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="bg-blue-600 rounded-3xl p-12 text-center">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mb-4">Ready to stop overpaying?</h2>
            <p className="text-blue-100 mb-8 text-lg leading-relaxed">
              Join thousands of UK businesses taking control of their bills. Setup takes under 2 minutes and your first saving could be waiting today.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-colors"
              >
                Start saving now — it's free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={handleDemo}
                disabled={demoLoading}
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors disabled:opacity-60"
              >
                {demoLoading ? 'Loading...' : 'View demo'}
              </button>
            </div>
            <p className="mt-4 text-sm text-blue-200">14-day free trial. No credit card required. Cancel anytime.</p>
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
            &copy; {new Date().getFullYear()} Vpayit Ltd &middot;{' '}
            <a href="https://vpayit.co.uk" className="hover:text-blue-600 transition-colors">vpayit.co.uk</a>
          </p>
        </div>
      </footer>

    </div>
  );
}
