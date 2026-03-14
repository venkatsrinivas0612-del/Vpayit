import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Zap, Loader2, Receipt, BarChart3, PiggyBank, Shield,
  ArrowRight, CheckCircle, Lock, Building, TrendingDown,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEMO_EMAIL    = 'demo@vpayit.co.uk';
const DEMO_PASSWORD = 'demo123';

const FEATURES = [
  {
    icon: Receipt,
    title: 'Auto bill detection',
    desc: 'Connects via Open Banking and identifies every recurring bill automatically.',
    colour: 'indigo',
  },
  {
    icon: BarChart3,
    title: 'Spending insights',
    desc: 'See exactly where your money goes each month with category breakdowns.',
    colour: 'violet',
  },
  {
    icon: PiggyBank,
    title: 'Find savings',
    desc: 'Compare bills against market rates and get personalised switching recommendations.',
    colour: 'emerald',
  },
  {
    icon: Shield,
    title: 'Bank-grade security',
    desc: 'FCA-regulated Open Banking via TrueLayer. We never store your bank credentials.',
    colour: 'amber',
  },
];

const STATS = [
  { value: '£1,900', label: 'average annual saving' },
  { value: '4hrs',   label: 'saved per month' },
  { value: '73%',    label: 'of SMEs overpay on bills' },
];

const iconColours = {
  indigo:  { bg: 'rgba(99,102,241,0.12)',  icon: '#818cf8' },
  violet:  { bg: 'rgba(139,92,246,0.12)',  icon: '#c084fc' },
  emerald: { bg: 'rgba(16,185,129,0.12)',  icon: '#34d399' },
  amber:   { bg: 'rgba(251,191,36,0.12)',  icon: '#fbbf24' },
};

export default function Welcome() {
  const { user, signIn } = useAuth();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError,   setDemoError]   = useState('');

  useEffect(() => { document.title = 'Vpayit — Smart bill management for UK businesses'; }, []);
  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

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
    <div className="min-h-screen" style={{ background: '#060c1a', color: '#f1f5f9' }}>

      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none" style={{
        backgroundImage: `
          radial-gradient(ellipse 80% 50% at 30% -10%, rgba(99,102,241,0.15), transparent),
          radial-gradient(ellipse 60% 40% at 80% 90%, rgba(139,92,246,0.08), transparent),
          radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: 'auto, auto, 28px 28px',
        zIndex: 0,
      }} />

      {/* ── Nav ──────────────────────────────────────────── */}
      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 h-16"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', backdropFilter: 'blur(12px)', background: 'rgba(6,12,26,0.8)' }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.4)' }}
          >
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg text-white">Vpayit</span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          <Link to="/pricing" className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; e.currentTarget.style.background = 'transparent'; }}
          >Pricing</Link>
          <Link to="/about" className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; e.currentTarget.style.background = 'transparent'; }}
          >About</Link>
          <Link to="/auth/login" className="text-sm font-medium px-3 py-2 rounded-lg transition-colors"
            style={{ color: 'rgba(148,163,184,0.8)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'white'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(148,163,184,0.8)'; e.currentTarget.style.background = 'transparent'; }}
          >Log in</Link>
        </div>
        <Link to="/auth/register"
          className="text-sm font-semibold px-4 py-2 rounded-xl text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}
          onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(99,102,241,0.6)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(99,102,241,0.35)'; e.currentTarget.style.transform = 'translateY(0)'; }}
        >Get started free</Link>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-24 pb-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-8"
          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', color: '#818cf8' }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" style={{ animation: 'pulse 2s ease infinite' }} />
          Open Banking · FCA regulated partners
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-none tracking-tight mb-6"
          style={{ letterSpacing: '-3px' }}>
          Stop overpaying on<br />
          <span style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc,#a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
            business bills.
          </span>
        </h1>

        <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
          style={{ color: 'rgba(148,163,184,0.8)' }}>
          Connect your bank, auto-detect recurring bills, find cheaper alternatives.
          UK SMEs save an average of <strong style={{ color: '#34d399' }}>£1,900/year</strong>.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center mb-6">
          <Link to="/auth/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            Get started free <ArrowRight className="w-4 h-4" />
          </Link>
          <button onClick={handleDemo} disabled={demoLoading}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold transition-all disabled:opacity-60 cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(203,213,225,0.9)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {demoLoading ? 'Loading demo…' : 'View live demo'}
          </button>
        </div>

        {demoError && <p className="text-sm mb-4" style={{ color: '#f87171' }}>{demoError}</p>}

        <p className="text-xs" style={{ color: 'rgba(100,116,139,0.7)' }}>
          Free to get started · No credit card required · Bank-grade security
        </p>

        {/* Stats strip */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-14 pt-10"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {STATS.map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-3xl font-extrabold"
                style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {s.value}
              </p>
              <p className="text-xs mt-1" style={{ color: 'rgba(100,116,139,0.8)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Trust strip ──────────────────────────────────── */}
      <div className="relative z-10 py-5" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}>
        <div className="max-w-4xl mx-auto px-6 flex flex-wrap items-center justify-center gap-6">
          {[
            { label: 'TrueLayer', icon: <Building className="w-3.5 h-3.5" /> },
            { label: 'Open Banking', icon: <Lock className="w-3.5 h-3.5" /> },
            { label: 'AES-256 Encryption', icon: <Lock className="w-3.5 h-3.5" /> },
            { label: 'FCA regulated partners', icon: <Shield className="w-3.5 h-3.5" /> },
            { label: 'UK-hosted infrastructure', icon: <CheckCircle className="w-3.5 h-3.5" /> },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-2 text-xs font-semibold"
              style={{ color: 'rgba(100,116,139,0.7)' }}>
              {t.icon}
              {t.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Features ─────────────────────────────────────── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>Features</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ letterSpacing: '-1.5px' }}>
            Everything you need to control your bills
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {FEATURES.map(({ icon: Icon, title, desc, colour }) => {
            const c = iconColours[colour];
            return (
              <div key={title}
                className="p-6 rounded-2xl transition-all cursor-default"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4" style={{ background: c.bg }}>
                  <Icon className="w-5 h-5" style={{ color: c.icon }} />
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="relative z-10 py-24" style={{ background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: '#818cf8' }}>How it works</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight" style={{ letterSpacing: '-1.5px' }}>
              Three steps to save thousands
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n: '01', title: 'Connect your bank', desc: 'Securely link via TrueLayer Open Banking. Read-only access — we never move money.', icon: Building, colour: '#818cf8' },
              { n: '02', title: 'Bills auto-detected', desc: 'We scan your transactions and identify every recurring bill across all categories automatically.', icon: Zap, colour: '#c084fc' },
              { n: '03', title: 'Start saving money', desc: 'Get personalised switching recommendations. Average UK SME saves £1,900/year.', icon: TrendingDown, colour: '#34d399' },
            ].map(({ n, title, desc, icon: Icon, colour }) => (
              <div key={n} className="relative p-6 rounded-2xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-black tracking-widest" style={{ color: 'rgba(100,116,139,0.5)' }}>{n}</span>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${colour}18`, border: `1px solid ${colour}30` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </div>
                </div>
                <h3 className="font-bold text-white mb-2">{title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(148,163,184,0.7)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="relative z-10 py-24" style={{ background: 'linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,12,41,0.9))' }}>
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 tracking-tight" style={{ letterSpacing: '-1px' }}>
            Ready to take control of your bills?
          </h2>
          <p className="mb-8" style={{ color: 'rgba(148,163,184,0.7)' }}>
            Join UK businesses already saving time and money with Vpayit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/auth/register"
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', boxShadow: '0 0 24px rgba(99,102,241,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(99,102,241,0.7)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(99,102,241,0.45)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              Create free account <ChevronRight className="w-4 h-4" />
            </Link>
            <button onClick={handleDemo} disabled={demoLoading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-base font-semibold transition-all cursor-pointer disabled:opacity-60"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(203,213,225,0.9)' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
            >
              {demoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {demoLoading ? 'Loading…' : 'View demo'}
            </button>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="relative z-10 py-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.3)' }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#6366f1,#8b5cf6)' }}>
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-bold text-white">Vpayit</span>
          </div>
          <p className="text-xs" style={{ color: 'rgba(71,85,105,0.8)' }}>
            © {new Date().getFullYear()} Vpayit Ltd ·{' '}
            <a href="https://vpayit.co.uk" style={{ color: 'rgba(99,102,241,0.7)' }}>vpayit.co.uk</a>
          </p>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(71,85,105,0.7)' }}>
            <a href="https://vpayit.co.uk/privacy.html" className="transition-colors"
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(71,85,105,0.7)'; }}>Privacy</a>
            <a href="https://vpayit.co.uk/terms.html" className="transition-colors"
              onMouseEnter={e => { e.currentTarget.style.color = '#818cf8'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(71,85,105,0.7)'; }}>Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
